import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface BusinessSettings {
  id?: string;
  company_name: string;
  address?: string | null;
  phone?: string | null;
  email?: string | null;
  website?: string | null;
  logo_url?: string | null;
}

export function useBusinessSettings() {
  const query = useQuery({
    queryKey: ["business-settings"],
    queryFn: async (): Promise<BusinessSettings> => {
      const { data, error } = await supabase
        .from("business_settings")
        .select("*")
        .limit(1)
        .maybeSingle();
      if (error) throw error;
      return (data || { company_name: "" }) as BusinessSettings;
    },
    staleTime: 5 * 60 * 1000,
  });

  return query;
}
