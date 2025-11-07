export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      favorites: {
        Row: {
          created_at: string;
          id: string;
          insight_id: string | null;
          interaction_id: string | null;
          note: string | null;
          user_id: string;
        };
        Insert: {
          created_at?: string;
          id?: string;
          insight_id?: string | null;
          interaction_id?: string | null;
          note?: string | null;
          user_id: string;
        };
        Update: {
          created_at?: string;
          id?: string;
          insight_id?: string | null;
          interaction_id?: string | null;
          note?: string | null;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "favorites_insight_id_fkey";
            columns: ["insight_id"];
            referencedRelation: "insights";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "favorites_interaction_id_fkey";
            columns: ["interaction_id"];
            referencedRelation: "interactions";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "favorites_user_id_fkey";
            columns: ["user_id"];
            referencedRelation: "users";
            referencedColumns: ["id"];
            referencedSchema: "auth";
          }
        ];
      };
      insights: {
        Row: {
          content: string;
          created_at: string;
          id: string;
          interaction_id: string | null;
          metadata: Json;
          tags: string[];
          title: string | null;
          updated_at: string;
          user_id: string;
        };
        Insert: {
          content: string;
          created_at?: string;
          id?: string;
          interaction_id?: string | null;
          metadata?: Json;
          tags?: string[];
          title?: string | null;
          updated_at?: string;
          user_id: string;
        };
        Update: {
          content?: string;
          created_at?: string;
          id?: string;
          interaction_id?: string | null;
          metadata?: Json;
          tags?: string[];
          title?: string | null;
          updated_at?: string;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "insights_interaction_id_fkey";
            columns: ["interaction_id"];
            referencedRelation: "interactions";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "insights_user_id_fkey";
            columns: ["user_id"];
            referencedRelation: "users";
            referencedSchema: "auth";
            referencedColumns: ["id"];
          }
        ];
      };
      interactions: {
        Row: {
          created_at: string;
          id: string;
          metadata: Json;
          mode: "voice" | "text" | "camera";
          occurred_at: string;
          summary: string | null;
          user_id: string;
        };
        Insert: {
          created_at?: string;
          id?: string;
          metadata?: Json;
          mode: "voice" | "text" | "camera";
          occurred_at?: string;
          summary?: string | null;
          user_id: string;
        };
        Update: {
          created_at?: string;
          id?: string;
          metadata?: Json;
          mode?: "voice" | "text" | "camera";
          occurred_at?: string;
          summary?: string | null;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "interactions_user_id_fkey";
            columns: ["user_id"];
            referencedRelation: "users";
            referencedSchema: "auth";
            referencedColumns: ["id"];
          }
        ];
      };
      user_profiles: {
        Row: {
          avatar_url: string | null;
          created_at: string;
          display_name: string | null;
          id: string;
          last_active: string | null;
          streak_count: number;
          updated_at: string;
        };
        Insert: {
          avatar_url?: string | null;
          created_at?: string;
          display_name?: string | null;
          id: string;
          last_active?: string | null;
          streak_count?: number;
          updated_at?: string;
        };
        Update: {
          avatar_url?: string | null;
          created_at?: string;
          display_name?: string | null;
          id?: string;
          last_active?: string | null;
          streak_count?: number;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "user_profiles_id_fkey";
            columns: ["id"];
            isOneToOne: true;
            referencedRelation: "users";
            referencedSchema: "auth";
            referencedColumns: ["id"];
          }
        ];
      };
      user_settings: {
        Row: {
          created_at: string;
          marketing_opt_in: boolean;
          notifications_enabled: boolean;
          preferred_mode: "voice" | "text" | "camera";
          timezone: string;
          updated_at: string;
          user_id: string;
        };
        Insert: {
          created_at?: string;
          marketing_opt_in?: boolean;
          notifications_enabled?: boolean;
          preferred_mode?: "voice" | "text" | "camera";
          timezone?: string;
          updated_at?: string;
          user_id: string;
        };
        Update: {
          created_at?: string;
          marketing_opt_in?: boolean;
          notifications_enabled?: boolean;
          preferred_mode?: "voice" | "text" | "camera";
          timezone?: string;
          updated_at?: string;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "user_settings_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: true;
            referencedRelation: "users";
            referencedSchema: "auth";
            referencedColumns: ["id"];
          }
        ];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      [_ in never]: never;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
}

export type PublicSchema = Database["public"];

export type Tables<
  T extends keyof PublicSchema["Tables"]
> = PublicSchema["Tables"][T]["Row"];

export type TablesInsert<
  T extends keyof PublicSchema["Tables"]
> = PublicSchema["Tables"][T]["Insert"];

export type TablesUpdate<
  T extends keyof PublicSchema["Tables"]
> = PublicSchema["Tables"][T]["Update"];

export type Enums<T extends keyof PublicSchema["Enums"]> = PublicSchema["Enums"][T];
