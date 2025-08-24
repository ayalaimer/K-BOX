import { Header } from "@/components/Header";
import { HeroSection } from "@/components/HeroSection";
import { BookingSection } from "@/components/BookingSection";
import { PromotionsSection } from "@/components/PromotionsSection";
import { ReviewsSection } from "@/components/ReviewsSection";
import { ContactSection } from "@/components/ContactSection";
import { Footer } from "@/components/Footer";
import { SkipToContent } from "@/components/SkipToContent";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <SkipToContent />
      <Header />
      <main id="main-content" tabIndex={-1}>
        <HeroSection />
        <BookingSection />
        <PromotionsSection />
        <ReviewsSection />
        <ContactSection />
      </main>
      <Footer />
    </div>
  );
};

export default Index;
