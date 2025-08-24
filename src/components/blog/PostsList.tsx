
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { FileText, Trash2, Eye, Calendar } from 'lucide-react';
import { useBlogList } from '@/hooks/useBlogList';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { logInfo, logError } from '@/lib/logging';

interface PostsListProps {
  onPostDeleted: () => void;
}

export const PostsList = ({ onPostDeleted }: PostsListProps) => {
  const { posts, loading, error, refreshPosts } = useBlogList();
  const { toast } = useToast();

  const handleDelete = async (slug: string) => {
    try {
      const { error } = await (supabase as any).from('blog_posts').delete().eq('slug', slug);
      if (error) throw error;
      await logInfo('Blog post deleted', { component: 'PostsList', context: { slug } });
      toast({
        title: "הפוסט נמחק",
        description: `הפוסט "${slug}" הוסר בהצלחה`,
      });
      refreshPosts();
      onPostDeleted();
    } catch (error: any) {
      await logError('Blog post delete failed', { component: 'PostsList', context: { slug, message: error?.message } });
      toast({
        title: "שגיאה במחיקה",
        description: "אירעה שגיאה בעת מחיקת הפוסט",
        variant: "destructive"
      });
    }
  };

  const handleView = (slug: string, language: string = 'he') => {
    window.open(`/${language}/blog/${slug}`, '_blank');
  };
  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>פוסטים קיימים</CardTitle>
        </CardHeader>
        <CardContent>
          <p>טוען...</p>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>פוסטים קיימים</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-destructive">שגיאה: {error}</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-5 w-5" />
          פוסטים קיימים ({posts.length})
        </CardTitle>
        <CardDescription>
          ניהול הפוסטים הקיימים בבלוג
        </CardDescription>
      </CardHeader>
      <CardContent>
        {posts.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>אין פוסטים עדיין</p>
            <p className="text-sm">העלה קובץ Markdown כדי להתחיל</p>
          </div>
        ) : (
          <div className="space-y-4">
            {posts.map((post) => (
              <div key={`${post.language}-${post.slug}`} className="border rounded-lg p-4 hover:bg-muted/50 transition-colors">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold truncate">{post.title}</h3>
                    <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                      {post.metaDescription}
                    </p>
                    <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {post.publishedAt}
                      </span>
                      <span>{post.readTime}</span>
                      <Badge variant="secondary" className="text-xs">
                        {post.slug}
                      </Badge>
                      {post.language && (
                        <Badge variant="outline" className="text-xs">
                          {post.language.toUpperCase()}
                        </Badge>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-2 flex-shrink-0">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleView(post.slug, post.language || 'he')}
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDelete(post.slug)}
                      className="text-destructive hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
