import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { useTranslation } from "@/hooks/useTranslation";

const PrivacyPolicy = () => {
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
              {t('privacyPolicy.title')}
            </h1>
            
            <div className="prose prose-lg max-w-none text-foreground space-y-6">
              <section>
                <h2 className="text-2xl font-hebrew-display text-foreground mb-4">
                  {t('privacyPolicy.intro.title')}
                </h2>
                <p className="text-muted-foreground leading-relaxed">
                  {t('privacyPolicy.intro.content')}
                </p>
              </section>
              
              <section>
                <h2 className="text-2xl font-hebrew-display text-foreground mb-4">
                  {t('privacyPolicy.dataCollection.title')}
                </h2>
                <p className="text-muted-foreground leading-relaxed mb-4">
                  {t('privacyPolicy.dataCollection.description')}
                </p>
                <ul className="list-disc list-inside text-muted-foreground space-y-2">
                  <li>{t('privacyPolicy.dataCollection.items.personal')}</li>
                  <li>{t('privacyPolicy.dataCollection.items.usage')}</li>
                  <li>{t('privacyPolicy.dataCollection.items.contact')}</li>
                </ul>
              </section>
              
              <section>
                <h2 className="text-2xl font-hebrew-display text-foreground mb-4">
                  {t('privacyPolicy.dataUse.title')}
                </h2>
                <p className="text-muted-foreground leading-relaxed mb-4">
                  {t('privacyPolicy.dataUse.description')}
                </p>
                <ul className="list-disc list-inside text-muted-foreground space-y-2">
                  <li>{t('privacyPolicy.dataUse.items.orders')}</li>
                  <li>{t('privacyPolicy.dataUse.items.service')}</li>
                  <li>{t('privacyPolicy.dataUse.items.contact')}</li>
                  <li>{t('privacyPolicy.dataUse.items.updates')}</li>
                </ul>
              </section>
              
              <section>
                <h2 className="text-2xl font-hebrew-display text-foreground mb-4">
                  {t('privacyPolicy.dataSharing.title')}
                </h2>
                <p className="text-muted-foreground leading-relaxed">
                  {t('privacyPolicy.dataSharing.content')}
                </p>
              </section>
              
              <section>
                <h2 className="text-2xl font-hebrew-display text-foreground mb-4">
                  {t('privacyPolicy.userRights.title')}
                </h2>
                <p className="text-muted-foreground leading-relaxed mb-4">
                  {t('privacyPolicy.userRights.description')}
                </p>
                <ul className="list-disc list-inside text-muted-foreground space-y-2">
                  <li>{t('privacyPolicy.userRights.items.access')}</li>
                  <li>{t('privacyPolicy.userRights.items.correction')}</li>
                  <li>{t('privacyPolicy.userRights.items.deletion')}</li>
                  <li>{t('privacyPolicy.userRights.items.objection')}</li>
                </ul>
              </section>
              
              <section>
                <h2 className="text-2xl font-hebrew-display text-foreground mb-4">
                  {t('privacyPolicy.contact.title')}
                </h2>
                <p className="text-muted-foreground leading-relaxed">
                  {t('privacyPolicy.contact.content')}
                </p>
              </section>
              
              <p className="text-sm text-muted-foreground border-t border-border pt-6 mt-8">
                {t('privacyPolicy.lastUpdated')}
              </p>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default PrivacyPolicy;