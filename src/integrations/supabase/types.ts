export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export type Database = {
  __InternalSupabase: {
    PostgrestVersion: "14.5";
  };
  public: {
    Tables: {
      audit_logs: {
        Row: {
          action: string;
          actor_type: Database["public"]["Enums"]["actor_type"];
          actor_user_id: string | null;
          created_at: string;
          external_response: Json | null;
          id: string;
          new_value: Json | null;
          old_value: Json | null;
          reason: string | null;
          result: string | null;
          target_id: string | null;
          target_type: string | null;
          workspace_id: string;
        };
        Insert: {
          action: string;
          actor_type?: Database["public"]["Enums"]["actor_type"];
          actor_user_id?: string | null;
          created_at?: string;
          external_response?: Json | null;
          id?: string;
          new_value?: Json | null;
          old_value?: Json | null;
          reason?: string | null;
          result?: string | null;
          target_id?: string | null;
          target_type?: string | null;
          workspace_id: string;
        };
        Update: {
          action?: string;
          actor_type?: Database["public"]["Enums"]["actor_type"];
          actor_user_id?: string | null;
          created_at?: string;
          external_response?: Json | null;
          id?: string;
          new_value?: Json | null;
          old_value?: Json | null;
          reason?: string | null;
          result?: string | null;
          target_id?: string | null;
          target_type?: string | null;
          workspace_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "audit_logs_workspace_id_fkey";
            columns: ["workspace_id"];
            isOneToOne: false;
            referencedRelation: "workspaces";
            referencedColumns: ["id"];
          },
        ];
      };
      integrations: {
        Row: {
          category: string;
          connected_by: string | null;
          created_at: string;
          deleted_at: string | null;
          display_name: string | null;
          external_account_id: string | null;
          id: string;
          last_error_at: string | null;
          last_synced_at: string | null;
          provider: string;
          record_count: number;
          status: Database["public"]["Enums"]["integration_status"];
          status_detail: string | null;
          updated_at: string;
          workspace_id: string;
        };
        Insert: {
          category: string;
          connected_by?: string | null;
          created_at?: string;
          deleted_at?: string | null;
          display_name?: string | null;
          external_account_id?: string | null;
          id?: string;
          last_error_at?: string | null;
          last_synced_at?: string | null;
          provider: string;
          record_count?: number;
          status?: Database["public"]["Enums"]["integration_status"];
          status_detail?: string | null;
          updated_at?: string;
          workspace_id: string;
        };
        Update: {
          category?: string;
          connected_by?: string | null;
          created_at?: string;
          deleted_at?: string | null;
          display_name?: string | null;
          external_account_id?: string | null;
          id?: string;
          last_error_at?: string | null;
          last_synced_at?: string | null;
          provider?: string;
          record_count?: number;
          status?: Database["public"]["Enums"]["integration_status"];
          status_detail?: string | null;
          updated_at?: string;
          workspace_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "integrations_workspace_id_fkey";
            columns: ["workspace_id"];
            isOneToOne: false;
            referencedRelation: "workspaces";
            referencedColumns: ["id"];
          },
        ];
      };
      permissions: {
        Row: {
          category: string;
          description: string;
          key: string;
        };
        Insert: {
          category: string;
          description: string;
          key: string;
        };
        Update: {
          category?: string;
          description?: string;
          key?: string;
        };
        Relationships: [];
      };
      profiles: {
        Row: {
          avatar_url: string | null;
          created_at: string;
          display_name: string | null;
          id: string;
          locale: string;
          onboarding_completed_at: string | null;
          timezone: string;
          updated_at: string;
        };
        Insert: {
          avatar_url?: string | null;
          created_at?: string;
          display_name?: string | null;
          id: string;
          locale?: string;
          onboarding_completed_at?: string | null;
          timezone?: string;
          updated_at?: string;
        };
        Update: {
          avatar_url?: string | null;
          created_at?: string;
          display_name?: string | null;
          id?: string;
          locale?: string;
          onboarding_completed_at?: string | null;
          timezone?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      role_permissions: {
        Row: {
          permission_key: string;
          role: Database["public"]["Enums"]["app_role"];
        };
        Insert: {
          permission_key: string;
          role: Database["public"]["Enums"]["app_role"];
        };
        Update: {
          permission_key?: string;
          role?: Database["public"]["Enums"]["app_role"];
        };
        Relationships: [
          {
            foreignKeyName: "role_permissions_permission_key_fkey";
            columns: ["permission_key"];
            isOneToOne: false;
            referencedRelation: "permissions";
            referencedColumns: ["key"];
          },
        ];
      };
      workspace_members: {
        Row: {
          created_at: string;
          id: string;
          role: Database["public"]["Enums"]["app_role"];
          updated_at: string;
          user_id: string;
          workspace_id: string;
        };
        Insert: {
          created_at?: string;
          id?: string;
          role?: Database["public"]["Enums"]["app_role"];
          updated_at?: string;
          user_id: string;
          workspace_id: string;
        };
        Update: {
          created_at?: string;
          id?: string;
          role?: Database["public"]["Enums"]["app_role"];
          updated_at?: string;
          user_id?: string;
          workspace_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "workspace_members_workspace_id_fkey";
            columns: ["workspace_id"];
            isOneToOne: false;
            referencedRelation: "workspaces";
            referencedColumns: ["id"];
          },
        ];
      };
      workspaces: {
        Row: {
          base_currency: string;
          business_type: Database["public"]["Enums"]["business_type"] | null;
          created_at: string;
          created_by: string;
          deleted_at: string | null;
          id: string;
          locale: string;
          name: string;
          onboarding_completed_at: string | null;
          slug: string;
          status: Database["public"]["Enums"]["workspace_status"];
          timezone: string;
          trial_ends_at: string;
          updated_at: string;
        };
        Insert: {
          base_currency?: string;
          business_type?: Database["public"]["Enums"]["business_type"] | null;
          created_at?: string;
          created_by: string;
          deleted_at?: string | null;
          id?: string;
          locale?: string;
          name: string;
          onboarding_completed_at?: string | null;
          slug: string;
          status?: Database["public"]["Enums"]["workspace_status"];
          timezone?: string;
          trial_ends_at?: string;
          updated_at?: string;
        };
        Update: {
          base_currency?: string;
          business_type?: Database["public"]["Enums"]["business_type"] | null;
          created_at?: string;
          created_by?: string;
          deleted_at?: string | null;
          id?: string;
          locale?: string;
          name?: string;
          onboarding_completed_at?: string | null;
          slug?: string;
          status?: Database["public"]["Enums"]["workspace_status"];
          timezone?: string;
          trial_ends_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      // ---------- MARKETING ----------
      campaigns: {
        Row: {
          id: string;
          workspace_id: string;
          integration_id: string | null;
          external_id: string | null;
          name: string;
          platform: string;
          status: Database["public"]["Enums"]["campaign_status"];
          objective: string | null;
          budget: number | null;
          currency: string;
          start_at: string | null;
          end_at: string | null;
          metadata: Json | null;
          created_at: string;
          updated_at: string;
          deleted_at: string | null;
        };
        Insert: {
          id?: string;
          workspace_id: string;
          integration_id?: string | null;
          external_id?: string | null;
          name: string;
          platform: string;
          status?: Database["public"]["Enums"]["campaign_status"];
          objective?: string | null;
          budget?: number | null;
          currency?: string;
          start_at?: string | null;
          end_at?: string | null;
          metadata?: Json | null;
          created_at?: string;
          updated_at?: string;
          deleted_at?: string | null;
        };
        Update: {
          id?: string;
          workspace_id?: string;
          integration_id?: string | null;
          external_id?: string | null;
          name?: string;
          platform?: string;
          status?: Database["public"]["Enums"]["campaign_status"];
          objective?: string | null;
          budget?: number | null;
          currency?: string;
          start_at?: string | null;
          end_at?: string | null;
          metadata?: Json | null;
          created_at?: string;
          updated_at?: string;
          deleted_at?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "campaigns_workspace_id_fkey";
            columns: ["workspace_id"];
            isOneToOne: false;
            referencedRelation: "workspaces";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "campaigns_integration_id_fkey";
            columns: ["integration_id"];
            isOneToOne: false;
            referencedRelation: "integrations";
            referencedColumns: ["id"];
          },
        ];
      };
      ad_sets: {
        Row: {
          id: string;
          workspace_id: string;
          campaign_id: string;
          integration_id: string | null;
          external_id: string | null;
          name: string;
          status: Database["public"]["Enums"]["campaign_status"];
          budget: number | null;
          currency: string;
          targeting: Json | null;
          optimization_goal: string | null;
          created_at: string;
          updated_at: string;
          deleted_at: string | null;
        };
        Insert: {
          id?: string;
          workspace_id: string;
          campaign_id: string;
          integration_id?: string | null;
          external_id?: string | null;
          name: string;
          status?: Database["public"]["Enums"]["campaign_status"];
          budget?: number | null;
          currency?: string;
          targeting?: Json | null;
          optimization_goal?: string | null;
          created_at?: string;
          updated_at?: string;
          deleted_at?: string | null;
        };
        Update: {
          id?: string;
          workspace_id?: string;
          campaign_id?: string;
          integration_id?: string | null;
          external_id?: string | null;
          name?: string;
          status?: Database["public"]["Enums"]["campaign_status"];
          budget?: number | null;
          currency?: string;
          targeting?: Json | null;
          optimization_goal?: string | null;
          created_at?: string;
          updated_at?: string;
          deleted_at?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "ad_sets_workspace_id_fkey";
            columns: ["workspace_id"];
            isOneToOne: false;
            referencedRelation: "workspaces";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "ad_sets_campaign_id_fkey";
            columns: ["campaign_id"];
            isOneToOne: false;
            referencedRelation: "campaigns";
            referencedColumns: ["id"];
          },
        ];
      };
      creatives: {
        Row: {
          id: string;
          workspace_id: string;
          integration_id: string | null;
          external_id: string | null;
          name: string | null;
          type: Database["public"]["Enums"]["creative_type"];
          url: string | null;
          thumbnail_url: string | null;
          headline: string | null;
          body_text: string | null;
          call_to_action: string | null;
          metadata: Json | null;
          created_at: string;
          updated_at: string;
          deleted_at: string | null;
        };
        Insert: {
          id?: string;
          workspace_id: string;
          integration_id?: string | null;
          external_id?: string | null;
          name?: string | null;
          type?: Database["public"]["Enums"]["creative_type"];
          url?: string | null;
          thumbnail_url?: string | null;
          headline?: string | null;
          body_text?: string | null;
          call_to_action?: string | null;
          metadata?: Json | null;
          created_at?: string;
          updated_at?: string;
          deleted_at?: string | null;
        };
        Update: {
          id?: string;
          workspace_id?: string;
          integration_id?: string | null;
          external_id?: string | null;
          name?: string | null;
          type?: Database["public"]["Enums"]["creative_type"];
          url?: string | null;
          thumbnail_url?: string | null;
          headline?: string | null;
          body_text?: string | null;
          call_to_action?: string | null;
          metadata?: Json | null;
          created_at?: string;
          updated_at?: string;
          deleted_at?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "creatives_workspace_id_fkey";
            columns: ["workspace_id"];
            isOneToOne: false;
            referencedRelation: "workspaces";
            referencedColumns: ["id"];
          },
        ];
      };
      ads: {
        Row: {
          id: string;
          workspace_id: string;
          campaign_id: string;
          ad_set_id: string;
          creative_id: string | null;
          integration_id: string | null;
          external_id: string | null;
          name: string;
          status: Database["public"]["Enums"]["campaign_status"];
          preview_url: string | null;
          metadata: Json | null;
          created_at: string;
          updated_at: string;
          deleted_at: string | null;
        };
        Insert: {
          id?: string;
          workspace_id: string;
          campaign_id: string;
          ad_set_id: string;
          creative_id?: string | null;
          integration_id?: string | null;
          external_id?: string | null;
          name: string;
          status?: Database["public"]["Enums"]["campaign_status"];
          preview_url?: string | null;
          metadata?: Json | null;
          created_at?: string;
          updated_at?: string;
          deleted_at?: string | null;
        };
        Update: {
          id?: string;
          workspace_id?: string;
          campaign_id?: string;
          ad_set_id?: string;
          creative_id?: string | null;
          integration_id?: string | null;
          external_id?: string | null;
          name?: string;
          status?: Database["public"]["Enums"]["campaign_status"];
          preview_url?: string | null;
          metadata?: Json | null;
          created_at?: string;
          updated_at?: string;
          deleted_at?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "ads_workspace_id_fkey";
            columns: ["workspace_id"];
            isOneToOne: false;
            referencedRelation: "workspaces";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "ads_campaign_id_fkey";
            columns: ["campaign_id"];
            isOneToOne: false;
            referencedRelation: "campaigns";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "ads_ad_set_id_fkey";
            columns: ["ad_set_id"];
            isOneToOne: false;
            referencedRelation: "ad_sets";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "ads_creative_id_fkey";
            columns: ["creative_id"];
            isOneToOne: false;
            referencedRelation: "creatives";
            referencedColumns: ["id"];
          },
        ];
      };
      ad_metrics_daily: {
        Row: {
          id: string;
          workspace_id: string;
          integration_id: string | null;
          campaign_id: string;
          ad_set_id: string;
          ad_id: string;
          date: string;
          platform: string;
          impressions: number;
          clicks: number;
          spend: number;
          spend_base_currency: number;
          currency: string;
          exchange_rate: number;
          conversions: number;
          purchases: number;
          revenue: number;
          revenue_base_currency: number;
          reach: number | null;
          frequency: number | null;
          synced_at: string;
        };
        Insert: {
          id?: string;
          workspace_id: string;
          integration_id?: string | null;
          campaign_id: string;
          ad_set_id: string;
          ad_id: string;
          date: string;
          platform: string;
          impressions?: number;
          clicks?: number;
          spend?: number;
          spend_base_currency?: number;
          currency?: string;
          exchange_rate?: number;
          conversions?: number;
          purchases?: number;
          revenue?: number;
          revenue_base_currency?: number;
          reach?: number | null;
          frequency?: number | null;
          synced_at?: string;
        };
        Update: {
          id?: string;
          workspace_id?: string;
          integration_id?: string | null;
          campaign_id?: string;
          ad_set_id?: string;
          ad_id?: string;
          date?: string;
          platform?: string;
          impressions?: number;
          clicks?: number;
          spend?: number;
          spend_base_currency?: number;
          currency?: string;
          exchange_rate?: number;
          conversions?: number;
          purchases?: number;
          revenue?: number;
          revenue_base_currency?: number;
          reach?: number | null;
          frequency?: number | null;
          synced_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "ad_metrics_daily_workspace_id_fkey";
            columns: ["workspace_id"];
            isOneToOne: false;
            referencedRelation: "workspaces";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "ad_metrics_daily_campaign_id_fkey";
            columns: ["campaign_id"];
            isOneToOne: false;
            referencedRelation: "campaigns";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "ad_metrics_daily_ad_set_id_fkey";
            columns: ["ad_set_id"];
            isOneToOne: false;
            referencedRelation: "ad_sets";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "ad_metrics_daily_ad_id_fkey";
            columns: ["ad_id"];
            isOneToOne: false;
            referencedRelation: "ads";
            referencedColumns: ["id"];
          },
        ];
      };
      // ---------- VENDAS, PRODUTOS E CLIENTES ----------
      products: {
        Row: {
          id: string;
          workspace_id: string;
          integration_id: string | null;
          external_id: string | null;
          title: string;
          sku: string | null;
          description: string | null;
          price: number;
          cost_price: number;
          currency: string;
          status: Database["public"]["Enums"]["product_status"];
          type: Database["public"]["Enums"]["product_type"];
          url: string | null;
          metadata: Json | null;
          created_at: string;
          updated_at: string;
          deleted_at: string | null;
        };
        Insert: {
          id?: string;
          workspace_id: string;
          integration_id?: string | null;
          external_id?: string | null;
          title: string;
          sku?: string | null;
          description?: string | null;
          price?: number;
          cost_price?: number;
          currency?: string;
          status?: Database["public"]["Enums"]["product_status"];
          type?: Database["public"]["Enums"]["product_type"];
          url?: string | null;
          metadata?: Json | null;
          created_at?: string;
          updated_at?: string;
          deleted_at?: string | null;
        };
        Update: {
          id?: string;
          workspace_id?: string;
          integration_id?: string | null;
          external_id?: string | null;
          title?: string;
          sku?: string | null;
          description?: string | null;
          price?: number;
          cost_price?: number;
          currency?: string;
          status?: Database["public"]["Enums"]["product_status"];
          type?: Database["public"]["Enums"]["product_type"];
          url?: string | null;
          metadata?: Json | null;
          created_at?: string;
          updated_at?: string;
          deleted_at?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "products_workspace_id_fkey";
            columns: ["workspace_id"];
            isOneToOne: false;
            referencedRelation: "workspaces";
            referencedColumns: ["id"];
          },
        ];
      };
      customers: {
        Row: {
          id: string;
          workspace_id: string;
          integration_id: string | null;
          external_id: string | null;
          email: string | null;
          phone: string | null;
          first_name: string | null;
          last_name: string | null;
          document: string | null;
          city: string | null;
          state: string | null;
          country: string;
          total_orders: number;
          total_spent: number;
          currency: string;
          first_order_at: string | null;
          last_order_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          workspace_id: string;
          integration_id?: string | null;
          external_id?: string | null;
          email?: string | null;
          phone?: string | null;
          first_name?: string | null;
          last_name?: string | null;
          document?: string | null;
          city?: string | null;
          state?: string | null;
          country?: string;
          total_orders?: number;
          total_spent?: number;
          currency?: string;
          first_order_at?: string | null;
          last_order_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          workspace_id?: string;
          integration_id?: string | null;
          external_id?: string | null;
          email?: string | null;
          phone?: string | null;
          first_name?: string | null;
          last_name?: string | null;
          document?: string | null;
          city?: string | null;
          state?: string | null;
          country?: string;
          total_orders?: number;
          total_spent?: number;
          currency?: string;
          first_order_at?: string | null;
          last_order_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "customers_workspace_id_fkey";
            columns: ["workspace_id"];
            isOneToOne: false;
            referencedRelation: "workspaces";
            referencedColumns: ["id"];
          },
        ];
      };
      orders: {
        Row: {
          id: string;
          workspace_id: string;
          customer_id: string | null;
          integration_id: string | null;
          external_id: string | null;
          order_number: string | null;
          status: Database["public"]["Enums"]["order_status"];
          financial_status: string | null;
          fulfillment_status: string | null;
          total_amount: number;
          subtotal_amount: number;
          tax_amount: number;
          discount_amount: number;
          shipping_amount: number;
          currency: string;
          total_base_currency: number;
          exchange_rate: number;
          exchange_rate_at: string | null;
          payment_method: string | null;
          payment_gateway: string | null;
          utm_source: string | null;
          utm_medium: string | null;
          utm_campaign: string | null;
          utm_content: string | null;
          utm_term: string | null;
          session_id: string | null;
          ordered_at: string;
          synced_at: string | null;
          metadata: Json | null;
          created_at: string;
          updated_at: string;
          deleted_at: string | null;
        };
        Insert: {
          id?: string;
          workspace_id: string;
          customer_id?: string | null;
          integration_id?: string | null;
          external_id?: string | null;
          order_number?: string | null;
          status?: Database["public"]["Enums"]["order_status"];
          financial_status?: string | null;
          fulfillment_status?: string | null;
          total_amount?: number;
          subtotal_amount?: number;
          tax_amount?: number;
          discount_amount?: number;
          shipping_amount?: number;
          currency?: string;
          total_base_currency?: number;
          exchange_rate?: number;
          exchange_rate_at?: string | null;
          payment_method?: string | null;
          payment_gateway?: string | null;
          utm_source?: string | null;
          utm_medium?: string | null;
          utm_campaign?: string | null;
          utm_content?: string | null;
          utm_term?: string | null;
          session_id?: string | null;
          ordered_at?: string;
          synced_at?: string | null;
          metadata?: Json | null;
          created_at?: string;
          updated_at?: string;
          deleted_at?: string | null;
        };
        Update: {
          id?: string;
          workspace_id?: string;
          customer_id?: string | null;
          integration_id?: string | null;
          external_id?: string | null;
          order_number?: string | null;
          status?: Database["public"]["Enums"]["order_status"];
          financial_status?: string | null;
          fulfillment_status?: string | null;
          total_amount?: number;
          subtotal_amount?: number;
          tax_amount?: number;
          discount_amount?: number;
          shipping_amount?: number;
          currency?: string;
          total_base_currency?: number;
          exchange_rate?: number;
          exchange_rate_at?: string | null;
          payment_method?: string | null;
          payment_gateway?: string | null;
          utm_source?: string | null;
          utm_medium?: string | null;
          utm_campaign?: string | null;
          utm_content?: string | null;
          utm_term?: string | null;
          session_id?: string | null;
          ordered_at?: string;
          synced_at?: string | null;
          metadata?: Json | null;
          created_at?: string;
          updated_at?: string;
          deleted_at?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "orders_workspace_id_fkey";
            columns: ["workspace_id"];
            isOneToOne: false;
            referencedRelation: "workspaces";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "orders_customer_id_fkey";
            columns: ["customer_id"];
            isOneToOne: false;
            referencedRelation: "customers";
            referencedColumns: ["id"];
          },
        ];
      };
      order_items: {
        Row: {
          id: string;
          workspace_id: string;
          order_id: string;
          product_id: string | null;
          external_id: string | null;
          sku: string | null;
          title: string;
          quantity: number;
          unit_price: number;
          total_price: number;
          unit_cost: number;
          total_cost: number;
          currency: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          workspace_id: string;
          order_id: string;
          product_id?: string | null;
          external_id?: string | null;
          sku?: string | null;
          title: string;
          quantity?: number;
          unit_price?: number;
          total_price?: number;
          unit_cost?: number;
          total_cost?: number;
          currency?: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          workspace_id?: string;
          order_id?: string;
          product_id?: string | null;
          external_id?: string | null;
          sku?: string | null;
          title?: string;
          quantity?: number;
          unit_price?: number;
          total_price?: number;
          unit_cost?: number;
          total_cost?: number;
          currency?: string;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "order_items_workspace_id_fkey";
            columns: ["workspace_id"];
            isOneToOne: false;
            referencedRelation: "workspaces";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "order_items_order_id_fkey";
            columns: ["order_id"];
            isOneToOne: false;
            referencedRelation: "orders";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "order_items_product_id_fkey";
            columns: ["product_id"];
            isOneToOne: false;
            referencedRelation: "products";
            referencedColumns: ["id"];
          },
        ];
      };
      // ---------- FINANCEIRO ----------
      product_costs: {
        Row: {
          id: string;
          workspace_id: string;
          product_id: string;
          cost_amount: number;
          currency: string;
          cost_type: string;
          valid_from: string;
          valid_to: string | null;
          notes: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          workspace_id: string;
          product_id: string;
          cost_amount: number;
          currency?: string;
          cost_type?: string;
          valid_from?: string;
          valid_to?: string | null;
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          workspace_id?: string;
          product_id?: string;
          cost_amount?: number;
          currency?: string;
          cost_type?: string;
          valid_from?: string;
          valid_to?: string | null;
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "product_costs_workspace_id_fkey";
            columns: ["workspace_id"];
            isOneToOne: false;
            referencedRelation: "workspaces";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "product_costs_product_id_fkey";
            columns: ["product_id"];
            isOneToOne: false;
            referencedRelation: "products";
            referencedColumns: ["id"];
          },
        ];
      };
      gateway_fees: {
        Row: {
          id: string;
          workspace_id: string;
          gateway: string;
          payment_method: string;
          fee_percentage: number;
          fixed_fee: number;
          currency: string;
          active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          workspace_id: string;
          gateway: string;
          payment_method?: string;
          fee_percentage?: number;
          fixed_fee?: number;
          currency?: string;
          active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          workspace_id?: string;
          gateway?: string;
          payment_method?: string;
          fee_percentage?: number;
          fixed_fee?: number;
          currency?: string;
          active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "gateway_fees_workspace_id_fkey";
            columns: ["workspace_id"];
            isOneToOne: false;
            referencedRelation: "workspaces";
            referencedColumns: ["id"];
          },
        ];
      };
      taxes: {
        Row: {
          id: string;
          workspace_id: string;
          name: string;
          rate_percentage: number;
          applies_to: string;
          active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          workspace_id: string;
          name: string;
          rate_percentage?: number;
          applies_to?: string;
          active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          workspace_id?: string;
          name?: string;
          rate_percentage?: number;
          applies_to?: string;
          active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "taxes_workspace_id_fkey";
            columns: ["workspace_id"];
            isOneToOne: false;
            referencedRelation: "workspaces";
            referencedColumns: ["id"];
          },
        ];
      };
      fixed_costs: {
        Row: {
          id: string;
          workspace_id: string;
          name: string;
          category: string;
          amount: number;
          currency: string;
          periodicity: string;
          start_date: string;
          end_date: string | null;
          active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          workspace_id: string;
          name: string;
          category?: string;
          amount: number;
          currency?: string;
          periodicity?: string;
          start_date: string;
          end_date?: string | null;
          active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          workspace_id?: string;
          name?: string;
          category?: string;
          amount?: number;
          currency?: string;
          periodicity?: string;
          start_date?: string;
          end_date?: string | null;
          active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "fixed_costs_workspace_id_fkey";
            columns: ["workspace_id"];
            isOneToOne: false;
            referencedRelation: "workspaces";
            referencedColumns: ["id"];
          },
        ];
      };
      financial_entries: {
        Row: {
          id: string;
          workspace_id: string;
          type: Database["public"]["Enums"]["financial_entry_type"];
          category: string;
          amount: number;
          amount_base_currency: number;
          currency: string;
          exchange_rate: number;
          description: string;
          reference_type: string | null;
          reference_id: string | null;
          entry_date: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          workspace_id: string;
          type: Database["public"]["Enums"]["financial_entry_type"];
          category: string;
          amount: number;
          amount_base_currency: number;
          currency?: string;
          exchange_rate?: number;
          description: string;
          reference_type?: string | null;
          reference_id?: string | null;
          entry_date?: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          workspace_id?: string;
          type?: Database["public"]["Enums"]["financial_entry_type"];
          category?: string;
          amount?: number;
          amount_base_currency?: number;
          currency?: string;
          exchange_rate?: number;
          description?: string;
          reference_type?: string | null;
          reference_id?: string | null;
          entry_date?: string;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "financial_entries_workspace_id_fkey";
            columns: ["workspace_id"];
            isOneToOne: false;
            referencedRelation: "workspaces";
            referencedColumns: ["id"];
          },
        ];
      };
      // ---------- TRACKING ----------
      utm_links: {
        Row: {
          id: string;
          workspace_id: string;
          name: string;
          destination_url: string;
          utm_source: string;
          utm_medium: string;
          utm_campaign: string;
          utm_content: string | null;
          utm_term: string | null;
          short_code: string | null;
          custom_params: Json | null;
          click_count: number;
          is_active: boolean;
          created_by: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          workspace_id: string;
          name: string;
          destination_url: string;
          utm_source: string;
          utm_medium: string;
          utm_campaign: string;
          utm_content?: string | null;
          utm_term?: string | null;
          short_code?: string | null;
          custom_params?: Json | null;
          click_count?: number;
          is_active?: boolean;
          created_by?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          workspace_id?: string;
          name?: string;
          destination_url?: string;
          utm_source?: string;
          utm_medium?: string;
          utm_campaign?: string;
          utm_content?: string | null;
          utm_term?: string | null;
          short_code?: string | null;
          custom_params?: Json | null;
          click_count?: number;
          is_active?: boolean;
          created_by?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "utm_links_workspace_id_fkey";
            columns: ["workspace_id"];
            isOneToOne: false;
            referencedRelation: "workspaces";
            referencedColumns: ["id"];
          },
        ];
      };
      tracking_sessions: {
        Row: {
          id: string;
          workspace_id: string;
          session_token: string;
          visitor_id: string;
          landing_page: string;
          referrer: string | null;
          utm_source: string | null;
          utm_medium: string | null;
          utm_campaign: string | null;
          utm_content: string | null;
          utm_term: string | null;
          device_type: string | null;
          os: string | null;
          browser: string | null;
          country: string | null;
          city: string | null;
          started_at: string;
          last_seen_at: string;
        };
        Insert: {
          id?: string;
          workspace_id: string;
          session_token: string;
          visitor_id: string;
          landing_page: string;
          referrer?: string | null;
          utm_source?: string | null;
          utm_medium?: string | null;
          utm_campaign?: string | null;
          utm_content?: string | null;
          utm_term?: string | null;
          device_type?: string | null;
          os?: string | null;
          browser?: string | null;
          country?: string | null;
          city?: string | null;
          started_at?: string;
          last_seen_at?: string;
        };
        Update: {
          id?: string;
          workspace_id?: string;
          session_token?: string;
          visitor_id?: string;
          landing_page?: string;
          referrer?: string | null;
          utm_source?: string | null;
          utm_medium?: string | null;
          utm_campaign?: string | null;
          utm_content?: string | null;
          utm_term?: string | null;
          device_type?: string | null;
          os?: string | null;
          browser?: string | null;
          country?: string | null;
          city?: string | null;
          started_at?: string;
          last_seen_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "tracking_sessions_workspace_id_fkey";
            columns: ["workspace_id"];
            isOneToOne: false;
            referencedRelation: "workspaces";
            referencedColumns: ["id"];
          },
        ];
      };
      tracking_events: {
        Row: {
          id: string;
          workspace_id: string;
          session_id: string | null;
          visitor_id: string;
          event_name: string;
          page_url: string;
          page_title: string | null;
          properties: Json | null;
          occurred_at: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          workspace_id: string;
          session_id?: string | null;
          visitor_id: string;
          event_name: string;
          page_url: string;
          page_title?: string | null;
          properties?: Json | null;
          occurred_at?: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          workspace_id?: string;
          session_id?: string | null;
          visitor_id?: string;
          event_name?: string;
          page_url?: string;
          page_title?: string | null;
          properties?: Json | null;
          occurred_at?: string;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "tracking_events_workspace_id_fkey";
            columns: ["workspace_id"];
            isOneToOne: false;
            referencedRelation: "workspaces";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "tracking_events_session_id_fkey";
            columns: ["session_id"];
            isOneToOne: false;
            referencedRelation: "tracking_sessions";
            referencedColumns: ["id"];
          },
        ];
      };
      attributions: {
        Row: {
          id: string;
          workspace_id: string;
          order_id: string;
          session_id: string | null;
          customer_id: string | null;
          campaign_id: string | null;
          ad_id: string | null;
          model: Database["public"]["Enums"]["attribution_model"];
          attributed_revenue: number;
          attributed_weight: number;
          touchpoint_at: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          workspace_id: string;
          order_id: string;
          session_id?: string | null;
          customer_id?: string | null;
          campaign_id?: string | null;
          ad_id?: string | null;
          model?: Database["public"]["Enums"]["attribution_model"];
          attributed_revenue?: number;
          attributed_weight?: number;
          touchpoint_at?: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          workspace_id?: string;
          order_id?: string;
          session_id?: string | null;
          customer_id?: string | null;
          campaign_id?: string | null;
          ad_id?: string | null;
          model?: Database["public"]["Enums"]["attribution_model"];
          attributed_revenue?: number;
          attributed_weight?: number;
          touchpoint_at?: string;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "attributions_workspace_id_fkey";
            columns: ["workspace_id"];
            isOneToOne: false;
            referencedRelation: "workspaces";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "attributions_order_id_fkey";
            columns: ["order_id"];
            isOneToOne: false;
            referencedRelation: "orders";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "attributions_campaign_id_fkey";
            columns: ["campaign_id"];
            isOneToOne: false;
            referencedRelation: "campaigns";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "attributions_ad_id_fkey";
            columns: ["ad_id"];
            isOneToOne: false;
            referencedRelation: "ads";
            referencedColumns: ["id"];
          },
        ];
      };
      automations: {
        Row: {
          id: string;
          workspace_id: string;
          name: string;
          description: string | null;
          trigger_type: Database["public"]["Enums"]["automation_trigger_type"];
          trigger_config: Json;
          condition_config: Json;
          action_config: Json;
          guardrails: Json;
          status: Database["public"]["Enums"]["automation_status"];
          created_by: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          workspace_id: string;
          name: string;
          description?: string | null;
          trigger_type?: Database["public"]["Enums"]["automation_trigger_type"];
          trigger_config?: Json;
          condition_config?: Json;
          action_config?: Json;
          guardrails?: Json;
          status?: Database["public"]["Enums"]["automation_status"];
          created_by?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          workspace_id?: string;
          name?: string;
          description?: string | null;
          trigger_type?: Database["public"]["Enums"]["automation_trigger_type"];
          trigger_config?: Json;
          condition_config?: Json;
          action_config?: Json;
          guardrails?: Json;
          status?: Database["public"]["Enums"]["automation_status"];
          created_by?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "automations_workspace_id_fkey";
            columns: ["workspace_id"];
            isOneToOne: false;
            referencedRelation: "workspaces";
            referencedColumns: ["id"];
          },
        ];
      };
      automation_runs: {
        Row: {
          id: string;
          workspace_id: string;
          automation_id: string;
          trigger_event: Json | null;
          execution_status: string;
          result: Json | null;
          error_detail: string | null;
          executed_at: string;
        };
        Insert: {
          id?: string;
          workspace_id: string;
          automation_id: string;
          trigger_event?: Json | null;
          execution_status?: string;
          result?: Json | null;
          error_detail?: string | null;
          executed_at?: string;
        };
        Update: {
          id?: string;
          workspace_id?: string;
          automation_id?: string;
          trigger_event?: Json | null;
          execution_status?: string;
          result?: Json | null;
          error_detail?: string | null;
          executed_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "automation_runs_workspace_id_fkey";
            columns: ["workspace_id"];
            isOneToOne: false;
            referencedRelation: "workspaces";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "automation_runs_automation_id_fkey";
            columns: ["automation_id"];
            isOneToOne: false;
            referencedRelation: "automations";
            referencedColumns: ["id"];
          },
        ];
      };
      brain_conversations: {
        Row: {
          id: string;
          workspace_id: string;
          user_id: string;
          title: string;
          context_page: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          workspace_id: string;
          user_id: string;
          title?: string;
          context_page?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          workspace_id?: string;
          user_id?: string;
          title?: string;
          context_page?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "brain_conversations_workspace_id_fkey";
            columns: ["workspace_id"];
            isOneToOne: false;
            referencedRelation: "workspaces";
            referencedColumns: ["id"];
          },
        ];
      };
      brain_messages: {
        Row: {
          id: string;
          workspace_id: string;
          conversation_id: string;
          sender: string;
          content: string;
          structured_payload: Json | null;
          context_snapshot: Json | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          workspace_id: string;
          conversation_id: string;
          sender?: string;
          content: string;
          structured_payload?: Json | null;
          context_snapshot?: Json | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          workspace_id?: string;
          conversation_id?: string;
          sender?: string;
          content?: string;
          structured_payload?: Json | null;
          context_snapshot?: Json | null;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "brain_messages_workspace_id_fkey";
            columns: ["workspace_id"];
            isOneToOne: false;
            referencedRelation: "workspaces";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "brain_messages_conversation_id_fkey";
            columns: ["conversation_id"];
            isOneToOne: false;
            referencedRelation: "brain_conversations";
            referencedColumns: ["id"];
          },
        ];
      };
      brain_insights: {
        Row: {
          id: string;
          workspace_id: string;
          type: Database["public"]["Enums"]["brain_insight_type"];
          severity: Database["public"]["Enums"]["brain_insight_severity"];
          title: string;
          description: string;
          recommendation: string | null;
          context_entity_type: string | null;
          context_entity_id: string | null;
          is_dismissed: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          workspace_id: string;
          type?: Database["public"]["Enums"]["brain_insight_type"];
          severity?: Database["public"]["Enums"]["brain_insight_severity"];
          title: string;
          description: string;
          recommendation?: string | null;
          context_entity_type?: string | null;
          context_entity_id?: string | null;
          is_dismissed?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          workspace_id?: string;
          type?: Database["public"]["Enums"]["brain_insight_type"];
          severity?: Database["public"]["Enums"]["brain_insight_severity"];
          title?: string;
          description?: string;
          recommendation?: string | null;
          context_entity_type?: string | null;
          context_entity_id?: string | null;
          is_dismissed?: boolean;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "brain_insights_workspace_id_fkey";
            columns: ["workspace_id"];
            isOneToOne: false;
            referencedRelation: "workspaces";
            referencedColumns: ["id"];
          },
        ];
      };
      brain_actions: {
        Row: {
          id: string;
          workspace_id: string;
          proposed_by: Database["public"]["Enums"]["actor_type"];
          approved_by: string | null;
          rejected_by: string | null;
          action_type: string;
          description: string;
          risk_level: string;
          payload: Json;
          preview_diff: Json | null;
          status: Database["public"]["Enums"]["brain_action_status"];
          guardrails_passed: boolean;
          idempotency_key: string | null;
          executed_at: string | null;
          result: Json | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          workspace_id: string;
          proposed_by?: Database["public"]["Enums"]["actor_type"];
          approved_by?: string | null;
          rejected_by?: string | null;
          action_type: string;
          description: string;
          risk_level?: string;
          payload?: Json;
          preview_diff?: Json | null;
          status?: Database["public"]["Enums"]["brain_action_status"];
          guardrails_passed?: boolean;
          idempotency_key?: string | null;
          executed_at?: string | null;
          result?: Json | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          workspace_id?: string;
          proposed_by?: Database["public"]["Enums"]["actor_type"];
          approved_by?: string | null;
          rejected_by?: string | null;
          action_type?: string;
          description?: string;
          risk_level?: string;
          payload?: Json;
          preview_diff?: Json | null;
          status?: Database["public"]["Enums"]["brain_action_status"];
          guardrails_passed?: boolean;
          idempotency_key?: string | null;
          executed_at?: string | null;
          result?: Json | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "brain_actions_workspace_id_fkey";
            columns: ["workspace_id"];
            isOneToOne: false;
            referencedRelation: "workspaces";
            referencedColumns: ["id"];
          },
        ];
      };
      notifications: {
        Row: {
          id: string;
          workspace_id: string;
          user_id: string | null;
          type: string;
          title: string;
          message: string;
          link_to: string | null;
          is_read: boolean;
          read_at: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          workspace_id: string;
          user_id?: string | null;
          type?: string;
          title: string;
          message: string;
          link_to?: string | null;
          is_read?: boolean;
          read_at?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          workspace_id?: string;
          user_id?: string | null;
          type?: string;
          title?: string;
          message?: string;
          link_to?: string | null;
          is_read?: boolean;
          read_at?: string | null;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "notifications_workspace_id_fkey";
            columns: ["workspace_id"];
            isOneToOne: false;
            referencedRelation: "workspaces";
            referencedColumns: ["id"];
          },
        ];
      };
      plans: {
        Row: {
          id: string;
          slug: string;
          name: string;
          description: string | null;
          monthly_price: number;
          annual_price: number;
          currency: string;
          is_public: boolean;
          is_active: boolean;
          display_order: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          slug: string;
          name: string;
          description?: string | null;
          monthly_price?: number;
          annual_price?: number;
          currency?: string;
          is_public?: boolean;
          is_active?: boolean;
          display_order?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          slug?: string;
          name?: string;
          description?: string | null;
          monthly_price?: number;
          annual_price?: number;
          currency?: string;
          is_public?: boolean;
          is_active?: boolean;
          display_order?: number;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      plan_entitlements: {
        Row: {
          id: string;
          plan_id: string;
          feature_key: string;
          enabled: boolean;
          config: Json;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          plan_id: string;
          feature_key: string;
          enabled?: boolean;
          config?: Json;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          plan_id?: string;
          feature_key?: string;
          enabled?: boolean;
          config?: Json;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "plan_entitlements_plan_id_fkey";
            columns: ["plan_id"];
            isOneToOne: false;
            referencedRelation: "plans";
            referencedColumns: ["id"];
          },
        ];
      };
      plan_limits: {
        Row: {
          id: string;
          plan_id: string;
          resource_key: string;
          limit_value: number;
          period: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          plan_id: string;
          resource_key: string;
          limit_value?: number;
          period?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          plan_id?: string;
          resource_key?: string;
          limit_value?: number;
          period?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "plan_limits_plan_id_fkey";
            columns: ["plan_id"];
            isOneToOne: false;
            referencedRelation: "plans";
            referencedColumns: ["id"];
          },
        ];
      };
      billing_customers: {
        Row: {
          id: string;
          workspace_id: string;
          provider: string;
          provider_customer_id: string;
          email: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          workspace_id: string;
          provider?: string;
          provider_customer_id: string;
          email: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          workspace_id?: string;
          provider?: string;
          provider_customer_id?: string;
          email?: string;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "billing_customers_workspace_id_fkey";
            columns: ["workspace_id"];
            isOneToOne: false;
            referencedRelation: "workspaces";
            referencedColumns: ["id"];
          },
        ];
      };
      subscriptions: {
        Row: {
          id: string;
          workspace_id: string;
          plan_id: string;
          provider: string;
          provider_customer_id: string | null;
          provider_subscription_id: string | null;
          status: Database["public"]["Enums"]["subscription_status"];
          billing_interval: Database["public"]["Enums"]["plan_interval"];
          trial_started_at: string | null;
          trial_ends_at: string | null;
          current_period_start: string;
          current_period_end: string;
          cancel_at_period_end: boolean;
          canceled_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          workspace_id: string;
          plan_id: string;
          provider?: string;
          provider_customer_id?: string | null;
          provider_subscription_id?: string | null;
          status?: Database["public"]["Enums"]["subscription_status"];
          billing_interval?: Database["public"]["Enums"]["plan_interval"];
          trial_started_at?: string | null;
          trial_ends_at?: string | null;
          current_period_start?: string;
          current_period_end?: string;
          cancel_at_period_end?: boolean;
          canceled_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          workspace_id?: string;
          plan_id?: string;
          provider?: string;
          provider_customer_id?: string | null;
          provider_subscription_id?: string | null;
          status?: Database["public"]["Enums"]["subscription_status"];
          billing_interval?: Database["public"]["Enums"]["plan_interval"];
          trial_started_at?: string | null;
          trial_ends_at?: string | null;
          current_period_start?: string;
          current_period_end?: string;
          cancel_at_period_end?: boolean;
          canceled_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "subscriptions_workspace_id_fkey";
            columns: ["workspace_id"];
            isOneToOne: false;
            referencedRelation: "workspaces";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "subscriptions_plan_id_fkey";
            columns: ["plan_id"];
            isOneToOne: false;
            referencedRelation: "plans";
            referencedColumns: ["id"];
          },
        ];
      };
      subscription_invoices: {
        Row: {
          id: string;
          subscription_id: string;
          workspace_id: string;
          provider_invoice_id: string | null;
          provider_payment_id: string | null;
          status: string;
          amount: number;
          currency: string;
          due_at: string | null;
          paid_at: string | null;
          failure_reason: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          subscription_id: string;
          workspace_id: string;
          provider_invoice_id?: string | null;
          provider_payment_id?: string | null;
          status?: string;
          amount?: number;
          currency?: string;
          due_at?: string | null;
          paid_at?: string | null;
          failure_reason?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          subscription_id?: string;
          workspace_id?: string;
          provider_invoice_id?: string | null;
          provider_payment_id?: string | null;
          status?: string;
          amount?: number;
          currency?: string;
          due_at?: string | null;
          paid_at?: string | null;
          failure_reason?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "subscription_invoices_subscription_id_fkey";
            columns: ["subscription_id"];
            isOneToOne: false;
            referencedRelation: "subscriptions";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "subscription_invoices_workspace_id_fkey";
            columns: ["workspace_id"];
            isOneToOne: false;
            referencedRelation: "workspaces";
            referencedColumns: ["id"];
          },
        ];
      };
      billing_webhook_events: {
        Row: {
          id: string;
          provider: string;
          external_event_id: string;
          event_type: string;
          payload: Json;
          processed: boolean;
          processed_at: string | null;
          error: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          provider?: string;
          external_event_id: string;
          event_type: string;
          payload?: Json;
          processed?: boolean;
          processed_at?: string | null;
          error?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          provider?: string;
          external_event_id?: string;
          event_type?: string;
          payload?: Json;
          processed?: boolean;
          processed_at?: string | null;
          error?: string | null;
          created_at?: string;
        };
        Relationships: [];
      };
      workspace_invitations: {
        Row: {
          id: string;
          workspace_id: string;
          email: string;
          role: Database["public"]["Enums"]["app_role"];
          token: string;
          status: "pending" | "accepted" | "revoked" | "expired";
          invited_by: string;
          accepted_by: string | null;
          accepted_at: string | null;
          expires_at: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          workspace_id: string;
          email: string;
          role: Database["public"]["Enums"]["app_role"];
          token: string;
          status?: "pending" | "accepted" | "revoked" | "expired";
          invited_by: string;
          accepted_by?: string | null;
          accepted_at?: string | null;
          expires_at?: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          workspace_id?: string;
          email?: string;
          role?: Database["public"]["Enums"]["app_role"];
          token?: string;
          status?: "pending" | "accepted" | "revoked" | "expired";
          invited_by?: string;
          accepted_by?: string | null;
          accepted_at?: string | null;
          expires_at?: string;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "workspace_invitations_workspace_id_fkey";
            columns: ["workspace_id"];
            isOneToOne: false;
            referencedRelation: "workspaces";
            referencedColumns: ["id"];
          },
        ];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      has_workspace_permission: {
        Args: {
          _permission: string;
          _user_id: string;
          _workspace_id: string;
        };
        Returns: boolean;
      };
      is_workspace_member: {
        Args: {
          _user_id: string;
          _workspace_id: string;
        };
        Returns: boolean;
      };
      shares_workspace: {
        Args: {
          _user_a: string;
          _user_b: string;
        };
        Returns: boolean;
      };
      workspace_role: {
        Args: {
          _user_id: string;
          _workspace_id: string;
        };
        Returns: Database["public"]["Enums"]["app_role"];
      };
    };
    Enums: {
      actor_type: "user" | "brain" | "automation" | "system" | "integration";
      app_role: "owner" | "admin" | "manager" | "analyst" | "media_buyer" | "finance" | "viewer";
      business_type:
        | "ecommerce"
        | "saas"
        | "infoproduct"
        | "affiliate"
        | "agency"
        | "creator"
        | "freelancer"
        | "other";
      integration_status:
        | "not_connected"
        | "connecting"
        | "connected"
        | "syncing"
        | "error"
        | "paused"
        | "data_delayed";
      workspace_status: "trial" | "active" | "read_only" | "suspended";
      campaign_status: "active" | "paused" | "archived" | "draft";
      order_status: "pending" | "paid" | "canceled" | "refunded" | "failed";
      product_status: "active" | "draft" | "archived";
      product_type: "physical" | "digital" | "service" | "subscription";
      creative_type: "image" | "video" | "carousel" | "text";
      financial_entry_type:
        "income" | "expense" | "fee" | "tax" | "cost_of_goods" | "ad_spend" | "adjustment";
      attribution_model: "first_click" | "last_click" | "linear" | "data_driven";
      brain_action_status:
        "pending_approval" | "approved" | "rejected" | "executed" | "failed" | "rolled_back";
      brain_insight_type: "anomaly" | "opportunity" | "warning" | "trend" | "recommendation";
      brain_insight_severity: "info" | "warning" | "critical" | "success";
      automation_status: "active" | "paused" | "draft";
      automation_trigger_type: "metric_threshold" | "schedule" | "event" | "manual";
      plan_interval: "monthly" | "annual";
      subscription_status:
        | "trialing"
        | "active"
        | "past_due"
        | "grace_period"
        | "paused"
        | "canceled"
        | "expired";
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">;

type DefaultSchema = DatabaseWithoutInternals[keyof DatabaseWithoutInternals];

export type Tables<
  PublicTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (PublicTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof (DatabaseWithoutInternals[PublicTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[PublicTableNameOrOptions["schema"]]["Views"])
    : never) = never,
> = PublicTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? (DatabaseWithoutInternals[PublicTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[PublicTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R;
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] & DefaultSchema["Views"])[PublicTableNameOrOptions] extends {
        Row: infer R;
      }
      ? R
      : never
    : never;

export type TablesInsert<
  PublicTableNameOrOptions extends
    keyof DefaultSchema["Tables"] | { schema: keyof DatabaseWithoutInternals },
  TableName extends (PublicTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[PublicTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = PublicTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I;
    }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][PublicTableNameOrOptions] extends {
        Insert: infer I;
      }
      ? I
      : never
    : never;

export type TablesUpdate<
  PublicTableNameOrOptions extends
    keyof DefaultSchema["Tables"] | { schema: keyof DatabaseWithoutInternals },
  TableName extends (PublicTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[PublicTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = PublicTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U;
    }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][PublicTableNameOrOptions] extends {
        Update: infer U;
      }
      ? U
      : never
    : never;

export type Enums<
  PublicEnumNameOrOptions extends
    keyof DefaultSchema["Enums"] | { schema: keyof DatabaseWithoutInternals },
  EnumName extends (PublicEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[PublicEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
> = PublicEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[PublicEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : PublicEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][PublicEnumNameOrOptions]
    : never;

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    keyof DefaultSchema["CompositeTypes"] | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never;

export const Constants = {
  public: {
    Enums: {
      actor_type: ["user", "brain", "automation", "system", "integration"],
      app_role: ["owner", "admin", "manager", "analyst", "media_buyer", "finance", "viewer"],
      business_type: [
        "ecommerce",
        "saas",
        "infoproduct",
        "affiliate",
        "agency",
        "creator",
        "freelancer",
        "other",
      ],
      integration_status: [
        "not_connected",
        "connecting",
        "connected",
        "syncing",
        "error",
        "paused",
        "data_delayed",
      ],
      workspace_status: ["trial", "active", "read_only", "suspended"],
      campaign_status: ["active", "paused", "archived", "draft"],
      order_status: ["pending", "paid", "canceled", "refunded", "failed"],
      product_status: ["active", "draft", "archived"],
      product_type: ["physical", "digital", "service", "subscription"],
      creative_type: ["image", "video", "carousel", "text"],
      financial_entry_type: [
        "income",
        "expense",
        "fee",
        "tax",
        "cost_of_goods",
        "ad_spend",
        "adjustment",
      ],
      attribution_model: ["first_click", "last_click", "linear", "data_driven"],
      brain_action_status: [
        "pending_approval",
        "approved",
        "rejected",
        "executed",
        "failed",
        "rolled_back",
      ],
      brain_insight_type: ["anomaly", "opportunity", "warning", "trend", "recommendation"],
      brain_insight_severity: ["info", "warning", "critical", "success"],
      automation_status: ["active", "paused", "draft"],
      automation_trigger_type: ["metric_threshold", "schedule", "event", "manual"],
    },
  },
} as const;
