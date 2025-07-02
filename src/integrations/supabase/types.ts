export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      chat_logs: {
        Row: {
          ai_response: string
          created_at: string
          id: string
          user_id: string | null
          user_message: string
        }
        Insert: {
          ai_response: string
          created_at?: string
          id?: string
          user_id?: string | null
          user_message: string
        }
        Update: {
          ai_response?: string
          created_at?: string
          id?: string
          user_id?: string | null
          user_message?: string
        }
        Relationships: []
      }
      delivery_tracking: {
        Row: {
          current_lat: number
          current_lng: number
          delivery_partner_id: string
          id: string
          order_id: string
          status: string
          timestamp: string | null
        }
        Insert: {
          current_lat: number
          current_lng: number
          delivery_partner_id: string
          id?: string
          order_id: string
          status: string
          timestamp?: string | null
        }
        Update: {
          current_lat?: number
          current_lng?: number
          delivery_partner_id?: string
          id?: string
          order_id?: string
          status?: string
          timestamp?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "delivery_tracking_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      notifications: {
        Row: {
          created_at: string | null
          data: Json | null
          id: string
          message: string
          read: boolean | null
          title: string
          type: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          data?: Json | null
          id?: string
          message: string
          read?: boolean | null
          title: string
          type: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          data?: Json | null
          id?: string
          message?: string
          read?: boolean | null
          title?: string
          type?: string
          user_id?: string
        }
        Relationships: []
      }
      orders: {
        Row: {
          created_at: string | null
          customer_id: string
          delivery_address: string
          delivery_lat: number | null
          delivery_lng: number | null
          delivery_partner_id: string | null
          estimated_delivery_time: string | null
          id: string
          items: Json
          pickup_address: string
          pickup_lat: number | null
          pickup_lng: number | null
          shop_id: string
          status: string
          total_amount: number
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          customer_id: string
          delivery_address: string
          delivery_lat?: number | null
          delivery_lng?: number | null
          delivery_partner_id?: string | null
          estimated_delivery_time?: string | null
          id?: string
          items: Json
          pickup_address: string
          pickup_lat?: number | null
          pickup_lng?: number | null
          shop_id: string
          status?: string
          total_amount: number
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          customer_id?: string
          delivery_address?: string
          delivery_lat?: number | null
          delivery_lng?: number | null
          delivery_partner_id?: string | null
          estimated_delivery_time?: string | null
          id?: string
          items?: Json
          pickup_address?: string
          pickup_lat?: number | null
          pickup_lng?: number | null
          shop_id?: string
          status?: string
          total_amount?: number
          updated_at?: string | null
        }
        Relationships: []
      }
      shop_inventory: {
        Row: {
          category: string
          created_at: string | null
          description: string | null
          id: string
          image_url: string | null
          is_available: boolean | null
          price: number
          product_name: string
          shop_id: string
          stock_quantity: number
          updated_at: string | null
        }
        Insert: {
          category?: string
          created_at?: string | null
          description?: string | null
          id?: string
          image_url?: string | null
          is_available?: boolean | null
          price: number
          product_name: string
          shop_id: string
          stock_quantity?: number
          updated_at?: string | null
        }
        Update: {
          category?: string
          created_at?: string | null
          description?: string | null
          id?: string
          image_url?: string | null
          is_available?: boolean | null
          price?: number
          product_name?: string
          shop_id?: string
          stock_quantity?: number
          updated_at?: string | null
        }
        Relationships: []
      }
      shops: {
        Row: {
          contact_number: string | null
          created_at: string | null
          description: string | null
          id: string
          is_active: boolean | null
          pin_code: string | null
          shop_address: string
          shop_image: string | null
          shop_lat: number | null
          shop_lng: number | null
          shop_name: string
          shop_owner_id: string
          updated_at: string | null
        }
        Insert: {
          contact_number?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          pin_code?: string | null
          shop_address: string
          shop_image?: string | null
          shop_lat?: number | null
          shop_lng?: number | null
          shop_name: string
          shop_owner_id: string
          updated_at?: string | null
        }
        Update: {
          contact_number?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          pin_code?: string | null
          shop_address?: string
          shop_image?: string | null
          shop_lat?: number | null
          shop_lng?: number | null
          shop_name?: string
          shop_owner_id?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      user_agreements: {
        Row: {
          accepted_at: string | null
          id: string
          privacy_policy_accepted: boolean | null
          return_policy_accepted: boolean | null
          terms_accepted: boolean | null
          user_id: string
          user_type: string
        }
        Insert: {
          accepted_at?: string | null
          id?: string
          privacy_policy_accepted?: boolean | null
          return_policy_accepted?: boolean | null
          terms_accepted?: boolean | null
          user_id: string
          user_type: string
        }
        Update: {
          accepted_at?: string | null
          id?: string
          privacy_policy_accepted?: boolean | null
          return_policy_accepted?: boolean | null
          terms_accepted?: boolean | null
          user_id?: string
          user_type?: string
        }
        Relationships: []
      }
      user_profiles: {
        Row: {
          address: string | null
          avatar_url: string | null
          created_at: string | null
          email: string
          full_name: string
          id: string
          is_online: boolean | null
          latitude: number | null
          longitude: number | null
          phone: string | null
          preferred_language: string | null
          role: string
          shop_address: string | null
          shop_category: string | null
          shop_lat: number | null
          shop_lng: number | null
          shop_name: string | null
          updated_at: string | null
          user_type: string
          vehicle_type: string | null
        }
        Insert: {
          address?: string | null
          avatar_url?: string | null
          created_at?: string | null
          email: string
          full_name: string
          id: string
          is_online?: boolean | null
          latitude?: number | null
          longitude?: number | null
          phone?: string | null
          preferred_language?: string | null
          role: string
          shop_address?: string | null
          shop_category?: string | null
          shop_lat?: number | null
          shop_lng?: number | null
          shop_name?: string | null
          updated_at?: string | null
          user_type: string
          vehicle_type?: string | null
        }
        Update: {
          address?: string | null
          avatar_url?: string | null
          created_at?: string | null
          email?: string
          full_name?: string
          id?: string
          is_online?: boolean | null
          latitude?: number | null
          longitude?: number | null
          phone?: string | null
          preferred_language?: string | null
          role?: string
          shop_address?: string | null
          shop_category?: string | null
          shop_lat?: number | null
          shop_lng?: number | null
          shop_name?: string | null
          updated_at?: string | null
          user_type?: string
          vehicle_type?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
