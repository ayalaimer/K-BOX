-- Create contact_messages table
CREATE TABLE public.contact_messages (
  id bigserial PRIMARY KEY,
  full_name text NOT NULL,
  phone text NOT NULL,
  email text NOT NULL,
  message text NOT NULL,
  status text NOT NULL DEFAULT 'new' CHECK (status IN ('new', 'in_progress', 'resolved')),
  created_at timestamptz DEFAULT now(),
  handled_at timestamptz NULL,
  notes text NULL,
  source text DEFAULT 'contact_form'
);

-- Add constraints for validation
ALTER TABLE public.contact_messages 
ADD CONSTRAINT check_message_length CHECK (length(message) BETWEEN 2 AND 2000),
ADD CONSTRAINT check_phone_format CHECK (phone ~ '^05\d{8}$'),
ADD CONSTRAINT check_email_format CHECK (email ~ '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$');

-- Create index for performance
CREATE INDEX idx_contact_messages_status ON public.contact_messages(status);
CREATE INDEX idx_contact_messages_created_at ON public.contact_messages(created_at);

-- Create rate limiting table
CREATE TABLE public.contact_rate_limit (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  ip_hash text NOT NULL,
  last_submission timestamptz DEFAULT now(),
  submission_count integer DEFAULT 1
);

-- Create index for rate limiting
CREATE UNIQUE INDEX idx_contact_rate_limit_ip ON public.contact_rate_limit(ip_hash);

-- Enable RLS
ALTER TABLE public.contact_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contact_rate_limit ENABLE ROW LEVEL SECURITY;

-- RLS Policies for contact_messages
CREATE POLICY "Anonymous can insert contact messages" 
ON public.contact_messages 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Admins can select contact messages" 
ON public.contact_messages 
FOR SELECT 
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can update contact messages" 
ON public.contact_messages 
FOR UPDATE 
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can delete contact messages" 
ON public.contact_messages 
FOR DELETE 
USING (has_role(auth.uid(), 'admin'::app_role));

-- RLS Policies for rate limiting (internal use only)
CREATE POLICY "Rate limit internal access only" 
ON public.contact_rate_limit 
FOR ALL 
USING (false);

-- Create contact submission function with rate limiting
CREATE OR REPLACE FUNCTION public.contact_submit(
  p_full_name text,
  p_phone text,
  p_email text,
  p_message text,
  p_ip_address text DEFAULT NULL
)
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
  -- Basic validation
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

  -- Rate limiting (if IP provided)
  IF p_ip_address IS NOT NULL THEN
    v_ip_hash := encode(digest(p_ip_address, 'sha256'), 'hex');
    
    SELECT last_submission INTO v_last_submission
    FROM public.contact_rate_limit
    WHERE ip_hash = v_ip_hash;
    
    IF v_last_submission IS NOT NULL AND v_last_submission > (now() - interval '1 minute') THEN
      RETURN jsonb_build_object('success', false, 'error', 'Please wait before sending another message');
    END IF;
    
    -- Update rate limit record
    INSERT INTO public.contact_rate_limit (ip_hash, last_submission, submission_count)
    VALUES (v_ip_hash, now(), 1)
    ON CONFLICT (ip_hash) DO UPDATE SET
      last_submission = now(),
      submission_count = contact_rate_limit.submission_count + 1;
  END IF;

  -- Insert message
  INSERT INTO public.contact_messages (full_name, phone, email, message, source)
  VALUES (trim(p_full_name), p_phone, trim(p_email), trim(p_message), 'contact_form')
  RETURNING id INTO v_message_id;

  RETURN jsonb_build_object('success', true, 'message_id', v_message_id);
END;
$function$;