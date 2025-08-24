import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, Clock, ArrowRight } from "lucide-react";
import { Helmet } from "react-helmet-async";
import { useBlogList } from "@/hooks/useBlogList";
import { useLanguage } from "@/contexts/LanguageContext";
import { useTranslation } from "@/hooks/useTranslation";
import { Link } from "react-router-dom";

const Blog = () => {
  const { language } = useLanguage();
  const { t } = useTranslation();
  const { posts, loading, error } = useBlogList(language);
  
  const langPrefix = `/${language}`;

  return (
    <>
      <Helmet>
        <title>{t('blog.title')} | {language === 'he' ? 'טיפים ומדריכים לחוויה מושלמת' : 'Tips and Guides for Perfect Experience'}</title>
        <meta name="description" content={t('blog.description')} />
        <meta name="keywords" content={language === 'he' ? 'בלוג קריוקי ירושלים, טיפים קריוקי, מדריך קריוקי, מבצעי קריוקי' : 'Jerusalem karaoke blog, karaoke tips, karaoke guide, karaoke promotions'} />
        <meta property="og:title" content={t('blog.title')} />
        <meta property="og:description" content={t('blog.description')} />
        <meta property="og:type" content="website" />
        <link rel="canonical" href={`https://yoursite.com${langPrefix}/blog`} />
      </Helmet>

      <div className="min-h-screen flex flex-col">
        <Header />
        
        <main className="flex-1 container mx-auto px-4 py-8">
          {/* Breadcrumbs */}
          <nav className="mb-6">
            <ol className="flex items-center space-x-2 text-sm text-muted-foreground">
              <li><Link to={langPrefix} className="hover:text-primary">{t('header.nav.home')}</Link></li>
              <li><ArrowRight className="h-4 w-4 mx-2" /></li>
              <li>{t('header.nav.blog')}</li>
            </ol>
          </nav>

          {/* Page Header */}
          <header className="mb-12 text-center">
            <h1 className="text-4xl font-bold mb-4">{t('blog.title')}</h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              {t('blog.description')}
            </p>
          </header>

          {/* Blog Posts Grid */}
          {loading ? (
            <div className="text-center py-12">
              <p>{t('blog.loading')}</p>
            </div>
          ) : error ? (
            <div className="text-center py-12">
              <p className="text-destructive">{t('blog.error')}: {error}</p>
            </div>
          ) : posts.length === 0 ? (
            <div className="text-center py-12">
              <p>{t('blog.noPosts')}</p>
            </div>
          ) : (
            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
              {posts.map((post) => (
                <Card key={post.slug} className="overflow-hidden hover:shadow-lg transition-shadow">
                  <div className="aspect-video overflow-hidden">
                    <img 
                      src={post.heroImage} 
                      alt={post.title}
                      className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                  <CardHeader>
                    <CardTitle className="line-clamp-2 hover:text-primary transition-colors">
                      <Link to={`${langPrefix}/blog/${post.slug}`}>
                        {post.title}
                      </Link>
                    </CardTitle>
                    <CardDescription className="line-clamp-3">
                      {post.metaDescription}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between text-sm text-muted-foreground mb-4">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4" />
                        <span>{post.publishedAt}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4" />
                        <span>{post.readTime}</span>
                      </div>
                    </div>
                    <Button variant="outline" className="w-full group" asChild>
                      <Link to={`${langPrefix}/blog/${post.slug}`}>
                        {t('blog.readMore')}
                        <ArrowRight className="mr-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                      </Link>
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {/* CTA Section */}
          <section className="mt-16 text-center bg-primary/5 rounded-lg p-8">
            <h2 className="text-3xl font-bold mb-4">{t('booking.title')}?</h2>
            <p className="text-xl text-muted-foreground mb-6">
              {t('booking.description')}
            </p>
            <Button size="lg" asChild>
              <Link to={`${langPrefix}#booking`}>{t('header.quickBooking')}</Link>
            </Button>
          </section>
        </main>
        
        <Footer />
      </div>
    </>
  );
};

export default Blog;