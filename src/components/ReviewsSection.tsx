import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import { Star, Quote, User, Calendar, ArrowLeft } from "lucide-react";
import { useTranslation } from "@/hooks/useTranslation";
import { useReviews } from "@/hooks/useReviews";
import { NavLink } from "react-router-dom";

export const ReviewsSection = () => {
  const { t, loading } = useTranslation();
  const { data: reviews = [], isLoading: reviewsLoading } = useReviews();

  if (loading || reviewsLoading) {
    return (
      <section id="reviews" className="py-20 bg-background">
        <div className="container mx-auto px-4 text-center">
          <div className="text-lg">טוען...</div>
        </div>
      </section>
    );
  }

  const averageRating = reviews.length > 0 
    ? reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length 
    : 0;
  
  const totalReviews = reviews.length;

  return (
    <section id="reviews" className="py-20 bg-background">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="text-center mb-16">
          <Badge className="bg-primary/20 text-primary border-primary/30 mb-4">
            {t('reviews.badge')}
          </Badge>
          <h2 className="text-4xl md:text-5xl font-hebrew-display text-foreground mb-6">
            {t('reviews.title')}
          </h2>
          <div className="flex items-center justify-center space-x-4 mb-6">
            <div className="flex items-center space-x-1">
              {[...Array(5)].map((_, i) => (
                <Star 
                  key={i} 
                  className={`w-6 h-6 ${i < Math.floor(averageRating) ? 'text-yellow-400 fill-current' : 'text-muted-foreground'}`} 
                />
              ))}
            </div>
            <div className="text-lg font-semibold text-foreground">
              <span className="ltr-numbers">{averageRating}</span> {t('reviews.outOf5')}
            </div>
            <div className="text-muted-foreground">
              (<span className="ltr-numbers">{totalReviews}</span> {t('reviews.totalReviews').toLowerCase()})
            </div>
          </div>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            {t('reviews.subtitle')}
          </p>
        </div>

        {/* Reviews Carousel */}
        <div className="relative mb-12">
          <Carousel
            opts={{
              align: "start",
              direction: "rtl",
              loop: true,
            }}
            className="w-full"
          >
            <CarouselContent className="-ml-2 md:-ml-4">
              {reviews.map((review) => (
                <CarouselItem key={review.id} className="pl-2 md:pl-4 md:basis-1/2 lg:basis-1/3">
                  <Card className="h-full bg-card/80 backdrop-blur-sm border-border/30 shadow-elegant hover:shadow-glow transition-all duration-300 hover:scale-[1.02]">
                    <CardContent className="p-8">
                      {/* Header with user info */}
                      <div className="flex items-start justify-between mb-6">
                        <div className="flex items-center space-x-4">
                          <div className="w-14 h-14 rounded-full bg-gradient-primary flex items-center justify-center">
                            <User className="w-7 h-7 text-white" />
                          </div>
                          <div>
                            <div className="flex items-center space-x-2 mb-1">
                              <h4 className="text-lg font-semibold text-foreground">{review.customer_name}</h4>
                              {review.is_verified && (
                                <Badge variant="secondary" className="text-xs">
                                  {t('reviews.verified')}
                                </Badge>
                              )}
                            </div>
                            <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                              <Calendar className="w-4 h-4" />
                              <span>{new Date(review.created_at).toLocaleDateString("he-IL")}</span>
                              {review.experience_type && (
                                <>
                                  <span>•</span>
                                  <span className="text-primary">{review.experience_type}</span>
                                </>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      {/* Rating */}
                      <div className="flex items-center space-x-1 mb-6">
                        {[...Array(5)].map((_, i) => (
                          <Star 
                            key={i} 
                            className={`w-5 h-5 ${i < review.rating ? 'text-yellow-400 fill-current' : 'text-muted-foreground'}`} 
                          />
                        ))}
                      </div>

                      {/* Review content */}
                      <div className="relative">
                        <Quote className="absolute top-0 right-0 w-10 h-10 text-primary/20" />
                        <p className="text-muted-foreground leading-relaxed text-base pr-8 min-h-[4rem]">
                          {review.review_text}
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                </CarouselItem>
              ))}
            </CarouselContent>
            <CarouselPrevious className="hidden md:flex -left-12 bg-background/80 backdrop-blur-sm border-primary/30 hover:bg-primary/10" />
            <CarouselNext className="hidden md:flex -right-12 bg-background/80 backdrop-blur-sm border-primary/30 hover:bg-primary/10" />
          </Carousel>
          
          {/* Mobile scroll indicator */}
          <div className="md:hidden text-center mt-4">
            <p className="text-sm text-muted-foreground">גללו הצידה לביקורות נוספות</p>
          </div>
        </div>

        {/* CTA Section */}
        <div className="text-center">
          <NavLink to="/he/reviews">
            <Button 
              variant="outline" 
              className="border-primary/30 text-primary hover:bg-primary/10"
            >
              <ArrowLeft className="w-4 h-4 ml-2" />
              {t('reviews.seeAllReviews')}
            </Button>
          </NavLink>
        </div>
      </div>
    </section>
  );
};