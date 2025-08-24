import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { ArrowRight, Clock, AlertCircle } from "lucide-react";
import { useTranslation } from "@/hooks/useTranslation";

const CancellationPolicy = () => {
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
              {t('cancellationPolicy.title')}
            </h1>
            
            <div className="prose prose-lg max-w-none text-foreground space-y-6">
              <div className="bg-primary/10 border border-primary/20 rounded-lg p-6 mb-8">
                <div className="flex items-start space-x-3">
                  <AlertCircle className="w-6 h-6 text-primary mt-1 flex-shrink-0" />
                  <div>
                    <h3 className="text-lg font-semibold text-primary mb-2">
                      {t('cancellationPolicy.importantNotice.title')}
                    </h3>
                    <p className="text-primary/80">
                      {t('cancellationPolicy.importantNotice.content')}
                    </p>
                  </div>
                </div>
              </div>
              
              <section>
                <h2 className="text-2xl font-hebrew-display text-foreground mb-4 flex items-center">
                  <Clock className="w-6 h-6 text-primary ml-3" />
                  {t('cancellationPolicy.times.title')}
                </h2>
                
                <div className="bg-card border border-border rounded-lg p-6 mb-6">
                  <h3 className="text-xl font-semibold text-foreground mb-4">
                    {t('cancellationPolicy.times.upTo24.title')}
                  </h3>
                  <ul className="list-disc list-inside text-muted-foreground space-y-2">
                    <li>{t('cancellationPolicy.times.upTo24.items.free')}</li>
                    <li>{t('cancellationPolicy.times.upTo24.items.refund')}</li>
                    <li>{t('cancellationPolicy.times.upTo24.items.noCharge')}</li>
                  </ul>
                </div>
                
                <div className="bg-card border border-border rounded-lg p-6 mb-6">
                  <h3 className="text-xl font-semibold text-foreground mb-4">
                    {t('cancellationPolicy.times.12to24.title')}
                  </h3>
                  <ul className="list-disc list-inside text-muted-foreground space-y-2">
                    <li>{t('cancellationPolicy.times.12to24.items.charge50')}</li>
                    <li>{t('cancellationPolicy.times.12to24.items.refund50')}</li>
                    <li>{t('cancellationPolicy.times.12to24.items.preparationCost')}</li>
                  </ul>
                </div>
                
                <div className="bg-card border border-border rounded-lg p-6 mb-6">
                  <h3 className="text-xl font-semibold text-foreground mb-4">
                    {t('cancellationPolicy.times.under12.title')}
                  </h3>
                  <ul className="list-disc list-inside text-muted-foreground space-y-2">
                    <li>{t('cancellationPolicy.times.under12.items.fullCharge')}</li>
                    <li>{t('cancellationPolicy.times.under12.items.noRefund')}</li>
                    <li>{t('cancellationPolicy.times.under12.items.reschedule')}</li>
                  </ul>
                </div>
              </section>
              
              <section>
                <h2 className="text-2xl font-hebrew-display text-foreground mb-4">
                  {t('cancellationPolicy.specialCases.title')}
                </h2>
                
                <div className="space-y-4">
                  <div className="bg-muted/30 border border-border rounded-lg p-4">
                    <h4 className="font-semibold text-foreground mb-2">
                      {t('cancellationPolicy.specialCases.forceMajeure.title')}
                    </h4>
                    <p className="text-muted-foreground text-sm">
                      {t('cancellationPolicy.specialCases.forceMajeure.content')}
                    </p>
                  </div>
                  
                  <div className="bg-muted/30 border border-border rounded-lg p-4">
                    <h4 className="font-semibold text-foreground mb-2">
                      {t('cancellationPolicy.specialCases.medical.title')}
                    </h4>
                    <p className="text-muted-foreground text-sm">
                      {t('cancellationPolicy.specialCases.medical.content')}
                    </p>
                  </div>
                </div>
              </section>
              
              <section>
                <h2 className="text-2xl font-hebrew-display text-foreground mb-4">
                  {t('cancellationPolicy.process.title')}
                </h2>
                <ol className="list-decimal list-inside text-muted-foreground space-y-3">
                  <li>{t('cancellationPolicy.process.steps.call')}</li>
                  <li>{t('cancellationPolicy.process.steps.details')}</li>
                  <li>{t('cancellationPolicy.process.steps.confirmation')}</li>
                  <li>{t('cancellationPolicy.process.steps.refund')}</li>
                </ol>
              </section>
              
              <section>
                <h2 className="text-2xl font-hebrew-display text-foreground mb-4">
                  {t('cancellationPolicy.modifications.title')}
                </h2>
                <p className="text-muted-foreground leading-relaxed mb-4">
                  {t('cancellationPolicy.modifications.description')}
                </p>
                <ul className="list-disc list-inside text-muted-foreground space-y-2">
                  <li>{t('cancellationPolicy.modifications.items.upTo24')}</li>
                  <li>{t('cancellationPolicy.modifications.items.under24')}</li>
                  <li>{t('cancellationPolicy.modifications.items.availability')}</li>
                </ul>
              </section>
              
              <section>
                <h2 className="text-2xl font-hebrew-display text-foreground mb-4">
                  {t('cancellationPolicy.contact.title')}
                </h2>
                <div className="bg-primary/10 border border-primary/20 rounded-lg p-6">
                  <p className="text-primary/90 font-medium mb-2">
                    {t('cancellationPolicy.contact.forCancellations')}
                  </p>
                  <p className="text-primary/80">{t('cancellationPolicy.contact.phone')}</p>
                  <p className="text-primary/80">{t('cancellationPolicy.contact.email')}</p>
                  <p className="text-primary/80 text-sm mt-2">
                    {t('cancellationPolicy.contact.hours')}
                  </p>
                </div>
              </section>
              
              <p className="text-sm text-muted-foreground border-t border-border pt-6 mt-8">
                {t('cancellationPolicy.lastUpdated')}
              </p>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default CancellationPolicy;