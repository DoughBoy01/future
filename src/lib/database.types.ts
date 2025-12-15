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
  graphql_public: {
    Tables: {
      [_ in never]: never
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      graphql: {
        Args: {
          extensions?: Json
          operationName?: string
          query?: string
          variables?: Json
        }
        Returns: Json
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
  public: {
    Tables: {
      attendance: {
        Row: {
          booking_id: string | null
          camp_id: string | null
          check_in_time: string | null
          check_out_time: string | null
          checked_in_by: string | null
          checked_out_by: string | null
          child_id: string | null
          created_at: string | null
          date: string
          id: string
          notes: string | null
          status: string | null
        }
        Insert: {
          booking_id?: string | null
          camp_id?: string | null
          check_in_time?: string | null
          check_out_time?: string | null
          checked_in_by?: string | null
          checked_out_by?: string | null
          child_id?: string | null
          created_at?: string | null
          date: string
          id?: string
          notes?: string | null
          status?: string | null
        }
        Update: {
          booking_id?: string | null
          camp_id?: string | null
          check_in_time?: string | null
          check_out_time?: string | null
          checked_in_by?: string | null
          checked_out_by?: string | null
          child_id?: string | null
          created_at?: string | null
          date?: string
          id?: string
          notes?: string | null
          status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "attendance_booking_id_fkey"
            columns: ["booking_id"]
            isOneToOne: false
            referencedRelation: "bookings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "attendance_camp_id_fkey"
            columns: ["camp_id"]
            isOneToOne: false
            referencedRelation: "camp_availability"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "attendance_camp_id_fkey"
            columns: ["camp_id"]
            isOneToOne: false
            referencedRelation: "camps"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "attendance_checked_in_by_fkey"
            columns: ["checked_in_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "attendance_checked_out_by_fkey"
            columns: ["checked_out_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "attendance_child_id_fkey"
            columns: ["child_id"]
            isOneToOne: false
            referencedRelation: "children"
            referencedColumns: ["id"]
          },
        ]
      }
      audit_logs: {
        Row: {
          action: string
          changed_by: string | null
          changed_by_email: string | null
          changed_by_role: string | null
          changed_fields: string[] | null
          created_at: string
          id: string
          ip_address: unknown
          new_values: Json | null
          old_values: Json | null
          organisation_id: string | null
          record_id: string
          table_name: string
          user_agent: string | null
        }
        Insert: {
          action: string
          changed_by?: string | null
          changed_by_email?: string | null
          changed_by_role?: string | null
          changed_fields?: string[] | null
          created_at?: string
          id?: string
          ip_address?: unknown
          new_values?: Json | null
          old_values?: Json | null
          organisation_id?: string | null
          record_id: string
          table_name: string
          user_agent?: string | null
        }
        Update: {
          action?: string
          changed_by?: string | null
          changed_by_email?: string | null
          changed_by_role?: string | null
          changed_fields?: string[] | null
          created_at?: string
          id?: string
          ip_address?: unknown
          new_values?: Json | null
          old_values?: Json | null
          organisation_id?: string | null
          record_id?: string
          table_name?: string
          user_agent?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "audit_logs_changed_by_fkey"
            columns: ["changed_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "audit_logs_organisation_id_fkey"
            columns: ["organisation_id"]
            isOneToOne: false
            referencedRelation: "commission_summary"
            referencedColumns: ["organisation_id"]
          },
          {
            foreignKeyName: "audit_logs_organisation_id_fkey"
            columns: ["organisation_id"]
            isOneToOne: false
            referencedRelation: "organisations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "audit_logs_organisation_id_fkey"
            columns: ["organisation_id"]
            isOneToOne: false
            referencedRelation: "upcoming_payouts_summary"
            referencedColumns: ["organisation_id"]
          },
        ]
      }
      bookings: {
        Row: {
          amount_due: number
          amount_paid: number | null
          camp_id: string | null
          cancellation_date: string | null
          cancellation_reason: string | null
          child_id: string | null
          confirmation_date: string | null
          created_at: string | null
          discount_amount: number | null
          discount_code: string | null
          form_completed: boolean
          form_completed_at: string | null
          forms_submitted: boolean | null
          id: string
          notes: string | null
          parent_id: string | null
          payment_status: string | null
          photo_permission: boolean | null
          registration_date: string | null
          status: string | null
          stripe_checkout_session_id: string | null
          updated_at: string | null
        }
        Insert: {
          amount_due: number
          amount_paid?: number | null
          camp_id?: string | null
          cancellation_date?: string | null
          cancellation_reason?: string | null
          child_id?: string | null
          confirmation_date?: string | null
          created_at?: string | null
          discount_amount?: number | null
          discount_code?: string | null
          form_completed?: boolean
          form_completed_at?: string | null
          forms_submitted?: boolean | null
          id?: string
          notes?: string | null
          parent_id?: string | null
          payment_status?: string | null
          photo_permission?: boolean | null
          registration_date?: string | null
          status?: string | null
          stripe_checkout_session_id?: string | null
          updated_at?: string | null
        }
        Update: {
          amount_due?: number
          amount_paid?: number | null
          camp_id?: string | null
          cancellation_date?: string | null
          cancellation_reason?: string | null
          child_id?: string | null
          confirmation_date?: string | null
          created_at?: string | null
          discount_amount?: number | null
          discount_code?: string | null
          form_completed?: boolean
          form_completed_at?: string | null
          forms_submitted?: boolean | null
          id?: string
          notes?: string | null
          parent_id?: string | null
          payment_status?: string | null
          photo_permission?: boolean | null
          registration_date?: string | null
          status?: string | null
          stripe_checkout_session_id?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "bookings_camp_id_fkey"
            columns: ["camp_id"]
            isOneToOne: false
            referencedRelation: "camp_availability"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bookings_camp_id_fkey"
            columns: ["camp_id"]
            isOneToOne: false
            referencedRelation: "camps"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bookings_child_id_fkey"
            columns: ["child_id"]
            isOneToOne: false
            referencedRelation: "children"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bookings_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "parents"
            referencedColumns: ["id"]
          },
        ]
      }
      camp_categories: {
        Row: {
          active: boolean | null
          color_theme: string
          created_at: string | null
          description: string
          display_order: number
          icon_name: string
          id: string
          name: string
          slug: string
          updated_at: string | null
        }
        Insert: {
          active?: boolean | null
          color_theme?: string
          created_at?: string | null
          description: string
          display_order?: number
          icon_name?: string
          id?: string
          name: string
          slug: string
          updated_at?: string | null
        }
        Update: {
          active?: boolean | null
          color_theme?: string
          created_at?: string | null
          description?: string
          display_order?: number
          icon_name?: string
          id?: string
          name?: string
          slug?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      camp_category_assignments: {
        Row: {
          assigned_at: string | null
          assigned_by: string | null
          camp_id: string
          category_id: string
          id: string
        }
        Insert: {
          assigned_at?: string | null
          assigned_by?: string | null
          camp_id: string
          category_id: string
          id?: string
        }
        Update: {
          assigned_at?: string | null
          assigned_by?: string | null
          camp_id?: string
          category_id?: string
          id?: string
        }
        Relationships: [
          {
            foreignKeyName: "camp_category_assignments_assigned_by_fkey"
            columns: ["assigned_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "camp_category_assignments_camp_id_fkey"
            columns: ["camp_id"]
            isOneToOne: false
            referencedRelation: "camp_availability"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "camp_category_assignments_camp_id_fkey"
            columns: ["camp_id"]
            isOneToOne: false
            referencedRelation: "camps"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "camp_category_assignments_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "camp_categories"
            referencedColumns: ["id"]
          },
        ]
      }
      camp_commission_rates: {
        Row: {
          camp_id: string
          commission_rate: number
          created_at: string
          effective_date: string
          end_date: string | null
          id: string
          notes: string | null
          set_by: string | null
        }
        Insert: {
          camp_id: string
          commission_rate: number
          created_at?: string
          effective_date?: string
          end_date?: string | null
          id?: string
          notes?: string | null
          set_by?: string | null
        }
        Update: {
          camp_id?: string
          commission_rate?: number
          created_at?: string
          effective_date?: string
          end_date?: string | null
          id?: string
          notes?: string | null
          set_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "camp_commission_rates_camp_id_fkey"
            columns: ["camp_id"]
            isOneToOne: false
            referencedRelation: "camp_availability"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "camp_commission_rates_camp_id_fkey"
            columns: ["camp_id"]
            isOneToOne: false
            referencedRelation: "camps"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "camp_commission_rates_set_by_fkey"
            columns: ["set_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      camp_organizer_invites: {
        Row: {
          accepted_at: string | null
          created_at: string | null
          email: string
          expires_at: string | null
          id: string
          invited_at: string | null
          invited_by: string
          metadata: Json | null
          notes: string | null
          organisation_id: string | null
          profile_id: string | null
          status: string
          token: string
          updated_at: string | null
        }
        Insert: {
          accepted_at?: string | null
          created_at?: string | null
          email: string
          expires_at?: string | null
          id?: string
          invited_at?: string | null
          invited_by: string
          metadata?: Json | null
          notes?: string | null
          organisation_id?: string | null
          profile_id?: string | null
          status?: string
          token: string
          updated_at?: string | null
        }
        Update: {
          accepted_at?: string | null
          created_at?: string | null
          email?: string
          expires_at?: string | null
          id?: string
          invited_at?: string | null
          invited_by?: string
          metadata?: Json | null
          notes?: string | null
          organisation_id?: string | null
          profile_id?: string | null
          status?: string
          token?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "camp_organizer_invites_invited_by_fkey"
            columns: ["invited_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "camp_organizer_invites_organisation_id_fkey"
            columns: ["organisation_id"]
            isOneToOne: false
            referencedRelation: "commission_summary"
            referencedColumns: ["organisation_id"]
          },
          {
            foreignKeyName: "camp_organizer_invites_organisation_id_fkey"
            columns: ["organisation_id"]
            isOneToOne: false
            referencedRelation: "organisations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "camp_organizer_invites_organisation_id_fkey"
            columns: ["organisation_id"]
            isOneToOne: false
            referencedRelation: "upcoming_payouts_summary"
            referencedColumns: ["organisation_id"]
          },
          {
            foreignKeyName: "camp_organizer_invites_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      camps: {
        Row: {
          age_max: number
          age_min: number
          amenities: Json | null
          auto_publish: boolean | null
          cancellation_policy: string | null
          capacity: number
          category: string | null
          changes_requested: string | null
          commission_rate: number | null
          created_at: string | null
          created_by: string | null
          currency: string | null
          daily_schedule: Json | null
          description: string | null
          early_bird_deadline: string | null
          early_bird_price: number | null
          end_date: string
          enquiries_enabled: boolean | null
          enrolled_count: number | null
          faqs: Json | null
          featured: boolean | null
          featured_image_url: string | null
          gallery_urls: Json | null
          grade_max: string | null
          grade_min: string | null
          highlights: Json | null
          id: string
          image_metadata: Json | null
          included_in_price: Json | null
          insurance_info: string | null
          location: string
          name: string
          not_included_in_price: Json | null
          organisation_id: string | null
          payment_link: string | null
          price: number
          published_at: string | null
          refund_policy: string | null
          rejection_reason: string | null
          requirements: string | null
          review_notes: string | null
          reviewed_at: string | null
          reviewed_by: string | null
          safety_protocols: string | null
          schedule: Json | null
          slug: string
          staff_credentials: Json | null
          start_date: string
          status: string
          submitted_for_review_at: string | null
          updated_at: string | null
          video_metadata: Json | null
          video_url: string | null
          video_urls: Json | null
          what_to_bring: string | null
        }
        Insert: {
          age_max: number
          age_min: number
          amenities?: Json | null
          auto_publish?: boolean | null
          cancellation_policy?: string | null
          capacity?: number
          category?: string | null
          changes_requested?: string | null
          commission_rate?: number | null
          created_at?: string | null
          created_by?: string | null
          currency?: string | null
          daily_schedule?: Json | null
          description?: string | null
          early_bird_deadline?: string | null
          early_bird_price?: number | null
          end_date: string
          enquiries_enabled?: boolean | null
          enrolled_count?: number | null
          faqs?: Json | null
          featured?: boolean | null
          featured_image_url?: string | null
          gallery_urls?: Json | null
          grade_max?: string | null
          grade_min?: string | null
          highlights?: Json | null
          id?: string
          image_metadata?: Json | null
          included_in_price?: Json | null
          insurance_info?: string | null
          location: string
          name: string
          not_included_in_price?: Json | null
          organisation_id?: string | null
          payment_link?: string | null
          price: number
          published_at?: string | null
          refund_policy?: string | null
          rejection_reason?: string | null
          requirements?: string | null
          review_notes?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          safety_protocols?: string | null
          schedule?: Json | null
          slug: string
          staff_credentials?: Json | null
          start_date: string
          status?: string
          submitted_for_review_at?: string | null
          updated_at?: string | null
          video_metadata?: Json | null
          video_url?: string | null
          video_urls?: Json | null
          what_to_bring?: string | null
        }
        Update: {
          age_max?: number
          age_min?: number
          amenities?: Json | null
          auto_publish?: boolean | null
          cancellation_policy?: string | null
          capacity?: number
          category?: string | null
          changes_requested?: string | null
          commission_rate?: number | null
          created_at?: string | null
          created_by?: string | null
          currency?: string | null
          daily_schedule?: Json | null
          description?: string | null
          early_bird_deadline?: string | null
          early_bird_price?: number | null
          end_date?: string
          enquiries_enabled?: boolean | null
          enrolled_count?: number | null
          faqs?: Json | null
          featured?: boolean | null
          featured_image_url?: string | null
          gallery_urls?: Json | null
          grade_max?: string | null
          grade_min?: string | null
          highlights?: Json | null
          id?: string
          image_metadata?: Json | null
          included_in_price?: Json | null
          insurance_info?: string | null
          location?: string
          name?: string
          not_included_in_price?: Json | null
          organisation_id?: string | null
          payment_link?: string | null
          price?: number
          published_at?: string | null
          refund_policy?: string | null
          rejection_reason?: string | null
          requirements?: string | null
          review_notes?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          safety_protocols?: string | null
          schedule?: Json | null
          slug?: string
          staff_credentials?: Json | null
          start_date?: string
          status?: string
          submitted_for_review_at?: string | null
          updated_at?: string | null
          video_metadata?: Json | null
          video_url?: string | null
          video_urls?: Json | null
          what_to_bring?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "camps_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "camps_organisation_id_fkey"
            columns: ["organisation_id"]
            isOneToOne: false
            referencedRelation: "commission_summary"
            referencedColumns: ["organisation_id"]
          },
          {
            foreignKeyName: "camps_organisation_id_fkey"
            columns: ["organisation_id"]
            isOneToOne: false
            referencedRelation: "organisations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "camps_organisation_id_fkey"
            columns: ["organisation_id"]
            isOneToOne: false
            referencedRelation: "upcoming_payouts_summary"
            referencedColumns: ["organisation_id"]
          },
          {
            foreignKeyName: "camps_reviewed_by_fkey"
            columns: ["reviewed_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      children: {
        Row: {
          allergies: string | null
          created_at: string | null
          date_of_birth: string
          dietary_restrictions: string | null
          first_name: string
          gender: string | null
          grade: string | null
          id: string
          last_name: string
          medical_conditions: string | null
          medications: string | null
          notes: string | null
          organisation_id: string | null
          parent_id: string | null
          photo_url: string | null
          special_needs: string | null
          updated_at: string | null
        }
        Insert: {
          allergies?: string | null
          created_at?: string | null
          date_of_birth: string
          dietary_restrictions?: string | null
          first_name: string
          gender?: string | null
          grade?: string | null
          id?: string
          last_name: string
          medical_conditions?: string | null
          medications?: string | null
          notes?: string | null
          organisation_id?: string | null
          parent_id?: string | null
          photo_url?: string | null
          special_needs?: string | null
          updated_at?: string | null
        }
        Update: {
          allergies?: string | null
          created_at?: string | null
          date_of_birth?: string
          dietary_restrictions?: string | null
          first_name?: string
          gender?: string | null
          grade?: string | null
          id?: string
          last_name?: string
          medical_conditions?: string | null
          medications?: string | null
          notes?: string | null
          organisation_id?: string | null
          parent_id?: string | null
          photo_url?: string | null
          special_needs?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "children_organisation_id_fkey"
            columns: ["organisation_id"]
            isOneToOne: false
            referencedRelation: "commission_summary"
            referencedColumns: ["organisation_id"]
          },
          {
            foreignKeyName: "children_organisation_id_fkey"
            columns: ["organisation_id"]
            isOneToOne: false
            referencedRelation: "organisations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "children_organisation_id_fkey"
            columns: ["organisation_id"]
            isOneToOne: false
            referencedRelation: "upcoming_payouts_summary"
            referencedColumns: ["organisation_id"]
          },
          {
            foreignKeyName: "children_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "parents"
            referencedColumns: ["id"]
          },
        ]
      }
      commission_records: {
        Row: {
          booking_id: string
          camp_id: string
          commission_amount: number
          commission_rate: number
          created_at: string
          id: string
          notes: string | null
          organisation_id: string
          paid_date: string | null
          payment_reference: string | null
          payment_status: string
          registration_amount: number
          updated_at: string
        }
        Insert: {
          booking_id: string
          camp_id: string
          commission_amount: number
          commission_rate: number
          created_at?: string
          id?: string
          notes?: string | null
          organisation_id: string
          paid_date?: string | null
          payment_reference?: string | null
          payment_status?: string
          registration_amount: number
          updated_at?: string
        }
        Update: {
          booking_id?: string
          camp_id?: string
          commission_amount?: number
          commission_rate?: number
          created_at?: string
          id?: string
          notes?: string | null
          organisation_id?: string
          paid_date?: string | null
          payment_reference?: string | null
          payment_status?: string
          registration_amount?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "commission_records_booking_id_fkey"
            columns: ["booking_id"]
            isOneToOne: true
            referencedRelation: "bookings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "commission_records_camp_id_fkey"
            columns: ["camp_id"]
            isOneToOne: false
            referencedRelation: "camp_availability"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "commission_records_camp_id_fkey"
            columns: ["camp_id"]
            isOneToOne: false
            referencedRelation: "camps"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "commission_records_organisation_id_fkey"
            columns: ["organisation_id"]
            isOneToOne: false
            referencedRelation: "commission_summary"
            referencedColumns: ["organisation_id"]
          },
          {
            foreignKeyName: "commission_records_organisation_id_fkey"
            columns: ["organisation_id"]
            isOneToOne: false
            referencedRelation: "organisations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "commission_records_organisation_id_fkey"
            columns: ["organisation_id"]
            isOneToOne: false
            referencedRelation: "upcoming_payouts_summary"
            referencedColumns: ["organisation_id"]
          },
        ]
      }
      communications: {
        Row: {
          body: string
          camp_id: string | null
          created_at: string | null
          id: string
          metadata: Json | null
          organisation_id: string | null
          recipient_ids: Json | null
          recipient_type: string
          scheduled_for: string | null
          sent_at: string | null
          sent_by: string | null
          status: string | null
          subject: string | null
          type: string
        }
        Insert: {
          body: string
          camp_id?: string | null
          created_at?: string | null
          id?: string
          metadata?: Json | null
          organisation_id?: string | null
          recipient_ids?: Json | null
          recipient_type: string
          scheduled_for?: string | null
          sent_at?: string | null
          sent_by?: string | null
          status?: string | null
          subject?: string | null
          type: string
        }
        Update: {
          body?: string
          camp_id?: string | null
          created_at?: string | null
          id?: string
          metadata?: Json | null
          organisation_id?: string | null
          recipient_ids?: Json | null
          recipient_type?: string
          scheduled_for?: string | null
          sent_at?: string | null
          sent_by?: string | null
          status?: string | null
          subject?: string | null
          type?: string
        }
        Relationships: [
          {
            foreignKeyName: "communications_camp_id_fkey"
            columns: ["camp_id"]
            isOneToOne: false
            referencedRelation: "camp_availability"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "communications_camp_id_fkey"
            columns: ["camp_id"]
            isOneToOne: false
            referencedRelation: "camps"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "communications_organisation_id_fkey"
            columns: ["organisation_id"]
            isOneToOne: false
            referencedRelation: "commission_summary"
            referencedColumns: ["organisation_id"]
          },
          {
            foreignKeyName: "communications_organisation_id_fkey"
            columns: ["organisation_id"]
            isOneToOne: false
            referencedRelation: "organisations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "communications_organisation_id_fkey"
            columns: ["organisation_id"]
            isOneToOne: false
            referencedRelation: "upcoming_payouts_summary"
            referencedColumns: ["organisation_id"]
          },
          {
            foreignKeyName: "communications_sent_by_fkey"
            columns: ["sent_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      discount_codes: {
        Row: {
          active: boolean | null
          applicable_camps: Json | null
          code: string
          created_at: string | null
          created_by: string | null
          description: string | null
          discount_type: string
          discount_value: number
          id: string
          max_uses: number | null
          min_purchase: number | null
          organisation_id: string | null
          uses_count: number | null
          valid_from: string
          valid_until: string
        }
        Insert: {
          active?: boolean | null
          applicable_camps?: Json | null
          code: string
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          discount_type: string
          discount_value: number
          id?: string
          max_uses?: number | null
          min_purchase?: number | null
          organisation_id?: string | null
          uses_count?: number | null
          valid_from: string
          valid_until: string
        }
        Update: {
          active?: boolean | null
          applicable_camps?: Json | null
          code?: string
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          discount_type?: string
          discount_value?: number
          id?: string
          max_uses?: number | null
          min_purchase?: number | null
          organisation_id?: string | null
          uses_count?: number | null
          valid_from?: string
          valid_until?: string
        }
        Relationships: [
          {
            foreignKeyName: "discount_codes_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "discount_codes_organisation_id_fkey"
            columns: ["organisation_id"]
            isOneToOne: false
            referencedRelation: "commission_summary"
            referencedColumns: ["organisation_id"]
          },
          {
            foreignKeyName: "discount_codes_organisation_id_fkey"
            columns: ["organisation_id"]
            isOneToOne: false
            referencedRelation: "organisations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "discount_codes_organisation_id_fkey"
            columns: ["organisation_id"]
            isOneToOne: false
            referencedRelation: "upcoming_payouts_summary"
            referencedColumns: ["organisation_id"]
          },
        ]
      }
      enquiries: {
        Row: {
          camp_id: string
          created_at: string | null
          id: string
          message: string
          parent_email: string
          parent_id: string | null
          parent_name: string
          parent_phone: string | null
          responded_at: string | null
          responded_by: string | null
          response: string | null
          status: string
          subject: string
          updated_at: string | null
        }
        Insert: {
          camp_id: string
          created_at?: string | null
          id?: string
          message: string
          parent_email: string
          parent_id?: string | null
          parent_name: string
          parent_phone?: string | null
          responded_at?: string | null
          responded_by?: string | null
          response?: string | null
          status?: string
          subject: string
          updated_at?: string | null
        }
        Update: {
          camp_id?: string
          created_at?: string | null
          id?: string
          message?: string
          parent_email?: string
          parent_id?: string | null
          parent_name?: string
          parent_phone?: string | null
          responded_at?: string | null
          responded_by?: string | null
          response?: string | null
          status?: string
          subject?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "enquiries_camp_id_fkey"
            columns: ["camp_id"]
            isOneToOne: false
            referencedRelation: "camp_availability"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "enquiries_camp_id_fkey"
            columns: ["camp_id"]
            isOneToOne: false
            referencedRelation: "camps"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "enquiries_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "parents"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "enquiries_responded_by_fkey"
            columns: ["responded_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      feedback: {
        Row: {
          activities_rating: number | null
          booking_id: string | null
          camp_id: string | null
          child_id: string | null
          comments: string | null
          created_at: string | null
          facilities_rating: number | null
          featured: boolean
          helpful_count: number
          id: string
          overall_rating: number
          parent_email: string | null
          parent_id: string | null
          parent_location: string | null
          parent_name: string | null
          photos: Json | null
          response_date: string | null
          response_from_host: string | null
          staff_rating: number | null
          submitted_at: string | null
          testimonial_permission: boolean | null
          value_rating: number | null
          verified_booking: boolean
          visible: boolean
          would_recommend: boolean
        }
        Insert: {
          activities_rating?: number | null
          booking_id?: string | null
          camp_id?: string | null
          child_id?: string | null
          comments?: string | null
          created_at?: string | null
          facilities_rating?: number | null
          featured?: boolean
          helpful_count?: number
          id?: string
          overall_rating: number
          parent_email?: string | null
          parent_id?: string | null
          parent_location?: string | null
          parent_name?: string | null
          photos?: Json | null
          response_date?: string | null
          response_from_host?: string | null
          staff_rating?: number | null
          submitted_at?: string | null
          testimonial_permission?: boolean | null
          value_rating?: number | null
          verified_booking?: boolean
          visible?: boolean
          would_recommend: boolean
        }
        Update: {
          activities_rating?: number | null
          booking_id?: string | null
          camp_id?: string | null
          child_id?: string | null
          comments?: string | null
          created_at?: string | null
          facilities_rating?: number | null
          featured?: boolean
          helpful_count?: number
          id?: string
          overall_rating?: number
          parent_email?: string | null
          parent_id?: string | null
          parent_location?: string | null
          parent_name?: string | null
          photos?: Json | null
          response_date?: string | null
          response_from_host?: string | null
          staff_rating?: number | null
          submitted_at?: string | null
          testimonial_permission?: boolean | null
          value_rating?: number | null
          verified_booking?: boolean
          visible?: boolean
          would_recommend?: boolean
        }
        Relationships: [
          {
            foreignKeyName: "feedback_booking_id_fkey"
            columns: ["booking_id"]
            isOneToOne: true
            referencedRelation: "bookings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "feedback_camp_id_fkey"
            columns: ["camp_id"]
            isOneToOne: false
            referencedRelation: "camp_availability"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "feedback_camp_id_fkey"
            columns: ["camp_id"]
            isOneToOne: false
            referencedRelation: "camps"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "feedback_child_id_fkey"
            columns: ["child_id"]
            isOneToOne: false
            referencedRelation: "children"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "feedback_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "parents"
            referencedColumns: ["id"]
          },
        ]
      }
      incidents: {
        Row: {
          action_taken: string
          camp_id: string | null
          child_id: string | null
          created_at: string | null
          description: string
          follow_up_completed: boolean | null
          follow_up_notes: string | null
          follow_up_required: boolean | null
          id: string
          incident_date: string
          incident_type: string
          parent_notified: boolean | null
          parent_notified_at: string | null
          reported_by: string | null
          severity: string
          updated_at: string | null
        }
        Insert: {
          action_taken: string
          camp_id?: string | null
          child_id?: string | null
          created_at?: string | null
          description: string
          follow_up_completed?: boolean | null
          follow_up_notes?: string | null
          follow_up_required?: boolean | null
          id?: string
          incident_date: string
          incident_type: string
          parent_notified?: boolean | null
          parent_notified_at?: string | null
          reported_by?: string | null
          severity: string
          updated_at?: string | null
        }
        Update: {
          action_taken?: string
          camp_id?: string | null
          child_id?: string | null
          created_at?: string | null
          description?: string
          follow_up_completed?: boolean | null
          follow_up_notes?: string | null
          follow_up_required?: boolean | null
          id?: string
          incident_date?: string
          incident_type?: string
          parent_notified?: boolean | null
          parent_notified_at?: string | null
          reported_by?: string | null
          severity?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "incidents_camp_id_fkey"
            columns: ["camp_id"]
            isOneToOne: false
            referencedRelation: "camp_availability"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "incidents_camp_id_fkey"
            columns: ["camp_id"]
            isOneToOne: false
            referencedRelation: "camps"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "incidents_child_id_fkey"
            columns: ["child_id"]
            isOneToOne: false
            referencedRelation: "children"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "incidents_reported_by_fkey"
            columns: ["reported_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      organisation_members: {
        Row: {
          created_at: string | null
          id: string
          invited_at: string | null
          invited_by: string | null
          joined_at: string | null
          organisation_id: string
          permissions: Json | null
          profile_id: string
          role: string
          status: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          invited_at?: string | null
          invited_by?: string | null
          joined_at?: string | null
          organisation_id: string
          permissions?: Json | null
          profile_id: string
          role: string
          status?: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          invited_at?: string | null
          invited_by?: string | null
          joined_at?: string | null
          organisation_id?: string
          permissions?: Json | null
          profile_id?: string
          role?: string
          status?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "organisation_members_invited_by_fkey"
            columns: ["invited_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "organisation_members_organisation_id_fkey"
            columns: ["organisation_id"]
            isOneToOne: false
            referencedRelation: "commission_summary"
            referencedColumns: ["organisation_id"]
          },
          {
            foreignKeyName: "organisation_members_organisation_id_fkey"
            columns: ["organisation_id"]
            isOneToOne: false
            referencedRelation: "organisations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "organisation_members_organisation_id_fkey"
            columns: ["organisation_id"]
            isOneToOne: false
            referencedRelation: "upcoming_payouts_summary"
            referencedColumns: ["organisation_id"]
          },
          {
            foreignKeyName: "organisation_members_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      organisations: {
        Row: {
          about: string | null
          active: boolean | null
          address: Json | null
          approved_at: string | null
          approved_by: string | null
          bank_account_details: Json | null
          billing_contact_email: string | null
          billing_contact_name: string | null
          billing_contact_phone: string | null
          business_type: string | null
          company_registration_number: string | null
          contact_email: string
          contact_phone: string | null
          contract_end_date: string | null
          contract_start_date: string | null
          created_at: string | null
          established_year: number | null
          id: string
          identity_verification_status: string | null
          logo_url: string | null
          minimum_payout_amount: number | null
          name: string
          onboarding_completed_at: string | null
          onboarding_notes: string | null
          onboarding_status: string | null
          payout_enabled: boolean | null
          payout_schedule: string | null
          rejected_at: string | null
          rejected_by: string | null
          rejection_reason: string | null
          response_rate: number
          response_time_hours: number
          settings: Json | null
          slug: string
          stripe_account_id: string | null
          stripe_account_status: string | null
          tax_id: string | null
          timezone: string | null
          total_camps_hosted: number
          updated_at: string | null
          vat_number: string | null
          verified: boolean
          website: string | null
        }
        Insert: {
          about?: string | null
          active?: boolean | null
          address?: Json | null
          approved_at?: string | null
          approved_by?: string | null
          bank_account_details?: Json | null
          billing_contact_email?: string | null
          billing_contact_name?: string | null
          billing_contact_phone?: string | null
          business_type?: string | null
          company_registration_number?: string | null
          contact_email: string
          contact_phone?: string | null
          contract_end_date?: string | null
          contract_start_date?: string | null
          created_at?: string | null
          established_year?: number | null
          id?: string
          identity_verification_status?: string | null
          logo_url?: string | null
          minimum_payout_amount?: number | null
          name: string
          onboarding_completed_at?: string | null
          onboarding_notes?: string | null
          onboarding_status?: string | null
          payout_enabled?: boolean | null
          payout_schedule?: string | null
          rejected_at?: string | null
          rejected_by?: string | null
          rejection_reason?: string | null
          response_rate?: number
          response_time_hours?: number
          settings?: Json | null
          slug: string
          stripe_account_id?: string | null
          stripe_account_status?: string | null
          tax_id?: string | null
          timezone?: string | null
          total_camps_hosted?: number
          updated_at?: string | null
          vat_number?: string | null
          verified?: boolean
          website?: string | null
        }
        Update: {
          about?: string | null
          active?: boolean | null
          address?: Json | null
          approved_at?: string | null
          approved_by?: string | null
          bank_account_details?: Json | null
          billing_contact_email?: string | null
          billing_contact_name?: string | null
          billing_contact_phone?: string | null
          business_type?: string | null
          company_registration_number?: string | null
          contact_email?: string
          contact_phone?: string | null
          contract_end_date?: string | null
          contract_start_date?: string | null
          created_at?: string | null
          established_year?: number | null
          id?: string
          identity_verification_status?: string | null
          logo_url?: string | null
          minimum_payout_amount?: number | null
          name?: string
          onboarding_completed_at?: string | null
          onboarding_notes?: string | null
          onboarding_status?: string | null
          payout_enabled?: boolean | null
          payout_schedule?: string | null
          rejected_at?: string | null
          rejected_by?: string | null
          rejection_reason?: string | null
          response_rate?: number
          response_time_hours?: number
          settings?: Json | null
          slug?: string
          stripe_account_id?: string | null
          stripe_account_status?: string | null
          tax_id?: string | null
          timezone?: string | null
          total_camps_hosted?: number
          updated_at?: string | null
          vat_number?: string | null
          verified?: boolean
          website?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "organisations_approved_by_fkey"
            columns: ["approved_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "organisations_rejected_by_fkey"
            columns: ["rejected_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      parents: {
        Row: {
          address: Json | null
          created_at: string | null
          emergency_contact_name: string | null
          emergency_contact_phone: string | null
          emergency_contact_relationship: string | null
          guest_email: string | null
          guest_name: string | null
          guest_phone: string | null
          id: string
          is_guest: boolean | null
          notes: string | null
          profile_id: string | null
          updated_at: string | null
        }
        Insert: {
          address?: Json | null
          created_at?: string | null
          emergency_contact_name?: string | null
          emergency_contact_phone?: string | null
          emergency_contact_relationship?: string | null
          guest_email?: string | null
          guest_name?: string | null
          guest_phone?: string | null
          id?: string
          is_guest?: boolean | null
          notes?: string | null
          profile_id?: string | null
          updated_at?: string | null
        }
        Update: {
          address?: Json | null
          created_at?: string | null
          emergency_contact_name?: string | null
          emergency_contact_phone?: string | null
          emergency_contact_relationship?: string | null
          guest_email?: string | null
          guest_name?: string | null
          guest_phone?: string | null
          id?: string
          is_guest?: boolean | null
          notes?: string | null
          profile_id?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "parents_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      payment_records: {
        Row: {
          amount: number
          booking_id: string
          created_at: string
          currency: string
          id: string
          metadata: Json | null
          paid_at: string | null
          payment_method: string | null
          status: string
          stripe_checkout_session_id: string | null
          stripe_payment_intent_id: string | null
          updated_at: string
        }
        Insert: {
          amount: number
          booking_id: string
          created_at?: string
          currency?: string
          id?: string
          metadata?: Json | null
          paid_at?: string | null
          payment_method?: string | null
          status?: string
          stripe_checkout_session_id?: string | null
          stripe_payment_intent_id?: string | null
          updated_at?: string
        }
        Update: {
          amount?: number
          booking_id?: string
          created_at?: string
          currency?: string
          id?: string
          metadata?: Json | null
          paid_at?: string | null
          payment_method?: string | null
          status?: string
          stripe_checkout_session_id?: string | null
          stripe_payment_intent_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "payment_records_booking_id_fkey"
            columns: ["booking_id"]
            isOneToOne: false
            referencedRelation: "bookings"
            referencedColumns: ["id"]
          },
        ]
      }
      payouts: {
        Row: {
          amount: number
          bank_account_last4: string | null
          commission_amount: number
          commission_record_ids: string[]
          created_at: string | null
          created_by: string | null
          currency: string
          failed_at: string | null
          failure_reason: string | null
          id: string
          metadata: Json | null
          notes: string | null
          organisation_id: string
          paid_at: string | null
          period_end: string
          period_start: string
          platform_fee: number | null
          retry_count: number | null
          scheduled_for: string | null
          status: string
          stripe_payout_id: string | null
          stripe_transfer_id: string | null
          updated_at: string | null
          updated_by: string | null
        }
        Insert: {
          amount: number
          bank_account_last4?: string | null
          commission_amount: number
          commission_record_ids: string[]
          created_at?: string | null
          created_by?: string | null
          currency?: string
          failed_at?: string | null
          failure_reason?: string | null
          id?: string
          metadata?: Json | null
          notes?: string | null
          organisation_id: string
          paid_at?: string | null
          period_end: string
          period_start: string
          platform_fee?: number | null
          retry_count?: number | null
          scheduled_for?: string | null
          status?: string
          stripe_payout_id?: string | null
          stripe_transfer_id?: string | null
          updated_at?: string | null
          updated_by?: string | null
        }
        Update: {
          amount?: number
          bank_account_last4?: string | null
          commission_amount?: number
          commission_record_ids?: string[]
          created_at?: string | null
          created_by?: string | null
          currency?: string
          failed_at?: string | null
          failure_reason?: string | null
          id?: string
          metadata?: Json | null
          notes?: string | null
          organisation_id?: string
          paid_at?: string | null
          period_end?: string
          period_start?: string
          platform_fee?: number | null
          retry_count?: number | null
          scheduled_for?: string | null
          status?: string
          stripe_payout_id?: string | null
          stripe_transfer_id?: string | null
          updated_at?: string | null
          updated_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "payouts_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payouts_organisation_id_fkey"
            columns: ["organisation_id"]
            isOneToOne: false
            referencedRelation: "commission_summary"
            referencedColumns: ["organisation_id"]
          },
          {
            foreignKeyName: "payouts_organisation_id_fkey"
            columns: ["organisation_id"]
            isOneToOne: false
            referencedRelation: "organisations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payouts_organisation_id_fkey"
            columns: ["organisation_id"]
            isOneToOne: false
            referencedRelation: "upcoming_payouts_summary"
            referencedColumns: ["organisation_id"]
          },
          {
            foreignKeyName: "payouts_updated_by_fkey"
            columns: ["updated_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string | null
          first_name: string
          id: string
          last_name: string
          last_seen_at: string | null
          organisation_id: string | null
          phone: string | null
          preferences: Json | null
          role: string
          updated_at: string | null
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string | null
          first_name: string
          id: string
          last_name: string
          last_seen_at?: string | null
          organisation_id?: string | null
          phone?: string | null
          preferences?: Json | null
          role?: string
          updated_at?: string | null
        }
        Update: {
          avatar_url?: string | null
          created_at?: string | null
          first_name?: string
          id?: string
          last_name?: string
          last_seen_at?: string | null
          organisation_id?: string | null
          phone?: string | null
          preferences?: Json | null
          role?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "profiles_organisation_id_fkey"
            columns: ["organisation_id"]
            isOneToOne: false
            referencedRelation: "commission_summary"
            referencedColumns: ["organisation_id"]
          },
          {
            foreignKeyName: "profiles_organisation_id_fkey"
            columns: ["organisation_id"]
            isOneToOne: false
            referencedRelation: "organisations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "profiles_organisation_id_fkey"
            columns: ["organisation_id"]
            isOneToOne: false
            referencedRelation: "upcoming_payouts_summary"
            referencedColumns: ["organisation_id"]
          },
        ]
      }
      registration_forms: {
        Row: {
          booking_id: string
          child_id: string
          completed: boolean
          created_at: string
          form_data: Json | null
          id: string
          submitted_at: string | null
          updated_at: string
        }
        Insert: {
          booking_id: string
          child_id: string
          completed?: boolean
          created_at?: string
          form_data?: Json | null
          id?: string
          submitted_at?: string | null
          updated_at?: string
        }
        Update: {
          booking_id?: string
          child_id?: string
          completed?: boolean
          created_at?: string
          form_data?: Json | null
          id?: string
          submitted_at?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "registration_forms_booking_id_fkey"
            columns: ["booking_id"]
            isOneToOne: true
            referencedRelation: "bookings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "registration_forms_child_id_fkey"
            columns: ["child_id"]
            isOneToOne: false
            referencedRelation: "children"
            referencedColumns: ["id"]
          },
        ]
      }
      registrations: {
        Row: {
          activity_restrictions: string | null
          additional_notes: string | null
          booking_id: string
          camp_id: string
          check_in_by: string | null
          check_in_time: string | null
          check_out_by: string | null
          check_out_time: string | null
          checked_in: boolean | null
          checked_out: boolean | null
          child_id: string
          created_at: string | null
          created_by: string | null
          current_medications: string | null
          dietary_requirements: string | null
          doctor_name: string | null
          doctor_phone: string | null
          emergency_contact_name: string | null
          emergency_contact_phone: string | null
          emergency_contact_relationship: string | null
          field_trip_permission: boolean | null
          form_completed_at: string | null
          id: string
          media_release_permission: boolean | null
          medication_administration_instructions: string | null
          photo_permission: boolean | null
          pickup_authorized_persons: Json | null
          special_accommodations: string | null
          status: string | null
          t_shirt_size: string | null
          updated_at: string | null
          updated_by: string | null
          water_activities_permission: boolean | null
        }
        Insert: {
          activity_restrictions?: string | null
          additional_notes?: string | null
          booking_id: string
          camp_id: string
          check_in_by?: string | null
          check_in_time?: string | null
          check_out_by?: string | null
          check_out_time?: string | null
          checked_in?: boolean | null
          checked_out?: boolean | null
          child_id: string
          created_at?: string | null
          created_by?: string | null
          current_medications?: string | null
          dietary_requirements?: string | null
          doctor_name?: string | null
          doctor_phone?: string | null
          emergency_contact_name?: string | null
          emergency_contact_phone?: string | null
          emergency_contact_relationship?: string | null
          field_trip_permission?: boolean | null
          form_completed_at?: string | null
          id?: string
          media_release_permission?: boolean | null
          medication_administration_instructions?: string | null
          photo_permission?: boolean | null
          pickup_authorized_persons?: Json | null
          special_accommodations?: string | null
          status?: string | null
          t_shirt_size?: string | null
          updated_at?: string | null
          updated_by?: string | null
          water_activities_permission?: boolean | null
        }
        Update: {
          activity_restrictions?: string | null
          additional_notes?: string | null
          booking_id?: string
          camp_id?: string
          check_in_by?: string | null
          check_in_time?: string | null
          check_out_by?: string | null
          check_out_time?: string | null
          checked_in?: boolean | null
          checked_out?: boolean | null
          child_id?: string
          created_at?: string | null
          created_by?: string | null
          current_medications?: string | null
          dietary_requirements?: string | null
          doctor_name?: string | null
          doctor_phone?: string | null
          emergency_contact_name?: string | null
          emergency_contact_phone?: string | null
          emergency_contact_relationship?: string | null
          field_trip_permission?: boolean | null
          form_completed_at?: string | null
          id?: string
          media_release_permission?: boolean | null
          medication_administration_instructions?: string | null
          photo_permission?: boolean | null
          pickup_authorized_persons?: Json | null
          special_accommodations?: string | null
          status?: string | null
          t_shirt_size?: string | null
          updated_at?: string | null
          updated_by?: string | null
          water_activities_permission?: boolean | null
        }
        Relationships: [
          {
            foreignKeyName: "registrations_booking_id_fkey"
            columns: ["booking_id"]
            isOneToOne: false
            referencedRelation: "bookings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "registrations_camp_id_fkey"
            columns: ["camp_id"]
            isOneToOne: false
            referencedRelation: "camp_availability"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "registrations_camp_id_fkey"
            columns: ["camp_id"]
            isOneToOne: false
            referencedRelation: "camps"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "registrations_check_in_by_fkey"
            columns: ["check_in_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "registrations_check_out_by_fkey"
            columns: ["check_out_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "registrations_child_id_fkey"
            columns: ["child_id"]
            isOneToOne: false
            referencedRelation: "children"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "registrations_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "registrations_updated_by_fkey"
            columns: ["updated_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      role_assignment_history: {
        Row: {
          assigned_by: string | null
          created_at: string | null
          id: string
          new_role: string
          old_role: string | null
          reason: string | null
          user_id: string | null
        }
        Insert: {
          assigned_by?: string | null
          created_at?: string | null
          id?: string
          new_role: string
          old_role?: string | null
          reason?: string | null
          user_id?: string | null
        }
        Update: {
          assigned_by?: string | null
          created_at?: string | null
          id?: string
          new_role?: string
          old_role?: string | null
          reason?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "role_assignment_history_assigned_by_fkey"
            columns: ["assigned_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "role_assignment_history_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      roles: {
        Row: {
          created_at: string | null
          description: string
          display_name: string
          id: string
          is_system_role: boolean | null
          level: number
          name: string
          permissions: Json | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          description: string
          display_name: string
          id?: string
          is_system_role?: boolean | null
          level?: number
          name: string
          permissions?: Json | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string
          display_name?: string
          id?: string
          is_system_role?: boolean | null
          level?: number
          name?: string
          permissions?: Json | null
          updated_at?: string | null
        }
        Relationships: []
      }
      site_settings: {
        Row: {
          created_at: string | null
          description: string | null
          id: string
          key: string
          updated_at: string | null
          updated_by: string | null
          value: Json | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: string
          key: string
          updated_at?: string | null
          updated_by?: string | null
          value?: Json | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: string
          key?: string
          updated_at?: string | null
          updated_by?: string | null
          value?: Json | null
        }
        Relationships: []
      }
    }
    Views: {
      camp_availability: {
        Row: {
          availability_status: string | null
          available_places: number | null
          capacity: number | null
          confirmed_count: number | null
          enrolled_count: number | null
          id: string | null
          name: string | null
          pending_count: number | null
          waitlist_count: number | null
        }
        Relationships: []
      }
      commission_summary: {
        Row: {
          disputed_commission: number | null
          organisation_id: string | null
          organisation_name: string | null
          paid_commission: number | null
          pending_commission: number | null
          total_commission: number | null
          total_transactions: number | null
        }
        Relationships: []
      }
      upcoming_payouts_summary: {
        Row: {
          minimum_payout_amount: number | null
          next_payout_date: string | null
          oldest_pending_commission: string | null
          organisation_id: string | null
          organisation_name: string | null
          payout_schedule: string | null
          pending_commission_total: number | null
          pending_commissions_count: number | null
          ready_for_payout: boolean | null
          total_bookings_value: number | null
        }
        Relationships: []
      }
    }
    Functions: {
      archive_old_audit_logs: {
        Args: { p_days_to_keep?: number }
        Returns: number
      }
      calculate_commission: {
        Args: { p_registration_id: string }
        Returns: undefined
      }
      calculate_next_payout: {
        Args: { org_id: string }
        Returns: {
          amount: number
          commission_count: number
          commission_ids: string[]
          ready: boolean
        }[]
      }
      can_assign_role: { Args: { p_target_role: string }; Returns: boolean }
      can_edit_camp: { Args: { camp_id: string }; Returns: boolean }
      can_review_camps: { Args: never; Returns: boolean }
      create_payout: {
        Args: {
          p_organisation_id: string
          p_period_end: string
          p_period_start: string
        }
        Returns: string
      }
      expire_old_invites: { Args: never; Returns: number }
      get_all_users_with_emails: {
        Args: never
        Returns: {
          created_at: string
          email: string
          first_name: string
          id: string
          last_name: string
          last_seen_at: string
          organisation_id: string
          role: string
        }[]
      }
      get_audit_history: {
        Args: { p_limit?: number; p_record_id: string; p_table_name: string }
        Returns: {
          action: string
          changed_by: string
          changed_by_email: string
          changed_by_role: string
          changed_fields: string[]
          created_at: string
          id: string
          new_values: Json
          old_values: Json
        }[]
      }
      get_booking_registration_completion: {
        Args: { p_booking_id: string }
        Returns: number
      }
      get_camp_category_names: {
        Args: { camp_uuid: string }
        Returns: string[]
      }
      get_camp_commission_rate: {
        Args: { p_camp_id: string; p_date?: string }
        Returns: number
      }
      get_camps_by_category: {
        Args: { category_slug: string }
        Returns: {
          age_max: number
          age_min: number
          amenities: Json | null
          auto_publish: boolean | null
          cancellation_policy: string | null
          capacity: number
          category: string | null
          changes_requested: string | null
          commission_rate: number | null
          created_at: string | null
          created_by: string | null
          currency: string | null
          daily_schedule: Json | null
          description: string | null
          early_bird_deadline: string | null
          early_bird_price: number | null
          end_date: string
          enquiries_enabled: boolean | null
          enrolled_count: number | null
          faqs: Json | null
          featured: boolean | null
          featured_image_url: string | null
          gallery_urls: Json | null
          grade_max: string | null
          grade_min: string | null
          highlights: Json | null
          id: string
          image_metadata: Json | null
          included_in_price: Json | null
          insurance_info: string | null
          location: string
          name: string
          not_included_in_price: Json | null
          organisation_id: string | null
          payment_link: string | null
          price: number
          published_at: string | null
          refund_policy: string | null
          rejection_reason: string | null
          requirements: string | null
          review_notes: string | null
          reviewed_at: string | null
          reviewed_by: string | null
          safety_protocols: string | null
          schedule: Json | null
          slug: string
          staff_credentials: Json | null
          start_date: string
          status: string
          submitted_for_review_at: string | null
          updated_at: string | null
          video_metadata: Json | null
          video_url: string | null
          video_urls: Json | null
          what_to_bring: string | null
        }[]
        SetofOptions: {
          from: "*"
          to: "camps"
          isOneToOne: false
          isSetofReturn: true
        }
      }
      get_category_stats: {
        Args: never
        Returns: {
          category_id: string
          category_name: string
          category_slug: string
          published_camps: number
          total_camps: number
          upcoming_camps: number
        }[]
      }
      get_organisation_audit_logs: {
        Args: { p_limit?: number; p_organisation_id: string }
        Returns: {
          action: string
          changed_by: string
          changed_by_role: string
          changed_fields: string[]
          created_at: string
          id: string
          record_id: string
          table_name: string
        }[]
      }
      get_organisation_from_invite: {
        Args: { p_token: string }
        Returns: string
      }
      get_organisation_role: { Args: { org_id: string }; Returns: string }
      get_role_details: {
        Args: { p_role_name: string }
        Returns: {
          description: string
          display_name: string
          id: string
          level: number
          name: string
          permissions: Json
        }[]
      }
      get_user_organisation_ids: {
        Args: never
        Returns: {
          organisation_id: string
        }[]
      }
      get_user_school_id: { Args: never; Returns: string }
      get_users_by_role: {
        Args: { p_role: string }
        Returns: {
          created_at: string
          email: string
          first_name: string
          id: string
          last_name: string
          role: string
        }[]
      }
      get_users_by_role_with_emails: {
        Args: { p_role: string }
        Returns: {
          created_at: string
          email: string
          first_name: string
          id: string
          last_name: string
          last_seen_at: string
          organisation_id: string
          role: string
        }[]
      }
      is_booking_fully_registered: {
        Args: { p_booking_id: string }
        Returns: boolean
      }
      is_camp_organizer: { Args: never; Returns: boolean }
      is_organisation_admin: { Args: { org_id: string }; Returns: boolean }
      is_organisation_member: { Args: { org_id: string }; Returns: boolean }
      is_school_staff: { Args: never; Returns: boolean }
      is_super_admin: { Args: never; Returns: boolean }
      mark_commission_paid: {
        Args: {
          p_commission_record_id: string
          p_paid_date?: string
          p_payment_reference: string
        }
        Returns: undefined
      }
      mark_invite_accepted: {
        Args: { p_profile_id: string; p_token: string }
        Returns: boolean
      }
      set_camp_commission_rate: {
        Args: {
          p_camp_id: string
          p_effective_date?: string
          p_notes?: string
          p_rate: number
        }
        Returns: string
      }
      update_user_role: {
        Args: { p_new_role: string; p_reason?: string; p_user_id: string }
        Returns: boolean
      }
      user_has_role: { Args: { check_role: string }; Returns: boolean }
      validate_invite_token: {
        Args: { p_token: string }
        Returns: {
          email: string
          error_message: string
          invite_id: string
          invited_by_id: string
          invited_by_name: string
          is_valid: boolean
          organisation_id: string
          organisation_name: string
        }[]
      }
    }
    Enums: {
      [_ in never]: never
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
  graphql_public: {
    Enums: {},
  },
  public: {
    Enums: {},
  },
} as const
