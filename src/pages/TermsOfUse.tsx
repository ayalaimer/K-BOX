import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { useTranslation } from "@/hooks/useTranslation";

const TermsOfUse = () => {
  const { t } = useTranslation();
  
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main id="main-content" className="pt-20" tabIndex={-1}>
        <div className="container mx-auto px-4 py-16">
          <div className="max-w-4xl mx-auto">
            <Button 
              variant="ghost" 
              className="mb-8"
              onClick={() => window.history.back()}
              aria-label={t('common.back')}
            >
              <ArrowRight className="w-4 h-4 ml-2" />
              {t('common.back')}
            </Button>
            
            <h1 className="text-4xl md:text-5xl font-hebrew-display text-foreground mb-8">
              {t('termsOfUse.title')}
            </h1>
            
            <div className="prose prose-lg max-w-none text-foreground space-y-6">
              <section>
                <h2 className="text-2xl font-hebrew-display text-foreground mb-4">
                  {t('termsOfUse.general.title')}
                </h2>
                <p className="text-muted-foreground leading-relaxed">
                  {t('termsOfUse.general.content')}
                </p>
              </section>
              
              <section>
                <h2 className="text-2xl font-hebrew-display text-foreground mb-4">
                  {t('termsOfUse.bookings.title')}
                </h2>
                <p className="text-muted-foreground leading-relaxed mb-4">
                  {t('termsOfUse.bookings.description')}
                </p>
                <ul className="list-disc list-inside text-muted-foreground space-y-2">
                  <li>{t('termsOfUse.bookings.items.confirmation')}</li>
                  <li>{t('termsOfUse.bookings.items.advance')}</li>
                  <li>{t('termsOfUse.bookings.items.payment')}</li>
                  <li>{t('termsOfUse.bookings.items.minimum')}</li>
                </ul>
              </section>
              
              <section>
                <h2 className="text-2xl font-hebrew-display text-foreground mb-4">
                  {t('termsOfUse.pricing.title')}
                </h2>
                <p className="text-muted-foreground leading-relaxed mb-4">
                  {t('termsOfUse.pricing.description')}
                </p>
                <ul className="list-disc list-inside text-muted-foreground space-y-2">
                  <li>{t('termsOfUse.pricing.items.vat')}</li>
                  <li>{t('termsOfUse.pricing.items.variable')}</li>
                  <li>{t('termsOfUse.pricing.items.payment')}</li>
                  <li>{t('termsOfUse.pricing.items.cancellation')}</li>
                </ul>
              </section>
              
              <section>
                <h2 className="text-2xl font-hebrew-display text-foreground mb-4">
                  {t('termsOfUse.conduct.title')}
                </h2>
                <p className="text-muted-foreground leading-relaxed mb-4">
                  {t('termsOfUse.conduct.description')}
                </p>
                <ul className="list-disc list-inside text-muted-foreground space-y-2">
                  <li>{t('termsOfUse.conduct.items.smoking')}</li>
                  <li>{t('termsOfUse.conduct.items.outside')}</li>
                  <li>{t('termsOfUse.conduct.items.cleanliness')}</li>
                  <li>{t('termsOfUse.conduct.items.damage')}</li>
                  <li>{t('termsOfUse.conduct.items.respect')}</li>
                </ul>
              </section>
              
              <section>
                <h2 className="text-2xl font-hebrew-display text-foreground mb-4">
                  {t('termsOfUse.liability.title')}
                </h2>
                <p className="text-muted-foreground leading-relaxed">
                  {t('termsOfUse.liability.content')}
                </p>
              </section>
              
              <section>
                <h2 className="text-2xl font-hebrew-display text-foreground mb-4">
                  {t('termsOfUse.changes.title')}
                </h2>
                <p className="text-muted-foreground leading-relaxed">
                  {t('termsOfUse.changes.content')}
                </p>
              </section>
              
              <section>
                <h2 className="text-2xl font-hebrew-display text-foreground mb-4">
                  {t('termsOfUse.contact.title')}
                </h2>
                <p className="text-muted-foreground leading-relaxed">
                  {t('termsOfUse.contact.content')}
                </p>
              </section>
              
              <p className="text-sm text-muted-foreground border-t border-border pt-6 mt-8">
                {t('termsOfUse.lastUpdated')}
              </p>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default TermsOfUse;