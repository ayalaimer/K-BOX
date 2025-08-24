-- Add structured content columns to blog_posts for rich rendering
ALTER TABLE public.blog_posts
  ADD COLUMN IF NOT EXISTS meta_title text,
  ADD COLUMN IF NOT EXISTS hero_image_alt text,
  ADD COLUMN IF NOT EXISTS h1_title text,
  ADD COLUMN IF NOT EXISTS intro_text text,
  ADD COLUMN IF NOT EXISTS faq jsonb DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS sections jsonb DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS local_seo_text text,
  ADD COLUMN IF NOT EXISTS schema jsonb DEFAULT '{}'::jsonb,
  ADD COLUMN IF NOT EXISTS toc jsonb DEFAULT '[]'::jsonb;

-- Helpful index for lookups
CREATE INDEX IF NOT EXISTS idx_blog_posts_lang_slug ON public.blog_posts(language, slug);

-- Optional: ensure updated_at auto-updates on updates
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'trg_set_updated_at_blog_posts'
  ) THEN
    CREATE TRIGGER trg_set_updated_at_blog_posts
    BEFORE UPDATE ON public.blog_posts
    FOR EACH ROW
    EXECUTE FUNCTION public.set_updated_at_blog_posts();
  END IF;
END $$;