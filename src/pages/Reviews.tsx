import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Star, User, Calendar, MessageSquare } from "lucide-react";
import { useState } from "react";
import { useTranslation } from "@/hooks/useTranslation";
import { useReviews, useAddReview } from "@/hooks/useReviews";
import { NavLink } from "react-router-dom";

const Reviews = () => {
  const { t } = useTranslation();
  const { data: reviews = [], isLoading } = useReviews();
  const addReviewMutation = useAddReview();
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [newReview, setNewReview] = useState({
    customer_name: "",
    rating: 5,
    review_text: "",
    experience_type: ""
  });

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    await addReviewMutation.mutateAsync(newReview);
    setShowReviewForm(false);
    setNewReview({ customer_name: "", rating: 5, review_text: "", experience_type: "" });
  };

  const averageRating = reviews.length > 0 
    ? reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length 
    : 0;

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="pt-24 pb-16">
        <div className="container mx-auto px-4">
          {/* Page Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-foreground mb-4">{t('reviews.title')}</h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-6">
              {t('reviews.subtitle')}
            </p>
            
            {/* Rating Summary */}
            {reviews.length > 0 && (
              <div className="flex items-center justify-center gap-4 mb-8">
                <div className="text-center">
                  <div className="text-4xl font-bold text-primary">{averageRating.toFixed(1)}</div>
                  <div className="flex justify-center mb-2">
                    {[1,2,3,4,5].map((star) => (
                      <Star 
                        key={star} 
                        className={`w-6 h-6 ${star <= averageRating ? 'fill-primary text-primary' : 'text-muted-foreground'}`} 
                      />
                    ))}
                  </div>
                  <div className="text-sm text-muted-foreground">{reviews.length} {t('reviews.totalReviews')}</div>
                </div>
              </div>
            )}

            <Button 
              onClick={() => setShowReviewForm(!showReviewForm)}
              size="lg"
              className="mb-8"
            >
              <MessageSquare className="w-5 h-5 ml-2" />
              {t('reviews.writeReview')}
            </Button>
          </div>

          {/* Review Form */}
          {showReviewForm && (
            <Card className="mb-12 max-w-2xl mx-auto">
              <CardHeader>
                <h3 className="text-xl font-bold text-right">{t('reviews.shareExperience')}</h3>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmitReview} className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium mb-2 text-right">{t('reviews.fullName')}</label>
                    <Input
                      value={newReview.customer_name}
                      onChange={(e) => setNewReview({...newReview, customer_name: e.target.value})}
                      className="text-right"
                      placeholder={t('bookingSection.enterName')}
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2 text-right">{t('reviews.rating')}</label>
                    <div className="flex justify-center gap-2">
                      {[1,2,3,4,5].map((star) => (
                        <button
                          key={star}
                          type="button"
                          onClick={() => setNewReview({...newReview, rating: star})}
                          className="p-1"
                        >
                          <Star 
                            className={`w-8 h-8 ${star <= newReview.rating ? 'fill-primary text-primary' : 'text-muted-foreground'}`} 
                          />
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2 text-right">{t('reviews.experienceType')}</label>
                    <Input
                      value={newReview.experience_type}
                      onChange={(e) => setNewReview({...newReview, experience_type: e.target.value})}
                      className="text-right"
                      placeholder={t('reviews.experiencePlaceholder')}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2 text-right">{t('reviews.reviewText')}</label>
                    <Textarea
                      value={newReview.review_text}
                      onChange={(e) => setNewReview({...newReview, review_text: e.target.value})}
                      className="text-right min-h-[120px]"
                      placeholder={t('reviews.reviewPlaceholder')}
                      required
                    />
                  </div>

                  <div className="flex gap-4">
                    <Button type="submit" disabled={addReviewMutation.isPending} className="flex-1">
                      {addReviewMutation.isPending ? "שולח..." : t('reviews.submitReview')}
                    </Button>
                    <Button 
                      type="button" 
                      variant="outline" 
                      onClick={() => setShowReviewForm(false)}
                      className="flex-1"
                    >
                      {t('reviews.cancel')}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          )}

          {/* Reviews List */}
          {isLoading ? (
            <div className="text-center py-8">
              <div className="text-lg">טוען ביקורות...</div>
            </div>
          ) : reviews.length === 0 ? (
            <div className="text-center py-8">
              <div className="text-lg text-muted-foreground">עדיין אין ביקורות. היה הראשון לכתוב!</div>
            </div>
          ) : (
            <div className="grid gap-6 max-w-4xl mx-auto">
              {reviews.map((review) => (
                <Card key={review.id} className="transition-all duration-300 hover:shadow-md">
                  <CardContent className="pt-6">
                    {/* Review Header */}
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                          <User className="w-5 h-5 text-primary" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="font-semibold">{review.customer_name}</h4>
                            {review.is_verified && (
                              <Badge variant="secondary" className="text-xs">
                                {t('reviews.verified')}
                              </Badge>
                            )}
                          </div>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <span>{new Date(review.created_at).toLocaleDateString("he-IL")}</span>
                            <Calendar className="w-4 h-4" />
                          </div>
                        </div>
                      </div>
                      
                      <div className="text-left">
                        <div className="flex gap-1 mb-1">
                          {[1,2,3,4,5].map((star) => (
                            <Star 
                              key={star} 
                              className={`w-4 h-4 ${star <= review.rating ? 'fill-primary text-primary' : 'text-muted-foreground'}`} 
                            />
                          ))}
                        </div>
                        {review.experience_type && (
                          <Badge variant="outline" className="text-xs">
                            {review.experience_type}
                          </Badge>
                        )}
                      </div>
                    </div>

                    {/* Review Text */}
                    <p className="text-muted-foreground leading-relaxed text-right">
                      {review.review_text}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {/* Call to Action */}
          <div className="text-center mt-16">
            <h3 className="text-2xl font-bold mb-4">{t('reviews.wantToExperience')}</h3>
            <p className="text-muted-foreground mb-6">{t('reviews.experienceSubtitle')}</p>
            <Button size="lg" className="bg-primary hover:bg-primary/90">
              {t('reviews.bookNow')}
            </Button>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Reviews;