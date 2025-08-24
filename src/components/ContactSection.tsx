import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { 
  MapPin, 
  Calendar,
  Instagram,
  Facebook,
  MessageSquare,
  Navigation,
  Loader2
} from "lucide-react";
import { useState } from "react";
import { useTranslation } from "@/hooks/useTranslation";
import { useBusinessSettings } from "@/hooks/useBusinessSettings";
import { logInfo } from "@/lib/logging";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export const ContactSection = () => {
  const { t, loading } = useTranslation();
  const { data: business } = useBusinessSettings();
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    email: "",
    message: ""
  });
  const [errors, setErrors] = useState<{[key: string]: string}>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validateForm = () => {
    const newErrors: {[key: string]: string} = {};
    
    if (!formData.name.trim()) {
      newErrors.name = "שם מלא הוא שדה חובה";
    }
    
    if (!formData.phone.match(/^05\d{8}$/)) {
      newErrors.phone = "אנא הזינו מספר טלפון ישראלי תקין (05XXXXXXXX)";
    }
    
    if (!formData.email.match(/^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/)) {
      newErrors.email = "אנא הזינו כתובת אימייל תקינה";
    }
    
    if (!formData.message.trim() || formData.message.length < 2 || formData.message.length > 2000) {
      newErrors.message = "ההודעה חייבת להיות באורך של 2-2000 תווים";
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm() || isSubmitting) {
      return;
    }
    
    setIsSubmitting(true);
    logInfo('contact_form_submit', { component: 'ContactSection', context: { message_length: formData.message.length } });
    
    try {
      const { data, error } = await supabase.rpc('contact_submit', {
        p_full_name: formData.name,
        p_phone: formData.phone,
        p_email: formData.email,
        p_message: formData.message
      });
      
      if (error) {
        throw error;
      }
      
      if (data && typeof data === 'object' && 'success' in data && data.success) {
        toast({
          title: "ההודעה נשלחה בהצלחה",
          description: "ההודעה נשלחה ונקלטה במערכת. נחזור אליכם בהקדם.",
        });
        
        // Reset form
        setFormData({
          name: "",
          phone: "",
          email: "",
          message: ""
        });
        setErrors({});
      } else {
        throw new Error((data && typeof data === 'object' && 'error' in data ? data.error as string : null) || "שגיאה בשליחת ההודעה");
      }
    } catch (error: any) {
      console.error("Error submitting contact form:", error);
      toast({
        title: "שגיאה בשליחת ההודעה",
        description: error.message || "אירעה שגיאה בשליחת ההודעה. אנא נסו שוב.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const address = business?.address || t('contact.location.address');
  const mapQuery = encodeURIComponent(address || '');
  const mapLink = `https://www.google.com/maps?q=${mapQuery}`;
  const wazeLink = business?.address 
    ? `https://waze.com/ul?q=${mapQuery}` 
    : 'https://www.waze.com/live-map/directions/%D7%A9%D7%98%D7%A0%D7%A8-3-%D7%99%D7%A8%D7%95%D7%A9%D7%9C%D7%99%D7%9D';

  return (
    <section id="contact" className="py-20 bg-muted/30">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="text-center mb-16">
          <Badge className="bg-primary/20 text-primary border-primary/30 mb-4">
            {t('contact.badge')}
          </Badge>
          <h2 className="text-4xl md:text-5xl font-hebrew-display text-foreground mb-6">
            {t('contact.title')}
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            {t('contact.subtitle')}
          </p>
        </div>

        <div className="max-w-4xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Location Card */}
            <Card className="overflow-hidden shadow-card border-border/50">
              <CardHeader>
                <CardTitle className="flex items-center space-x-3 text-foreground">
                  <div className="w-10 h-10 rounded-lg bg-gradient-primary flex items-center justify-center">
                    <MapPin className="w-5 h-5 text-white" />
                  </div>
                  <span className="font-hebrew-display">{t('contact.location.title')}</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <p className="font-semibold text-foreground mb-1">{t('contact.location')}</p>
                    <p className="text-muted-foreground">{address}</p>
                  </div>
                  <div>
                    <p className="font-semibold text-foreground mb-1">{t('contact.directions.title')}</p>
                    <p className="text-muted-foreground text-sm">{t('contact.directions.driving')}</p>
                    <p className="text-muted-foreground text-sm">{t('contact.parking')}</p>
                  </div>
                  {/* Map */}
                  <div className="space-y-3">
                    <div className="w-full h-72 rounded-lg border border-border/50 overflow-hidden bg-muted/30">
                      <iframe
                        src={`https://www.google.com/maps?q=${mapQuery}&output=embed`}
                        className="w-full h-full border-0"
                        loading="lazy"
                        referrerPolicy="no-referrer-when-downgrade"
                        title={t('contact.map.title')}
                        aria-label={t('contact.map.title')}
                      />
                    </div>
                    <div className="flex gap-3 flex-wrap">
                      <Button 
                        variant="outline" 
                        onClick={() => window.open(mapLink, '_blank', 'noopener,noreferrer')}
                        aria-label={t('contact.map.open')}
                      >
                        <MapPin className="w-4 h-4 ml-2" />
                        {t('contact.map.open')}
                      </Button>
                      <Button 
                        variant="outline" 
                        onClick={() => window.open(wazeLink, '_blank', 'noopener,noreferrer')}
                        aria-label="פתח בוויז"
                      >
                        <Navigation className="w-4 h-4 ml-2" />
                        פתח בוויז
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Contact Form */}
            <Card className="overflow-hidden shadow-card border-border/50">
              <CardHeader>
                <CardTitle className="flex items-center space-x-3 text-foreground">
                  <div className="w-10 h-10 rounded-lg bg-gradient-primary flex items-center justify-center">
                    <MessageSquare className="w-5 h-5 text-white" />
                  </div>
                  <span className="font-hebrew-display">{t('contact.form.title')}</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-foreground mb-2 block">
                        {t('contact.form.name')} *
                      </label>
                      <Input
                        type="text"
                        value={formData.name}
                        onChange={(e) => {
                          setFormData({...formData, name: e.target.value});
                          if (errors.name) setErrors({...errors, name: ""});
                        }}
                        placeholder={t('contact.form.name')}
                        required
                        className={`bg-background border-border ${errors.name ? 'border-destructive' : ''}`}
                      />
                      {errors.name && (
                        <p className="text-sm text-destructive mt-1">{errors.name}</p>
                      )}
                    </div>
                    <div>
                      <label className="text-sm font-medium text-foreground mb-2 block">
                        {t('contact.form.phone')} *
                      </label>
                      <Input
                        type="tel"
                        value={formData.phone}
                        onChange={(e) => {
                          setFormData({...formData, phone: e.target.value});
                          if (errors.phone) setErrors({...errors, phone: ""});
                        }}
                        placeholder="0501234567"
                        required
                        className={`bg-background border-border ltr-numbers ${errors.phone ? 'border-destructive' : ''}`}
                      />
                      {errors.phone && (
                        <p className="text-sm text-destructive mt-1">{errors.phone}</p>
                      )}
                    </div>
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium text-foreground mb-2 block">
                      {t('contact.form.email')}
                    </label>
                    <Input
                      type="email"
                      value={formData.email}
                      onChange={(e) => {
                        setFormData({...formData, email: e.target.value});
                        if (errors.email) setErrors({...errors, email: ""});
                      }}
                      placeholder="example@email.com"
                      className={`bg-background border-border ${errors.email ? 'border-destructive' : ''}`}
                    />
                    {errors.email && (
                      <p className="text-sm text-destructive mt-1">{errors.email}</p>
                    )}
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium text-foreground mb-2 block">
                      {t('contact.form.message')} *
                    </label>
                    <Textarea
                      value={formData.message}
                      onChange={(e) => {
                        setFormData({...formData, message: e.target.value});
                        if (errors.message) setErrors({...errors, message: ""});
                      }}
                      placeholder={t('contact.form.message')}
                      required
                      rows={4}
                      className={`bg-background border-border resize-none ${errors.message ? 'border-destructive' : ''}`}
                    />
                    {errors.message && (
                      <p className="text-sm text-destructive mt-1">{errors.message}</p>
                    )}
                  </div>

                  <Button 
                    type="submit" 
                    disabled={isSubmitting}
                    className="w-full bg-gradient-primary hover:scale-105 transition-bounce shadow-button disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSubmitting ? (
                      <Loader2 className="w-4 h-4 ml-2 animate-spin" />
                    ) : (
                      <Calendar className="w-4 h-4 ml-2" />
                    )}
                    {isSubmitting ? "שולח..." : t('contact.form.submit')}
                  </Button>
                </form>

                {/* Social Media */}
                <div className="mt-8 pt-6 border-t border-border">
                  <p className="text-sm text-muted-foreground mb-4 text-center">
                    {t('contact.social.title')}:
                  </p>
                  <div className="flex justify-center space-x-4">
                    <Button 
                      variant="outline" 
                      size="icon" 
                      className="border-primary/30 hover:bg-primary/10"
                      onClick={() => window.open('https://www.instagram.com/k_box3?igsh=MTVyamxyZngxaWZsbA==', '_blank')}
                      aria-label={t('contact.social.instagram.label')}
                    >
                      <Instagram className="w-4 h-4 text-primary" aria-hidden="true" />
                    </Button>
                    <Button 
                      variant="outline" 
                      size="icon" 
                      className="border-primary/30 hover:bg-primary/10"
                      onClick={() => window.open('https://www.facebook.com/share/16bHZuu4Jh/?mibextid=qi2Omg', '_blank')}
                      aria-label={t('contact.social.facebook.label')}
                    >
                      <Facebook className="w-4 h-4 text-primary" aria-hidden="true" />
                    </Button>
                    <Button 
                      variant="outline" 
                      size="icon" 
                      className="border-primary/30 hover:bg-primary/10"
                      onClick={() => window.open(`https://wa.me/9720522666652`, '_blank')}
                      aria-label={t('contact.social.whatsapp.label')}
                    >
                      <MessageSquare className="w-4 h-4 text-primary" aria-hidden="true" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </section>
  );
};