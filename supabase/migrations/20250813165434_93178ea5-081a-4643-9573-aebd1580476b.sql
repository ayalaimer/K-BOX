-- Fix remaining security issues

-- 1. Remove security definer from business_info view to prevent security risks
DROP VIEW IF EXISTS public.business_info;

-- Create a regular view instead (no security definer)
CREATE VIEW public.business_info AS
SELECT 
  company_name,
  logo_url,
  website
FROM public.business_settings
LIMIT 1;

-- Grant public access to the view
GRANT SELECT ON public.business_info TO anon;
GRANT SELECT ON public.business_info TO authenticated;

-- 2. Fix search_path for all functions that don't have it set
CREATE OR REPLACE FUNCTION public.check_availability_and_suggest(p_room_id uuid, p_booking_date date, p_start_time time without time zone, p_duration_hours smallint)
 RETURNS TABLE(available boolean, suggested_start_time time without time zone, suggested_end_time time without time zone, message text)
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  v_end_time time without time zone;
  v_open_hour smallint;
  v_close_hour smallint;
  v_is_open boolean;
  v_candidate time without time zone;
  v_best_start time without time zone;
  v_best_end time without time zone;
  v_best_diff interval := NULL;
  v_diff interval;
  v_has_conflict boolean;
  v_day_of_week int;
BEGIN
  IF p_duration_hours IS NULL OR p_duration_hours <= 0 THEN
    RAISE EXCEPTION 'Invalid duration';
  END IF;

  v_end_time := (p_start_time + make_interval(hours => p_duration_hours))::time;

  SELECT bh.is_open, bh.open_time_hour, bh.close_time_hour
  INTO v_is_open, v_open_hour, v_close_hour
  FROM public.business_hours bh
  WHERE bh.special_date = p_booking_date
  ORDER BY bh.updated_at DESC
  LIMIT 1;

  IF v_is_open IS NULL THEN
    v_day_of_week := extract(dow from p_booking_date);
    SELECT bh.is_open, bh.open_time_hour, bh.close_time_hour
    INTO v_is_open, v_open_hour, v_close_hour
    FROM public.business_hours bh
    WHERE bh.day_of_week = v_day_of_week AND bh.special_date IS NULL
    ORDER BY bh.updated_at DESC
    LIMIT 1;
  END IF;

  IF v_is_open IS DISTINCT FROM TRUE THEN
    RETURN QUERY SELECT false, NULL::time, NULL::time,
      'אנחנו סגורים ביום זה. אנא בחרו יום אחר.'::text;
    RETURN;
  END IF;

  IF extract(hour from p_start_time)::smallint < v_open_hour OR (extract(hour from v_end_time)::smallint > v_close_hour) THEN
    NULL;
  END IF;

  SELECT EXISTS (
    SELECT 1 FROM public.bookings b
    WHERE b.room_id = p_room_id
      AND b.booking_date = p_booking_date
      AND b.status IN ('pending','approved')
      AND (p_start_time, v_end_time) OVERLAPS (b.start_time, (b.start_time + make_interval(hours => b.duration_hours))::time)
  ) INTO v_has_conflict;

  IF NOT v_has_conflict THEN
    RETURN QUERY SELECT true, p_start_time, v_end_time,
      'החדר פנוי בטווח שבחרת'::text;
    RETURN;
  END IF;

  FOR v_candidate IN
    SELECT make_time(h, 0, 0)::time AS candidate_start
    FROM generate_series(v_open_hour, v_close_hour - p_duration_hours, 1) AS h
  LOOP
    IF NOT EXISTS (
      SELECT 1 FROM public.bookings b
      WHERE b.room_id = p_room_id
        AND b.booking_date = p_booking_date
        AND b.status IN ('pending','approved')
        AND (v_candidate, (v_candidate + make_interval(hours => p_duration_hours))::time)
            OVERLAPS (b.start_time, (b.start_time + make_interval(hours => b.duration_hours))::time)
    ) THEN
      v_diff := abs((v_candidate - p_start_time));
      IF v_best_diff IS NULL OR v_diff < v_best_diff THEN
        v_best_diff := v_diff;
        v_best_start := v_candidate;
        v_best_end := (v_candidate + make_interval(hours => p_duration_hours))::time;
      END IF;
    END IF;
  END LOOP;

  IF v_best_start IS NOT NULL THEN
    RETURN QUERY SELECT false, v_best_start, v_best_end,
      format('החדר אינו פנוי בטווח שבחרת. הטווח הקרוב ביותר הפנוי הוא %s–%s',
        to_char(v_best_start, 'HH24:MI'), to_char(v_best_end, 'HH24:MI'))::text;
    RETURN;
  END IF;

  RETURN QUERY SELECT false, NULL::time, NULL::time,
    'אין זמינות בטווח השעות של היום. צרו קשר וננסה לסייע.'::text;
END;
$function$;

-- Update contact_submit function to fix search_path
CREATE OR REPLACE FUNCTION public.contact_submit(p_full_name text, p_phone text, p_email text, p_message text, p_ip_address text DEFAULT NULL::text)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  v_ip_hash text;
  v_last_submission timestamptz;
  v_message_id bigint;
