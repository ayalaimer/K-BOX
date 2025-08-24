
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface BlogPostSummary {
  slug: string;
  title: string;
  metaDescription: string;
  heroImage: string;
  publishedAt: string;
  readTime: string;
  author?: string;
  tags?: string[];
  language?: 'he' | 'en';
}

export const useBlogList = (language: 'he' | 'en' = 'he') => {
  const [posts, setPosts] = useState<BlogPostSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadPosts = async () => {
      try {
        setLoading(true);
        setError(null);

        const { data, error } = await (supabase as any)
          .from('blog_posts')
          .select('slug, title, meta_description, hero_image, published_at, read_time, author, tags, language')
          .eq('language', language)
          .eq('status', 'published')
          .order('published_at', { ascending: false, nullsFirst: false });

        if (error) throw error;

        const mapped: BlogPostSummary[] = (data ?? []).map((p: any) => ({
          slug: p.slug,
          title: p.title,
          metaDescription: p.meta_description ?? '',
          heroImage: p.hero_image ?? '/placeholder.svg',
          publishedAt: p.published_at ? new Date(p.published_at).toISOString().slice(0, 10) : new Date().toISOString().slice(0, 10),
          readTime: p.read_time ?? '5 דקות קריאה',
          author: p.author ?? undefined,
          tags: p.tags ?? undefined,
          language: p.language,
        }));

        setPosts(mapped);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load posts');
      } finally {
        setLoading(false);
      }
    };

    loadPosts();
  }, [language]);

  const refreshPosts = async () => {
    setLoading(true);
    try {
      const { data, error } = await (supabase as any)
        .from('blog_posts')
        .select('slug, title, meta_description, hero_image, published_at, read_time, author, tags, language')
        .eq('language', language)
        .order('published_at', { ascending: false, nullsFirst: false });

      if (error) throw error;

      const mapped: BlogPostSummary[] = (data ?? []).map((p: any) => ({
        slug: p.slug,
        title: p.title,
        metaDescription: p.meta_description ?? '',
        heroImage: p.hero_image ?? '/placeholder.svg',
        publishedAt: p.published_at ? new Date(p.published_at).toISOString().slice(0, 10) : new Date().toISOString().slice(0, 10),
        readTime: p.read_time ?? '5 דקות קריאה',
        author: p.author ?? undefined,
        tags: p.tags ?? undefined,
        language: p.language,
      }));

      setPosts(mapped);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to refresh posts');
    } finally {
      setLoading(false);
    }
  };

  return { posts, loading, error, refreshPosts };
};
