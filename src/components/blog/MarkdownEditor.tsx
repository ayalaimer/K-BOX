import { useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Save, Eye, FileText, Bold, Italic, List, Link, Image, Table, MessageSquare } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import matter from 'gray-matter';

interface MarkdownEditorProps {
  value: string;
  onChange: (value: string) => void;
  onSave: () => void;
}

const TEMPLATE_MARKDOWN = `---
title: "איך לבחור חדר קריוקי בירושלים: מדריך מקומי מלא"
meta_title: "איך לבחור חדר קריוקי בירושלים │ מדריך 8 צעדים + טיפים למחיר"
meta_description: "גלה איך לחסוך עד 20 ₪ לשעה והזמן אונליין. מדריך מקיף לבחירת חדר הקריוקי המושלם בירושלים."
keywords:
  - קריוקי ירושלים
  - חדר קריוקי
  - מחיר קריוקי
  - הזמנת קריוקי
hero_image:
  url: "https://example.com/image.jpg"
  alt: "חדר קריוקי בירושלים עם תאורה צבעונית"
author: "צוות KBOM"
published_at: "${new Date().toISOString()}"
---

![חדר קריוקי בירושלים עם תאורה צבעונית](https://example.com/image.jpg "חדר קריוקי בירושלים עם תאורה צבעונית")

> מחפשים חדר קריוקי מושלם בירושלים? המדריך הזה יעזור לכם לבחור נכון, לחסוך כסף **ולקבוע תאריך תוך 3 דקות** – בלי כאב ראש ובלי הפתעות במחיר.

---

## תוכן העניינים  {#toc}
1. [למה חשוב לבחור נכון?](#pain)
2. [8 צעדים לבחירה מוצלחת](#steps)
3. [טיפים למחירי דקה ושעה](#pricing)
4. [שאלות נפוצות](#faq)
5. [קריאת פעולה](#cta)
6. [קצת לוקאלי על ירושלים](#local)

---

## למה בחירה לא נכונה עלולה לחרב את הערב?  {#pain}

דמיינו שמזמינים את כל החבר׳ה, מגיעים בהתרגשות – ופתאום האקוסטיקה מזייפת יותר מהשיר הראשון שלכם. 🤯  
בחירה פזיזה של חדר קריוקי בירושלים יכולה לעלות לכם:

- ### כסף מיותר  
- ### סאונד צורם  
- ### שירות שלא זמין בשבת/חג  
- ### ביטול ברגע האחרון  

## 8 צעדים לבחירת חדר קריוקי מנצח  {#steps}

| צעד | מה בודקים? | מדד מומלץ |
|-----|------------|-----------|
| 1 | איטום אקוסטי | ≥ 60 dB STC |
| 2 | ספריית שירים | ‎30 K+ (עברית, אנגלית, ספרדית) |
| 3 | ציוד סאונד | מיקרופון דינמי + מיקסר דיגיטלי |
| 4 | תאורה מתחלפת | RGB + מצב "סטודיו" |
| 5 | מחיר שקוף | חבילות 60/90/120 דק׳ כולל שתייה |
| 6 | נגישות | רמפה + שירותים תואמים |
| 7 | זמינות | 24/7 או לפחות 10:00-02:00 |
| 8 | חוות-דעת | ‎4.5★‎ ומעלה מ-50 ביקורות |

> 💡 **טיפ זהב:** הזמינו אמצע-שבוע (א-ד) וקבלו **15 ₪ הנחה**.

## טיפים למחיר לשעה, לחבילה ולמועדון לקוחות  {#pricing}

- השוואה בין 3 ספקים מובילים בי-ם.  
- קופון סטודנטים ▼  
- מועדון לקוחות למצטרפים בניוזלטר – ‎10 %‎ קבוע.

---

## שאלות נפוצות  {#faq}

<details>
<summary><strong>כמה זמן מראש צריך להזמין חדר קריוקי בירושלים?</strong></summary>

רוב הלקוחות סוגרים שבוע מראש. בסופי-שבוע מומלץ 10-14 יום לפני.
</details>

<details>
<summary><strong>האם אפשר להביא אוכל ושתייה מבחוץ?</strong></summary>

כן, בתיאום מוקדם ובתוספת דמי פיקדון 100 ₪ לניקיון.
</details>

---

## קריאה לפעולה  {#cta}

[🎤 בדקו זמינות והזמינו חדר לשעה >>](#booking)

---

## קצת לוקאלי על ירושלים  {#local}

אנחנו ממוקמים במתחם הבילוי החדש **"דרך חברון 101"**, דקות הליכה מ-טיילת ארמון-הנציב ומתחנת הרכבת הקלה.  
✔ חניה חינם ברח׳ האומן  
✔ קווי אוטובוס 7, 71, 72 עוצרים ליד.
`;

