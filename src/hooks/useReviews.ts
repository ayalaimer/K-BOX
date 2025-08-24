import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export interface Review {
  id: string;
  customer_name: string;
  rating: number;
  review_text: string;
  experience_type?: string;
  is_verified: boolean;
  is_visible: boolean;
  created_at: string;
  updated_at: string;
}

export interface NewReview {
  customer_name: string;
  rating: number;
  review_text: string;
  experience_type?: string;
}

export function useReviews() {
  return useQuery({
    queryKey: ["reviews"],
    queryFn: async (): Promise<Review[]> => {
      const { data, error } = await supabase
        .from("reviews")
        .select("*")
        .eq("is_visible", true)
        .order("created_at", { ascending: false });
      
      if (error) throw error;
      return data || [];
    },
  });
}

export function useAllReviews() {
  return useQuery({
    queryKey: ["all-reviews"],
    queryFn: async (): Promise<Review[]> => {
      const { data, error } = await supabase
        .from("reviews")
        .select("*")
        .order("created_at", { ascending: false });
      
      if (error) throw error;
      return data || [];
    },
  });
}

export function useAddReview() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (review: NewReview): Promise<Review> => {
      const { data, error } = await supabase
        .from("reviews")
        .insert([review])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["reviews"] });
      queryClient.invalidateQueries({ queryKey: ["all-reviews"] });
      toast({
        title: "ביקורת נוספה בהצלחה",
        description: "תודה שחלקת את החוויה שלך!",
      });
    },
    onError: () => {
      toast({
        title: "שגיאה",
        description: "לא ניתן היה להוסיף את הביקורת. נסה שוב.",
        variant: "destructive",
      });
    },
  });
}

export function useUpdateReview() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<Review> & { id: string }) => {
      const { data, error } = await supabase
        .from("reviews")
        .update(updates)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["reviews"] });
      queryClient.invalidateQueries({ queryKey: ["all-reviews"] });
      toast({
        title: "ביקורת עודכנה בהצלחה",
      });
    },
    onError: () => {
      toast({
        title: "שגיאה",
        description: "לא ניתן היה לעדכן את הביקורת. נסה שוב.",
        variant: "destructive",
      });
    },
  });
}

export function useDeleteReview() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("reviews")
        .delete()
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["reviews"] });
      queryClient.invalidateQueries({ queryKey: ["all-reviews"] });
      toast({
        title: "ביקורת נמחקה בהצלחה",
      });
    },
    onError: () => {
      toast({
        title: "שגיאה",
        description: "לא ניתן היה למחוק את הביקורת. נסה שוב.",
        variant: "destructive",
      });
    },
  });
}