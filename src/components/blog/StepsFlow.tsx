import React from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { ArrowRight, ArrowLeft, ArrowDown } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

interface StepsFlowProps {
  items: string[];
}

export const StepsFlow: React.FC<StepsFlowProps> = ({ items }) => {
  if (!items || items.length === 0) return null;

  const { language } = useLanguage();
  const isRTL = language === 'he';

  return (
    <section className="w-full">
      {/* Mobile: vertical timeline */}
      <ul className="space-y-6 md:hidden">
        {items.map((text, i) => (
          <li key={i} className="relative flex items-start gap-4">
            <div className="flex flex-col items-center">
              <div className="h-10 w-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold shadow-button">
                {i + 1}
              </div>
              {i < items.length - 1 && <div className="w-px flex-1 bg-border mt-2" />}
            </div>
            <div className="bg-card border rounded-lg p-4 shadow-card w-full">
              <div className="prose dark:prose-invert max-w-none">
                <ReactMarkdown remarkPlugins={[remarkGfm]}>{text}</ReactMarkdown>
              </div>
            </div>
          </li>
        ))}
      </ul>

      {/* Desktop: horizontal flow with arrows */}
      <div className="hidden md:flex items-stretch gap-4">
        {items.map((text, i) => (
          <React.Fragment key={i}>
            <div className="flex-1 bg-card border rounded-lg p-4 shadow-card">
              <div className="flex items-center justify-between mb-2 text-muted-foreground">
                <span className="text-xs font-semibold">שלב {i + 1}</span>
                <ArrowDown className="h-4 w-4 md:hidden" />
              </div>
              <div className="prose dark:prose-invert max-w-none text-sm">
                <ReactMarkdown remarkPlugins={[remarkGfm]}>{text}</ReactMarkdown>
              </div>
            </div>
            {i < items.length - 1 && (
              <div className="self-center text-muted-foreground">
                {isRTL ? (
                  <ArrowLeft className="h-6 w-6" />
                ) : (
                  <ArrowRight className="h-6 w-6" />
                )}
              </div>
            )}
          </React.Fragment>
        ))}
      </div>
    </section>
  );
};

export default StepsFlow;
