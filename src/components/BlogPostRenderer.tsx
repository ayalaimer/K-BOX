import { useParams, Link } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { ShareButtons } from '@/components/blog/ShareButtons';
import { ScrollTriggeredCTA } from '@/components/blog/ScrollTriggeredCTA';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Calendar, Clock, ArrowRight, User } from 'lucide-react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { parseMarkdownToStructured } from '@/utils/markdownToStructured';
import { AspectRatio } from '@/components/ui/aspect-ratio';
import BlogTOC from '@/components/blog/BlogTOC';
import StepsFlow from '@/components/blog/StepsFlow';

interface BlogPostRendererProps {
  markdownContent?: string;
  post?: any;
}

function parseFrontMatter(src: string): { data: any; content: string } {
  if (!src) return { data: {}, content: '' };
  const lines = src.replace(/^\uFEFF/, '').split('\n');
  let i = 0;
  while (i < lines.length && lines[i].trim() !== '---') i++;
  if (i >= lines.length) return { data: {}, content: src };
  let j = i + 1;
  while (j < lines.length && lines[j].trim() !== '---') j++;
  if (j >= lines.length) return { data: {}, content: src };
  const fmLines = lines.slice(i + 1, j);
  const body = lines.slice(j + 1).join('\n');
  const data: Record<string, any> = {};
  let lastKey: string | null = null;
  const strip = (v: string) => {
    const t = v.trim();
    if ((t.startsWith('"') && t.endsWith('"')) || (t.startsWith("'") && t.endsWith("'"))) return t.slice(1, -1);
    return t;
  };
  for (const raw of fmLines) {
    if (!raw.trim()) continue;
    const arr = raw.match(/^\s*-\s+(.*)$/);
    if (arr && lastKey) {
      if (!Array.isArray(data[lastKey])) data[lastKey] = [];
      (data[lastKey] as any[]).push(strip(arr[1]));
      continue;
    }
    const nested = raw.match(/^\s{2,}([\w_-]+):\s*(.*)$/);
    if (nested && lastKey) {
      data[lastKey] = data[lastKey] && typeof data[lastKey] === 'object' ? data[lastKey] : {};
      (data[lastKey] as any)[nested[1]] = strip(nested[2]);
      continue;
    }
    const top = raw.match(/^([\w_-]+):\s*(.*)$/);
    if (top) {
      const key = top[1];
      const val = top[2];
      if (!val) {
        lastKey = key;
        if (data[key] === undefined) data[key] = undefined;
      } else {
        data[key] = strip(val);
        lastKey = key;
      }
    }
  }
  return { data, content: body };
}

