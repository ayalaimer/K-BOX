-- Create booking email templates table
create table public.booking_email_templates (
  id uuid primary key default gen_random_uuid(),
  status text not null,
  language text not null default 'he',
  subject text not null,
  body_html text not null,
  enabled boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint booking_email_templates_unique unique (status, language)
);

alter table public.booking_email_templates enable row level security;

create policy "Anyone can view booking email templates"
  on public.booking_email_templates for select
  using (true);

create policy "Admins can insert booking email templates"
  on public.booking_email_templates for insert
  with check (has_role(auth.uid(), 'admin'));

create policy "Admins can update booking email templates"
  on public.booking_email_templates for update
  using (has_role(auth.uid(), 'admin'))
  with check (has_role(auth.uid(), 'admin'));

create policy "Admins can delete booking email templates"
  on public.booking_email_templates for delete
  using (has_role(auth.uid(), 'admin'));

-- updated_at trigger
create trigger set_updated_at_booking_email_templates
before update on public.booking_email_templates
for each row execute function public.update_updated_at_column();

-- Create business settings table
create table public.business_settings (
  id uuid primary key default gen_random_uuid(),
  company_name text not null,
  address text,
  phone text,
  email text,
  website text,
  logo_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.business_settings enable row level security;

create policy "Anyone can view business settings"
  on public.business_settings for select
  using (true);

create policy "Admins can insert business settings"
  on public.business_settings for insert
  with check (has_role(auth.uid(), 'admin'));

create policy "Admins can update business settings"
  on public.business_settings for update
  using (has_role(auth.uid(), 'admin'))
  with check (has_role(auth.uid(), 'admin'));

create policy "Admins can delete business settings"
  on public.business_settings for delete
  using (has_role(auth.uid(), 'admin'));

-- updated_at trigger
create trigger set_updated_at_business_settings
before update on public.business_settings
for each row execute function public.update_updated_at_column();
