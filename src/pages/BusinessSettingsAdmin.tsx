
import { useEffect, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Helmet } from "react-helmet-async";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import SocialLinksManager from "@/components/admin/SocialLinksManager";
import PromotionsManager from "@/components/admin/PromotionsManager";

interface BusinessSettings {
  id?: string;
  company_name: string;
  address?: string | null;
  phone?: string | null;
  email?: string | null;
  website?: string | null;
  logo_url?: string | null;
}

const BusinessSettingsAdmin = () => {
  const qc = useQueryClient();
  const [form, setForm] = useState<BusinessSettings>({ company_name: '' });

  const query = useQuery({
    queryKey: ['business-settings'],
    queryFn: async () => {
      const { data, error } = await supabase.from('business_settings').select('*').limit(1).maybeSingle();
      if (error) throw error;
      return (data || { company_name: '' }) as BusinessSettings;
    },
  });

  useEffect(() => {
    if (query.data) setForm(query.data);
  }, [query.data]);

  const mutation = useMutation({
    mutationFn: async (payload: BusinessSettings) => {
      if (payload.id) {
        const { error } = await supabase.from('business_settings').update(payload).eq('id', payload.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from('business_settings').insert(payload);
        if (error) throw error;
      }
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['business-settings'] })
  });

  return (
    <div className="container mx-auto px-2 md:px-4">
      <Helmet>
        <title>הגדרות עסק | K-Box</title>
        <meta name="robots" content="noindex" />
        <meta name="description" content="שם העסק, כתובת, טלפון ועוד" />
        <link rel="canonical" href={`${window.location.origin}/admin/settings`} />
      </Helmet>

      <Card>
        <CardHeader className="flex items-center justify-between">
          <CardTitle>פרטי העסק</CardTitle>
          <Button onClick={() => mutation.mutate(form)}>שמור</Button>
        </CardHeader>
        <CardContent>
          {query.isLoading ? (
            <div>טוען…</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label>שם העסק</Label>
                <Input value={form.company_name} onChange={(e) => setForm({ ...form, company_name: e.target.value })} />
              </div>
              <div>
                <Label>טלפון</Label>
                <Input value={form.phone || ''} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
              </div>
              <div className="md:col-span-2">
                <Label>כתובת</Label>
                <Input value={form.address || ''} onChange={(e) => setForm({ ...form, address: e.target.value })} />
              </div>
              <div>
                <Label>אימייל</Label>
                <Input type="email" value={form.email || ''} onChange={(e) => setForm({ ...form, email: e.target.value })} />
              </div>
              <div>
                <Label>אתר</Label>
                <Input value={form.website || ''} onChange={(e) => setForm({ ...form, website: e.target.value })} />
              </div>
              <div className="md:col-span-2">
                <Label>לוגו (URL)</Label>
                <Input value={form.logo_url || ''} onChange={(e) => setForm({ ...form, logo_url: e.target.value })} />
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <SocialLinksManager />

      <PromotionsManager />
    </div>
  );
};

export default BusinessSettingsAdmin;
