export interface BlogPost {
  id: string;
  slug: string;
  title: string;
  metaTitle: string;
  metaDescription: string;
  metaKeywords: string;
  heroImage: string;
  heroImageAlt: string;
  h1Title: string;
  introText: string;
  content: BlogSection[];
  faq: FAQItem[];
  localSeoText: string;
  authorName: string;
  publishedAt: string;
  updatedAt: string;
  schema: SchemaMarkup;
}

export interface BlogSection {
  id: string;
  type: 'h2' | 'h3' | 'paragraph' | 'list' | 'image' | 'table' | 'quote' | 'cta';
  title?: string;
  content: string;
  anchor?: string;
  items?: string[];
  imageAlt?: string;
  ctaText?: string;
  ctaLink?: string;
  ordered?: boolean;
}

export interface FAQItem {
  question: string;
  answer: string;
}

export interface SchemaMarkup {
  article: {
    headline: string;
    author: string;
    datePublished: string;
    dateModified: string;
    description: string;
    image: string;
  };
  localBusiness: {
    name: string;
    address: string;
    telephone: string;
    coordinates: {
      latitude: number;
      longitude: number;
    };
  };
}

export interface TableOfContents {
  title: string;
  anchor: string;
  level: number;
}