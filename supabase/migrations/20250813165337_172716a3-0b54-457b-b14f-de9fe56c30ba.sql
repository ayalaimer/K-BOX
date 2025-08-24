-- Fix RLS policies for better security

-- 1. Fix reviews table - remove public insert, keep only verified reviews visible
DROP POLICY IF EXISTS "Anyone can insert reviews" ON public.reviews;
DROP POLICY IF EXISTS "Anyone can view visible reviews" ON public.reviews;

CREATE POLICY "Public can view verified visible reviews" 
ON public.reviews 
FOR SELECT 
USING (is_visible = true AND is_verified = true);

-- 2. Fix business_settings - restrict public access to only essential fields
DROP POLICY IF EXISTS "Anyone can view business settings" ON public.business_settings;

-- Create a view for public business info (only safe fields)
CREATE OR REPLACE VIEW public.business_info AS
SELECT 
  company_name,
  logo_url,
  website
FROM public.business_settings
LIMIT 1;

-- Grant public access to the view
GRANT SELECT ON public.business_info TO anon;
GRANT SELECT ON public.business_info TO authenticated;

-- Only admins can see full business_settings table
CREATE POLICY "Only admins can view business settings" 
ON public.business_settings 
FOR SELECT 
USING (has_role(auth.uid(), 'admin'::app_role));

-- 3. Fix contact_messages - remove public read access
DROP POLICY IF EXISTS "Admins can select contact messages" ON public.contact_messages;

CREATE POLICY "Only admins can read contact messages" 
ON public.contact_messages 
FOR SELECT 
USING (has_role(auth.uid(), 'admin'::app_role));

-- 4. Fix booking_email_templates - remove public read access  
DROP POLICY IF EXISTS "Anyone can view booking email templates" ON public.booking_email_templates;

CREATE POLICY "Only admins can view email templates" 
ON public.booking_email_templates 
FOR SELECT 
USING (has_role(auth.uid(), 'admin'::app_role));

-- 5. Fix search_path in functions for security
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role app_role)
 RETURNS boolean
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
  select exists (
    select 1
    from public.user_roles
    where user_id = _user_id
      and role = _role
  );
$function$;