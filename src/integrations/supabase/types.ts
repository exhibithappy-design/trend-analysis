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
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      aeo_citations: {
        Row: {
          citation_url: string | null
          created_at: string
          date_seen: string
          id: string
          logged_by: string | null
          screenshot: string | null
          snippet: string | null
          source: string
        }
        Insert: {
          citation_url?: string | null
          created_at?: string
          date_seen?: string
          id?: string
          logged_by?: string | null
          screenshot?: string | null
          snippet?: string | null
          source: string
        }
        Update: {
          citation_url?: string | null
          created_at?: string
          date_seen?: string
          id?: string
          logged_by?: string | null
          screenshot?: string | null
          snippet?: string | null
          source?: string
        }
        Relationships: []
      }
      aeo_keywords: {
        Row: {
          created_at: string
          current_rank: number | null
          id: string
          keyword: string
          notes: string | null
          previous_rank: number | null
          updated_at: string
          updated_by: string | null
        }
        Insert: {
          created_at?: string
          current_rank?: number | null
          id?: string
          keyword: string
          notes?: string | null
          previous_rank?: number | null
          updated_at?: string
          updated_by?: string | null
        }
        Update: {
          created_at?: string
          current_rank?: number | null
          id?: string
          keyword?: string
          notes?: string | null
          previous_rank?: number | null
          updated_at?: string
          updated_by?: string | null
        }
        Relationships: []
      }
      aeo_lighthouse: {
        Row: {
          desktop_scores: Json | null
          id: string
          mobile_scores: Json | null
          run_at: string
          run_by: string | null
          url: string
        }
        Insert: {
          desktop_scores?: Json | null
          id?: string
          mobile_scores?: Json | null
          run_at?: string
          run_by?: string | null
          url: string
        }
        Update: {
          desktop_scores?: Json | null
          id?: string
          mobile_scores?: Json | null
          run_at?: string
          run_by?: string | null
          url?: string
        }
        Relationships: []
      }
      aeo_schema_checks: {
        Row: {
          checked_at: string
          checked_by: string | null
          id: string
          results: Json
          url: string
        }
        Insert: {
          checked_at?: string
          checked_by?: string | null
          id?: string
          results?: Json
          url: string
        }
        Update: {
          checked_at?: string
          checked_by?: string | null
          id?: string
          results?: Json
          url?: string
        }
        Relationships: []
      }
      ai_chat_messages: {
        Row: {
          content: string
          conversation_id: string | null
          created_at: string
          id: string
          role: string
          user_id: string
        }
        Insert: {
          content: string
          conversation_id?: string | null
          created_at?: string
          id?: string
          role: string
          user_id: string
        }
        Update: {
          content?: string
          conversation_id?: string | null
          created_at?: string
          id?: string
          role?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "ai_chat_messages_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "chat_conversations"
            referencedColumns: ["id"]
          },
        ]
      }
      ai_insights: {
        Row: {
          content: string
          edition_id: string | null
          generated_at: string
          id: string
          insight_type: string
          kind: string
          metadata: Json
          resolved_at: string | null
          resolved_by: string | null
          status: string
          title: string | null
        }
        Insert: {
          content: string
          edition_id?: string | null
          generated_at?: string
          id?: string
          insight_type: string
          kind?: string
          metadata?: Json
          resolved_at?: string | null
          resolved_by?: string | null
          status?: string
          title?: string | null
        }
        Update: {
          content?: string
          edition_id?: string | null
          generated_at?: string
          id?: string
          insight_type?: string
          kind?: string
          metadata?: Json
          resolved_at?: string | null
          resolved_by?: string | null
          status?: string
          title?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "ai_insights_edition_id_fkey"
            columns: ["edition_id"]
            isOneToOne: false
            referencedRelation: "editions"
            referencedColumns: ["id"]
          },
        ]
      }
      app_settings: {
        Row: {
          key: string
          updated_at: string
          updated_by: string | null
          value: Json
        }
        Insert: {
          key: string
          updated_at?: string
          updated_by?: string | null
          value?: Json
        }
        Update: {
          key?: string
          updated_at?: string
          updated_by?: string | null
          value?: Json
        }
        Relationships: []
      }
      authorized_emails: {
        Row: {
          email: string
          invited_at: string
          invited_by: string | null
          role: Database["public"]["Enums"]["app_role"]
        }
        Insert: {
          email: string
          invited_at?: string
          invited_by?: string | null
          role?: Database["public"]["Enums"]["app_role"]
        }
        Update: {
          email?: string
          invited_at?: string
          invited_by?: string | null
          role?: Database["public"]["Enums"]["app_role"]
        }
        Relationships: []
      }
      channels: {
        Row: {
          created_at: string
          display_order: number
          id: string
          is_custom: boolean
          name: string
          slug: string
        }
        Insert: {
          created_at?: string
          display_order?: number
          id?: string
          is_custom?: boolean
          name: string
          slug: string
        }
        Update: {
          created_at?: string
          display_order?: number
          id?: string
          is_custom?: boolean
          name?: string
          slug?: string
        }
        Relationships: []
      }
      chat_conversations: {
        Row: {
          created_at: string
          folder_id: string | null
          id: string
          starred: boolean
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          folder_id?: string | null
          id?: string
          starred?: boolean
          title?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          folder_id?: string | null
          id?: string
          starred?: boolean
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "chat_conversations_folder_id_fkey"
            columns: ["folder_id"]
            isOneToOne: false
            referencedRelation: "chat_folders"
            referencedColumns: ["id"]
          },
        ]
      }
      chat_folders: {
        Row: {
          created_at: string
          display_order: number
          id: string
          name: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          display_order?: number
          id?: string
          name?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          display_order?: number
          id?: string
          name?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      deployment_logs: {
        Row: {
          action: string
          actor_email: string | null
          actor_id: string | null
          channel: string | null
          created_at: string
          deployment_id: string
          detail: string | null
          edition_id: string | null
          id: string
          result: string | null
        }
        Insert: {
          action: string
          actor_email?: string | null
          actor_id?: string | null
          channel?: string | null
          created_at?: string
          deployment_id: string
          detail?: string | null
          edition_id?: string | null
          id?: string
          result?: string | null
        }
        Update: {
          action?: string
          actor_email?: string | null
          actor_id?: string | null
          channel?: string | null
          created_at?: string
          deployment_id?: string
          detail?: string | null
          edition_id?: string | null
          id?: string
          result?: string | null
        }
        Relationships: []
      }
      deployments: {
        Row: {
          channel: string
          created_at: string
          deployed_at: string | null
          deployed_by: string | null
          edition_id: string
          external_url: string | null
          id: string
          notes: string | null
          recipient_count: number
          scheduled_at: string | null
          status: Database["public"]["Enums"]["deployment_status"]
          updated_at: string
        }
        Insert: {
          channel: string
          created_at?: string
          deployed_at?: string | null
          deployed_by?: string | null
          edition_id: string
          external_url?: string | null
          id?: string
          notes?: string | null
          recipient_count?: number
          scheduled_at?: string | null
          status?: Database["public"]["Enums"]["deployment_status"]
          updated_at?: string
        }
        Update: {
          channel?: string
          created_at?: string
          deployed_at?: string | null
          deployed_by?: string | null
          edition_id?: string
          external_url?: string | null
          id?: string
          notes?: string | null
          recipient_count?: number
          scheduled_at?: string | null
          status?: Database["public"]["Enums"]["deployment_status"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "deployments_edition_id_fkey"
            columns: ["edition_id"]
            isOneToOne: false
            referencedRelation: "editions"
            referencedColumns: ["id"]
          },
        ]
      }
      editions: {
        Row: {
          archive_date: string | null
          created_at: string
          created_by: string | null
          edition_label: string | null
          id: string
          public_url: string | null
          publish_date: string | null
          slug: string
          status: Database["public"]["Enums"]["edition_status"]
          title: string
          updated_at: string
        }
        Insert: {
          archive_date?: string | null
          created_at?: string
          created_by?: string | null
          edition_label?: string | null
          id?: string
          public_url?: string | null
          publish_date?: string | null
          slug: string
          status?: Database["public"]["Enums"]["edition_status"]
          title: string
          updated_at?: string
        }
        Update: {
          archive_date?: string | null
          created_at?: string
          created_by?: string | null
          edition_label?: string | null
          id?: string
          public_url?: string | null
          publish_date?: string | null
          slug?: string
          status?: Database["public"]["Enums"]["edition_status"]
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      hubspot_signals: {
        Row: {
          captured_at: string
          contact_company: string | null
          contact_name: string | null
          edition_id: string | null
          hubspot_contact_id: string | null
          id: string
          signal_strength: number | null
          signal_type: string | null
          status: string
        }
        Insert: {
          captured_at?: string
          contact_company?: string | null
          contact_name?: string | null
          edition_id?: string | null
          hubspot_contact_id?: string | null
          id?: string
          signal_strength?: number | null
          signal_type?: string | null
          status?: string
        }
        Update: {
          captured_at?: string
          contact_company?: string | null
          contact_name?: string | null
          edition_id?: string | null
          hubspot_contact_id?: string | null
          id?: string
          signal_strength?: number | null
          signal_type?: string | null
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "hubspot_signals_edition_id_fkey"
            columns: ["edition_id"]
            isOneToOne: false
            referencedRelation: "editions"
            referencedColumns: ["id"]
          },
        ]
      }
      notes: {
        Row: {
          author_id: string
          content: string
          created_at: string
          deployment_id: string | null
          edition_id: string | null
          id: string
        }
        Insert: {
          author_id: string
          content: string
          created_at?: string
          deployment_id?: string | null
          edition_id?: string | null
          id?: string
        }
        Update: {
          author_id?: string
          content?: string
          created_at?: string
          deployment_id?: string | null
          edition_id?: string | null
          id?: string
        }
        Relationships: [
          {
            foreignKeyName: "notes_deployment_id_fkey"
            columns: ["deployment_id"]
            isOneToOne: false
            referencedRelation: "deployments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "notes_edition_id_fkey"
            columns: ["edition_id"]
            isOneToOne: false
            referencedRelation: "editions"
            referencedColumns: ["id"]
          },
        ]
      }
      page_events: {
        Row: {
          card_id: string | null
          edition_id: string | null
          event_type: string
          id: string
          section: string | null
          session_id: string | null
          source: string | null
          source_detail: string | null
          ts: string
          user_agent: string | null
          viewport_size: string | null
        }
        Insert: {
          card_id?: string | null
          edition_id?: string | null
          event_type: string
          id?: string
          section?: string | null
          session_id?: string | null
          source?: string | null
          source_detail?: string | null
          ts?: string
          user_agent?: string | null
          viewport_size?: string | null
        }
        Update: {
          card_id?: string | null
          edition_id?: string | null
          event_type?: string
          id?: string
          section?: string | null
          session_id?: string | null
          source?: string | null
          source_detail?: string | null
          ts?: string
          user_agent?: string | null
          viewport_size?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "page_events_edition_id_fkey"
            columns: ["edition_id"]
            isOneToOne: false
            referencedRelation: "editions"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          created_at: string
          email: string
          id: string
          last_active: string | null
          name: string | null
          notification_prefs: Json
          updated_at: string
        }
        Insert: {
          created_at?: string
          email: string
          id: string
          last_active?: string | null
          name?: string | null
          notification_prefs?: Json
          updated_at?: string
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          last_active?: string | null
          name?: string | null
          notification_prefs?: Json
          updated_at?: string
        }
        Relationships: []
      }
      trend_cards: {
        Row: {
          body: string | null
          category: string | null
          cited_shows: string[]
          created_at: string
          edition_id: string | null
          id: string
          performance_score: number | null
          tags: string[]
          title: string
        }
        Insert: {
          body?: string | null
          category?: string | null
          cited_shows?: string[]
          created_at?: string
          edition_id?: string | null
          id?: string
          performance_score?: number | null
          tags?: string[]
          title: string
        }
        Update: {
          body?: string | null
          category?: string | null
          cited_shows?: string[]
          created_at?: string
          edition_id?: string | null
          id?: string
          performance_score?: number | null
          tags?: string[]
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "trend_cards_edition_id_fkey"
            columns: ["edition_id"]
            isOneToOne: false
            referencedRelation: "editions"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_authorized: { Args: { _user_id: string }; Returns: boolean }
    }
    Enums: {
      app_role: "admin" | "viewer"
      deployment_status:
        | "not_deployed"
        | "queued"
        | "live"
        | "completed"
        | "failed"
      edition_status: "draft" | "live" | "archived"
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
      app_role: ["admin", "viewer"],
      deployment_status: [
        "not_deployed",
        "queued",
        "live",
        "completed",
        "failed",
      ],
      edition_status: ["draft", "live", "archived"],
    },
  },
} as const
