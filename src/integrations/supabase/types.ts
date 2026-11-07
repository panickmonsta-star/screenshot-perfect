export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      coin_packages: {
        Row: {
          active: boolean
          bonus_coins: number
          coin_amount: number
          created_at: string
          id: string
          name: string
          popular: boolean
          price_idr: number
          updated_at: string
        }
        Insert: {
          active?: boolean
          bonus_coins?: number
          coin_amount: number
          created_at?: string
          id?: string
          name: string
          popular?: boolean
          price_idr: number
          updated_at?: string
        }
        Update: {
          active?: boolean
          bonus_coins?: number
          coin_amount?: number
          created_at?: string
          id?: string
          name?: string
          popular?: boolean
          price_idr?: number
          updated_at?: string
        }
        Relationships: []
      }
      comments: {
        Row: {
          content: string
          created_at: string
          id: string
          user_id: string
          video_id: string
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          user_id: string
          video_id: string
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          user_id?: string
          video_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "comments_video_id_fkey"
            columns: ["video_id"]
            isOneToOne: false
            referencedRelation: "videos"
            referencedColumns: ["id"]
          },
        ]
      }
      download_jobs: {
        Row: {
          created_at: string
          episode_id: string
          expires_at: string | null
          id: string
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          episode_id: string
          expires_at?: string | null
          id?: string
          status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          episode_id?: string
          expires_at?: string | null
          id?: string
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "download_jobs_episode_id_fkey"
            columns: ["episode_id"]
            isOneToOne: false
            referencedRelation: "episodes"
            referencedColumns: ["id"]
          },
        ]
      }
      download_settings: {
        Row: {
          bulk_first_five_episodes: boolean
          id: boolean
          platform_name: string
          positions: Json
          updated_at: string
          updated_by: string | null
          watermark_logo_url: string | null
          watermark_text: string
        }
        Insert: {
          bulk_first_five_episodes?: boolean
          id?: boolean
          platform_name?: string
          positions?: Json
          updated_at?: string
          updated_by?: string | null
          watermark_logo_url?: string | null
          watermark_text?: string
        }
        Update: {
          bulk_first_five_episodes?: boolean
          id?: boolean
          platform_name?: string
          positions?: Json
          updated_at?: string
          updated_by?: string | null
          watermark_logo_url?: string | null
          watermark_text?: string
        }
        Relationships: []
      }
      episode_entitlements: {
        Row: {
          episode_id: string
          episode_number: number
          id: string
          series_id: string
          source: string
          unlocked_at: string
          user_id: string
        }
        Insert: {
          episode_id: string
          episode_number: number
          id?: string
          series_id: string
          source: string
          unlocked_at?: string
          user_id: string
        }
        Update: {
          episode_id?: string
          episode_number?: number
          id?: string
          series_id?: string
          source?: string
          unlocked_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "episode_entitlements_episode_id_fkey"
            columns: ["episode_id"]
            isOneToOne: false
            referencedRelation: "episodes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "episode_entitlements_series_id_fkey"
            columns: ["series_id"]
            isOneToOne: false
            referencedRelation: "series"
            referencedColumns: ["id"]
          },
        ]
      }
      episodes: {
        Row: {
          aspect_ratio: string
          coin_price: number
          created_at: string
          description: string
          download_enabled: boolean
          duration_seconds: number
          episode_number: number
          id: string
          is_free: boolean
          series_id: string
          status: string
          thumbnail_url: string
          title: string
          updated_at: string
          video_asset_key: string | null
        }
        Insert: {
          aspect_ratio?: string
          coin_price?: number
          created_at?: string
          description?: string
          download_enabled?: boolean
          duration_seconds?: number
          episode_number: number
          id?: string
          is_free?: boolean
          series_id: string
          status?: string
          thumbnail_url?: string
          title: string
          updated_at?: string
          video_asset_key?: string | null
        }
        Update: {
          aspect_ratio?: string
          coin_price?: number
          created_at?: string
          description?: string
          download_enabled?: boolean
          duration_seconds?: number
          episode_number?: number
          id?: string
          is_free?: boolean
          series_id?: string
          status?: string
          thumbnail_url?: string
          title?: string
          updated_at?: string
          video_asset_key?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "episodes_series_id_fkey"
            columns: ["series_id"]
            isOneToOne: false
            referencedRelation: "series"
            referencedColumns: ["id"]
          },
        ]
      }
      payment_attempts: {
        Row: {
          amount_idr: number
          channel_code: string
          checkout_actions: Json
          coin_amount: number
          created_at: string
          expires_at: string | null
          id: string
          package_id: string | null
          provider: string
          provider_payment_id: string | null
          provider_request_id: string | null
          reference: string
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          amount_idr: number
          channel_code: string
          checkout_actions?: Json
          coin_amount: number
          created_at?: string
          expires_at?: string | null
          id?: string
          package_id?: string | null
          provider?: string
          provider_payment_id?: string | null
          provider_request_id?: string | null
          reference: string
          status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          amount_idr?: number
          channel_code?: string
          checkout_actions?: Json
          coin_amount?: number
          created_at?: string
          expires_at?: string | null
          id?: string
          package_id?: string | null
          provider?: string
          provider_payment_id?: string | null
          provider_request_id?: string | null
          reference?: string
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "payment_attempts_package_id_fkey"
            columns: ["package_id"]
            isOneToOne: false
            referencedRelation: "coin_packages"
            referencedColumns: ["id"]
          },
        ]
      }
      platform_settings: {
        Row: {
          setting_key: string
          settings: Json
          updated_at: string
          updated_by: string | null
        }
        Insert: {
          setting_key: string
          settings?: Json
          updated_at?: string
          updated_by?: string | null
        }
        Update: {
          setting_key?: string
          settings?: Json
          updated_at?: string
          updated_by?: string | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          banner_url: string | null
          created_at: string | null
          display_name: string | null
          id: string
          updated_at: string | null
          username: string | null
        }
        Insert: {
          avatar_url?: string | null
          banner_url?: string | null
          created_at?: string | null
          display_name?: string | null
          id: string
          updated_at?: string | null
          username?: string | null
        }
        Update: {
          avatar_url?: string | null
          banner_url?: string | null
          created_at?: string | null
          display_name?: string | null
          id?: string
          updated_at?: string | null
          username?: string | null
        }
        Relationships: []
      }
      series: {
        Row: {
          created_at: string
          created_by: string | null
          featured: boolean
          genre: string
          id: string
          poster_url: string
          release_year: number
          slug: string
          status: string
          synopsis: string
          title: string
          total_views: number
          trending: boolean
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          featured?: boolean
          genre?: string
          id?: string
          poster_url?: string
          release_year?: number
          slug: string
          status?: string
          synopsis?: string
          title: string
          total_views?: number
          trending?: boolean
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          featured?: boolean
          genre?: string
          id?: string
          poster_url?: string
          release_year?: number
          slug?: string
          status?: string
          synopsis?: string
          title?: string
          total_views?: number
          trending?: boolean
          updated_at?: string
        }
        Relationships: []
      }
      subscriptions: {
        Row: {
          channel_id: string
          created_at: string
          subscriber_id: string
        }
        Insert: {
          channel_id: string
          created_at?: string
          subscriber_id: string
        }
        Update: {
          channel_id?: string
          created_at?: string
          subscriber_id?: string
        }
        Relationships: []
      }
      transactions: {
        Row: {
          amount_idr: number | null
          coin_amount: number
          created_at: string
          episode_number: number | null
          id: string
          payment_attempt_id: string | null
          provider_payment_id: string | null
          reference: string
          series_title: string | null
          status: string
          title: string
          type: string
          user_id: string
        }
        Insert: {
          amount_idr?: number | null
          coin_amount: number
          created_at?: string
          episode_number?: number | null
          id?: string
          payment_attempt_id?: string | null
          provider_payment_id?: string | null
          reference: string
          series_title?: string | null
          status?: string
          title: string
          type: string
          user_id: string
        }
        Update: {
          amount_idr?: number | null
          coin_amount?: number
          created_at?: string
          episode_number?: number | null
          id?: string
          payment_attempt_id?: string | null
          provider_payment_id?: string | null
          reference?: string
          series_title?: string | null
          status?: string
          title?: string
          type?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "transactions_payment_attempt_id_fkey"
            columns: ["payment_attempt_id"]
            isOneToOne: false
            referencedRelation: "payment_attempts"
            referencedColumns: ["id"]
          },
        ]
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
      user_wallets: {
        Row: {
          balance: number
          created_at: string
          updated_at: string
          user_id: string
        }
        Insert: {
          balance?: number
          created_at?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          balance?: number
          created_at?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      video_reactions: {
        Row: {
          created_at: string
          reaction: string
          user_id: string
          video_id: string
        }
        Insert: {
          created_at?: string
          reaction: string
          user_id: string
          video_id: string
        }
        Update: {
          created_at?: string
          reaction?: string
          user_id?: string
          video_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "video_reactions_video_id_fkey"
            columns: ["video_id"]
            isOneToOne: false
            referencedRelation: "videos"
            referencedColumns: ["id"]
          },
        ]
      }
      videos: {
        Row: {
          category: string
          created_at: string | null
          description: string | null
          duration: number | null
          id: string
          status: string | null
          thumbnail_url: string | null
          title: string
          updated_at: string | null
          user_id: string
          video_url: string
          views: number | null
        }
        Insert: {
          category?: string
          created_at?: string | null
          description?: string | null
          duration?: number | null
          id?: string
          status?: string | null
          thumbnail_url?: string | null
          title: string
          updated_at?: string | null
          user_id: string
          video_url: string
          views?: number | null
        }
        Update: {
          category?: string
          created_at?: string | null
          description?: string | null
          duration?: number | null
          id?: string
          status?: string | null
          thumbnail_url?: string | null
          title?: string
          updated_at?: string | null
          user_id?: string
          video_url?: string
          views?: number | null
        }
        Relationships: []
      }
      watch_history: {
        Row: {
          user_id: string
          video_id: string
          watched_at: string
        }
        Insert: {
          user_id: string
          video_id: string
          watched_at?: string
        }
        Update: {
          user_id?: string
          video_id?: string
          watched_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "watch_history_video_id_fkey"
            columns: ["video_id"]
            isOneToOne: false
            referencedRelation: "videos"
            referencedColumns: ["id"]
          },
        ]
      }
      watch_progress: {
        Row: {
          duration_seconds: number
          episode_id: string
          position_seconds: number
          updated_at: string
          user_id: string
        }
        Insert: {
          duration_seconds?: number
          episode_id: string
          position_seconds?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          duration_seconds?: number
          episode_id?: string
          position_seconds?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "watch_progress_episode_id_fkey"
            columns: ["episode_id"]
            isOneToOne: false
            referencedRelation: "episodes"
            referencedColumns: ["id"]
          },
        ]
      }
      webhook_events: {
        Row: {
          event_type: string
          id: string
          processed_at: string
          provider: string
          provider_event_id: string
        }
        Insert: {
          event_type: string
          id?: string
          processed_at?: string
          provider: string
          provider_event_id: string
        }
        Update: {
          event_type?: string
          id?: string
          processed_at?: string
          provider?: string
          provider_event_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      credit_xendit_payment: {
        Args: {
          p_amount_idr: number
          p_attempt_id: string
          p_event_id: string
          p_provider_payment_id: string
        }
        Returns: boolean
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      increment_video_views: {
        Args: { p_video_id: string }
        Returns: undefined
      }
      unlock_episode: { Args: { p_episode_id: string }; Returns: Json }
    }
    Enums: {
      app_role: "admin" | "moderator" | "user"
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
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
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
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
      app_role: ["admin", "moderator", "user"],
    },
  },
} as const
