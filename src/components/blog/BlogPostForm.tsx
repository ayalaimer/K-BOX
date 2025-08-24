import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeRaw from "rehype-raw";
import { toast } from "@/hooks/use-toast";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { parseMarkdownToStructured } from "@/utils/markdownToStructured";
import { logInfo, logError } from "@/lib/logging";
interface BlogPostFormProps {
  onSaveSuccess?: () => void;
}

type Lang = "he" | "en";

function slugify(input: string) {
  // Allow unicode (Hebrew included); trim and convert spaces to dashes
  return input
    .trim()
    .replace(/\s+/g, "-") // spaces to dashes
    .replace(/["'`]/g, "") // remove quotes
    .replace(/-+/g, "-")
    .toLowerCase();
}

function computeReadTime(text: string) {
  const words = text.split(/\s+/).filter(Boolean).length;
  const minutes = Math.max(1, Math.round(words / 200));
  return `${minutes} min read`;
}


export const BlogPostForm = ({ onSaveSuccess }: BlogPostFormProps) => {
  const [language, setLanguage] = useState<Lang>("he");
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [content, setContent] = useState("");
  const [saving, setSaving] = useState(false);
  const [session, setSession] = useState<unknown>(null);

  // Keep slug in sync with title but allow manual edits if needed
  useEffect(() => {
    setSlug(slugify(title));
  }, [title]);

  useEffect(() => {
    let mounted = true;
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (mounted) setSession(session);
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (mounted) setSession(session);
    });
    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const structured = useMemo(() => parseMarkdownToStructured(content || ""), [content]);
  const readTime = useMemo(() => computeReadTime(structured.content || ""), [structured]);
  const handleSave = async () => {
    const fm: any = structured.frontMatter || {};
    const body = (structured.content || "").trim();

    const effectiveTitle = (title || fm.title || "").trim();
    if (!effectiveTitle) {
      toast({ title: "שגיאה", description: "יש להזין כותרת לפוסט" });
      return;
    }
    if (!body) {
      toast({ title: "שגיאה", description: "יש להזין תוכן Markdown" });
      return;
    }

    setSaving(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast({ title: "נדרשת התחברות", description: "עליך להתחבר עם Supabase כדי לשמור פוסטים" });
        return;
      }

      const today = (fm.date as string) || new Date().toISOString().slice(0, 10);
      const metaDescription = fm.meta_description || fm.og_description || null;
      const heroImage = (fm.hero_image && fm.hero_image.url) || fm.og_image || null;
      const tags = Array.isArray(fm.keywords) ? fm.keywords : null;
      const author = fm.author || null;

      const postSlug = slug || slugify(effectiveTitle);

      // Check if post exists (by slug + language)
      const { data: existing, error: fetchErr } = await supabase
        .from("blog_posts")
        .select("id")
        .eq("slug", postSlug)
        .eq("language", language)
        .maybeSingle();

      if (fetchErr) throw fetchErr;

      if (existing?.id) {
        const { error: updateErr } = await supabase
          .from("blog_posts")
          .update({
            title: effectiveTitle,
            h1_title: effectiveTitle,
            content: body,
            intro_text: structured.introText || null,
            read_time: readTime,
            status: "published",
            meta_title: fm.meta_title || effectiveTitle,
            meta_description: metaDescription,
            hero_image: heroImage,
            hero_image_alt: (fm.hero_image && fm.hero_image.alt) || null,
            local_seo_text: fm.local_seo_text || fm.local_seo || null,
            sections: structured.sections as any,
            faq: structured.faq as any,
            toc: structured.toc as any,
            schema: structured.schema as any,
            tags,
            author,
            updated_at: new Date().toISOString(),
          })
          .eq("id", existing.id);
        if (updateErr) throw updateErr;
        await logInfo('Blog post updated', { component: 'BlogPostForm', context: { slug: postSlug, language } });
      } else {
        const { error: insertErr } = await supabase.from("blog_posts").insert([
          {
            language,
            slug: postSlug,
            title: effectiveTitle,
            h1_title: effectiveTitle,
            content: body,
            intro_text: structured.introText || null,
            read_time: readTime,
            status: "published",
            published_at: today,
            meta_title: fm.meta_title || effectiveTitle,
            meta_description: metaDescription,
            hero_image: heroImage,
            hero_image_alt: (fm.hero_image && fm.hero_image.alt) || null,
            local_seo_text: fm.local_seo_text || fm.local_seo || null,
            sections: structured.sections as any,
            faq: structured.faq as any,
            toc: structured.toc as any,
            schema: structured.schema as any,
            tags,
            author,
          },
        ]);
        if (insertErr) throw insertErr;
        await logInfo('Blog post created', { component: 'BlogPostForm', context: { slug: postSlug, language } });
      }

      toast({ title: "נשמר בהצלחה", description: "הפוסט פורסם או עודכן" });
      onSaveSuccess?.();
    } catch (e: any) {
      console.error("Save blog post error", e);
      const msg = e?.message || "נסה שוב";
      const perm = /row level security|RLS|permission|insufficient/i.test(msg);
      await logError('Blog post save failed', { component: 'BlogPostForm', context: { message: msg } });
      toast({ title: perm ? "אין הרשאות" : "שגיאה בשמירה", description: perm ? "יש להתחבר כ-Admin דרך /auth" : msg });
    } finally {
      setSaving(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>יצירת פוסט בלוג</CardTitle>
        <CardDescription>בחר שפה, הזן כותרת ותוכן Markdown. תצוגה מקדימה תוצג מטה.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid gap-4 md:grid-cols-3">
          <div className="space-y-2">
            <Label htmlFor="language">שפה</Label>
            <Select value={language} onValueChange={(v: Lang) => setLanguage(v)}>
              <SelectTrigger id="language">
                <SelectValue placeholder="בחר שפה" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="he">עברית</SelectItem>
                <SelectItem value="en">English</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="title">שם הפוסט</Label>
            <Input id="title" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="כותרת / H1" />
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="content">תוכן Markdown</Label>
            <Textarea
              id="content"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="הדבק כאן את התוכן לפי התבנית שלך"
              className="min-h-[240px]"
            />
            <div className="text-sm text-muted-foreground">זמן קריאה מוערך: {readTime}</div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="slug">Slug (נוצר אוטומטית)</Label>
            <Input id="slug" value={slug} onChange={(e) => setSlug(slugify(e.target.value))} />
            <Button onClick={handleSave} disabled={saving || !session} className="mt-4 w-full">
              {saving ? "שומר..." : "שמור פוסט"}
            </Button>
            {!session && <p className="text-sm text-muted-foreground mt-2">כדי לשמור פוסט יש להתחבר דרך <a href="/auth" className="underline">מסך ההתחברות</a>.</p>}
          </div>
        </div>

        <div className="space-y-2">
          <Label>תצוגה מקדימה</Label>
          <div className="max-w-none border rounded-md p-4" dir={language === "he" ? "rtl" : "ltr"} lang={language}>
            {structured.sections.length ? (
              <article className="space-y-6">
                {structured.sections.map((section, idx) => {
                  switch (section.type) {
                    case 'h2':
                      return <h2 key={idx} id={section.anchor} className="text-2xl font-bold mt-6">{section.title}</h2>;
                    case 'h3':
                      return <h3 key={idx} id={section.anchor} className="text-xl font-semibold mt-4">{section.title}</h3>;
                    case 'quote':
                      return (
                        <blockquote key={idx} className="border-l-4 pl-4 italic">
                          <ReactMarkdown remarkPlugins={[remarkGfm]}>{section.content}</ReactMarkdown>
                        </blockquote>
                      );
                    case 'image':
                      return (
                        <img key={idx} src={section.content} alt={section.imageAlt || section.title || ''} className="rounded-md" />
                      );
                    case 'list':
                      return (
                        section.ordered ? (
                          <section key={idx} className="w-full">
                            <ul className="space-y-4">
                              {(section.items || []).map((text, i2) => (
                                <li key={i2} className="flex items-start gap-4">
                                  <div className="h-8 w-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold shadow-button">{i2 + 1}</div>
                                  <div className="bg-card border rounded-md p-3 shadow-card w-full">
                                    <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeRaw]}>{text}</ReactMarkdown>
                                  </div>
                                </li>
                              ))}
                            </ul>
                          </section>
                        ) : (
                          <div key={idx} className="prose dark:prose-invert">
                            <ReactMarkdown remarkPlugins={[remarkGfm]}>{(section.items || []).map(i => `- ${i}`).join('\n')}</ReactMarkdown>
                          </div>
                        )
                      );
                    case 'cta':
                      return (
                        <section key={idx} className="text-center rounded-xl p-6 bg-gradient-primary text-primary-foreground shadow-glow">
                          <h3 className="text-xl font-bold mb-2">{section.title || 'רוצים להזמין?'}</h3>
                          <p className="mb-4 opacity-90">{section.content}</p>
                          {section.ctaLink && (
                            <Button asChild>
                              <a href={section.ctaLink}>{section.ctaText || 'בדוק זמינות עכשיו'}</a>
                            </Button>
                          )}
                        </section>
                      );
                  }
                })}

                {structured.faq.length ? (
                  <section className="mt-8">
                    <h3 className="text-xl font-semibold mb-2">שאלות ותשובות</h3>
                    <Accordion type="single" collapsible className="w-full">
                      {structured.faq.map((item, i) => (
                        <AccordionItem key={i} value={`faq-${i}`}>
                          <AccordionTrigger className="text-right">{item.question}</AccordionTrigger>
                          <AccordionContent>
                            <div className="prose dark:prose-invert max-w-none">
                              <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeRaw]}>{item.answer}</ReactMarkdown>
                            </div>
                          </AccordionContent>
                        </AccordionItem>
                      ))}
                    </Accordion>
                  </section>
                ) : null}
              </article>
            ) : (
              <div className="prose dark:prose-invert max-w-none">
                <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeRaw]}>
                  {structured.content || "אין תוכן"}
                </ReactMarkdown>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
