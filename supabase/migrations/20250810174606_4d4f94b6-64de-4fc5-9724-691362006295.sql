
-- 1) Add guest_count to bookings
ALTER TABLE public.bookings
ADD COLUMN IF NOT EXISTS guest_count smallint;

-- 2) Replace reserve_booking to include guest count and align price with UI multipliers
CREATE OR REPLACE FUNCTION public.reserve_booking(
  p_room_id uuid,
  p_booking_date date,
  p_start_time time without time zone,
  p_duration_hours smallint,
  p_customer_name text,
  p_customer_phone text,
  p_customer_email text DEFAULT NULL::text,
  p_notes text DEFAULT NULL::text,
  p_guest_count smallint DEFAULT NULL
)
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
  -- Basic validations
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

  -- Do not allow crossing midnight (simplicity)
  IF v_end_time <= p_start_time THEN
    RAISE EXCEPTION 'Booking cannot cross midnight';
  END IF;

  -- Room exists and is active
  PERFORM 1 FROM public.rooms WHERE id = p_room_id AND is_active = true;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Room not found or inactive';
  END IF;

  -- Duration multipliers aligned with UI:
  -- 1h: 1.0x, 2h: 1.8x, 3h: 2.5x, 4h: 3.0x, else: p_duration_hours
  v_multiplier := CASE
    WHEN p_duration_hours = 1 THEN 1.0
    WHEN p_duration_hours = 2 THEN 1.8
    WHEN p_duration_hours = 3 THEN 2.5
    WHEN p_duration_hours = 4 THEN 3.0
    ELSE p_duration_hours::numeric
  END;

  -- Price based on room price_per_hour and the multiplier
  SELECT (price_per_hour * v_multiplier) INTO v_price
  FROM public.rooms
  WHERE id = p_room_id;

  IF v_price IS NULL THEN
    v_price := 0;
  END IF;

  -- Check conflicts (pending/approved)
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

  -- Create booking in pending status
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
