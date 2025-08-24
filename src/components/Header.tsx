import { Button } from "@/components/ui/button";
import { Phone, MapPin, Menu, Instagram, Facebook, MessageCircle } from "lucide-react";
import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import logo from "@/assets/logo.png";
import { useTranslation } from "@/hooks/useTranslation";
import { LanguageToggle } from "@/components/LanguageToggle";
import { useLanguage } from "@/contexts/LanguageContext";
import { useSocialLinks } from "@/hooks/useSocialLinks";
export const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { t, loading } = useTranslation();
  const { language } = useLanguage();
  const location = useLocation();
  const { data: socialLinks } = useSocialLinks();

  // Get current language prefix for links
  const langPrefix = `/${language}`;
  
  // Show skeleton during loading
  if (loading) {
    return <header className="fixed top-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-sm border-b border-border">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center space-x-2">
            <div className="w-10 h-10 bg-muted rounded-lg animate-pulse" />
            <div className="w-20 h-6 bg-muted rounded animate-pulse" />
          </div>
          <div className="hidden md:flex items-center space-x-6">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="w-16 h-5 bg-muted rounded animate-pulse" />
            ))}
          </div>
          <div className="hidden md:flex items-center space-x-4">
            <div className="w-32 h-10 bg-muted rounded animate-pulse" />
          </div>
        </div>
      </div>
    </header>;
  }
  
  return <header className="fixed top-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-sm border-b border-border">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to={langPrefix} className="flex items-center space-x-2">
            <div className="w-10 h-10 rounded-lg overflow-hidden">
              <img src={logo} alt={t('header.logo')} className="w-full h-full object-cover" />
            </div>
            <span className="text-xl font-hebrew-display text-foreground mx-[10px]">
              {t('header.logo')}
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-6" role="navigation" aria-label={language === 'he' ? 'ניווט ראשי' : 'Main navigation'}>
            <Link to={langPrefix} className="text-foreground hover:text-primary transition-smooth px-px mx-[20px]">
              {t('header.nav.home')}
            </Link>
            <Link to={`${langPrefix}/blog`} className="text-foreground hover:text-primary transition-smooth">
              {t('header.nav.blog')}
            </Link>
            <a href={`${langPrefix}#promotions`} className="text-foreground hover:text-primary transition-smooth">
              {t('header.nav.promotions')}
            </a>
            <a href="#reviews" className="text-foreground hover:text-primary transition-smooth">
              {t('header.nav.reviews')}
            </a>
            <a href="#contact" className="text-foreground hover:text-primary transition-smooth">
              {t('header.nav.contact')}
            </a>
          </nav>

          {/* Contact Info & Social Links */}
          <div className="hidden md:flex items-center space-x-4">
            <Link to="/auth">
              <Button variant="outline" size="sm">
                {language === 'he' ? 'כניסה' : 'Login'}
              </Button>
            </Link>
            <LanguageToggle />
            <div className="flex items-center space-x-2 text-muted-foreground">
              <Phone className="w-4 h-4" aria-hidden="true" />
              <span className="ltr-numbers mx-[15px]">{t('header.phone')}</span>
            </div>
            {/* Social Media Icons */}
            <div className="flex items-center space-x-3">
              {socialLinks?.map((link) => {
                const Icon = link.platform === 'instagram' ? Instagram :
                            link.platform === 'facebook' ? Facebook :
                            link.platform === 'whatsapp' ? MessageCircle : null;
                
                if (!Icon) return null;
                
                return (
                  <a 
                    key={link.id} 
                    href={link.url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="w-8 h-8 flex items-center justify-center rounded-full bg-muted/50 text-muted-foreground hover:bg-primary hover:text-primary-foreground transition-smooth"
                    aria-label={link.label || link.platform}
                  >
                    <Icon className="w-4 h-4" />
                  </a>
                );
              })}
            </div>
          </div>

          {/* Mobile Menu Button */}
          <Button variant="ghost" size="icon" className="md:hidden" onClick={() => setIsMenuOpen(!isMenuOpen)}>
            <Menu className="w-6 h-6" />
          </Button>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden py-4 border-t border-border">
            <nav className="flex flex-col space-y-4">
              <Link to={langPrefix} className="text-foreground hover:text-primary transition-smooth py-2">
                {t('header.nav.home')}
              </Link>
              <Link to={`${langPrefix}/blog`} className="text-foreground hover:text-primary transition-smooth py-2">
                {t('header.nav.blog')}
              </Link>
              <a href={`${langPrefix}#promotions`} className="text-foreground hover:text-primary transition-smooth py-2">
                {t('header.nav.promotions')}
              </a>
              <a href="#reviews" className="text-foreground hover:text-primary transition-smooth py-2">
                {t('header.nav.reviews')}
              </a>
              <a href="#contact" className="text-foreground hover:text-primary transition-smooth py-2">
                {t('header.nav.contact')}
              </a>
              <Link to="/auth" className="text-foreground hover:text-primary transition-smooth py-2">
                {language === 'he' ? 'כניסה' : 'Login'}
              </Link>
              <div className="pt-4 border-t border-border">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-2 text-muted-foreground">
                    <Phone className="w-4 h-4" aria-hidden="true" />
                    <span className="ltr-numbers">{t('header.phone')}</span>
                  </div>
                  <LanguageToggle />
                </div>
                {/* Social Media Icons Mobile */}
                <div className="flex items-center justify-center space-x-3">
                  {socialLinks?.map((link) => {
                    const Icon = link.platform === 'instagram' ? Instagram :
                                link.platform === 'facebook' ? Facebook :
                                link.platform === 'whatsapp' ? MessageCircle : null;
                    
                    if (!Icon) return null;
                    
                    return (
                      <a 
                        key={link.id} 
                        href={link.url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="w-10 h-10 flex items-center justify-center rounded-full bg-muted/50 text-muted-foreground hover:bg-primary hover:text-primary-foreground transition-smooth"
                        aria-label={link.label || link.platform}
                      >
                        <Icon className="w-5 h-5" />
                      </a>
                    );
                  })}
                </div>
              </div>
            </nav>
          </div>
        )}

      </div>
    </header>;
};