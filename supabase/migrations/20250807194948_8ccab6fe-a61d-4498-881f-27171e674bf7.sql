-- Enable required extension
create extension if not exists pgcrypto;

-- ENUM types
DO $$ BEGIN
  CREATE TYPE public.booking_status AS ENUM ('pending','approved','rejected','cancelled','completed');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE public.discount_type AS ENUM ('percent','fixed');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- updated_at trigger function (idempotent)
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ROOMS
CREATE TABLE IF NOT EXISTS public.rooms (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  capacity int NOT NULL DEFAULT 2,
  base_price numeric(10,2) NOT NULL DEFAULT 0,
  active boolean NOT NULL DEFAULT true,
  images text[] NOT NULL DEFAULT '{}',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE TRIGGER update_rooms_updated_at
BEFORE UPDATE ON public.rooms
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- BUSINESS HOURS
CREATE TABLE IF NOT EXISTS public.business_hours (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  day_of_week int CHECK (day_of_week BETWEEN 0 AND 6),
  open_time time,
  close_time time,
  is_closed boolean NOT NULL DEFAULT false,
  special_date date,
  special_open_time time,
  special_close_time time,
  note text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE TRIGGER update_business_hours_updated_at
BEFORE UPDATE ON public.business_hours
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- PROMOTIONS
CREATE TABLE IF NOT EXISTS public.promotions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text,
  start_at timestamptz,
  end_at timestamptz,
  is_active boolean NOT NULL DEFAULT true,
  discount_type public.discount_type NOT NULL,
  discount_value numeric(10,2) NOT NULL,
  conditions jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE TRIGGER update_promotions_updated_at
BEFORE UPDATE ON public.promotions
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ADMIN USERS
CREATE TABLE IF NOT EXISTS public.admin_users (
  user_id uuid PRIMARY KEY,
  role text NOT NULL CHECK (role IN ('owner','manager','staff')) DEFAULT 'manager',
  created_at timestamptz NOT NULL DEFAULT now()
);

-- BOOKINGS
CREATE TABLE IF NOT EXISTS public.bookings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid,
  user_email text NOT NULL,
  customer_name text NOT NULL,
  phone text NOT NULL,
  room_id uuid REFERENCES public.rooms(id) ON DELETE SET NULL,
  booking_date date NOT NULL,
  start_time time NOT NULL,
  end_time time NOT NULL,
  guests int NOT NULL DEFAULT 2,
  status public.booking_status NOT NULL DEFAULT 'pending',
  total_price numeric(10,2) NOT NULL DEFAULT 0,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_bookings_room_date ON public.bookings(room_id, booking_date, start_time);
CREATE TRIGGER update_bookings_updated_at
BEFORE UPDATE ON public.bookings
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- BOOKING NOTES
CREATE TABLE IF NOT EXISTS public.booking_notes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id uuid NOT NULL REFERENCES public.bookings(id) ON DELETE CASCADE,
  admin_user_id uuid NOT NULL,
  content text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.business_hours ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.promotions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.booking_notes ENABLE ROW LEVEL SECURITY;

-- Helper predicate
-- is_admin: current auth uid is in admin_users
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean LANGUAGE sql STABLE AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.admin_users au WHERE au.user_id = auth.uid()
  );
$$;

-- Policies
-- ROOMS
DO $$ BEGIN
  DROP POLICY IF EXISTS "rooms_select_public" ON public.rooms;
  DROP POLICY IF EXISTS "rooms_modify_admin" ON public.rooms;
END $$;
CREATE POLICY "rooms_select_public" ON public.rooms FOR SELECT USING (true);
CREATE POLICY "rooms_modify_admin" ON public.rooms
  FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

-- BUSINESS HOURS
DO $$ BEGIN
  DROP POLICY IF EXISTS "hours_select_public" ON public.business_hours;
  DROP POLICY IF EXISTS "hours_modify_admin" ON public.business_hours;
END $$;
CREATE POLICY "hours_select_public" ON public.business_hours FOR SELECT USING (true);
CREATE POLICY "hours_modify_admin" ON public.business_hours
  FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

-- PROMOTIONS
DO $$ BEGIN
  DROP POLICY IF EXISTS "promotions_select_public" ON public.promotions;
  DROP POLICY IF EXISTS "promotions_modify_admin" ON public.promotions;
END $$;
CREATE POLICY "promotions_select_public" ON public.promotions FOR SELECT USING (true);
CREATE POLICY "promotions_modify_admin" ON public.promotions
  FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

-- ADMIN USERS
DO $$ BEGIN
  DROP POLICY IF EXISTS "admin_users_select_admin" ON public.admin_users;
  DROP POLICY IF EXISTS "admin_users_modify_admin" ON public.admin_users;
END $$;
CREATE POLICY "admin_users_select_admin" ON public.admin_users
  FOR SELECT TO authenticated USING (public.is_admin());
CREATE POLICY "admin_users_modify_admin" ON public.admin_users
  FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

-- BOOKINGS
DO $$ BEGIN
  DROP POLICY IF EXISTS "bookings_insert_public" ON public.bookings;
  DROP POLICY IF EXISTS "bookings_admin_all" ON public.bookings;
END $$;
-- Allow anyone (anon or authenticated) to create a booking. If authenticated, enforce ownership on user_id
CREATE POLICY "bookings_insert_public" ON public.bookings
  FOR INSERT TO anon, authenticated
  WITH CHECK (
    auth.uid() IS NULL OR user_id = auth.uid()
  );
-- Admins can do everything on bookings
CREATE POLICY "bookings_admin_all" ON public.bookings
  FOR ALL TO authenticated
  USING (public.is_admin()) WITH CHECK (public.is_admin());

-- BOOKING NOTES (admins only)
DO $$ BEGIN
  DROP POLICY IF EXISTS "booking_notes_admin_all" ON public.booking_notes;
END $$;
CREATE POLICY "booking_notes_admin_all" ON public.booking_notes
  FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

-- Seed initial admin based on provided email
INSERT INTO public.admin_users (user_id, role)
SELECT id, 'owner' FROM auth.users WHERE email = 'info@kbox.co.il'
ON CONFLICT (user_id) DO NOTHING;