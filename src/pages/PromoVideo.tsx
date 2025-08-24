import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Play, Volume2, Mic, Users, Star, Calendar } from "lucide-react";
import { useState } from "react";

const PromoVideo = () => {
  const [videoLoaded, setVideoLoaded] = useState(false);

  const features = [
    {
      icon: <Mic className="w-6 h-6" />,
      title: "מערכת קול מתקדמת",
      description: "מיקרופונים אלחוטיים איכותיים ומערכת קול מקצועית"
    },
    {
      icon: <Users className="w-6 h-6" />,
      title: "חדרים לכל גודל קבוצה",
      description: "מחדרים אינטימיים לזוגות ועד חללים גדולים למסיבות"
    },
    {
      icon: <Volume2 className="w-6 h-6" />,
      title: "קטלוג שירים עצום",
      description: "אלפי שירים בעברית, אנגלית וערבית + עדכונים שוטפים"
    },
    {
      icon: <Star className="w-6 h-6" />,
      title: "שירות 5 כוכבים",
      description: "צוות מקצועי ואדיב שידאג לכל הפרטים"
    }
  ];

  const galleryImages = [
    {
      id: 1,
      title: "חדר VIP מפואר",
      description: "חדר פרטי עם תאורה מיוחדת ומערכת קול מתקדמת"
    },
    {
      id: 2,
      title: "חדר קבוצתי גדול",
      description: "מתאים למסיבות ואירועים של עד 20 אנשים"
    },
    {
      id: 3,
      title: "פינת הרפיה",
      description: "אזור מנוחה נוח בין השירים"
    },
    {
      id: 4,
      title: "בר ומשקאות",
      description: "מגוון משקאות קרים וחמים"
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="pt-24 pb-16">
        <div className="container mx-auto px-4">
          {/* Page Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-foreground mb-4">גלו את החוויה שלנו</h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              סרטון קצר שיראה לכם בדיוק מה מחכה לכם אצלנו
            </p>
          </div>

          {/* Video Section */}
          <div className="max-w-4xl mx-auto mb-16">
            <Card className="overflow-hidden">
              <CardContent className="p-0">
                <div className="relative aspect-video bg-gradient-to-br from-primary/20 to-secondary/20">
                  {!videoLoaded ? (
                    // Video Placeholder
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="text-center">
                        <div className="w-20 h-20 bg-primary rounded-full flex items-center justify-center mb-4 mx-auto shadow-lg hover:shadow-xl transition-shadow cursor-pointer">
                          <Play className="w-8 h-8 text-primary-foreground mr-1" />
                        </div>
                        <h3 className="text-xl font-bold mb-2">צפו בסרטון הפרומו שלנו</h3>
                        <p className="text-muted-foreground mb-4">2:30 דקות של חוויה מדהימה</p>
                        <Button 
                          onClick={() => setVideoLoaded(true)}
                          size="lg"
                          className="bg-primary hover:bg-primary/90"
                        >
                          <Play className="w-5 h-5 ml-2" />
                          הפעילו הסרטון
                        </Button>
                      </div>
                    </div>
                  ) : (
                    // YouTube Embed Placeholder
                    <div className="w-full h-full flex items-center justify-center bg-muted">
                      <div className="text-center">
                        <Play className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                        <p className="text-muted-foreground">
                          כאן יוטמע סרטון YouTube<br />
                          (החליפו עם embed URL אמיתי)
                        </p>
                      </div>
                      {/* 
                      Replace with actual YouTube embed:
                      <iframe
                        src="https://www.youtube.com/embed/YOUR_VIDEO_ID"
                        title="Karaoke Rooms Promo Video"
                        className="w-full h-full"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                      />
                      */}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Features Grid */}
          <div className="mb-16">
            <h2 className="text-3xl font-bold text-center mb-8">למה לבחור אותנו?</h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {features.map((feature, index) => (
                <Card key={index} className="text-center hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4 text-primary">
                      {feature.icon}
                    </div>
                    <CardTitle className="text-lg">{feature.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground text-sm">{feature.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Gallery Section */}
          <div className="mb-16">
            <h2 className="text-3xl font-bold text-center mb-8">גלריית תמונות</h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {galleryImages.map((image) => (
                <Card key={image.id} className="overflow-hidden hover:shadow-lg transition-shadow group">
                  <div className="aspect-square bg-gradient-to-br from-primary/10 to-secondary/10 relative overflow-hidden">
                    {/* Image Placeholder */}
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="text-center p-4">
                        <div className="w-12 h-12 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-3">
                          <Star className="w-6 h-6 text-primary" />
                        </div>
                        <h4 className="font-semibold text-sm mb-1">{image.title}</h4>
                        <p className="text-xs text-muted-foreground">{image.description}</p>
                      </div>
                    </div>
                    {/* Replace with actual images */}
                  </div>
                </Card>
              ))}
            </div>
          </div>

          {/* Stats Section */}
          <div className="mb-16">
            <Card className="bg-gradient-to-r from-primary/5 to-secondary/5">
              <CardContent className="py-12">
                <div className="grid md:grid-cols-4 gap-8 text-center">
                  <div>
                    <div className="text-4xl font-bold text-primary mb-2">50,000+</div>
                    <div className="text-muted-foreground">לקוחות מרוצים</div>
                  </div>
                  <div>
                    <div className="text-4xl font-bold text-primary mb-2">8</div>
                    <div className="text-muted-foreground">חדרים מפוארים</div>
                  </div>
                  <div>
                    <div className="text-4xl font-bold text-primary mb-2">15,000+</div>
                    <div className="text-muted-foreground">שירים בקטלוג</div>
                  </div>
                  <div>
                    <div className="text-4xl font-bold text-primary mb-2">4.9</div>
                    <div className="text-muted-foreground">דירוג ממוצע</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Testimonials */}
          <div className="mb-16">
            <h2 className="text-3xl font-bold text-center mb-8">מה אומרים עלינו</h2>
            <div className="grid md:grid-cols-3 gap-6">
              {[
                {
                  name: "שרה ודני",
                  text: "המקום הכי רומנטי לדייט! האווירה פשוט מושלמת.",
                  type: "זוג"
                },
                {
                  name: "קבוצת החברות",
                  text: "כל פעם שאנחנו רוצות לחגוג משהו, אנחנו מגיעות לכאן.",
                  type: "חברות"
                },
                {
                  name: "משפחת כהן",
                  text: "חגגנו יום הולדת והילדים לא רצו לעזוב!",
                  type: "משפחה"
                }
              ].map((testimonial, index) => (
                <Card key={index}>
                  <CardContent className="pt-6">
                    <div className="text-center">
                      <div className="flex justify-center mb-4">
                        {[1,2,3,4,5].map((star) => (
                          <Star key={star} className="w-4 h-4 fill-primary text-primary" />
                        ))}
                      </div>
                      <p className="text-muted-foreground mb-4 italic">"{testimonial.text}"</p>
                      <div>
                        <div className="font-semibold">{testimonial.name}</div>
                        <Badge variant="secondary" className="mt-1">{testimonial.type}</Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* CTA Section */}
          <div className="text-center">
            <Card className="bg-gradient-to-r from-primary to-secondary text-primary-foreground">
              <CardContent className="py-12">
                <h2 className="text-3xl font-bold mb-4">מוכנים לחוויה בלתי נשכחת?</h2>
                <p className="text-xl mb-8 opacity-90">
                  הזמינו עכשיו וגלו למה אנחנו החדרי קריוקי הטובים בעיר
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Button 
                    size="lg" 
                    variant="secondary"
                    className="text-primary bg-primary-foreground hover:bg-primary-foreground/90"
                  >
                    <Calendar className="w-5 h-5 ml-2" />
                    הזמנו עכשיו
                  </Button>
                  <Button 
                    size="lg" 
                    variant="outline" 
                    className="border-primary-foreground text-primary-foreground hover:bg-primary-foreground/10"
                  >
                    03-555-1234
                  </Button>
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

export default PromoVideo;