function cleanMarkdown(md: string) {
  if (!md) return '';
  let out = md;
  // Strip HTML comments
  out = out.replace(/<!--[\s\S]*?-->/g, '');
  // Remove raw <img> tags (hero duplication)
  out = out.replace(/<img[^>]*>/gi, '');
  // Remove inline <script> tags
  out = out.replace(/<script[\s\S]*?<\/script>/gi, '');
  // Remove details/summary blocks (we render as FAQ separately)
  out = out.replace(/<details[\s\S]*?<\/details>/gi, '');
  // remove anchor markers like {#summary}
  out = out.replace(/\s*\{#[a-zA-Z0-9_-]+\}\s*$/gm, '');
  // remove sections explicitly marked for schema/structured-data
  out = out.replace(/^(##?|###)\s+.*\{#(?:structured-data|schema)\}$(?:[\s\S]*?)(?=^##?\s|^###\s|\Z)/gim, '');
  // remove plain headings that indicate structured data sections
  out = out.replace(/^(##?|###)\s+(structured data|schema|data structured|נתונים מובנים)\s*$(?:[\s\S]*?)(?=^##?\s|^###\s|\Z)/gim, '');
  // remove fenced JSON/JSON-LD code blocks
  out = out.replace(/```(?:json|json-ld|ld\+json)[\s\S]*?```/gi, '');
  // remove manual TOC sections ("תוכן העניינים" or contains "toc") until next heading or hr
  out = out.replace(/^(##?|###)\s+.*(toc|תוכן העניינים).*$(?:[\s\S]*?)(?=^##?\s|^###\s|^---\s*$|\Z)/gim, '');
  return out;
}

export const BlogPostRenderer = ({ markdownContent, post }: BlogPostRendererProps) => {
  const { slug } = useParams();
  const currentUrl = typeof window !== 'undefined' ? window.location.href : '';

  let fm: any = {};
  let body = '';

  if (post) {
    fm = {
      title: post.title,
      meta_title: post.metaTitle || post.meta_title || post.title,
      meta_description: post.metaDescription || post.meta_description || '',
      hero_image: post.heroImage
        ? { url: post.heroImage, alt: post.heroImageAlt || post.hero_image_alt || post.title }
        : post.hero_image
          ? { url: post.hero_image, alt: post.hero_image_alt || post.title }
          : undefined,
      author: post.author || post.authorName,
      published_at: post.publishedAt || post.published_at,
      updated_at: post.updatedAt || post.updated_at,
      keywords: post.tags || post.keywords,
    };
    body = post.content || '';
  } else if (markdownContent) {
    const parsed = parseFrontMatter(markdownContent);
    fm = parsed.data || {};
    body = parsed.content || '';
  }
  const bodyPre = (body || '')
    .replace(/<!--[\s\S]*?-->/g, '')
    .replace(/<img[^>]*>/gi, '')
    .replace(/<script[\s\S]*?<\/script>/gi, '')
    .replace(/<details[\s\S]*?<\/details>/gi, '');
  const structured = parseMarkdownToStructured(bodyPre);
  const cleaned = cleanMarkdown(bodyPre);
  const readTimeMin = Math.max(1, Math.ceil(cleaned.split(/\s+/).filter(Boolean).length / 200));

  const schemaForHead = post?.schema || structured.schema || {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Article",
        "headline": fm.meta_title || fm.title,
        "description": fm.meta_description,
        "image": fm.hero_image?.url,
        "author": { "@type": "Person", "name": fm.author || "צוות חדרי קריוקי ירושלים" },
        "publisher": { "@type": "Organization", "name": "חדרי קריוקי ירושלים", "logo": { "@type": "ImageObject", "url": "/logo.png" } },
        "datePublished": fm.published_at,
        "dateModified": fm.updated_at || fm.published_at
      }
    ]
  };

const sectionsToRender = (post?.sections?.length ? post.sections : structured.sections) as any[] | undefined;
const faqToRender = (post?.faq?.length ? post.faq : structured.faq) as any[] | undefined;

// Extract <details><summary>Q</summary>A</details> fallback from raw body if needed
const extractFaqFromDetails = (src: string) => {
  const items: { question: string; answer: string }[] = [];
  if (!src) return items;
  const re = /<details>\s*<summary>(.*?)<\/summary>\s*([\s\S]*?)<\/details>/gi;
  let m: RegExpExecArray | null;
  while ((m = re.exec(src))) {
    items.push({ question: m[1].trim(), answer: m[2].trim() });
  }
  return items;
};
const computedFaq = (faqToRender && faqToRender.length ? faqToRender : extractFaqFromDetails(body));

// Markdown components overrides (images with caption, headings styling)
const mdComponents = {
  img: (props: any) => (
    <figure className="mb-6">
      <div className="relative w-full overflow-hidden rounded-xl shadow-glow">
        <AspectRatio ratio={16 / 9}>
          {/* eslint-disable-next-line jsx-a11y/alt-text */}
          <img {...props} className="h-full w-full object-cover" loading="lazy" />
        </AspectRatio>
      </div>
      {props.alt ? <figcaption className="figure-caption">{props.alt}</figcaption> : null}
    </figure>
  ),
  h2: (props: any) => <h2 {...props} className="text-3xl font-bold mt-8 text-gradient-primary" />,
  h3: (props: any) => <h3 {...props} className="text-2xl font-semibold mt-6 text-gradient-primary" />,
};

  return (
<>
  <title>{fm.meta_title || fm.title}</title>
  <meta name="description" content={fm.meta_description || ''} />
  <link rel="canonical" href={currentUrl} />
  <meta property="og:title" content={fm.meta_title || fm.title} />
  <meta property="og:description" content={fm.meta_description || ''} />
  {fm.hero_image?.url && <meta property="og:image" content={fm.hero_image.url} />}
  <meta property="og:url" content={currentUrl} />
  <meta property="og:type" content="article" />
  {fm.published_at && <meta property="article:published_time" content={new Date(fm.published_at).toISOString()} />}
  {(fm.updated_at || fm.published_at) && <meta property="article:modified_time" content={new Date(fm.updated_at || fm.published_at).toISOString()} />}
  <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaForHead) }} />

      <div className="min-h-screen bg-background">
        <Header />
        <ScrollTriggeredCTA />

        <main className="container mx-auto px-4 py-8 max-w-4xl">
          <nav className="mb-6">
            <ol className="flex items-center space-x-2 text-sm text-muted-foreground">
              <li><Link to="/" className="hover:text-primary">בית</Link></li>
              <li><ArrowRight className="h-4 w-4 mx-2" /></li>
              <li><Link to="/blog" className="hover:text-primary">בלוג</Link></li>
              <li><ArrowRight className="h-4 w-4 mx-2" /></li>
              <li className="line-clamp-1">{fm.title}</li>
            </ol>
          </nav>


{fm.hero_image?.url && (
  <figure className="mb-6">
    <div className="relative w-full overflow-hidden rounded-xl shadow-glow">
      <AspectRatio ratio={16 / 9}>
        <img src={fm.hero_image.url} alt={fm.hero_image.alt || fm.title} className="h-full w-full object-cover" loading="eager" />
        <div className="absolute inset-0 bg-gradient-to-t from-background/70 via-transparent to-transparent" />
        <div className="absolute inset-x-0 bottom-0 p-6">
          <h1 className="text-4xl md:text-5xl font-bold leading-tight text-gradient-primary drop-shadow-md">{fm.title}</h1>
        </div>
      </AspectRatio>
    </div>
    {fm.hero_image.alt && (
      <figcaption className="figure-caption">{fm.hero_image.alt}</figcaption>
    )}
  </figure>
)}

{/* Compact TOC */}
<BlogTOC toc={structured.toc} />

{/* Article Content or Structured Sections */}
{sectionsToRender && sectionsToRender.length ? (
  <article className="max-w-none mb-12 space-y-8">
    {(() => {
      let skipUntil = -1;
      let lastHeadingAnchor: string | undefined;
      let lastHeadingTitle: string | undefined;
      const looksLikeSteps = (title?: string) => /(^|\b)(steps?|צעדים|צעד|שלבים)($|\b)/i.test(title || '');
      const sanitizeInline = (s: string) => s
        .replace(/<details[\s\S]*?<\/details>/gi, '')
        .replace(/<!--[\s\S]*?-->/g, '')
        .replace(/<img[^>]*>/gi, '')
        .replace(/<script[\s\S]*?<\/script>/gi, '');
      return sectionsToRender.map((section: any, idx: number) => {
        if (idx <= skipUntil) return null;

        // Hide manual TOC or Structured Data headings
        const lowerTitle = (section.title || '').toLowerCase();
        if ((section.type === 'h2' || section.type === 'h3') && (
          ['תוכן העניינים', 'table of contents', 'structured data', 'schema', 'נתונים מובנים'].includes(lowerTitle)
        )) {
          // If this is the manual TOC heading, skip following blocks until next heading
          if (['תוכן העניינים', 'table of contents'].includes(lowerTitle)) {
            let j = idx + 1;
            while (j < (sectionsToRender?.length || 0)) {
              const next = sectionsToRender![j];
              if (next.type === 'h2' || next.type === 'h3') break;
              j++;
            }
            skipUntil = Math.max(skipUntil, j - 1);
          }
          return null;
        }

        // TL;DR or Summary special container
        if ((section.type === 'h2' || section.type === 'h3') && (/^(tl;dr|סיכום)$/i.test(section.title || ''))) {
          const blocks: any[] = [];
          let j = idx + 1;
          while (j < (sectionsToRender?.length || 0)) {
            const next = sectionsToRender![j];
            if (next.type === 'h2' || next.type === 'h3') break;
            if (next.type === 'paragraph' || next.type === 'quote' || next.type === 'list') {
              blocks.push(
                <div key={`tldr-${j}`} className="prose dark:prose-invert max-w-none">
                  <ReactMarkdown remarkPlugins={[remarkGfm]} components={mdComponents}>{next.content || (next.items || []).map((i: string) => `- ${i}`).join('\n')}</ReactMarkdown>
                </div>
              );
            }
            j++;
          }
          skipUntil = Math.max(skipUntil, j - 1);
          return (
            <section key={idx} className="rounded-xl p-6 bg-[hsl(var(--karaoke-purple)/0.12)] border border-[hsl(var(--karaoke-purple)/0.3)] shadow-card">
              <h2 className="text-xl font-bold mb-3 text-gradient-primary">TL;DR</h2>
              <div className="space-y-3">{blocks}</div>
            </section>
          );
        }

        // Track last heading context
        if (section.type === 'h2' || section.type === 'h3') {
          lastHeadingAnchor = section.anchor;
          lastHeadingTitle = section.title;
        }

        switch (section.type) {
          case 'h2':
            return <h2 key={idx} id={section.anchor} className="text-3xl font-bold mt-8 text-gradient-primary">{section.title}</h2>;
          case 'h3':
            return <h3 key={idx} id={section.anchor} className="text-2xl font-semibold mt-6 text-gradient-primary">{section.title}</h3>;
          case 'quote':
            return (
              <blockquote key={idx} className="border-l-4 border-primary pl-4 italic bg-muted/50 p-4 rounded-r-lg">
                <ReactMarkdown remarkPlugins={[remarkGfm]} components={mdComponents}>{section.content}</ReactMarkdown>
              </blockquote>
            );
          case 'image':
            return (
              <figure key={idx}>
                <div className="relative w-full overflow-hidden rounded-xl shadow-glow">
                  <AspectRatio ratio={16 / 9}>
                    <img src={section.content} alt={section.imageAlt || section.title || fm.title} className="h-full w-full object-cover" />
                  </AspectRatio>
                </div>
                {section.imageAlt && <figcaption className="figure-caption">{section.imageAlt}</figcaption>}
              </figure>
            );
          case 'list': {
            const shouldRenderAsSteps = !!section.ordered && (
              (lastHeadingAnchor && lastHeadingAnchor.toLowerCase() === 'steps') || looksLikeSteps(lastHeadingTitle)
            );
            if (shouldRenderAsSteps) {
              return <StepsFlow key={idx} items={section.items || []} />;
            }
            return (
              <div key={idx} className="prose dark:prose-invert">
                <ReactMarkdown remarkPlugins={[remarkGfm]} components={mdComponents}>{(section.items || []).map((i: string) => `- ${i}`).join('\n') || section.content}</ReactMarkdown>
              </div>
            );
          }
          case 'cta':
            return (
              <div key={idx} className="text-center">
                {section.ctaLink && (
                  <Button size="lg" asChild className="shadow-button">
                    <Link to={section.ctaLink}>{section.ctaText || 'בדוק זמינות עכשיו'}</Link>
                  </Button>
                )}
              </div>
            );
          default:
            return (
              <div key={idx} className="prose dark:prose-invert max-w-none">
                <ReactMarkdown remarkPlugins={[remarkGfm]} components={mdComponents}>{sanitizeInline(section.content)}</ReactMarkdown>
              </div>
            );
        }
      });
    })()}
  </article>
) : (
  <article className="prose prose-lg dark:prose-invert max-w-none mb-12 blog-content">
    <ReactMarkdown remarkPlugins={[remarkGfm]} components={mdComponents}>{cleaned}</ReactMarkdown>
  </article>
)}

          {/* FAQ Accordion */}
          {computedFaq && computedFaq.length ? (
            <section className="mt-12 bg-card border rounded-xl p-4 shadow-card">
              <h2 className="text-2xl font-semibold mb-4">שאלות ותשובות</h2>
              <Accordion type="single" collapsible className="w-full">
                {computedFaq.map((item: any, i: number) => (
                  <AccordionItem key={i} value={`faq-${i}`} className="rounded-lg">
                    <AccordionTrigger className="text-right font-semibold hover:text-primary transition-smooth">
                      {item.question}
                    </AccordionTrigger>
                    <AccordionContent>
                      <div className="prose dark:prose-invert max-w-none">
                        <ReactMarkdown remarkPlugins={[remarkGfm]}>{item.answer}</ReactMarkdown>
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </section>
          ) : null}

          {/* CTA Section (fallback) */}
          <section className="text-center bg-primary/5 rounded-lg p-8">
            <h2 className="text-3xl font-bold mb-4">מוכנים להזמין חדר קריוקי?</h2>
            <p className="text-xl text-muted-foreground mb-6">בדקו זמינות תאריכים והזמינו אונליין בקלות</p>
            <Button size="lg" asChild>
              <Link to="/#booking">בדוק זמינות עכשיו</Link>
            </Button>
          </section>
        </main>

        <Footer />
      </div>
    </>
  );
};

export default BlogPostRenderer;