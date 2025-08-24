import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';
import { BookingDialog } from '@/components/BookingDialog';

export const ScrollTriggeredCTA = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);
  const [isBookingOpen, setIsBookingOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const scrollPercent = (window.scrollY / (document.documentElement.scrollHeight - window.innerHeight)) * 100;
      
      if (scrollPercent > 40 && !isDismissed) {
        setIsVisible(true);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [isDismissed]);

  if (!isVisible || isDismissed) return null;

  return (
    <>
      <div className="fixed left-4 top-1/2 transform -translate-y-1/2 z-50 animate-in slide-in-from-left-5">
        <div className="bg-primary text-primary-foreground p-4 rounded-lg shadow-lg max-w-xs relative">
          <Button
            variant="ghost"
            size="sm"
            className="absolute -top-2 -right-2 h-6 w-6 rounded-full bg-background text-foreground hover:bg-muted"
            onClick={() => setIsDismissed(true)}
          >
            <X className="h-3 w-3" />
          </Button>
          <div className="text-center">
            <h3 className="font-semibold mb-2">מעוניין להזמין?</h3>
            <p className="text-sm mb-3">בדוק זמינות עכשיו</p>
            <Button 
              variant="secondary" 
              size="sm"
              onClick={() => {
                setIsBookingOpen(true);
                setIsDismissed(true);
              }}
            >
              בדוק זמינות
            </Button>
          </div>
        </div>
      </div>
      
      <BookingDialog 
        open={isBookingOpen} 
        onOpenChange={setIsBookingOpen} 
      />
    </>
  );
};