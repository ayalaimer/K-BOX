
-- 1) Add 'waitlisted' booking status (idempotent on PG15+)
ALTER TYPE public.booking_status ADD VALUE IF NOT EXISTS 'waitlisted';

-- 2) Ensure uniqueness of templates by (status, language)
CREATE UNIQUE INDEX IF NOT EXISTS booking_email_templates_status_language_uidx
  ON public.booking_email_templates (status, language);

-- 3) Seed/Upsert email templates for he/en and statuses: pending, approved, cancelled, waitlisted
INSERT INTO public.booking_email_templates (status, language, subject, body_html, enabled)
VALUES
  -- Hebrew
  ('pending',   'he', 'הזמנה בהמתנה - {{booking_code}}', 
   '<div dir="rtl" style="font-family:Arial,Helvetica,sans-serif">
      <h2>קיבלנו את הבקשה שלך</h2>
      <p>מספר הזמנה: <strong>{{booking_code}}</strong></p>
      <p>תאריך: <strong>{{booking_date}}</strong> | שעה: <strong>{{start_time}}</strong></p>
      <p>נעדכן אותך כאשר ההזמנה תאושר.</p>
      <hr />
      <p>{{business.name}}</p>
    </div>', true),
  ('approved',  'he', 'אישור הזמנה - {{booking_code}}',
   '<div dir="rtl" style="font-family:Arial,Helvetica,sans-serif">
      <h2>יש!</h2>
      <p>ההזמנה אושרה.</p>
      <p>מספר הזמנה: <strong>{{booking_code}}</strong></p>
      <p>תאריך: <strong>{{booking_date}}</strong> | שעה: <strong>{{start_time}}</strong> | משך: <strong>{{duration_hours}} שעות</strong></p>
      <p>שם: <strong>{{customer_name}}</strong> | טלפון: <strong>{{customer_phone}}</strong></p>
      <p>סכום משוער: ₪{{price_total}}</p>
      <hr />
      <p>{{business.name}}</p>
    </div>', true),
  ('cancelled', 'he', 'ביטול הזמנה - {{booking_code}}',
   '<div dir="rtl" style="font-family:Arial,Helvetica,sans-serif">
      <h2>הזמנה בוטלה</h2>
      <p>מספר הזמנה: <strong>{{booking_code}}</strong></p>
      <p>נשמח לראותך בהמשך.</p>
      <hr />
      <p>{{business.name}}</p>
    </div>', true),
  ('waitlisted','he', 'רשימת המתנה - {{booking_code}}',
   '<div dir="rtl" style="font-family:Arial,Helvetica,sans-serif">
      <h2>נוספת לרשימת המתנה</h2>
      <p>מספר הזמנה: <strong>{{booking_code}}</strong></p>
      <p>הודעה תישלח אם יתפנה מקום.</p>
      <hr />
      <p>{{business.name}}</p>
    </div>', true),

  -- English
  ('pending',   'en', 'Booking pending - {{booking_code}}',
   '<div style="font-family:Arial,Helvetica,sans-serif">
      <h2>We received your request</h2>
      <p>Booking code: <strong>{{booking_code}}</strong></p>
      <p>Date: <strong>{{booking_date}}</strong> | Time: <strong>{{start_time}}</strong></p>
      <p>We will notify you once it is approved.</p>
      <hr />
      <p>{{business.name}}</p>
    </div>', true),
  ('approved',  'en', 'Booking approved - {{booking_code}}',
   '<div style="font-family:Arial,Helvetica,sans-serif">
      <h2>Great news!</h2>
      <p>Your booking has been approved.</p>
      <p>Booking code: <strong>{{booking_code}}</strong></p>
      <p>Date: <strong>{{booking_date}}</strong> | Time: <strong>{{start_time}}</strong> | Duration: <strong>{{duration_hours}} hours</strong></p>
      <p>Name: <strong>{{customer_name}}</strong> | Phone: <strong>{{customer_phone}}</strong></p>
      <p>Estimated total: ₪{{price_total}}</p>
      <hr />
      <p>{{business.name}}</p>
    </div>', true),
  ('cancelled', 'en', 'Booking cancelled - {{booking_code}}',
   '<div style="font-family:Arial,Helvetica,sans-serif">
      <h2>Booking cancelled</h2>
      <p>Booking code: <strong>{{booking_code}}</strong></p>
      <p>Hope to see you again.</p>
      <hr />
      <p>{{business.name}}</p>
    </div>', true),
  ('waitlisted','en', 'Waitlisted - {{booking_code}}',
   '<div style="font-family:Arial,Helvetica,sans-serif">
      <h2>You have been added to the waitlist</h2>
      <p>Booking code: <strong>{{booking_code}}</strong></p>
      <p>We will notify you if a spot opens.</p>
      <hr />
      <p>{{business.name}}</p>
    </div>', true)
ON CONFLICT (status, language)
DO UPDATE SET
  subject = EXCLUDED.subject,
  body_html = EXCLUDED.body_html,
  enabled = true,
  updated_at = now();

-- 4) Email subscribers table (with RLS)
CREATE TABLE IF NOT EXISTS public.email_subscribers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text NOT NULL,
  name text,
  created_at timestamptz NOT NULL DEFAULT now(),
  consent boolean NOT NULL DEFAULT false,
  consent_at timestamptz,
  source text,
  language text NOT NULL DEFAULT 'he'
);

-- Prevent duplicates by email (case-insensitive)
CREATE UNIQUE INDEX IF NOT EXISTS email_subscribers_email_uidx
  ON public.email_subscribers ((lower(email)));

ALTER TABLE public.email_subscribers ENABLE ROW LEVEL SECURITY;

-- Anyone can subscribe (INSERT)
CREATE POLICY IF NOT EXISTS "Anyone can subscribe"
  ON public.email_subscribers
  FOR INSERT
  WITH CHECK (true);

-- Admins can manage subscribers (SELECT/UPDATE/DELETE/INSERT)
CREATE POLICY IF NOT EXISTS "Admins manage subscribers"
  ON public.email_subscribers
  FOR ALL
  USING (has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- 5) Social links table (flexible, supports multiple platforms)
CREATE TABLE IF NOT EXISTS public.business_social_links (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  platform text NOT NULL,          -- e.g. 'facebook','instagram','whatsapp','tiktok','youtube','custom'
  label text,
  url text NOT NULL,
  icon_name text,                  -- optional lucide icon key (for UI)
  order_index int NOT NULL DEFAULT 0,
  enabled boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- unique per platform (adjustable later if needed)
CREATE UNIQUE INDEX IF NOT EXISTS business_social_links_platform_uidx
  ON public.business_social_links (platform);

ALTER TABLE public.business_social_links ENABLE ROW LEVEL SECURITY;

-- Public can view social links
CREATE POLICY IF NOT EXISTS "Anyone can view social links"
  ON public.business_social_links
  FOR SELECT
  USING (true);

-- Admins manage social links
CREATE POLICY IF NOT EXISTS "Admins manage social links"
  ON public.business_social_links
  FOR ALL
  USING (has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- Keep updated_at fresh
DROP TRIGGER IF EXISTS business_social_links_set_updated_at ON public.business_social_links;
CREATE TRIGGER business_social_links_set_updated_at
  BEFORE UPDATE ON public.business_social_links
  FOR EACH ROW
  EXECUTE PROCEDURE public.update_updated_at_column();
