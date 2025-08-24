import { Button } from "@/components/ui/button";
import { Calendar, Play, Star, Users, Clock, Facebook, Instagram, Youtube, Navigation, Link as LinkIcon } from "lucide-react";
import { useTranslation } from "@/hooks/useTranslation";
import { useSocialLinks } from "@/hooks/useSocialLinks";
import { useBusinessInfo } from "@/hooks/useBusinessInfo";
import { wazeSearchUrl } from "@/utils/urls";

export const HeroSection = () => {
  const { t, loading } = useTranslation();
  const { data: socialLinks = [], isLoading: slLoading } = useSocialLinks(true);
  const { data: business } = useBusinessInfo();

  function renderIcon(platform: string) {
    const p = platform.toLowerCase();
    if (p.includes('facebook')) return <Facebook className="w-4 h-4" aria-hidden="true" />;
    if (p.includes('instagram')) return <Instagram className="w-4 h-4" aria-hidden="true" />;
    if (p.includes('youtube')) return <Youtube className="w-4 h-4" aria-hidden="true" />;
    if (p.includes('waze')) return <Navigation className="w-4 h-4" aria-hidden="true" />;
    return <LinkIcon className="w-4 h-4" aria-hidden="true" />;
  }

  // Show skeleton during loading
  if (loading) {
    return (
      <section id="hero" className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-hero">
        <div className="absolute inset-0 w-full h-full z-0">
          <iframe
            className="absolute top-1/2 left-1/2 w-[300%] h-[300%] -translate-x-1/2 -translate-y-1/2 pointer-events-none"
            src="https://www.youtube.com/embed/FfhC-tjh59g?autoplay=1&mute=1&loop=1&playlist=FfhC-tjh59g&controls=0&showinfo=0&rel=0&modestbranding=1"
            title="Karaoke Background Video"
            allow="autoplay; encrypted-media"
          />
          <div className="absolute inset-0 video-overlay" />
        </div>
        <div className="relative z-10 container mx-auto px-4 text-center">
          <div className="max-w-4xl mx-auto">
            <div className="w-48 h-8 bg-muted/50 rounded-full mx-auto mb-8 animate-pulse" />
            <div className="w-96 h-16 bg-muted/50 rounded mx-auto mb-6 animate-pulse" />
            <div className="w-80 h-6 bg-muted/50 rounded mx-auto mb-8 animate-pulse" />
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10 max-w-3xl mx-auto">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="w-full h-16 bg-muted/30 rounded-lg animate-pulse" />
              ))}
            </div>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <div className="w-40 h-12 bg-muted/50 rounded animate-pulse" />
              <div className="w-48 h-12 bg-muted/50 rounded animate-pulse" />
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section id="hero" className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-hero">
      {/* YouTube Video Background */}
      <div className="absolute inset-0 w-full h-full z-0">
        <iframe
          className="absolute top-1/2 left-1/2 w-[300%] h-[300%] -translate-x-1/2 -translate-y-1/2 pointer-events-none"
          src="https://www.youtube.com/embed/FfhC-tjh59g?autoplay=1&mute=1&loop=1&playlist=FfhC-tjh59g&controls=0&showinfo=0&rel=0&modestbranding=1"
          title="Karaoke Background Video"
          allow="autoplay; encrypted-media"
        />
        <div className="absolute inset-0 video-overlay" />
      </div>

      {/* Hero Content */}
      <div className="relative z-10 container mx-auto px-2 sm:px-4 text-center py-8">
        <div className="max-w-screen-xl mx-auto">

          {/* Main Headline */}
          <div className="text-center font-hebrew-display mb-6">
            <h1 className="inline-block whitespace-normal md:whitespace-nowrap text-[clamp(26px,9vw,36px)] md:text-[clamp(40px,6vw,88px)] leading-tight bg-gradient-primary bg-clip-text text-transparent"
                style={{ wordBreak: 'keep-all', hyphens: 'none', textWrap: 'stable' }}>
              {t('hero.title')}
            </h1>
            <h2 className="block mt-2 md:mt-4 text-[clamp(22px,7.5vw,30px)] md:text-[clamp(28px,4.2vw,64px)] leading-tight text-foreground">
              {t('hero.subtitle')}
            </h2>
          </div>

          {/* Subtitle */}
          <p className="text-base sm:text-lg md:text-xl lg:text-2xl text-muted-foreground mb-8 max-w-2xl mx-auto leading-relaxed px-4 sm:px-6">
            {t('hero.description')}
          </p>

          {/* Features Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6 mb-8 sm:mb-10 max-w-3xl mx-auto px-2 sm:px-4">
            <div className="flex items-center justify-center space-x-3 bg-card/50 backdrop-blur-sm rounded-lg p-3 sm:p-4 border border-border/50">
              <Users className="w-5 h-5 sm:w-6 sm:h-6 text-primary" />
              <span className="text-sm sm:text-base text-foreground font-medium">{t('hero.features.capacity')}</span>
            </div>
            <div className="flex items-center justify-center space-x-3 bg-card/50 backdrop-blur-sm rounded-lg p-3 sm:p-4 border border-border/50">
              <Clock className="w-5 h-5 sm:w-6 sm:h-6 text-primary" />
              <span className="text-sm sm:text-base text-foreground font-medium">{t('hero.features.hours')}</span>
            </div>
            <div className="flex items-center justify-center space-x-3 bg-card/50 backdrop-blur-sm rounded-lg p-3 sm:p-4 border border-border/50">
              <Play className="w-5 h-5 sm:w-6 sm:h-6 text-primary" />
              <span className="text-sm sm:text-base text-foreground font-medium">{t('hero.features.songs')}</span>
            </div>
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row w-full max-w-[720px] gap-3 sm:gap-4 mx-auto mb-6 sm:mb-8 px-2 sm:px-4">
            <Button 
              className="flex-1 h-12 sm:h-14 md:h-16 px-4 sm:px-6 text-base sm:text-lg md:text-xl rounded-xl sm:rounded-2xl bg-gradient-primary hover:scale-105 transition-bounce shadow-button animate-pulse-karaoke flex items-center justify-center"
              onClick={() => document.getElementById('booking')?.scrollIntoView({ behavior: 'smooth' })}
              aria-label={t('hero.buttons.booking')}
            >
              <Calendar className="w-4 h-4 sm:w-5 sm:h-5 ml-2 sm:ml-3" aria-hidden="true" />
              {t('hero.buttons.booking')}
            </Button>
            <Button 
              variant="outline"
              className="flex-1 h-12 sm:h-14 md:h-16 px-4 sm:px-6 text-base sm:text-lg md:text-xl rounded-xl sm:rounded-2xl border-primary/50 text-primary hover:bg-primary/10 transition-smooth flex items-center justify-center"
            >
              <Play className="w-4 h-4 sm:w-5 sm:h-5 ml-2 sm:ml-3" />
              {t('hero.buttons.tour')}
            </Button>
          </div>

          {/* Social Media Icons */}
          {!slLoading && socialLinks.length > 0 && (
            <div className="flex justify-center space-x-4">
              {socialLinks.map((s) => {
                let href = s.url;
                if (s.platform.toLowerCase().includes('waze') && (!href || href.trim() === '')) {
                  href = wazeSearchUrl('מחוז הצפון, ישראל'); // Default fallback
                }
                return (
                  <Button
                    key={s.id || s.platform}
                    size="icon"
                    variant="outline"
                    className="border-border/50 hover:bg-primary/10 bg-card/50 backdrop-blur-sm"
                    onClick={() => href && window.open(href, '_blank')}
                    aria-label={s.label || s.platform}
                  >
                    {renderIcon(s.icon_name || s.platform)}
                  </Button>
                );
              })}
            </div>
          )}

        </div>
      </div>

    </section>
  );
};