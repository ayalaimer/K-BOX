import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { BookingSection } from "@/components/BookingSection";
import { useTranslation } from "@/hooks/useTranslation";

interface BookingDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const BookingDialog = ({ open, onOpenChange }: BookingDialogProps) => {
  const { t, loading } = useTranslation();
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-6xl">
        <DialogHeader>
          <DialogTitle className="font-hebrew-display text-2xl text-foreground">
            {t('bookingDialog.title')}
          </DialogTitle>
        </DialogHeader>
        <BookingSection />
      </DialogContent>
    </Dialog>
  );
};