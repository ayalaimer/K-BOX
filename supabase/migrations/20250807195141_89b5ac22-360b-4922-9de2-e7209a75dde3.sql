-- Assign admin role to the provided user email
INSERT INTO public.user_roles (user_id, role)
SELECT id, 'admin'::public.app_role
FROM auth.users
WHERE email = 'info@kbox.co.il'
ON CONFLICT (user_id, role) DO NOTHING;