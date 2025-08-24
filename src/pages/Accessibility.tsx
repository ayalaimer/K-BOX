import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { ArrowRight, Eye, Ear, Hand } from "lucide-react";
import { useTranslation } from "@/hooks/useTranslation";

const Accessibility = () => {
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
              {t('accessibility.title')}
            </h1>
            
            <div className="prose prose-lg max-w-none text-foreground space-y-6">
              <section>
                <p className="text-xl text-muted-foreground leading-relaxed mb-8">
                  {t('accessibility.intro.content')}
                </p>
              </section>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="bg-card border border-border rounded-lg p-6 text-center">
                  <Eye className="w-8 h-8 text-primary mx-auto mb-4" />
                  <h3 className="font-semibold text-foreground mb-2">
                    {t('accessibility.visual.title')}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {t('accessibility.visual.description')}
                  </p>
                </div>
                <div className="bg-card border border-border rounded-lg p-6 text-center">
                  <Ear className="w-8 h-8 text-primary mx-auto mb-4" />
                  <h3 className="font-semibold text-foreground mb-2">
                    {t('accessibility.auditory.title')}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {t('accessibility.auditory.description')}
                  </p>
                </div>
                <div className="bg-card border border-border rounded-lg p-6 text-center">
                  <Hand className="w-8 h-8 text-primary mx-auto mb-4" />
                  <h3 className="font-semibold text-foreground mb-2">
                    {t('accessibility.motor.title')}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {t('accessibility.motor.description')}
                  </p>
                </div>
              </div>
              
              <section>
                <h2 className="text-2xl font-hebrew-display text-foreground mb-4">
                  {t('accessibility.webFeatures.title')}
                </h2>
                <ul className="list-disc list-inside text-muted-foreground space-y-2">
                  <li>{t('accessibility.webFeatures.items.keyboard')}</li>
                  <li>{t('accessibility.webFeatures.items.altText')}</li>
                  <li>{t('accessibility.webFeatures.items.contrast')}</li>
                  <li>{t('accessibility.webFeatures.items.headings')}</li>
                  <li>{t('accessibility.webFeatures.items.links')}</li>
                  <li>{t('accessibility.webFeatures.items.focus')}</li>
                  <li>{t('accessibility.webFeatures.items.screenReader')}</li>
                  <li>{t('accessibility.webFeatures.items.skipLink')}</li>
                </ul>
              </section>
              
              <section>
                <h2 className="text-2xl font-hebrew-display text-foreground mb-4">
                  {t('accessibility.physicalFeatures.title')}
                </h2>
                <p className="text-muted-foreground leading-relaxed mb-4">
                  {t('accessibility.physicalFeatures.description')}
                </p>
                <ul className="list-disc list-inside text-muted-foreground space-y-2">
                  <li>{t('accessibility.physicalFeatures.items.wheelchair')}</li>
                  <li>{t('accessibility.physicalFeatures.items.restrooms')}</li>
                  <li>{t('accessibility.physicalFeatures.items.parking')}</li>
                  <li>{t('accessibility.physicalFeatures.items.lighting')}</li>
                  <li>{t('accessibility.physicalFeatures.items.staff')}</li>
                </ul>
              </section>
              
              <section>
                <h2 className="text-2xl font-hebrew-display text-foreground mb-4">
                  {t('accessibility.continuousImprovement.title')}
                </h2>
                <p className="text-muted-foreground leading-relaxed">
                  {t('accessibility.continuousImprovement.content')}
                </p>
              </section>
              
              <section>
                <h2 className="text-2xl font-hebrew-display text-foreground mb-4">
                  {t('accessibility.feedback.title')}
                </h2>
                <div className="bg-primary/10 border border-primary/20 rounded-lg p-6">
                  <p className="text-primary/90 font-medium mb-2">
                    {t('accessibility.feedback.question')}
                  </p>
                  <p className="text-primary/80 mb-2">
                    {t('accessibility.feedback.contact')}
                  </p>
                  <p className="text-primary/80">{t('accessibility.feedback.phone')}</p>
                  <p className="text-primary/80">{t('accessibility.feedback.email')}</p>
                  <p className="text-primary/80 text-sm mt-2">
                    {t('accessibility.feedback.response')}
                  </p>
                </div>
              </section>
              
              <section>
                <h2 className="text-2xl font-hebrew-display text-foreground mb-4">
                  {t('accessibility.additionalInfo.title')}
                </h2>
                <p className="text-muted-foreground leading-relaxed">
                  {t('accessibility.additionalInfo.content')}
                </p>
              </section>
              
              <p className="text-sm text-muted-foreground border-t border-border pt-6 mt-8">
                {t('accessibility.lastUpdated')}
              </p>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Accessibility;