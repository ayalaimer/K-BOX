import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Gift, MessageSquare } from "lucide-react";
import { useTranslation } from "@/hooks/useTranslation";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

type DbPromotion = {
  id: string;
  title: string;
  description: string | null;
  regular_price: number;
  discounted_price: number;
  valid_from: string | null;
  valid_to: string | null;
  is_active: boolean;
  terms: string | null;
  language: 'he' | 'en';
  included_features: string[];
};

export const PromotionsSection = () => {
  const { t, loading, language } = useTranslation();

  const { data: promotions, isLoading } = useQuery({
    queryKey: ["promotions-public", language],
    queryFn: async (): Promise<DbPromotion[]> => {
      const { data, error } = await supabase
        .from("promotions")
        .select("*")
        .eq("is_active", true)
        .eq("language", language)
        .order("created_at", { ascending: false });
      if (error) throw error;
      // Ensure array types
      return (data || []).map((p: any) => ({
        ...p,
        included_features: Array.isArray(p.included_features) ? p.included_features : [],
      })) as DbPromotion[];
    },
    staleTime: 60_000,
  });

  const fmtDate = (d?: string | null) => (d ? d : "");

  return (
    <section id="promotions" className="py-20 bg-muted/30">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="text-center mb-16">
          <Badge className="bg-accent/20 text-accent border-accent/30 mb-4">
            {t('promotions.badge')}
          </Badge>
          <h2 className="text-4xl md:text-5xl font-hebrew-display text-foreground mb-6">
            {t('promotions.title')}
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            {t('promotions.subtitle')}
          </p>
        </div>

        {/* Promotions Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {isLoading ? (
            <div className="col-span-2 text-center text-muted-foreground">
              {t('loading') || 'טוען…'}
            </div>
          ) : !promotions || promotions.length === 0 ? (
            <div className="col-span-2 text-center text-muted-foreground">
              {t('promotions.none') || 'אין מבצעים זמינים כרגע'}
            </div>
          ) : (
            promotions.map((promo) => {
              return (
                <Card 
                  key={promo.id} 
                  className="relative overflow-hidden hover:scale-105 transition-bounce shadow-card border-border/50"
                >

                  <CardHeader className="pb-4">
                    <div className="flex items-center space-x-3 mb-4">
                      <div className="w-12 h-12 rounded-lg bg-gradient-primary flex items-center justify-center">
                        <Gift className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <CardTitle className="text-foreground font-hebrew-display text-xl mb-1">
                          {promo.title}
                        </CardTitle>
                        {(promo.valid_from || promo.valid_to) && (
                          <p className="text-muted-foreground text-sm">
                            {fmtDate(promo.valid_from)} {promo.valid_from && promo.valid_to ? '–' : ''} {fmtDate(promo.valid_to)}
                          </p>
                        )}
                      </div>
                    </div>
                    {promo.description && <p className="text-muted-foreground">{promo.description}</p>}
                  </CardHeader>

                  <CardContent>
                    {/* Features */}
                    {Array.isArray(promo.included_features) && promo.included_features.length > 0 && (
                      <div className="space-y-2 mb-6">
                        <h4 className="font-semibold text-foreground mb-3">{t('promotions.whatsIncluded')}</h4>
                        {promo.included_features.map((feature, index) => (
                          <div key={index} className="flex items-center space-x-2 text-sm">
                            <div className="w-1.5 h-1.5 bg-primary rounded-full" />
                            <span className="text-muted-foreground">{feature}</span>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Contact Info */}
                    <div className="w-full text-center py-3 px-4">
                      <p className="text-muted-foreground font-medium">
                        לתיאום חבילה – צרו קשר 052-2666652
                      </p>
                    </div>
                  </CardContent>
                </Card>
              );
            })
          )}
        </div>

      </div>
    </section>
  );
};
