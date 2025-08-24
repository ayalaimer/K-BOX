
-- 1) Add language and included_features columns to promotions
alter table public.promotions
  add column if not exists language text not null default 'he',
  add column if not exists included_features jsonb not null default '[]';

comment on column public.promotions.language is 'Content language code for this promotion (e.g., he, en)';
comment on column public.promotions.included_features is 'Freeform list of items included in the promotion (array of strings)';

-- 2) Helpful index for public reads by language and status
create index if not exists promotions_is_active_language_idx
  on public.promotions (is_active, language);
