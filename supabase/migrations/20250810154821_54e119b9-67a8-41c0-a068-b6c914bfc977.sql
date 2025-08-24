-- 1) Add 'waitlisted' to booking_status enum
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_type t
    JOIN pg_enum e ON t.oid = e.enumtypid
    WHERE t.typname = 'booking_status' AND e.enumlabel = 'waitlisted'
  ) THEN
    ALTER TYPE booking_status ADD VALUE 'waitlisted';
  END IF;
END $$;

-- 2) Seed email templates for each status (he and en) if not exists
-- We use simple NOT EXISTS guards to avoid duplicates if rerun
INSERT INTO public.booking_email_templates (status, language, subject, body_html)
SELECT s.status, l.language,
  CASE l.language
    WHEN 'he' THEN
      CASE s.status
        WHEN 'pending' THEN 'אישורך בתהליך'
        WHEN 'approved' THEN 'הזמנה אושרה'
        WHEN 'cancelled' THEN 'הזמנה בוטלה'
        WHEN 'waitlisted' THEN 'הזמנה בהמתנה למקום פנוי'
      END
    ELSE
      CASE s.status
        WHEN 'pending' THEN 'Your booking is pending'
        WHEN 'approved' THEN 'Your booking is approved'
        WHEN 'cancelled' THEN 'Your booking was cancelled'
        WHEN 'waitlisted' THEN 'You are on the waitlist'
      END
  END AS subject,
  CASE l.language
    WHEN 'he' THEN (
      '<h2>שלום {{customer.name}}</h2>' ||
      '<p>סטטוס ההזמנה: <strong>{{booking.status}}</strong></p>' ||
      '<p>תאריך: {{booking.date}} שעה: {{booking.time}}</p>' ||
      '<p>קוד הזמנה: {{booking.booking_code}}</p>' ||
      '<p>עסק: {{business.company_name}}</p>'
    )
    ELSE (
      '<h2>Hello {{customer.name}}</h2>' ||
      '<p>Booking status: <strong>{{booking.status}}</strong></p>' ||
      '<p>Date: {{booking.date}} Time: {{booking.time}}</p>' ||
      '<p>Booking code: {{booking.booking_code}}</p>' ||
      '<p>Business: {{business.company_name}}</p>'
    )
  END AS body_html
FROM (VALUES ('pending'), ('approved'), ('cancelled'), ('waitlisted')) AS s(status)
CROSS JOIN (VALUES ('he'), ('en')) AS l(language)
WHERE NOT EXISTS (
  SELECT 1 FROM public.booking_email_templates bet
  WHERE bet.status = s.status AND bet.language = l.language
);
