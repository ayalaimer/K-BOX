
import { useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Upload, FileText, AlertCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import matter from 'gray-matter';
import { supabase } from '@/integrations/supabase/client';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface FileUploadProps {
  onUploadSuccess: () => void;
}

type Lang = 'he' | 'en';

export const FileUpload = ({ onUploadSuccess }: FileUploadProps) => {
  const [isDragging, setIsDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [language, setLanguage] = useState<Lang>('he');
  const { toast } = useToast();

  const computeReadTime = (text: string) => {
    const words = text.trim().split(/\s+/).length;
    const minutes = Math.max(1, Math.ceil(words / 200));
    return `${minutes} דקות קריאה`;
  };

  const pingSearchEngines = async () => {
    // Generate the dynamic sitemap URL (edge function) with your current site origin.
    const origin = window.location.origin;
    const sitemapUrl = `https://vzxuamejtmrndjbdpfjc.supabase.co/functions/v1/sitemap?siteUrl=${encodeURIComponent(origin)}`;

    // Fire-and-forget pings to search engines
    // It's okay if these fail silently; they don't affect the upload result.
    try { fetch(`https://www.google.com/ping?sitemap=${encodeURIComponent(sitemapUrl)}`, { mode: 'no-cors' }); } catch {}
    try { fetch(`https://www.bing.com/ping?sitemap=${encodeURIComponent(sitemapUrl)}`, { mode: 'no-cors' }); } catch {}
  };

  const saveMarkdownToDatabase = async (fileName: string, markdown: string) => {
    const parsed = matter(markdown);
    const fm = parsed.data as any;
    const slug = fileName.replace(/\.md$/i, '');

    // Map front matter -> DB columns
    const title = fm.title || fm.meta_title || slug;
    const meta_description = fm.meta_description || fm.metaDescription || '';
    const hero_image = typeof fm.hero_image === 'object' ? (fm.hero_image?.url || '') : (fm.hero_image || '');
    const published_at = fm.published_at ? new Date(fm.published_at).toISOString().slice(0, 10) : new Date().toISOString().slice(0, 10);
    const author = fm.author || undefined;
    const tags = Array.isArray(fm.keywords) ? fm.keywords : (Array.isArray(fm.tags) ? fm.tags : undefined);
    const body = parsed.content?.trim() || '';
    const read_time = fm.read_time || computeReadTime(body);

    // Upsert so re-upload of same slug+language updates the content
    const { error } = await (supabase as any).from('blog_posts').upsert({
      language,
      slug,
      title,
      meta_description,
      hero_image,
      published_at,
      read_time,
      author,
      tags,
      status: 'published',
      content: body,
    }, { onConflict: 'language,slug' });

    if (error) {
      throw error;
    }
  };

  const handleFileUpload = async (file: File) => {
    if (!file.name.endsWith('.md')) {
      toast({
        title: "שגיאת סוג קובץ",
        description: "ניתן להעלות רק קבצי Markdown (.md)",
        variant: "destructive"
      });
      return;
    }

    setUploading(true);
    try {
      const content = await file.text();
      if (!content.trim()) {
        throw new Error('קובץ ריק');
      }

      await saveMarkdownToDatabase(file.name, content);
      await pingSearchEngines();

      toast({
        title: "הקובץ הועלה בהצלחה!",
        description: `${file.name} נשמר בבסיס הנתונים ונוסף ל-Sitemap`,
      });

      onUploadSuccess();
    } catch (error) {
      console.error('Upload error:', error);
      toast({
        title: "שגיאה בהעלאה",
        description: "אירעה שגיאה בעת העלאת הקובץ",
        variant: "destructive"
      });
    } finally {
      setUploading(false);
    }
  };

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const files = Array.from(e.dataTransfer.files);
    files.forEach(handleFileUpload);
  }, [language]); // language affects how we save

  const onDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const onDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const onFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    files.forEach(handleFileUpload);
  };

  return (
    <Card className="border-2 border-dashed transition-colors duration-200 hover:border-primary/50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Upload className="h-5 w-5" />
          העלאת פוסט בלוג
        </CardTitle>
        <CardDescription>
          גרור קובץ Markdown או לחץ לבחירת קובץ
        </CardDescription>
      </CardHeader>
      <CardContent>
        {/* Language Selector */}
        <div className="mb-4 flex items-center gap-3">
          <Label htmlFor="language">שפה</Label>
          <Select value={language} onValueChange={(v: Lang) => setLanguage(v)}>
            <SelectTrigger id="language" className="w-[160px]">
              <SelectValue placeholder="בחר שפה" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="he">עברית</SelectItem>
              <SelectItem value="en">English</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div
          className={`relative border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
            isDragging 
              ? 'border-primary bg-primary/5' 
              : 'border-muted-foreground/25 hover:border-primary/50'
          }`}
          onDrop={onDrop}
          onDragOver={onDragOver}
          onDragLeave={onDragLeave}
        >
          <input
            type="file"
            accept=".md"
            onChange={onFileSelect}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            disabled={uploading}
            multiple
          />
          
          <div className="space-y-4">
            <FileText className="h-12 w-12 mx-auto text-muted-foreground" />
            <div>
              <h3 className="text-lg font-medium">
                {uploading ? 'מעלה...' : 'בחר קבצי Markdown'}
              </h3>
              <p className="text-sm text-muted-foreground mt-1">
                גרור ושחרר או לחץ לבחירה
              </p>
            </div>
            <Button 
              variant="outline" 
              disabled={uploading}
              className="pointer-events-none"
            >
              בחר קבצים
            </Button>
          </div>
        </div>
        
        <div className="mt-4 flex items-start gap-2 text-sm text-muted-foreground">
          <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
          <div>
            <p className="font-medium">דרישות הקובץ:</p>
            <ul className="list-disc list-inside mt-1 space-y-1">
              <li>קובץ Markdown עם סיומת .md</li>
              <li>Front Matter בתחילת הקובץ (title, meta_description, hero_image.url, וכו')</li>
              <li>שם הקובץ יהיה ה-slug של הפוסט</li>
              <li>בחר שפה (עברית/אנגלית) לפני ההעלאה</li>
            </ul>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
