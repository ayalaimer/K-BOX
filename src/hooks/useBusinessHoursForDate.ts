import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";

export interface BusinessHoursForDate {
  is_open: boolean;
  open_time_hour: number;
  close_time_hour: number;
}

export function useBusinessHoursForDate(date?: Date) {
  const bookingDate = date ? format(date, "yyyy-MM-dd") : null;
  const dayOfWeek = date ? date.getDay() : null; // 0=Sunday ... 6=Saturday

  const query = useQuery({
    queryKey: ["business-hours", bookingDate],
    enabled: !!bookingDate,
    queryFn: async (): Promise<BusinessHoursForDate | null> => {
      if (!bookingDate || dayOfWeek === null) return null;

      // 1) Try special date override
      const { data: specialRows, error: specialErr } = await supabase
        .from("business_hours")
        .select("is_open, open_time_hour, close_time_hour")
        .eq("special_date", bookingDate)
        .order("updated_at", { ascending: false })
        .limit(1);
      if (specialErr) throw specialErr;
      if (specialRows && specialRows.length > 0) return specialRows[0] as BusinessHoursForDate;

      // 2) Fallback to weekday schedule
      const { data: regularRows, error: regularErr } = await supabase
        .from("business_hours")
        .select("is_open, open_time_hour, close_time_hour")
        .eq("day_of_week", dayOfWeek)
        .is("special_date", null)
        .order("updated_at", { ascending: false })
        .limit(1);
      if (regularErr) throw regularErr;
      if (regularRows && regularRows.length > 0) return regularRows[0] as BusinessHoursForDate;

      return null;
    },
  });

  return {
    hours: query.data ?? null,
    isLoading: query.isLoading,
    isError: query.isError,
  } as const;
}
