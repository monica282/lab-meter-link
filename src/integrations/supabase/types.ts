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
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      calibrations: {
        Row: {
          calibration_date: string
          calibration_lab: string | null
          certificate_number: string | null
          created_at: string
          id: string
          instrument_id: string
          next_calibration_date: string
          notes: string | null
          performed_by: string | null
          result: string
          uncertainty_unit: string | null
          uncertainty_value: number | null
        }
        Insert: {
          calibration_date: string
          calibration_lab?: string | null
          certificate_number?: string | null
          created_at?: string
          id?: string
          instrument_id: string
          next_calibration_date: string
          notes?: string | null
          performed_by?: string | null
          result: string
          uncertainty_unit?: string | null
          uncertainty_value?: number | null
        }
        Update: {
          calibration_date?: string
          calibration_lab?: string | null
          certificate_number?: string | null
          created_at?: string
          id?: string
          instrument_id?: string
          next_calibration_date?: string
          notes?: string | null
          performed_by?: string | null
          result?: string
          uncertainty_unit?: string | null
          uncertainty_value?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "calibrations_instrument_id_fkey"
            columns: ["instrument_id"]
            isOneToOne: false
            referencedRelation: "instruments"
            referencedColumns: ["id"]
          },
        ]
      }
      instruments: {
        Row: {
          calibration_frequency_months: number
          category: string
          created_at: string
          id: string
          last_calibration_date: string | null
          location: string | null
          manufacturer: string | null
          model: string | null
          name: string
          next_calibration_date: string | null
          notes: string | null
          serial_number: string | null
          status: string
          updated_at: string
        }
        Insert: {
          calibration_frequency_months?: number
          category: string
          created_at?: string
          id?: string
          last_calibration_date?: string | null
          location?: string | null
          manufacturer?: string | null
          model?: string | null
          name: string
          next_calibration_date?: string | null
          notes?: string | null
          serial_number?: string | null
          status?: string
          updated_at?: string
        }
        Update: {
          calibration_frequency_months?: number
          category?: string
          created_at?: string
          id?: string
          last_calibration_date?: string | null
          location?: string | null
          manufacturer?: string | null
          model?: string | null
          name?: string
          next_calibration_date?: string | null
          notes?: string | null
          serial_number?: string | null
          status?: string
          updated_at?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          created_at: string
          email: string
          full_name: string | null
          id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          email: string
          full_name?: string | null
          id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          email?: string
          full_name?: string | null
          id?: string
          updated_at?: string
        }
        Relationships: []
      }
      projects: {
        Row: {
          created_at: string
          created_by: string
          current_trl: Database["public"]["Enums"]["trl_level"]
          description: string | null
          expected_end_date: string | null
          id: string
          name: string
          responsible_user_id: string | null
          start_date: string
          status: Database["public"]["Enums"]["project_status"]
          target_trl: Database["public"]["Enums"]["trl_level"]
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by: string
          current_trl?: Database["public"]["Enums"]["trl_level"]
          description?: string | null
          expected_end_date?: string | null
          id?: string
          name: string
          responsible_user_id?: string | null
          start_date: string
          status?: Database["public"]["Enums"]["project_status"]
          target_trl?: Database["public"]["Enums"]["trl_level"]
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by?: string
          current_trl?: Database["public"]["Enums"]["trl_level"]
          description?: string | null
          expected_end_date?: string | null
          id?: string
          name?: string
          responsible_user_id?: string | null
          start_date?: string
          status?: Database["public"]["Enums"]["project_status"]
          target_trl?: Database["public"]["Enums"]["trl_level"]
          updated_at?: string
        }
        Relationships: []
      }
      quality_indicators: {
        Row: {
          created_at: string
          current_value: number
          id: string
          indicator_name: string
          indicator_type: string
          measured_by: string | null
          measurement_date: string
          notes: string | null
          project_id: string
          status: string
          target_value: number
          unit: string | null
        }
        Insert: {
          created_at?: string
          current_value: number
          id?: string
          indicator_name: string
          indicator_type: string
          measured_by?: string | null
          measurement_date?: string
          notes?: string | null
          project_id: string
          status: string
          target_value: number
          unit?: string | null
        }
        Update: {
          created_at?: string
          current_value?: number
          id?: string
          indicator_name?: string
          indicator_type?: string
          measured_by?: string | null
          measurement_date?: string
          notes?: string | null
          project_id?: string
          status?: string
          target_value?: number
          unit?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "quality_indicators_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      tdp_documents: {
        Row: {
          approval_date: string | null
          approved_by: string | null
          author_id: string | null
          created_at: string
          description: string | null
          document_type: string
          file_url: string | null
          id: string
          project_id: string
          status: string
          title: string
          updated_at: string
          version: string
        }
        Insert: {
          approval_date?: string | null
          approved_by?: string | null
          author_id?: string | null
          created_at?: string
          description?: string | null
          document_type: string
          file_url?: string | null
          id?: string
          project_id: string
          status?: string
          title: string
          updated_at?: string
          version?: string
        }
        Update: {
          approval_date?: string | null
          approved_by?: string | null
          author_id?: string | null
          created_at?: string
          description?: string | null
          document_type?: string
          file_url?: string | null
          id?: string
          project_id?: string
          status?: string
          title?: string
          updated_at?: string
          version?: string
        }
        Relationships: [
          {
            foreignKeyName: "tdp_documents_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      trl_history: {
        Row: {
          created_at: string
          evidence: string
          from_trl: Database["public"]["Enums"]["trl_level"]
          id: string
          notes: string | null
          project_id: string
          to_trl: Database["public"]["Enums"]["trl_level"]
          validated_by: string | null
          validation_date: string
        }
        Insert: {
          created_at?: string
          evidence: string
          from_trl: Database["public"]["Enums"]["trl_level"]
          id?: string
          notes?: string | null
          project_id: string
          to_trl: Database["public"]["Enums"]["trl_level"]
          validated_by?: string | null
          validation_date?: string
        }
        Update: {
          created_at?: string
          evidence?: string
          from_trl?: Database["public"]["Enums"]["trl_level"]
          id?: string
          notes?: string | null
          project_id?: string
          to_trl?: Database["public"]["Enums"]["trl_level"]
          validated_by?: string | null
          validation_date?: string
        }
        Relationships: [
          {
            foreignKeyName: "trl_history_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
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
    }
    Enums: {
      app_role: "admin" | "tecnico" | "usuario"
      project_status:
        | "planejamento"
        | "em_andamento"
        | "pausado"
        | "concluido"
        | "cancelado"
      trl_level:
        | "TRL1"
        | "TRL2"
        | "TRL3"
        | "TRL4"
        | "TRL5"
        | "TRL6"
        | "TRL7"
        | "TRL8"
        | "TRL9"
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
      app_role: ["admin", "tecnico", "usuario"],
      project_status: [
        "planejamento",
        "em_andamento",
        "pausado",
        "concluido",
        "cancelado",
      ],
      trl_level: [
        "TRL1",
        "TRL2",
        "TRL3",
        "TRL4",
        "TRL5",
        "TRL6",
        "TRL7",
        "TRL8",
        "TRL9",
      ],
    },
  },
} as const
