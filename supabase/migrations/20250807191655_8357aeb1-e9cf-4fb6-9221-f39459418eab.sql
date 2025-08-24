-- Stage 1: Booking management DB schema + RLS (idempotent)

-- 0) Create roles enum first
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'app_role') THEN
    CREATE TYPE public.app_role AS ENUM ('admin');
  END IF;
END$$;

-- 1) Roles table (must exist before has_role function)
CREATE TABLE IF NOT EXISTS public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role public.app_role NOT NULL,
  UNIQUE (user_id, role)
);

-- 2) has_role helper function (after table exists)
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role public.app_role)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = ''
AS $$
  select exists (
    select 1
    from public.user_roles
    where user_id = _user_id
      and role = _role
  );
$$;

-- 3) RLS + policies for user_roles
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admins can manage roles" ON public.user_roles;
CREATE POLICY "Admins can manage roles"
ON public.user_roles
FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS "Users can view their own roles" ON public.user_roles;
CREATE POLICY "Users can view their own roles"
ON public.user_roles
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- 4) Business hours table (supports weekdays + special dates)
CREATE TABLE IF NOT EXISTS public.business_hours (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  day_of_week smallint NOT NULL CHECK (day_of_week BETWEEN 0 AND 6),
  special_date date NULL,
  is_open boolean NOT NULL DEFAULT true,
  open_time_hour smallint NOT NULL DEFAULT 0 CHECK (open_time_hour BETWEEN 0 AND 24),
  close_time_hour smallint NOT NULL DEFAULT 0 CHECK (close_time_hour BETWEEN 0 AND 24),
  note text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS uq_business_hours_regular
ON public.business_hours(day_of_week)
WHERE special_date IS NULL;

CREATE UNIQUE INDEX IF NOT EXISTS uq_business_hours_special_date
ON public.business_hours(special_date)
WHERE special_date IS NOT NULL;

ALTER TABLE public.business_hours ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can view business hours" ON public.business_hours;
CREATE POLICY "Anyone can view business hours"
ON public.business_hours
FOR SELECT
USING (true);

DROP POLICY IF EXISTS "Admins can modify business hours" ON public.business_hours;
CREATE POLICY "Admins can modify business hours"
ON public.business_hours
FOR INSERT
TO authenticated
WITH CHECK (public.has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS "Admins can update business hours" ON public.business_hours;
CREATE POLICY "Admins can update business hours"
ON public.business_hours
FOR UPDATE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS "Admins can delete business hours" ON public.business_hours;
CREATE POLICY "Admins can delete business hours"
ON public.business_hours
FOR DELETE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

DROP TRIGGER IF EXISTS update_business_hours_updated_at ON public.business_hours;
CREATE TRIGGER update_business_hours_updated_at
BEFORE UPDATE ON public.business_hours
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- 5) Rooms table
CREATE TABLE IF NOT EXISTS public.rooms (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL UNIQUE,
  capacity integer NOT NULL CHECK (capacity > 0),
  price_per_hour numeric(10,2) NOT NULL CHECK (price_per_hour >= 0),
  description text,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.rooms ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can view rooms" ON public.rooms;
CREATE POLICY "Anyone can view rooms"
ON public.rooms
FOR SELECT
USING (true);

DROP POLICY IF EXISTS "Admins can insert rooms" ON public.rooms;
CREATE POLICY "Admins can insert rooms"
ON public.rooms
FOR INSERT
TO authenticated
WITH CHECK (public.has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS "Admins can update rooms" ON public.rooms;
CREATE POLICY "Admins can update rooms"
ON public.rooms
FOR UPDATE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS "Admins can delete rooms" ON public.rooms;
CREATE POLICY "Admins can delete rooms"
ON public.rooms
FOR DELETE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

DROP TRIGGER IF EXISTS update_rooms_updated_at ON public.rooms;
CREATE TRIGGER update_rooms_updated_at
BEFORE UPDATE ON public.rooms
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- 6) Promotions table
CREATE TABLE IF NOT EXISTS public.promotions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text,
  regular_price numeric(10,2) NOT NULL CHECK (regular_price >= 0),
  discounted_price numeric(10,2) NOT NULL CHECK (discounted_price >= 0),
  valid_from date,
  valid_to date,
  is_active boolean NOT NULL DEFAULT true,
  terms text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.promotions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can view promotions" ON public.promotions;
CREATE POLICY "Anyone can view promotions"
ON public.promotions
FOR SELECT
USING (true);

DROP POLICY IF EXISTS "Admins can insert promotions" ON public.promotions;
CREATE POLICY "Admins can insert promotions"
ON public.promotions
FOR INSERT
TO authenticated
WITH CHECK (public.has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS "Admins can update promotions" ON public.promotions;
CREATE POLICY "Admins can update promotions"
ON public.promotions
FOR UPDATE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS "Admins can delete promotions" ON public.promotions;
CREATE POLICY "Admins can delete promotions"
ON public.promotions
FOR DELETE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

DROP TRIGGER IF EXISTS update_promotions_updated_at ON public.promotions;
CREATE TRIGGER update_promotions_updated_at
BEFORE UPDATE ON public.promotions
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- 7) Booking status enum and bookings table
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'booking_status') THEN
    CREATE TYPE public.booking_status AS ENUM ('pending', 'approved', 'cancelled', 'completed');
  END IF;
END$$;

CREATE TABLE IF NOT EXISTS public.bookings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_name text NOT NULL,
  customer_phone text NOT NULL,
  customer_email text,
  room_id uuid NOT NULL REFERENCES public.rooms(id) ON DELETE RESTRICT,
  booking_date date NOT NULL,
  start_time time without time zone NOT NULL,
  duration_hours smallint NOT NULL CHECK (duration_hours BETWEEN 1 AND 12),
  status public.booking_status NOT NULL DEFAULT 'pending',
  price_total numeric(10,2) NOT NULL DEFAULT 0,
  notes text,
  promotion_id uuid REFERENCES public.promotions(id) ON DELETE SET NULL,
  approved_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_bookings_date_room ON public.bookings(booking_date, room_id);

ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admins can select bookings" ON public.bookings;
CREATE POLICY "Admins can select bookings"
ON public.bookings
FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS "Admins can insert bookings" ON public.bookings;
CREATE POLICY "Admins can insert bookings"
ON public.bookings
FOR INSERT
TO authenticated
WITH CHECK (public.has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS "Admins can update bookings" ON public.bookings;
CREATE POLICY "Admins can update bookings"
ON public.bookings
FOR UPDATE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS "Admins can delete bookings" ON public.bookings;
CREATE POLICY "Admins can delete bookings"
ON public.bookings
FOR DELETE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS "Anyone can create pending bookings" ON public.bookings;
CREATE POLICY "Anyone can create pending bookings"
ON public.bookings
FOR INSERT
TO anon
WITH CHECK (
  status = 'pending'::public.booking_status
  AND approved_by IS NULL
);

DROP TRIGGER IF EXISTS update_bookings_updated_at ON public.bookings;
CREATE TRIGGER update_bookings_updated_at
BEFORE UPDATE ON public.bookings
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- 8) Seed default business hours (Sun-Thu 18-24, Fri 10-15, Sat closed)
INSERT INTO public.business_hours (day_of_week, special_date, is_open, open_time_hour, close_time_hour, note)
VALUES
  (0, NULL, true, 18, 24, 'Default hours'), -- Sunday
  (1, NULL, true, 18, 24, 'Default hours'), -- Monday
  (2, NULL, true, 18, 24, 'Default hours'), -- Tuesday
  (3, NULL, true, 18, 24, 'Default hours'), -- Wednesday
  (4, NULL, true, 18, 24, 'Default hours'), -- Thursday
  (5, NULL, true, 10, 15, 'Default hours'), -- Friday
  (6, NULL, false, 0, 0, 'Closed')         -- Saturday
ON CONFLICT DO NOTHING;