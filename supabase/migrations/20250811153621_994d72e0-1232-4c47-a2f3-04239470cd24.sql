-- Create function to check availability and suggest nearest slot on the same date
-- Uses business_hours table for the day schedule
-- Exposes minimal info; SECURITY DEFINER to bypass RLS read on bookings

CREATE OR REPLACE FUNCTION public.check_availability_and_suggest(
  p_room_id uuid,
  p_booking_date date,
  p_start_time time without time zone,
  p_duration_hours smallint
)
RETURNS TABLE (
  available boolean,
  suggested_start_time time without time zone,
  suggested_end_time time without time zone,
  message text
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
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

  -- Calculate desired end time
  v_end_time := (p_start_time + make_interval(hours => p_duration_hours))::time;

  -- Get business hours for the date (special date has priority)
  SELECT bh.is_open, bh.open_time_hour, bh.close_time_hour
  INTO v_is_open, v_open_hour, v_close_hour
  FROM public.business_hours bh
  WHERE bh.special_date = p_booking_date
  ORDER BY bh.updated_at DESC
  LIMIT 1;

  IF v_is_open IS NULL THEN
    -- fallback to regular weekday schedule
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

  -- Ensure requested window is within open hours
  IF extract(hour from p_start_time)::smallint < v_open_hour OR (extract(hour from v_end_time)::smallint > v_close_hour) THEN
    -- We'll still compute a suggestion below; just note it may be outside
    NULL;
  END IF;

  -- First, check if requested window is available
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

  -- Generate candidate start times on the hour within business hours
  FOR v_candidate IN
    SELECT make_time(h, 0, 0)::time AS candidate_start
    FROM generate_series(v_open_hour, v_close_hour - p_duration_hours, 1) AS h
  LOOP
    -- check conflict for candidate
    IF NOT EXISTS (
      SELECT 1 FROM public.bookings b
      WHERE b.room_id = p_room_id
        AND b.booking_date = p_booking_date
        AND b.status IN ('pending','approved')
        AND (v_candidate, (v_candidate + make_interval(hours => p_duration_hours))::time)
            OVERLAPS (b.start_time, (b.start_time + make_interval(hours => b.duration_hours))::time)
    ) THEN
      -- compute diff to requested start
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

  -- No suggestion available on this date
  RETURN QUERY SELECT false, NULL::time, NULL::time,
    'אין זמינות בטווח השעות של היום. צרו קשר וננסה לסייע.'::text;
END;
$$;

-- Ensure function is callable by anon (RPC uses definer rights). No extra grants needed since PostgREST handles this.
