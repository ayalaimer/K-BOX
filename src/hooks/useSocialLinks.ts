
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface SocialLink {
  id?: string;
  platform: string;
  label?: string | null;
  url: string;
  icon_name?: string | null;
  order_index: number;
  enabled: boolean;
}

export function useSocialLinks(enabledOnly: boolean = true) {
  return useQuery({
    queryKey: ["social-links", { enabledOnly }],
    queryFn: async (): Promise<SocialLink[]> => {
      let q = (supabase as any)
        .from("business_social_links")
        .select("*")
        .order("order_index", { ascending: true });
      if (enabledOnly) q = q.eq("enabled", true);
      const { data, error } = await q;
      if (error) throw error;
      return (data || []) as SocialLink[];
    },
    staleTime: 5 * 60 * 1000,
  });
}
