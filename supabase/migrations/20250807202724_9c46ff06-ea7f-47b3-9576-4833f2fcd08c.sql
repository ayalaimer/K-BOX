
-- 1) עמודת מספר הזמנה קצר וייחודי
ALTER TABLE public.bookings
ADD COLUMN IF NOT EXISTS booking_code text;

-- נוודא ייחודיות
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_indexes
    WHERE schemaname = 'public'
      AND indexname = 'bookings_booking_code_key'
  ) THEN
    -- יצירת אינדקס ייחודי (אם כבר יש constraint בשם זהה, זה ידלג)
    BEGIN
      ALTER TABLE public.bookings
      ADD CONSTRAINT bookings_booking_code_key UNIQUE (booking_code);
    EXCEPTION
      WHEN duplicate_object THEN
        -- כבר קיים, מתעלמים
        NULL;
    END;
  END IF;
END$$;

-- פונקציה ליצירת קוד קצר (8 תווים הקס) – ללא תלות בהרחבות
CREATE OR REPLACE FUNCTION public.generate_booking_code()
RETURNS text
LANGUAGE sql
STABLE
AS $$
  SELECT lower(substr(md5(random()::text || clock_timestamp()::text), 1, 8));
$$;

-- טריגר שמציב קוד אם לא הוגדר
CREATE OR REPLACE FUNCTION public.set_booking_code()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  IF NEW.booking_code IS NULL THEN
    NEW.booking_code := public.generate_booking_code();
  END IF;
  RETURN NEW;
END;
$$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger
    WHERE tgname = 'before_insert_set_booking_code'
  ) THEN
    CREATE TRIGGER before_insert_set_booking_code
    BEFORE INSERT ON public.bookings
    FOR EACH ROW
    EXECUTE FUNCTION public.set_booking_code();
  END IF;
END$$;

-- 2) אינדקס ביצועים לחיפוש התנגשויות
CREATE INDEX IF NOT EXISTS idx_bookings_room_date_time
ON public.bookings (room_id, booking_date, start_time);

-- 3) טריגר updated_at (אם עדיין לא קיים)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger
    WHERE tgname = 'bookings_set_updated_at'
  ) THEN
    CREATE TRIGGER bookings_set_updated_at
    BEFORE UPDATE ON public.bookings
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();
  END IF;
END$$;

-- 4) פונקציית שריון אטומית ללא התנגשויות
CREATE OR REPLACE FUNCTION public.reserve_booking(
  p_room_id uuid,
  p_booking_date date,
  p_start_time time without time zone,
  p_duration_hours smallint,
  p_customer_name text,
  p_customer_phone text,
  p_customer_email text DEFAULT NULL,
  p_notes text DEFAULT NULL
)
RETURNS public.bookings
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
  v_end_time time without time zone;
  v_conflict uuid;
  v_price numeric;
  v_booking public.bookings;
BEGIN
  -- ולידציות בסיסיות
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

  -- לא מאפשרים חציית חצות (פשטות)
  IF v_end_time <= p_start_time THEN
    RAISE EXCEPTION 'Booking cannot cross midnight';
  END IF;

  -- החדר קיים ופעיל
  PERFORM 1 FROM public.rooms WHERE id = p_room_id AND is_active = true;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Room not found or inactive';
  END IF;

  -- מחיר לפי חדר * שעות
  SELECT (price_per_hour * p_duration_hours) INTO v_price
  FROM public.rooms
  WHERE id = p_room_id;

  IF v_price IS NULL THEN
    v_price := 0;
  END IF;

  -- בדיקת התנגשויות מול pending/approved
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

  -- יצירת הזמנה במצב pending
  INSERT INTO public.bookings (
    room_id, booking_date, start_time, duration_hours,
    status, price_total, promotion_id,
    customer_name, customer_phone, customer_email, notes
  )
  VALUES (
    p_room_id, p_booking_date, p_start_time, p_duration_hours,
    'pending', v_price, NULL,
    p_customer_name, p_customer_phone, p_customer_email, p_notes
  )
  RETURNING * INTO v_booking;

  RETURN v_booking;
END;
$$;

-- הרשאות: ברירת מחדל מאפשרת EXECUTE לציבור. הפונקציה רצה כ-SECURITY DEFINER כדי לעבור RLS בבטחה ובהיגיון שהוגדר.
