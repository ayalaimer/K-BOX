import React from "react";
import { TableOfContents } from "@/types/blog";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

interface BlogTOCProps {
  toc?: TableOfContents[];
}

// Compact, collapsible Table of Contents
export const BlogTOC: React.FC<BlogTOCProps> = ({ toc }) => {
  if (!toc || toc.length === 0) return null;

  const filteredToc = toc.filter(
    (item) =>
      !/^(structured\s*data|schema|נתונים\s*מובנים|תוכן\s*העניינים)$/i.test(item.title.trim()) &&
      !/(structured|schema|נתונים|מובנים|data)/i.test(item.title) &&
      !/^\s*(toc|table-of-contents|structured|schema)\s*$/i.test(item.anchor || '') &&
      item.anchor !== 'toc'
  );
  if (filteredToc.length === 0) return null;

  return (
    <aside aria-label="תוכן העניינים" className="mb-8">
      {/* Mobile - Collapsible */}
      <div className="lg:hidden">
        <Accordion type="single" collapsible>
          <AccordionItem value="toc">
            <AccordionTrigger className="text-sm font-semibold">תוכן העניינים</AccordionTrigger>
            <AccordionContent>
              <nav>
                <ul className="text-sm space-y-1">
                  {filteredToc.map((item, idx) => (
                    <li key={idx} className="truncate">
                      <a href={`#${item.anchor}`} className="block py-1 px-2 rounded hover:bg-muted transition-smooth text-muted-foreground hover:text-foreground">
                        <span className={item.level === 3 ? "pr-3" : ""}>{item.title}</span>
                      </a>
                    </li>
                  ))}
                </ul>
              </nav>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </div>

      {/* Desktop - Compact Card, sticky */}
      <div className="hidden lg:block">
        <div className="bg-card border rounded-xl p-4 shadow-card sticky top-24">
          <h2 className="text-sm font-semibold mb-3 text-muted-foreground">תוכן העניינים</h2>
          <nav>
            <ul className="text-sm space-y-1">
              {filteredToc.map((item, idx) => (
                <li key={idx} className="truncate">
                  <a href={`#${item.anchor}`} className="block py-1 px-2 rounded hover:bg-muted transition-smooth text-muted-foreground hover:text-foreground">
                    <span className={item.level === 3 ? "pr-3" : ""}>{item.title}</span>
                  </a>
                </li>
              ))}
            </ul>
          </nav>
        </div>
      </div>
    </aside>
  );
};

export default BlogTOC;