export const MarkdownEditor = ({ value, onChange, onSave }: MarkdownEditorProps) => {
  const [activeTab, setActiveTab] = useState<"edit" | "preview">("edit");

  const insertText = useCallback((before: string, after = '') => {
    const textarea = document.querySelector('textarea') as HTMLTextAreaElement;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = value.substring(start, end);
    const newText = value.substring(0, start) + before + selectedText + after + value.substring(end);
    
    onChange(newText);
    
    // Set cursor position after insertion
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + before.length, start + before.length + selectedText.length);
    }, 0);
  }, [value, onChange]);

  const insertTemplate = () => {
    onChange(TEMPLATE_MARKDOWN);
  };

  const parseMarkdown = () => {
    try {
      const parsed = matter(value);
      return {
        frontMatter: parsed.data,
        content: parsed.content
      };
    } catch (error) {
      return {
        frontMatter: {},
        content: value
      };
    }
  };

  const { frontMatter, content } = parseMarkdown();

  return (
    <div className="space-y-6">
      {/* Toolbar */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span className="font-hebrew-display">עורך Markdown</span>
            <div className="flex items-center gap-2">
              <Button onClick={insertTemplate} variant="outline" size="sm">
                <FileText className="w-4 h-4 ml-2" />
                טען תבנית
              </Button>
              <Button onClick={onSave} className="bg-primary hover:bg-primary/90">
                <Save className="w-4 h-4 ml-2" />
                שמור פוסט
              </Button>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2 mb-4">
            <Button
              onClick={() => insertText('**', '**')}
              variant="outline"
              size="sm"
            >
              <Bold className="w-4 h-4" />
            </Button>
            <Button
              onClick={() => insertText('*', '*')}
              variant="outline"
              size="sm"
            >
              <Italic className="w-4 h-4" />
            </Button>
            <Button
              onClick={() => insertText('\n- ')}
              variant="outline"
              size="sm"
            >
              <List className="w-4 h-4" />
            </Button>
            <Button
              onClick={() => insertText('[טקסט](', ')')}
              variant="outline"
              size="sm"
            >
              <Link className="w-4 h-4" />
            </Button>
            <Button
              onClick={() => insertText('![alt text](', ')')}
              variant="outline"
              size="sm"
            >
              <Image className="w-4 h-4" />
            </Button>
            <Button
              onClick={() => insertText('\n| עמודה 1 | עמודה 2 |\n|---------|----------|\n| תא 1 | תא 2 |\n')}
              variant="outline"
              size="sm"
            >
              <Table className="w-4 h-4" />
            </Button>
            <Button
              onClick={() => insertText('<details>\n<summary><strong>', '</strong></summary>\n\nתשובה כאן\n</details>\n')}
              variant="outline"
              size="sm"
            >
              <MessageSquare className="w-4 h-4" />
            </Button>
          </div>

          {/* Front Matter Preview */}
          {Object.keys(frontMatter).length > 0 && (
            <div className="mb-4 p-3 bg-muted rounded-lg">
              <h4 className="font-semibold mb-2">Front Matter:</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                {frontMatter.title && (
                  <Badge variant="outline">Title: {frontMatter.title}</Badge>
                )}
                {frontMatter.meta_title && (
                  <Badge variant="outline">Meta Title: {frontMatter.meta_title}</Badge>
                )}
                {frontMatter.keywords && Array.isArray(frontMatter.keywords) && (
                  <Badge variant="outline">Keywords: {frontMatter.keywords.length}</Badge>
                )}
                {frontMatter.author && (
                  <Badge variant="outline">Author: {frontMatter.author}</Badge>
                )}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Editor/Preview Tabs */}
      <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as "edit" | "preview")}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="edit">עריכה</TabsTrigger>
          <TabsTrigger value="preview">תצוגה מקדימה</TabsTrigger>
        </TabsList>
        
        <TabsContent value="edit" className="mt-4">
          <Card>
            <CardContent className="p-0">
              <Textarea
                value={value}
                onChange={(e) => onChange(e.target.value)}
                placeholder="כתבו כאן את הפוסט שלכם בפורמט Markdown..."
                className="min-h-[600px] border-none resize-none font-mono text-sm"
                dir="rtl"
              />
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="preview" className="mt-4">
          <Card>
            <CardContent className="p-6 blog-content">
              <ReactMarkdown 
                remarkPlugins={[remarkGfm]}
                components={{
                  table: ({ children }) => (
                    <div className="overflow-x-auto my-6">
                      <table className="w-full">{children}</table>
                    </div>
                  ),
                  img: ({ src, alt }) => (
                    <img 
                      src={src} 
                      alt={alt} 
                      className="w-full max-w-4xl mx-auto rounded-lg shadow-lg my-6"
                      loading="lazy"
                    />
                  ),
                  blockquote: ({ children }) => (
                    <blockquote className="border-r-4 border-primary bg-muted/50 p-4 my-6 italic">
                      {children}
                    </blockquote>
                  ),
                  h1: ({ children }) => (
                    <h1 className="text-4xl font-hebrew-display text-foreground mb-6 mt-8">
                      {children}
                    </h1>
                  ),
                  h2: ({ children }) => (
                    <h2 className="text-3xl font-hebrew-display text-foreground mb-4 mt-8">
                      {children}
                    </h2>
                  ),
                  h3: ({ children }) => (
                    <h3 className="text-2xl font-hebrew-display text-foreground mb-3 mt-6">
                      {children}
                    </h3>
                  ),
                }}
              >
                {content}
              </ReactMarkdown>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};