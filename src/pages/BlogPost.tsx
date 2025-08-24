import { useParams, useLocation } from "react-router-dom";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { useBlogPost } from "@/hooks/useBlogPost";
import { BlogPostRenderer } from "@/components/BlogPostRenderer";
import { useLanguage } from "@/contexts/LanguageContext";
import { useTranslation } from "@/hooks/useTranslation";

const BlogPost = () => {
  const { slug } = useParams<{ slug: string }>();
  const { language } = useLanguage();
  const { t } = useTranslation();
  const { post, loading, error } = useBlogPost(slug || '', language);

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 container mx-auto px-4 py-8">
          <div className="flex items-center justify-center h-64">
            <p>{t('blog.loading')}</p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (error || !post) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 container mx-auto px-4 py-8">
          <div className="flex items-center justify-center h-64">
            <p>{t('blog.postNotFound')}</p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return <BlogPostRenderer post={post} />;
};

export default BlogPost;