BEGIN
  IF p_full_name IS NULL OR length(trim(p_full_name)) = 0 THEN
    RETURN jsonb_build_object('success', false, 'error', 'Name is required');
  END IF;

  IF p_phone IS NULL OR p_phone !~ '^05\d{8}$' THEN
    RETURN jsonb_build_object('success', false, 'error', 'Valid Israeli phone number is required');
  END IF;

  IF p_email IS NULL OR p_email !~ '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$' THEN
    RETURN jsonb_build_object('success', false, 'error', 'Valid email address is required');
  END IF;

  IF p_message IS NULL OR length(trim(p_message)) < 2 OR length(trim(p_message)) > 2000 THEN
    RETURN jsonb_build_object('success', false, 'error', 'Message must be between 2 and 2000 characters');
  END IF;

  IF p_ip_address IS NOT NULL THEN
    v_ip_hash := encode(digest(p_ip_address, 'sha256'), 'hex');
    
    SELECT last_submission INTO v_last_submission
    FROM public.contact_rate_limit
    WHERE ip_hash = v_ip_hash;
    
    IF v_last_submission IS NOT NULL AND v_last_submission > (now() - interval '1 minute') THEN
      RETURN jsonb_build_object('success', false, 'error', 'Please wait before sending another message');
    END IF;
    
    INSERT INTO public.contact_rate_limit (ip_hash, last_submission, submission_count)
    VALUES (v_ip_hash, now(), 1)
    ON CONFLICT (ip_hash) DO UPDATE SET
      last_submission = now(),
      submission_count = contact_rate_limit.submission_count + 1;
  END IF;

  INSERT INTO public.contact_messages (full_name, phone, email, message, source)
  VALUES (trim(p_full_name), p_phone, trim(p_email), trim(p_message), 'contact_form')
  RETURNING id INTO v_message_id;

  RETURN jsonb_build_object('success', true, 'message_id', v_message_id);
END;
$function$;

-- Update reserve_booking function to fix search_path
CREATE OR REPLACE FUNCTION public.reserve_booking(p_room_id uuid, p_booking_date date, p_start_time time without time zone, p_duration_hours smallint, p_customer_name text, p_customer_phone text, p_customer_email text DEFAULT NULL::text, p_notes text DEFAULT NULL::text, p_guest_count smallint DEFAULT NULL::smallint)
 RETURNS bookings
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  v_end_time time without time zone;
  v_conflict uuid;
  v_price numeric;
  v_multiplier numeric := 1;
  v_booking public.bookings;
BEGIN
  IF p_duration_hours IS NULL OR p_duration_hours <= 0 OR p_duration_hours > 8 THEN
    RAISE EXCEPTION 'Invalid duration';
  END IF;

  IF p_customer_name IS NULL OR length(trim(p_customer_name)) = 0 THEN
    RAISE EXCEPTION 'Customer name is required';
  END IF;

  IF p_customer_phone IS NULL OR length(trim(p_customer_phone)) = 0 THEN
    RAISE EXCEPTION 'Customer phone is required';
  END IF;

  v_end_time := (p_start_time + make_interval(hours => p_duration_hours))::time;

  IF v_end_time <= p_start_time THEN
    RAISE EXCEPTION 'Booking cannot cross midnight';
  END IF;

  PERFORM 1 FROM public.rooms WHERE id = p_room_id AND is_active = true;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Room not found or inactive';
  END IF;

  v_multiplier := CASE
    WHEN p_duration_hours = 1 THEN 1.0
    WHEN p_duration_hours = 2 THEN 1.8
    WHEN p_duration_hours = 3 THEN 2.5
    WHEN p_duration_hours = 4 THEN 3.0
    ELSE p_duration_hours::numeric
  END;

  SELECT (price_per_hour * v_multiplier) INTO v_price
  FROM public.rooms
  WHERE id = p_room_id;

  IF v_price IS NULL THEN
    v_price := 0;
  END IF;

  SELECT b.id INTO v_conflict
  FROM public.bookings b
  WHERE b.room_id = p_room_id
    AND b.booking_date = p_booking_date
    AND (p_start_time, v_end_time) OVERLAPS (b.start_time, (b.start_time + make_interval(hours => b.duration_hours))::time)
    AND b.status IN ('pending','approved')
  LIMIT 1;

  IF v_conflict IS NOT NULL THEN
    RAISE EXCEPTION 'Room is not available for the selected time';
  END IF;

  INSERT INTO public.bookings (
    room_id, booking_date, start_time, duration_hours,
    status, price_total, promotion_id,
    customer_name, customer_phone, customer_email, notes,
    guest_count
  )
  VALUES (
    p_room_id, p_booking_date, p_start_time, p_duration_hours,
    'pending', v_price, NULL,
    p_customer_name, p_customer_phone, p_customer_email, p_notes,
    p_guest_count
  )
  RETURNING * INTO v_booking;

  RETURN v_booking;
END;
$function$;