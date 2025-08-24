-- Create blog_posts table
create table if not exists public.blog_posts (
  id uuid primary key default gen_random_uuid(),
  language text not null check (language in ('he','en')),
  slug text not null,
  title text not null,
  meta_description text,
  hero_image text,
  published_at date,
  read_time text,
  author text,
  tags text[],
  status text not null default 'published',
  content text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (language, slug)
);

-- Enable RLS
alter table public.blog_posts enable row level security;

-- Policies
create policy "Public can read published blog posts"
  on public.blog_posts
  for select
  using (status = 'published');

create policy "Admins can read all blog posts"
  on public.blog_posts
  for select
  using (public.has_role(auth.uid(), 'admin'));

create policy "Admins can insert blog posts"
  on public.blog_posts
  for insert
  with check (public.has_role(auth.uid(), 'admin'));

create policy "Admins can update blog posts"
  on public.blog_posts
  for update
  using (public.has_role(auth.uid(), 'admin'))
  with check (public.has_role(auth.uid(), 'admin'));

create policy "Admins can delete blog posts"
  on public.blog_posts
  for delete
  using (public.has_role(auth.uid(), 'admin'));

-- Trigger to update updated_at
create or replace function public.set_updated_at_blog_posts()
returns trigger as $$
begin
  new.updated_at := now();
  return new;
end;
$$ language plpgsql;

create trigger blog_posts_set_updated_at
before update on public.blog_posts
for each row execute function public.set_updated_at_blog_posts();

-- Helpful indexes
create index if not exists idx_blog_posts_published_at on public.blog_posts (published_at desc nulls last);
create index if not exists idx_blog_posts_language_status on public.blog_posts (language, status);
