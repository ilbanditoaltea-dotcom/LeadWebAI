export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  public: {
    Tables: {
      leads: {
        Row: {
          id: string;
          business_name: string;
          category: string | null;
          city: string | null;
          description: string | null;
          address: string | null;
          phone: string | null;
          email: string | null;
          whatsapp: string | null;
          website_url: string | null;
          google_maps_url: string | null;
          instagram_url: string | null;
          rating: number | null;
          review_count: number | null;
          status: string | null;
          opportunity_score: number | null;
          website_quality_score: number | null;
          main_problem_detected: string | null;
          detected_problems: Json | null;
          recommendations: Json | null;
          created_at: string | null;
          updated_at: string | null;
        };
        Insert: {
          id?: string;
          business_name: string;
          category?: string | null;
          city?: string | null;
          description?: string | null;
          address?: string | null;
          phone?: string | null;
          email?: string | null;
          whatsapp?: string | null;
          website_url?: string | null;
          google_maps_url?: string | null;
          instagram_url?: string | null;
          rating?: number | null;
          review_count?: number | null;
          status?: string | null;
          opportunity_score?: number | null;
          website_quality_score?: number | null;
          main_problem_detected?: string | null;
          detected_problems?: Json | null;
          recommendations?: Json | null;
          created_at?: string | null;
          updated_at?: string | null;
        };
        Update: {
          id?: string;
          business_name?: string;
          category?: string | null;
          city?: string | null;
          description?: string | null;
          address?: string | null;
          phone?: string | null;
          email?: string | null;
          whatsapp?: string | null;
          website_url?: string | null;
          google_maps_url?: string | null;
          instagram_url?: string | null;
          rating?: number | null;
          review_count?: number | null;
          status?: string | null;
          opportunity_score?: number | null;
          website_quality_score?: number | null;
          main_problem_detected?: string | null;
          detected_problems?: Json | null;
          recommendations?: Json | null;
          created_at?: string | null;
          updated_at?: string | null;
        };
        Relationships: [];
      };
      generated_websites: {
        Row: {
          id: string;
          lead_id: string | null;
          business_profile: Json;
          website: Json;
          seo: Json | null;
          contact: Json | null;
          confidence: Json | null;
          demo_slug: string | null;
          status: string | null;
          created_at: string | null;
          updated_at: string | null;
        };
        Insert: {
          id?: string;
          lead_id?: string | null;
          business_profile: Json;
          website: Json;
          seo?: Json | null;
          contact?: Json | null;
          confidence?: Json | null;
          demo_slug?: string | null;
          status?: string | null;
          created_at?: string | null;
          updated_at?: string | null;
        };
        Update: {
          id?: string;
          lead_id?: string | null;
          business_profile?: Json;
          website?: Json;
          seo?: Json | null;
          contact?: Json | null;
          confidence?: Json | null;
          demo_slug?: string | null;
          status?: string | null;
          created_at?: string | null;
          updated_at?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "generated_websites_lead_id_fkey";
            columns: ["lead_id"];
            isOneToOne: false;
            referencedRelation: "leads";
            referencedColumns: ["id"];
          },
        ];
      };
      messages: {
        Row: {
          id: string;
          lead_id: string | null;
          generated_website_id: string | null;
          channel: string | null;
          subject: string | null;
          body: string | null;
          status: string | null;
          created_at: string | null;
          sent_at: string | null;
        };
        Insert: {
          id?: string;
          lead_id?: string | null;
          generated_website_id?: string | null;
          channel?: string | null;
          subject?: string | null;
          body?: string | null;
          status?: string | null;
          created_at?: string | null;
          sent_at?: string | null;
        };
        Update: {
          id?: string;
          lead_id?: string | null;
          generated_website_id?: string | null;
          channel?: string | null;
          subject?: string | null;
          body?: string | null;
          status?: string | null;
          created_at?: string | null;
          sent_at?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "messages_generated_website_id_fkey";
            columns: ["generated_website_id"];
            isOneToOne: false;
            referencedRelation: "generated_websites";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "messages_lead_id_fkey";
            columns: ["lead_id"];
            isOneToOne: false;
            referencedRelation: "leads";
            referencedColumns: ["id"];
          },
        ];
      };
      campaigns: {
        Row: {
          id: string;
          name: string | null;
          city: string | null;
          category: string | null;
          status: string | null;
          created_at: string | null;
        };
        Insert: {
          id?: string;
          name?: string | null;
          city?: string | null;
          category?: string | null;
          status?: string | null;
          created_at?: string | null;
        };
        Update: {
          id?: string;
          name?: string | null;
          city?: string | null;
          category?: string | null;
          status?: string | null;
          created_at?: string | null;
        };
        Relationships: [];
      };
      activities: {
        Row: {
          id: string;
          lead_id: string | null;
          type: string | null;
          description: string | null;
          metadata: Json | null;
          created_at: string | null;
        };
        Insert: {
          id?: string;
          lead_id?: string | null;
          type?: string | null;
          description?: string | null;
          metadata?: Json | null;
          created_at?: string | null;
        };
        Update: {
          id?: string;
          lead_id?: string | null;
          type?: string | null;
          description?: string | null;
          metadata?: Json | null;
          created_at?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "activities_lead_id_fkey";
            columns: ["lead_id"];
            isOneToOne: false;
            referencedRelation: "leads";
            referencedColumns: ["id"];
          },
        ];
      };
      generated_website_versions: {
        Row: {
          id: string;
          generated_website_id: string | null;
          version_number: number | null;
          change_type: string | null;
          instruction: string | null;
          snapshot: Json | null;
          created_at: string | null;
        };
        Insert: {
          id?: string;
          generated_website_id?: string | null;
          version_number?: number | null;
          change_type?: string | null;
          instruction?: string | null;
          snapshot?: Json | null;
          created_at?: string | null;
        };
        Update: {
          id?: string;
          generated_website_id?: string | null;
          version_number?: number | null;
          change_type?: string | null;
          instruction?: string | null;
          snapshot?: Json | null;
          created_at?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "generated_website_versions_generated_website_id_fkey";
            columns: ["generated_website_id"];
            isOneToOne: false;
            referencedRelation: "generated_websites";
            referencedColumns: ["id"];
          },
        ];
      };
      settings: {
        Row: {
          id: string;
          key: string | null;
          value: Json | null;
          created_at: string | null;
          updated_at: string | null;
        };
        Insert: {
          id?: string;
          key?: string | null;
          value?: Json | null;
          created_at?: string | null;
          updated_at?: string | null;
        };
        Update: {
          id?: string;
          key?: string | null;
          value?: Json | null;
          created_at?: string | null;
          updated_at?: string | null;
        };
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
};
