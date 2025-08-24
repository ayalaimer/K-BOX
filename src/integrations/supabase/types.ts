export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instanciate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "13.0.4"
  }
  public: {
    Tables: {
      app_logs: {
        Row: {
          component: string | null
          context: Json | null
          created_at: string
          id: string
          level: Database["public"]["Enums"]["log_level"]
          message: string
          occurred_at: string
          route: string | null
          source: string
          user_id: string | null
        }
        Insert: {
          component?: string | null
          context?: Json | null
          created_at?: string
          id?: string
          level: Database["public"]["Enums"]["log_level"]
          message: string
          occurred_at?: string
          route?: string | null
          source: string
          user_id?: string | null
        }
        Update: {
          component?: string | null
          context?: Json | null
          created_at?: string
          id?: string
          level?: Database["public"]["Enums"]["log_level"]
          message?: string
          occurred_at?: string
          route?: string | null
          source?: string
          user_id?: string | null
        }
        Relationships: []
      }
      blog_posts: {
        Row: {
          author: string | null
          content: string | null
          created_at: string
          faq: Json | null
          h1_title: string | null
          hero_image: string | null
          hero_image_alt: string | null
          id: string
          intro_text: string | null
          language: string
          local_seo_text: string | null
          meta_description: string | null
          meta_title: string | null
          published_at: string | null
          read_time: string | null
          schema: Json | null
          sections: Json | null
          slug: string
          status: string
          tags: string[] | null
          title: string
          toc: Json | null
          updated_at: string
        }
        Insert: {
          author?: string | null
          content?: string | null
          created_at?: string
          faq?: Json | null
          h1_title?: string | null
          hero_image?: string | null
          hero_image_alt?: string | null
          id?: string
          intro_text?: string | null
          language: string
          local_seo_text?: string | null
          meta_description?: string | null
          meta_title?: string | null
          published_at?: string | null
          read_time?: string | null
          schema?: Json | null
          sections?: Json | null
          slug: string
          status?: string
          tags?: string[] | null
          title: string
          toc?: Json | null
          updated_at?: string
        }
        Update: {
          author?: string | null
          content?: string | null
          created_at?: string
          faq?: Json | null
          h1_title?: string | null
          hero_image?: string | null
          hero_image_alt?: string | null
          id?: string
          intro_text?: string | null
          language?: string
          local_seo_text?: string | null
          meta_description?: string | null
          meta_title?: string | null
          published_at?: string | null
          read_time?: string | null
          schema?: Json | null
          sections?: Json | null
          slug?: string
          status?: string
          tags?: string[] | null
          title?: string
          toc?: Json | null
          updated_at?: string
        }
        Relationships: []
      }
      booking_email_templates: {
        Row: {
          body_html: string
          created_at: string
          enabled: boolean
          id: string
          language: string
          status: string
          subject: string
          updated_at: string
        }
        Insert: {
          body_html: string
          created_at?: string
          enabled?: boolean
          id?: string
          language?: string
          status: string
          subject: string
          updated_at?: string
        }
        Update: {
          body_html?: string
          created_at?: string
          enabled?: boolean
          id?: string
          language?: string
          status?: string
          subject?: string
          updated_at?: string
        }
        Relationships: []
      }
      booking_notes: {
        Row: {
          booking_id: string
          created_at: string
          created_by: string | null
          id: string
          note: string
        }
        Insert: {
          booking_id: string
          created_at?: string
          created_by?: string | null
          id?: string
          note: string
        }
        Update: {
          booking_id?: string
          created_at?: string
          created_by?: string | null
          id?: string
          note?: string
        }
        Relationships: [
          {
            foreignKeyName: "booking_notes_booking_id_fkey"
            columns: ["booking_id"]
            isOneToOne: false
            referencedRelation: "bookings"
            referencedColumns: ["id"]
          },
        ]
      }
      bookings: {
        Row: {
          approved_by: string | null
          booking_code: string | null
          booking_date: string
          created_at: string
          customer_email: string | null
          customer_name: string
          customer_phone: string
          duration_hours: number
          guest_count: number | null
          id: string
          notes: string | null
          price_total: number
          promotion_id: string | null
          room_id: string
          start_time: string
          status: Database["public"]["Enums"]["booking_status"]
          updated_at: string
        }
        Insert: {
          approved_by?: string | null
          booking_code?: string | null
          booking_date: string
          created_at?: string
          customer_email?: string | null
          customer_name: string
          customer_phone: string
          duration_hours: number
          guest_count?: number | null
          id?: string
          notes?: string | null
          price_total?: number
          promotion_id?: string | null
          room_id: string
          start_time: string
          status?: Database["public"]["Enums"]["booking_status"]
          updated_at?: string
        }
        Update: {
          approved_by?: string | null
          booking_code?: string | null
          booking_date?: string
          created_at?: string
          customer_email?: string | null
          customer_name?: string
          customer_phone?: string
          duration_hours?: number
          guest_count?: number | null
          id?: string
          notes?: string | null
          price_total?: number
          promotion_id?: string | null
          room_id?: string
          start_time?: string
          status?: Database["public"]["Enums"]["booking_status"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "bookings_promotion_id_fkey"
            columns: ["promotion_id"]
            isOneToOne: false
            referencedRelation: "promotions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bookings_room_id_fkey"
            columns: ["room_id"]
            isOneToOne: false
            referencedRelation: "rooms"
            referencedColumns: ["id"]
          },
        ]
      }
      business_hours: {
        Row: {
          close_time_hour: number
          created_at: string
          day_of_week: number
          id: string
          is_open: boolean
          note: string | null
          open_time_hour: number
          special_date: string | null
          updated_at: string
        }
        Insert: {
          close_time_hour?: number
          created_at?: string
          day_of_week: number
          id?: string
          is_open?: boolean
          note?: string | null
          open_time_hour?: number
          special_date?: string | null
          updated_at?: string
        }
        Update: {
          close_time_hour?: number
          created_at?: string
          day_of_week?: number
          id?: string
          is_open?: boolean
          note?: string | null
          open_time_hour?: number
          special_date?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      business_settings: {
        Row: {
          address: string | null
          company_name: string
          created_at: string
          email: string | null
          id: string
          logo_url: string | null
          phone: string | null
          updated_at: string
          website: string | null
        }
        Insert: {
          address?: string | null
          company_name: string
          created_at?: string
          email?: string | null
          id?: string
          logo_url?: string | null
          phone?: string | null
          updated_at?: string
          website?: string | null
        }
        Update: {
          address?: string | null
          company_name?: string
          created_at?: string
          email?: string | null
          id?: string
          logo_url?: string | null
          phone?: string | null
          updated_at?: string
          website?: string | null
        }
        Relationships: []
      }
      contact_messages: {
        Row: {
          created_at: string | null
          email: string
          full_name: string
          handled_at: string | null
          id: number
          message: string
          notes: string | null
          phone: string
          source: string | null
          status: string
        }
        Insert: {
          created_at?: string | null
          email: string
          full_name: string
          handled_at?: string | null
          id?: number
          message: string
          notes?: string | null
          phone: string
          source?: string | null
          status?: string
        }
        Update: {
          created_at?: string | null
          email?: string
          full_name?: string
          handled_at?: string | null
          id?: number
          message?: string
          notes?: string | null
          phone?: string
          source?: string | null
          status?: string
        }
        Relationships: []
      }
      contact_rate_limit: {
        Row: {
          id: string
          ip_hash: string
          last_submission: string | null
          submission_count: number | null
        }
        Insert: {
          id?: string
          ip_hash: string
          last_submission?: string | null
          submission_count?: number | null
        }
        Update: {
          id?: string
          ip_hash?: string
          last_submission?: string | null
          submission_count?: number | null
        }
        Relationships: []
      }
      promotions: {
        Row: {
          created_at: string
          description: string | null
          discounted_price: number
          id: string
          included_features: Json
          is_active: boolean
          language: string
          regular_price: number
          terms: string | null
          title: string
          updated_at: string
          valid_from: string | null
          valid_to: string | null
        }
        Insert: {
          created_at?: string
          description?: string | null
          discounted_price: number
          id?: string
          included_features?: Json
          is_active?: boolean
          language?: string
          regular_price: number
          terms?: string | null
          title: string
          updated_at?: string
          valid_from?: string | null
          valid_to?: string | null
        }
        Update: {
          created_at?: string
          description?: string | null
          discounted_price?: number
          id?: string
          included_features?: Json
          is_active?: boolean
          language?: string
          regular_price?: number
          terms?: string | null
          title?: string
          updated_at?: string
          valid_from?: string | null
          valid_to?: string | null
        }
        Relationships: []
      }
      reviews: {
        Row: {
          created_at: string
          customer_name: string
          experience_type: string | null
          id: string
          is_verified: boolean
          is_visible: boolean
          rating: number
          review_text: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          customer_name: string
          experience_type?: string | null
          id?: string
          is_verified?: boolean
          is_visible?: boolean
          rating: number
          review_text: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          customer_name?: string
          experience_type?: string | null
          id?: string
          is_verified?: boolean
          is_visible?: boolean
          rating?: number
          review_text?: string
          updated_at?: string
        }
        Relationships: []
      }
      rooms: {
        Row: {
          capacity: number
          created_at: string
          description: string | null
          id: string
          image_url: string | null
          is_active: boolean
          name: string
          price_per_hour: number
          updated_at: string
        }
        Insert: {
          capacity: number
          created_at?: string
          description?: string | null
          id?: string
          image_url?: string | null
          is_active?: boolean
          name: string
          price_per_hour: number
          updated_at?: string
        }
        Update: {
          capacity?: number
          created_at?: string
          description?: string | null
          id?: string
          image_url?: string | null
          is_active?: boolean
          name?: string
          price_per_hour?: number
          updated_at?: string
        }
        Relationships: []
      }
      translations: {
        Row: {
          category: string | null
          component: string | null
          created_at: string
          en: string | null
          he: string | null
          id: string
          key: string
          updated_at: string
        }
        Insert: {
          category?: string | null
          component?: string | null
          created_at?: string
          en?: string | null
          he?: string | null
          id?: string
          key: string
          updated_at?: string
        }
        Update: {
          category?: string | null
          component?: string | null
          created_at?: string
          en?: string | null
          he?: string | null
          id?: string
          key?: string
          updated_at?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      business_info: {
        Row: {
          company_name: string | null
          logo_url: string | null
          website: string | null
        }
        Relationships: []
      }
    }
    Functions: {
      check_availability_and_suggest: {
        Args: {
          p_room_id: string
          p_booking_date: string
          p_start_time: string
          p_duration_hours: number
        }
        Returns: {
          available: boolean
          suggested_start_time: string
          suggested_end_time: string
          message: string
        }[]
      }
      contact_submit: {
        Args: {
          p_full_name: string
          p_phone: string
          p_email: string
          p_message: string
          p_ip_address?: string
        }
        Returns: Json
      }
      generate_booking_code: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      has_role: {
        Args: {
          _user_id: string
          _role: Database["public"]["Enums"]["app_role"]
        }
        Returns: boolean
      }
      reserve_booking: {
        Args:
          | {
              p_room_id: string
              p_booking_date: string
              p_start_time: string
              p_duration_hours: number
              p_customer_name: string
              p_customer_phone: string
              p_customer_email?: string
              p_notes?: string
            }
          | {
              p_room_id: string
              p_booking_date: string
              p_start_time: string
              p_duration_hours: number
              p_customer_name: string
              p_customer_phone: string
              p_customer_email?: string
              p_notes?: string
              p_guest_count?: number
            }
        Returns: {
          approved_by: string | null
          booking_code: string | null
          booking_date: string
          created_at: string
          customer_email: string | null
          customer_name: string
          customer_phone: string
          duration_hours: number
          guest_count: number | null
          id: string
          notes: string | null
          price_total: number
          promotion_id: string | null
          room_id: string
          start_time: string
          status: Database["public"]["Enums"]["booking_status"]
          updated_at: string
        }
      }
    }
    Enums: {
      app_role: "admin" | "manager" | "staff"
      booking_status:
        | "pending"
        | "approved"
        | "cancelled"
        | "completed"
        | "waitlisted"
      log_level: "debug" | "info" | "warn" | "error"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["admin", "manager", "staff"],
      booking_status: [
        "pending",
        "approved",
        "cancelled",
        "completed",
        "waitlisted",
      ],
      log_level: ["debug", "info", "warn", "error"],
    },
  },
} as const
