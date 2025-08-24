import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { MapPin, Navigation } from "lucide-react";
import { useState } from "react";
import { useTranslation } from "@/hooks/useTranslation";
import { useBusinessSettings } from "@/hooks/useBusinessSettings";

const Contact = () => {
  const { t } = useTranslation();
  const { data: business } = useBusinessSettings();
  const [contactForm, setContactForm] = useState({
    name: "",
    phone: "",
    email: "",
    subject: "",
    message: ""
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Contact form submitted:", contactForm);
    // Handle form submission
    setContactForm({ name: "", phone: "", email: "", subject: "", message: "" });
  };


const address = business?.address || t('contact.location.value') || t('contact.map.address');
const mapQuery = encodeURIComponent(address || '');
const mapLink = `https://www.google.com/maps?q=${mapQuery}`;
const wazeLink = business?.address 
  ? `https://waze.com/ul?q=${mapQuery}` 
  : 'https://www.waze.com/live-map/directions/%D7%A9%D7%98%D7%A0%D7%A8-3-%D7%99%D7%A8%D7%95%D7%A9%D7%9C%D7%99%D7%9D';
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="pt-24 pb-16">
        <div className="container mx-auto px-4">
          {/* Page Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-foreground mb-4">{t('contact.title')}</h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              {t('contact.subtitle')}
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-12">
            {/* Contact Information */}
            <div className="space-y-8">
              {/* Business Info Card */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-right flex items-center gap-2">
                    <MapPin className="w-5 h-5" />
                    {t('contact.info.business')}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Address */}
                  <div className="text-right">
                    <h3 className="font-semibold mb-2">{t('contact.location.title')}:</h3>
                    <p className="text-muted-foreground">
                      {address}
                    </p>
                  </div>

                </CardContent>
              </Card>


              {/* Directions */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-right flex items-center gap-2">
                    <Navigation className="w-5 h-5" />
                    {t('contact.directions.title')}
                  </CardTitle>
                </CardHeader>
                <CardContent className="text-right space-y-3">
                  <div>
                    <h4 className="font-semibold mb-2">{t('contact.directions.car')}</h4>
                    <p className="text-muted-foreground text-sm leading-relaxed">
                      {t('contact.directions.carInfo')}
                    </p>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-2">{t('contact.directions.public')}</h4>
                    <p className="text-muted-foreground text-sm leading-relaxed">
                      {t('contact.directions.publicInfo')}
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Contact Form */}
            <div>
              <Card>
                <CardHeader>
                  <CardTitle className="text-right">{t('contact.form.title')}</CardTitle>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium mb-2 text-right">{t('contact.form.name')} *</label>
                        <Input
                          value={contactForm.name}
                          onChange={(e) => setContactForm({...contactForm, name: e.target.value})}
                          className="text-right"
                          placeholder={t('contact.form.name')}
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-2 text-right">{t('contact.form.phone')} *</label>
                        <Input
                          value={contactForm.phone}
                          onChange={(e) => setContactForm({...contactForm, phone: e.target.value})}
                          className="text-right"
                          placeholder={t('contact.form.phone')}
                          required
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2 text-right">{t('contact.form.email')}</label>
                      <Input
                        type="email"
                        value={contactForm.email}
                        onChange={(e) => setContactForm({...contactForm, email: e.target.value})}
                        className="text-right"
                        placeholder={t('contact.form.email')}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2 text-right">{t('contact.form.subject')} *</label>
                      <Input
                        value={contactForm.subject}
                        onChange={(e) => setContactForm({...contactForm, subject: e.target.value})}
                        className="text-right"
                        placeholder={t('contact.form.subject')}
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2 text-right">{t('contact.form.message')} *</label>
                      <Textarea
                        value={contactForm.message}
                        onChange={(e) => setContactForm({...contactForm, message: e.target.value})}
                        className="text-right min-h-[120px]"
                        placeholder={t('contact.form.message')}
                        required
                      />
                    </div>

                    <Button type="submit" className="w-full text-lg py-6">
                      {t('contact.form.submit')}
                    </Button>

                    <p className="text-xs text-muted-foreground text-center">
                      {t('contact.form.required')}
                    </p>
                  </form>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Map Section */}
          <div className="mt-16">
            <Card>
                <CardHeader>
                  <CardTitle className="text-right">{t('contact.map.title')}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="w-full h-96 rounded-lg overflow-hidden border border-border">
                      <iframe
                        src={`https://www.google.com/maps?q=${mapQuery}&output=embed`}
                        className="w-full h-full border-0"
                        loading="lazy"
                        referrerPolicy="no-referrer-when-downgrade"
                        title={t('contact.map.title')}
                        aria-label={t('contact.map.title')}
                      />
                    </div>
<div className="flex justify-end gap-3">
  <Button variant="outline" onClick={() => window.open(mapLink, '_blank', 'noopener,noreferrer')}>
    {t('contact.map.open')}
  </Button>
  <Button variant="outline" onClick={() => window.open(wazeLink, '_blank', 'noopener,noreferrer')} aria-label="פתח בוויז">
    פתח בוויז
  </Button>
</div>
                  </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Contact;