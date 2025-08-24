
-- 1) סוג סטטוס לפוסטים
do $$
begin
  if not exists (select 1 from pg_type where typname = 'blog_status') then
    create type public.blog_status as enum ('draft', 'published', 'archived');
  end if;
end $$;

-- 2) טבלת פוסטים לבלוג
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
  status public.blog_status not null default 'draft',
  content text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (language, slug)
);

-- 3) הפעלת RLS
alter table public.blog_posts enable row level security;

-- 4) מדיניות RLS
-- כולם יכולים לצפות בפוסטים שפורסמו
create policy if not exists "Anyone can view published blog posts"
  on public.blog_posts
  for select
  using (status = 'published'::public.blog_status);

-- אדמינים יכולים לצפות בכל הפוסטים (כולל טיוטות וארכיון)
create policy if not exists "Admins can select all blog posts"
  on public.blog_posts
  for select
  using (public.has_role(auth.uid(), 'admin'::public.app_role));

-- אדמינים יכולים להוסיף פוסטים
create policy if not exists "Admins can insert blog posts"
  on public.blog_posts
  for insert
  with check (public.has_role(auth.uid(), 'admin'::public.app_role));

-- אדמינים יכולים לעדכן פוסטים
create policy if not exists "Admins can update blog posts"
  on public.blog_posts
  for update
  using (public.has_role(auth.uid(), 'admin'::public.app_role))
  with check (public.has_role(auth.uid(), 'admin'::public.app_role));

-- אדמינים יכולים למחוק פוסטים
create policy if not exists "Admins can delete blog posts"
  on public.blog_posts
  for delete
  using (public.has_role(auth.uid(), 'admin'::public.app_role));

-- 5) אינדקסים לשיפור ביצועים
create index if not exists idx_blog_posts_status_lang_pubdate
  on public.blog_posts (status, language, published_at desc);

-- 6) טריגר עדכון updated_at
do $$
begin
  if not exists (
    select 1 from pg_trigger where tgname = 'trg_blog_posts_set_updated_at'
  ) then
    create trigger trg_blog_posts_set_updated_at
      before update on public.blog_posts
      for each row
      execute function public.update_updated_at_column();
  end if;
end $$;
