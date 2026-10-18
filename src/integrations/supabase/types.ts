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
    PostgrestVersion: "14.18"
  }
  public: {
    Tables: {
      activity_log: {
        Row: {
          action: string
          created_at: string
          details: Json
          entity: string | null
          entity_id: string | null
          id: string
          user_id: string
        }
        Insert: {
          action: string
          created_at?: string
          details?: Json
          entity?: string | null
          entity_id?: string | null
          id?: string
          user_id: string
        }
        Update: {
          action?: string
          created_at?: string
          details?: Json
          entity?: string | null
          entity_id?: string | null
          id?: string
          user_id?: string
        }
        Relationships: []
      }
      announcements: {
        Row: {
          body: string
          created_at: string
          created_by: string | null
          id: string
          pinned: boolean
          published: boolean
          title: string
        }
        Insert: {
          body?: string
          created_at?: string
          created_by?: string | null
          id?: string
          pinned?: boolean
          published?: boolean
          title: string
        }
        Update: {
          body?: string
          created_at?: string
          created_by?: string | null
          id?: string
          pinned?: boolean
          published?: boolean
          title?: string
        }
        Relationships: []
      }
      app_settings: {
        Row: {
          is_public: boolean
          key: string
          updated_at: string
          value: Json
        }
        Insert: {
          is_public?: boolean
          key: string
          updated_at?: string
          value: Json
        }
        Update: {
          is_public?: boolean
          key?: string
          updated_at?: string
          value?: Json
        }
        Relationships: []
      }
      assignments: {
        Row: {
          assignment_type: string
          chapter_id: string | null
          created_at: string
          created_by: string | null
          description: string
          due_at: string
          id: string
          max_marks: number
          published: boolean
          subject_id: string | null
          title: string
        }
        Insert: {
          assignment_type?: string
          chapter_id?: string | null
          created_at?: string
          created_by?: string | null
          description?: string
          due_at: string
          id?: string
          max_marks?: number
          published?: boolean
          subject_id?: string | null
          title: string
        }
        Update: {
          assignment_type?: string
          chapter_id?: string | null
          created_at?: string
          created_by?: string | null
          description?: string
          due_at?: string
          id?: string
          max_marks?: number
          published?: boolean
          subject_id?: string | null
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "assignments_chapter_id_fkey"
            columns: ["chapter_id"]
            isOneToOne: false
            referencedRelation: "chapters"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "assignments_subject_id_fkey"
            columns: ["subject_id"]
            isOneToOne: false
            referencedRelation: "subjects"
            referencedColumns: ["id"]
          },
        ]
      }
      audit_log: {
        Row: {
          action: string
          actor_id: string
          created_at: string
          details: Json
          id: string
        }
        Insert: {
          action: string
          actor_id: string
          created_at?: string
          details?: Json
          id?: string
        }
        Update: {
          action?: string
          actor_id?: string
          created_at?: string
          details?: Json
          id?: string
        }
        Relationships: []
      }
      chapters: {
        Row: {
          created_at: string
          id: string
          name: string
          sort_order: number
          subject_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
          sort_order?: number
          subject_id: string
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
          sort_order?: number
          subject_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "chapters_subject_id_fkey"
            columns: ["subject_id"]
            isOneToOne: false
            referencedRelation: "subjects"
            referencedColumns: ["id"]
          },
        ]
      }
      doubt_queries: {
        Row: {
          attachment_name: string | null
          attachment_path: string | null
          body: string
          chapter_id: string | null
          created_at: string
          id: string
          status: Database["public"]["Enums"]["doubt_status"]
          student_id: string
          subject_id: string | null
          title: string
          updated_at: string
        }
        Insert: {
          attachment_name?: string | null
          attachment_path?: string | null
          body: string
          chapter_id?: string | null
          created_at?: string
          id?: string
          status?: Database["public"]["Enums"]["doubt_status"]
          student_id: string
          subject_id?: string | null
          title: string
          updated_at?: string
        }
        Update: {
          attachment_name?: string | null
          attachment_path?: string | null
          body?: string
          chapter_id?: string | null
          created_at?: string
          id?: string
          status?: Database["public"]["Enums"]["doubt_status"]
          student_id?: string
          subject_id?: string | null
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "doubt_queries_chapter_id_fkey"
            columns: ["chapter_id"]
            isOneToOne: false
            referencedRelation: "chapters"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "doubt_queries_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "doubt_queries_subject_id_fkey"
            columns: ["subject_id"]
            isOneToOne: false
            referencedRelation: "subjects"
            referencedColumns: ["id"]
          },
        ]
      }
      doubt_replies: {
        Row: {
          author_id: string
          body: string
          created_at: string
          doubt_id: string
          id: string
        }
        Insert: {
          author_id: string
          body: string
          created_at?: string
          doubt_id: string
          id?: string
        }
        Update: {
          author_id?: string
          body?: string
          created_at?: string
          doubt_id?: string
          id?: string
        }
        Relationships: [
          {
            foreignKeyName: "doubt_replies_doubt_id_fkey"
            columns: ["doubt_id"]
            isOneToOne: false
            referencedRelation: "doubt_queries"
            referencedColumns: ["id"]
          },
        ]
      }
      parent_links: {
        Row: {
          id: string
          parent_id: string
          student_id: string
        }
        Insert: {
          id?: string
          parent_id: string
          student_id: string
        }
        Update: {
          id?: string
          parent_id?: string
          student_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "parent_links_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          class_level: string
          created_at: string
          full_name: string
          id: string
          is_active: boolean
          parent_name: string | null
          parent_phone: string | null
          phone: string | null
          student_code: string | null
          updated_at: string
        }
        Insert: {
          class_level?: string
          created_at?: string
          full_name?: string
          id: string
          is_active?: boolean
          parent_name?: string | null
          parent_phone?: string | null
          phone?: string | null
          student_code?: string | null
          updated_at?: string
        }
        Update: {
          class_level?: string
          created_at?: string
          full_name?: string
          id?: string
          is_active?: boolean
          parent_name?: string | null
          parent_phone?: string | null
          phone?: string | null
          student_code?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      resource_access: {
        Row: {
          resource_id: string
          student_id: string
        }
        Insert: {
          resource_id: string
          student_id: string
        }
        Update: {
          resource_id?: string
          student_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "resource_access_resource_id_fkey"
            columns: ["resource_id"]
            isOneToOne: false
            referencedRelation: "resources"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "resource_access_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      resources: {
        Row: {
          chapter_id: string | null
          class_level: string
          created_at: string
          created_by: string | null
          description: string
          external_url: string | null
          file_name: string | null
          file_path: string | null
          id: string
          published: boolean
          resource_type: string
          subject_id: string | null
          title: string
          visibility: string
        }
        Insert: {
          chapter_id?: string | null
          class_level?: string
          created_at?: string
          created_by?: string | null
          description?: string
          external_url?: string | null
          file_name?: string | null
          file_path?: string | null
          id?: string
          published?: boolean
          resource_type?: string
          subject_id?: string | null
          title: string
          visibility?: string
        }
        Update: {
          chapter_id?: string | null
          class_level?: string
          created_at?: string
          created_by?: string | null
          description?: string
          external_url?: string | null
          file_name?: string | null
          file_path?: string | null
          id?: string
          published?: boolean
          resource_type?: string
          subject_id?: string | null
          title?: string
          visibility?: string
        }
        Relationships: [
          {
            foreignKeyName: "resources_chapter_id_fkey"
            columns: ["chapter_id"]
            isOneToOne: false
            referencedRelation: "chapters"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "resources_subject_id_fkey"
            columns: ["subject_id"]
            isOneToOne: false
            referencedRelation: "subjects"
            referencedColumns: ["id"]
          },
        ]
      }
      subjects: {
        Row: {
          created_at: string
          id: string
          name: string
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
        }
        Relationships: []
      }
      submissions: {
        Row: {
          assignment_id: string
          feedback: string | null
          file_name: string
          file_path: string
          id: string
          marks: number | null
          note: string
          reviewed_at: string | null
          reviewed_by: string | null
          status: Database["public"]["Enums"]["submission_status"]
          student_id: string
          submitted_at: string
        }
        Insert: {
          assignment_id: string
          feedback?: string | null
          file_name?: string
          file_path: string
          id?: string
          marks?: number | null
          note?: string
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: Database["public"]["Enums"]["submission_status"]
          student_id: string
          submitted_at?: string
        }
        Update: {
          assignment_id?: string
          feedback?: string | null
          file_name?: string
          file_path?: string
          id?: string
          marks?: number | null
          note?: string
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: Database["public"]["Enums"]["submission_status"]
          student_id?: string
          submitted_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "submissions_assignment_id_fkey"
            columns: ["assignment_id"]
            isOneToOne: false
            referencedRelation: "assignments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "submissions_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      test_marks: {
        Row: {
          id: string
          marks: number
          remarks: string
          student_id: string
          test_id: string
          updated_at: string
        }
        Insert: {
          id?: string
          marks: number
          remarks?: string
          student_id: string
          test_id: string
          updated_at?: string
        }
        Update: {
          id?: string
          marks?: number
          remarks?: string
          student_id?: string
          test_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "test_marks_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "test_marks_test_id_fkey"
            columns: ["test_id"]
            isOneToOne: false
            referencedRelation: "tests"
            referencedColumns: ["id"]
          },
        ]
      }
      tests: {
        Row: {
          chapter_id: string | null
          created_at: string
          created_by: string | null
          id: string
          max_marks: number
          subject_id: string | null
          test_date: string
          title: string
        }
        Insert: {
          chapter_id?: string | null
          created_at?: string
          created_by?: string | null
          id?: string
          max_marks?: number
          subject_id?: string | null
          test_date?: string
          title: string
        }
        Update: {
          chapter_id?: string | null
          created_at?: string
          created_by?: string | null
          id?: string
          max_marks?: number
          subject_id?: string | null
          test_date?: string
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "tests_chapter_id_fkey"
            columns: ["chapter_id"]
            isOneToOne: false
            referencedRelation: "chapters"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tests_subject_id_fkey"
            columns: ["subject_id"]
            isOneToOne: false
            referencedRelation: "subjects"
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
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      can_view_doubt: {
        Args: { _doubt: string; _uid: string }
        Returns: boolean
      }
      can_view_resource: {
        Args: { _resource: string; _uid: string }
        Returns: boolean
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_parent_of: {
        Args: { _parent: string; _student: string }
        Returns: boolean
      }
      is_staff: { Args: { _user_id: string }; Returns: boolean }
      resubmit_work: {
        Args: {
          _file_name: string
          _file_path: string
          _note: string
          _submission: string
        }
        Returns: undefined
      }
    }
    Enums: {
      app_role: "admin" | "teacher" | "student" | "parent"
      doubt_status: "pending" | "answered" | "closed"
      submission_status:
        | "submitted"
        | "under_review"
        | "corrections_required"
        | "reviewed"
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
      app_role: ["admin", "teacher", "student", "parent"],
      doubt_status: ["pending", "answered", "closed"],
      submission_status: [
        "submitted",
        "under_review",
        "corrections_required",
        "reviewed",
      ],
    },
  },
} as const
