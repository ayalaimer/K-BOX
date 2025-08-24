
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { PromotionsSection } from "@/components/PromotionsSection";

const Promotions = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="pt-24 pb-16">
        {/* Reuse the unified promotions section that pulls data from Supabase */}
        <PromotionsSection />
      </main>
      <Footer />
    </div>
  );
};

export default Promotions;
