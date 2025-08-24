import { Button } from "@/components/ui/button";

export const SkipToContent = () => {
  const skipToMain = () => {
    const mainContent = document.getElementById('main-content');
    if (mainContent) {
      mainContent.focus();
      mainContent.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <Button
      onClick={skipToMain}
      className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 z-[100] bg-primary text-primary-foreground"
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          skipToMain();
        }
      }}
    >
      דילוג לתוכן הראשי
    </Button>
  );
};