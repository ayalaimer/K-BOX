
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Phone, Mail, MapPin, Clock, Facebook, Instagram, Youtube, Star, Navigation, Link as LinkIcon } from "lucide-react";
import { useTranslation } from "@/hooks/useTranslation";
import { useLanguage } from "@/contexts/LanguageContext";
import logo from "@/assets/logo.png";
import { useBusinessInfo } from "@/hooks/useBusinessInfo";
import { useSocialLinks } from "@/hooks/useSocialLinks";
import { Checkbox } from "@/components/ui/checkbox";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { wazeSearchUrl } from "@/utils/urls";

export const Footer = () => {
  const { t, loading } = useTranslation();
  const { language } = useLanguage();
  const { data: business, isLoading: bsLoading } = useBusinessInfo();
  const { data: socialLinks = [], isLoading: slLoading } = useSocialLinks(true);
  const { toast } = useToast();

  const [email, setEmail] = useState("");
  const [consent, setConsent] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  
  // Show skeleton during loading
  if (loading || bsLoading) {
    return <footer className="bg-muted/50 border-t border-border">
      <div className="container mx-auto px-4 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="space-y-4">
              <div className="w-32 h-6 bg-muted rounded animate-pulse" />
              <div className="space-y-2">
                <div className="w-full h-4 bg-muted rounded animate-pulse" />
                <div className="w-3/4 h-4 bg-muted rounded animate-pulse" />
                <div className="w-1/2 h-4 bg-muted rounded animate-pulse" />
              </div>
            </div>
          ))}
        </div>
        <div className="border-t border-border mt-12 pt-8">
          <div className="w-48 h-4 bg-muted rounded animate-pulse mx-auto" />
        </div>
      </div>
    </footer>;
  }

  async function handleSubscribe() {
    if (!email.trim()) {
      toast({ title: language === 'he' ? 'שגיאה' : 'Error', description: language === 'he' ? 'אנא הזן אימייל' : 'Please enter an email', variant: 'destructive' });
      return;
    }
    if (!consent) {
      toast({ title: language === 'he' ? 'נדרש אישור' : 'Consent required', description: language === 'he' ? 'אנא אשר/י דיוור כדי להירשם' : 'Please approve marketing to subscribe', variant: 'destructive' });
      return;
    }
    setSubmitting(true);
    try {
      console.log('[Footer] subscribing email:', email, 'language:', language, 'consent:', consent);
      const { error } = await (supabase as any).from('email_subscribers').insert({
        email: email.trim(),
        consent: true,
        consent_at: new Date().toISOString(),
        source: 'footer',
        language,
      });
      if (error && (error as any).code !== '23505') throw error;
      toast({ title: language === 'he' ? 'תודה!' : 'Thank you!', description: language === 'he' ? 'נרשמת בהצלחה לרשימת התפוצה' : 'You have been subscribed successfully' });
      setEmail("");
      setConsent(false);
    } catch (e: any) {
      toast({ title: language === 'he' ? 'שגיאה' : 'Error', description: e?.message || (language === 'he' ? 'נכשלה הרשמה' : 'Subscription failed'), variant: 'destructive' });
    } finally {
      setSubmitting(false);
    }
  }

  function renderIcon(platform: string) {
    const p = platform.toLowerCase();
    if (p.includes('facebook')) return <Facebook className="w-4 h-4" aria-hidden="true" />;
    if (p.includes('instagram')) return <Instagram className="w-4 h-4" aria-hidden="true" />;
    if (p.includes('youtube')) return <Youtube className="w-4 h-4" aria-hidden="true" />;
    if (p.includes('waze')) return <Navigation className="w-4 h-4" aria-hidden="true" />;
    return <LinkIcon className="w-4 h-4" aria-hidden="true" />;
  }
  
  return <footer className="bg-muted/50 border-t border-border">
      <div className="container mx-auto px-4 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Brand & Description */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <div className="w-10 h-10 rounded-lg overflow-hidden">
                <img src={(business?.logo_url || logo) as any} alt={(business?.company_name || t('footer.company')) as string} className="w-full h-full object-cover" />
              </div>
              <span className="text-xl font-hebrew-display text-foreground">{business?.company_name || t('header.logo')}</span>
            </div>
            <p className="text-muted-foreground">
              {t('hero.description')}
            </p>
            <div className="flex items-center space-x-1">
              {[...Array(5)].map((_, i) => <Star key={i} className="w-4 h-4 fill-primary text-primary" />)}
              <span className="text-muted-foreground mr-2 ltr-numbers">(4.9/5)</span>
            </div>
          </div>

          {/* Contact Info */}
          <div className="space-y-4">
            <h3 className="text-lg font-hebrew-display text-foreground">{t('header.nav.contact')}</h3>
            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <Phone className="w-4 h-4 text-primary" aria-hidden="true" />
                <span className="text-muted-foreground ltr-numbers">{t('footer.phone').replace('Phone: ', '').replace('טלפון: ', '')}</span>
              </div>
              <div className="flex items-center space-x-3">
                <Mail className="w-4 h-4 text-primary" aria-hidden="true" />
                <span className="text-muted-foreground">{t('footer.email').replace('Email: ', '').replace('דוא"ל: ', '')}</span>
              </div>
              <div className="flex items-start space-x-3">
                <MapPin className="w-4 h-4 text-primary mt-1" aria-hidden="true" />
                <span className="text-muted-foreground">
                  {t('footer.address')}
                </span>
              </div>
            </div>
          </div>

          {/* Hours & Quick Links */}
          <div className="space-y-4">
            <h3 className="text-lg font-hebrew-display text-foreground">{t('footer.businessHours')}</h3>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-muted-foreground">{language === 'he' ? 'א-ה:' : 'Sun-Thu:'}</span>
                <span className="text-foreground ltr-numbers">18:00-00:00</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">{language === 'he' ? 'ו:' : 'Fri:'}</span>
                <span className="text-foreground ltr-numbers">10:00-15:00</span>
              </div>
            </div>
            <div className="pt-2">
              <div className="flex items-center space-x-2 text-primary font-medium">
                <Clock className="w-4 h-4" aria-hidden="true" />
                <span>{t('businessHours.openNow')}</span>
              </div>
            </div>
          </div>

          {/* Newsletter */}
          <div className="space-y-4">
            <h3 className="text-lg font-hebrew-display text-foreground">{t('footer.newsletter')}</h3>
            <p className="text-muted-foreground text-sm">
              {t('footer.newsletterDesc')}
            </p>
            <div className="space-y-2">
              <Input placeholder={t('footer.emailPlaceholder')} className="border-border/50" value={email} onChange={(e) => setEmail(e.target.value)} />
              <div className="flex items-center gap-2">
                <Checkbox id="newsletter-consent" checked={consent} onCheckedChange={(v) => setConsent(!!v)} />
                <label htmlFor="newsletter-consent" className="text-sm text-muted-foreground cursor-pointer">
                  {language === 'he' ? 'אני מאשר/ת קבלת דיוור' : 'I approve marketing emails'}
                </label>
              </div>
              <Button className="w-full bg-gradient-primary" onClick={handleSubscribe} disabled={submitting}>
                {t('footer.subscribe')}
              </Button>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
          <div className="mt-12 pt-8 border-t border-border/50 flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <div className="text-muted-foreground text-sm">
              {t('footer.copyright')}
            </div>
            <div className="flex space-x-4 text-muted-foreground text-sm">
              <a href={`/${language}/privacy-policy`} className="hover:text-primary transition-smooth mx-[20px]">{t('footer.privacyPolicy')}</a>
              <a href={`/${language}/terms-of-use`} className="hover:text-primary transition-smooth">{t('footer.termsOfUse')}</a>
              <a href={`/${language}/cancellation-policy`} className="hover:text-primary transition-smooth">{t('footer.cancellationPolicy')}</a>
              <a href={`/${language}/accessibility`} className="hover:text-primary transition-smooth">{t('footer.accessibility')}</a>
              <a href="/auth" className="hover:text-primary transition-smooth">{language === 'he' ? 'התחברות' : 'Login'}</a>
            </div>
          </div>
      </div>
    </footer>;
};
