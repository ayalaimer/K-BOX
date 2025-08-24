import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface BusinessInfo {
  company_name: string;
  website?: string | null;
  logo_url?: string | null;
}

export function useBusinessInfo() {
  const query = useQuery({
    queryKey: ["business-info"],
    queryFn: async (): Promise<BusinessInfo> => {
      const { data, error } = await supabase
        .from("business_info")
        .select("*")
        .limit(1)
        .maybeSingle();
      if (error) throw error;
      return (data || { company_name: "" }) as BusinessInfo;
    },
    staleTime: 5 * 60 * 1000,
  });

  return query;
}