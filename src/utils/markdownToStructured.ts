import { BlogSection, FAQItem, TableOfContents } from "@/types/blog";

export interface ParsedMarkdown {
  frontMatter: any;
  content: string;
  sections: BlogSection[];
  faq: FAQItem[];
  toc: TableOfContents[];
  introText: string;
  schema?: any;
}

function slugify(input: string) {
  return input
    .trim()
    .replace(/\s+/g, "-")
    .replace(/["'`]/g, "")
    .replace(/-+/g, "-")
    .toLowerCase();
}

function parseFrontMatter(src: string): { data: any; content: string } {
  if (!src) return { data: {}, content: "" };
  const lines = src.replace(/^\uFEFF/, "").split("\n");
  let i = 0;
  while (i < lines.length && lines[i].trim() !== "---") i++;
  if (i >= lines.length) return { data: {}, content: src };
  let j = i + 1;
  while (j < lines.length && lines[j].trim() !== "---") j++;
  if (j >= lines.length) return { data: {}, content: src };
  const fmLines = lines.slice(i + 1, j);
  const body = lines.slice(j + 1).join("\n");
  const data: any = {};
  let lastParent: string | null = null;
  const stripQuotes = (v: string) => {
    const t = v.trim();
    if ((t.startsWith('"') && t.endsWith('"')) || (t.startsWith("'") && t.endsWith("'"))) return t.slice(1, -1);
    return t;
  };
  for (const raw of fmLines) {
    if (!raw.trim()) continue;
    const arrMatch = raw.match(/^\s*-\s+(.*)$/);
    if (arrMatch && lastParent) {
      if (!Array.isArray(data[lastParent])) data[lastParent] = [];
      (data[lastParent] as any[]).push(stripQuotes(arrMatch[1]));
      continue;
    }
    const nestedMatch = raw.match(/^\s{2,}([\w_-]+):\s*(.*)$/);
    if (nestedMatch && lastParent) {
      if (Array.isArray(data[lastParent])) continue;
      if (typeof data[lastParent] !== "object" || data[lastParent] === null) data[lastParent] = {};
      (data[lastParent] as any)[nestedMatch[1]] = stripQuotes(nestedMatch[2]);
      continue;
    }
    const topMatch = raw.match(/^([\w_-]+):\s*(.*)$/);
    if (topMatch) {
      const key = topMatch[1];
      const val = topMatch[2];
      if (val === "" || val === undefined) {
        lastParent = key;
        if (data[key] === undefined) data[key] = undefined;
      } else {
        data[key] = stripQuotes(val);
        lastParent = key;
      }
    }
  }
  return { data, content: body };
}

export function parseMarkdownToStructured(md: string): ParsedMarkdown {
  const { data: fm, content } = parseFrontMatter(md);
  const lines = (content || "").split(/\r?\n/);
  const sections: BlogSection[] = [];
  const toc: TableOfContents[] = [];
  const faq: FAQItem[] = [];

  let buffer: string[] = [];
  let introText = "";

  const flushParagraph = () => {
    const paragraph = buffer.join("\n").trim();
    if (paragraph) {
      if (!introText) {
        // Use first paragraph as intro
        introText = paragraph.replace(/^>\s?/gm,"").trim();
      }
      sections.push({ id: cryptoId(), type: "paragraph", content: paragraph });
    }
    buffer = [];
  };

  const parseListBlock = (block: string[]) => {
    const items = block
      .map((l) => l.replace(/^\s*[-*+]\s+/, "").trim())
      .filter(Boolean);
    sections.push({ id: cryptoId(), type: "list", content: items.join("\n"), items });
  };

  const parseQuoteBlock = (block: string[]) => {
    const content = block.map((l) => l.replace(/^>\s?/, "")).join("\n");
    sections.push({ id: cryptoId(), type: "quote", content });
  };

  const anchorFromHeading = (raw: string) => {
    const m = raw.match(/\{#([a-zA-Z0-9_-]+)\}\s*$/);
    if (m) return m[1];
    return slugify(raw.replace(/\{#[^}]+\}\s*$/, "").trim());
  };

  const titleFromHeading = (raw: string) => raw.replace(/\{#[^}]+\}\s*$/, "").trim();

  // Simple FAQ mode detection
  let inFAQ = false;
  let currentQ: string | null = null;
  let currentA: string[] = [];

  const pushFAQ = () => {
    if (currentQ) {
      faq.push({ question: currentQ.trim(), answer: currentA.join("\n").trim() });
      currentQ = null;
      currentA = [];
    }
  };

  // CTA detection
  let inCTA = false;
  let ctaTitle: string | null = null;
  let ctaBuffer: string[] = [];
  const pushCTA = () => {
    if (ctaBuffer.length) {
      const raw = ctaBuffer.join("\n").trim();
      const link = raw.match(/\[([^\]]+)\]\(([^)]+)\)/);
      const ctaText = link?.[1];
      const ctaLink = link?.[2];
      const contentNoLink = link ? raw.replace(link[0], "").trim() : raw;
      sections.push({ id: cryptoId(), type: "cta", title: ctaTitle || undefined, content: contentNoLink, ctaText, ctaLink });
    }
    ctaBuffer = [];
    ctaTitle = null;
  };

  // Code fences (to capture and suppress JSON-LD)
  let inCode = false;
  let codeLang = "";
  let codeBuffer: string[] = [];
  let schema: any = undefined;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // Code fences (start/end)
    const fence = line.match(/^```(\w+)?\s*$/);
    if (fence) {
      if (!inCode) {
        if (buffer.length) flushParagraph();
        inCode = true;
        codeLang = (fence[1] || "").toLowerCase();
        codeBuffer = [];
      } else {
        const codeContent = codeBuffer.join("\n");
        if (/^(json|json-ld|ld\+json)$/.test(codeLang)) {
          try {
            const parsed = JSON.parse(codeContent);
            if (parsed && (parsed["@context"] || parsed["@graph"] || parsed["@type"])) {
              schema = parsed; // capture schema JSON-LD
            }
          } catch {}
        } else {
          // Keep non-JSON code blocks as-is inside content
          buffer.push("```" + codeLang + "\n" + codeContent + "\n```");
        }
        inCode = false;
        codeLang = "";
        codeBuffer = [];
      }
      continue;
    }
    if (inCode) {
      codeBuffer.push(line);
      continue;
    }

    // Headings
    const h2 = line.match(/^##\s+(.*)$/);
    const h3 = line.match(/^###\s+(.*)$/);

    if (h2 || h3) {
      // close FAQ block if we hit a new heading
      if (inFAQ) {
        pushFAQ();
        inFAQ = false;
      }
      // close CTA block on new heading
      if (inCTA) {
        pushCTA();
        inCTA = false;
      }
      // flush buffered paragraph before starting a new section
      if (buffer.length) flushParagraph();

      const rawTitle = (h2 ? h2[1] : h3![1]) as string;
      const headingTitle = titleFromHeading(rawTitle);
      const anchor = anchorFromHeading(rawTitle);
      const level = h2 ? 2 : 3;

      // Detect FAQ heading names
      const titleLower = headingTitle.toLowerCase();
      if (["faq", "שאלות ותשובות", "שאלות נפוצות"].includes(headingTitle) ||
          titleLower.includes("faq") ) {
        inFAQ = true;
        continue; // don't add heading itself as section
      }

      // Detect CTA section heading
      if (titleLower.includes("cta") || headingTitle.includes("קריאה לפעולה")) {
        inCTA = true;
        ctaTitle = headingTitle;
        continue; // don't add heading itself as section
      }

      sections.push({ id: cryptoId(), type: (level === 2 ? "h2" : "h3"), title: headingTitle, content: "", anchor });
      toc.push({ title: headingTitle, anchor, level });
      continue;
    }

    if (inFAQ) {
      const qMatch = line.match(/^\s*(Q:|ש:\s*|שאלה:\s*)(.+)$/i);
      if (qMatch) {
        pushFAQ();
        currentQ = qMatch[2].trim();
        currentA = [];
        continue;
      }
      const aMatch = line.match(/^\s*(A:|ת:\s*|תשובה:\s*)(.+)$/i);
      if (aMatch) {
        currentA.push(aMatch[2]);
        continue;
      }
      // regular line inside answer
      if (currentQ) {
        currentA.push(line);
        continue;
      }
    }

    // Accumulate CTA content until next heading
    if (inCTA) {
      ctaBuffer.push(line);
      continue;
    }

    // Image
    const img = line.match(/^!\[([^\]]*)\]\(([^)]+)\)/);
    if (img) {
      if (buffer.length) flushParagraph();
      sections.push({ id: cryptoId(), type: "image", content: img[2], imageAlt: img[1] });
      continue;
    }

    // List block start (unordered or ordered)
    if (/^\s*(?:[-*+]|\d+\.)\s+/.test(line)) {
      const ordered = /^\s*\d+\.\s+/.test(line);
      // collect list block (same kind of markers)
      const block: string[] = [line];
      let j = i + 1;
      while (j < lines.length && /^\s*(?:[-*+]|\d+\.)\s+/.test(lines[j])) {
        block.push(lines[j]);
        j++;
      }
      // Parse list
      const items = block
        .map((l) => (ordered ? l.replace(/^\s*\d+\.\s+/, "") : l.replace(/^\s*[-*+]\s+/, "")).trim())
        .filter(Boolean);
      sections.push({ id: cryptoId(), type: "list", content: items.join("\n"), items, ...(ordered ? { ordered: true } : {}) });
      i = j - 1;
      continue;
    }

    // Quote block
    if (/^>\s?/.test(line)) {
      const block: string[] = [line];
      let j = i + 1;
      while (j < lines.length && (/^>\s?/.test(lines[j]) || lines[j].trim() === "")) {
        block.push(lines[j]);
        j++;
      }
      parseQuoteBlock(block);
      i = j - 1;
      continue;
    }

    // Blank line flushes paragraph
    if (line.trim() === "") {
      if (buffer.length) flushParagraph();
      continue;
    }

    // Accumulate paragraph
    buffer.push(line);
  }

  if (buffer.length) flushParagraph();
  if (inFAQ) pushFAQ();
  if (inCTA) pushCTA();

  return {
    frontMatter: fm,
    content,
    sections,
    faq,
    toc,
    introText,
    schema,
  };
}

function cryptoId() {
  // Lightweight unique id for client-side composition
  return Math.random().toString(36).slice(2, 10);
}
