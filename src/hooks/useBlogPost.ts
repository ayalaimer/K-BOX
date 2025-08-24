
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface BlogPost {
  slug: string;
  title: string;
  metaDescription: string;
  metaTitle?: string;
  heroImage: string;
  heroImageAlt?: string;
  publishedAt: string;
  updatedAt?: string;
  readTime: string;
  content: string;
  author?: string;
  tags?: string[];
  sections?: any[];
  faq?: Array<{ question: string; answer: string }>;
  localSEO?: string;
}


export const useBlogPost = (slug: string, language: 'he' | 'en' = 'he') => {
  const [post, setPost] = useState<BlogPost | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadPost = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Try Supabase first
        const { data, error } = await (supabase as any)
          .from('blog_posts')
          .select('*')
          .eq('slug', slug)
          .eq('language', language)
          .order('updated_at', { ascending: false })
          .limit(1)
          .maybeSingle();

        if (error) throw error;

        if (data) {
          const blogPost: BlogPost = {
            slug,
            title: data.title || 'Untitled',
            metaDescription: data.meta_description || '',
            metaTitle: data.meta_title || undefined,
            heroImage: data.hero_image || '/placeholder.svg',
            heroImageAlt: data.hero_image_alt || undefined,
            publishedAt: data.published_at ? new Date(data.published_at).toISOString().slice(0, 10) : new Date().toISOString().slice(0, 10),
            updatedAt: data.updated_at ? new Date(data.updated_at).toISOString() : undefined,
            readTime: data.read_time || '5 דקות קריאה',
            content: data.content || '',
            author: data.author || undefined,
            tags: data.tags || undefined,
            sections: data.sections || undefined,
            faq: data.faq || undefined,
            localSEO: data.local_seo_text || undefined,
          };
          setPost(blogPost);
          return;
        }

        // No fallback to local files to avoid client Buffer issues
        throw new Error('Post not found');
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load post');
      } finally {
        setLoading(false);
      }
    };

    if (slug) {
      loadPost();
    }
  }, [slug, language]);

  return { post, loading, error };
};
