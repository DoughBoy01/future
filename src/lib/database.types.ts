export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      schools: {
        Row: {
          id: string
          name: string
          slug: string
          logo_url: string | null
          website: string | null
          contact_email: string
          contact_phone: string | null
          address: Json
          settings: Json
          timezone: string
          active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          slug: string
          logo_url?: string | null
          website?: string | null
          contact_email: string
          contact_phone?: string | null
          address?: Json
          settings?: Json
          timezone?: string
          active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          slug?: string
          logo_url?: string | null
          website?: string | null
          contact_email?: string
          contact_phone?: string | null
          address?: Json
          settings?: Json
          timezone?: string
          active?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      profiles: {
        Row: {
          id: string
          organisation_id: string | null
          role: 'parent' | 'school_admin' | 'marketing' | 'operations' | 'risk' | 'super_admin'
          first_name: string
          last_name: string
          phone: string | null
          avatar_url: string | null
          preferences: Json
          last_seen_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          organisation_id?: string | null
          role?: 'parent' | 'school_admin' | 'marketing' | 'operations' | 'risk' | 'super_admin'
          first_name: string
          last_name: string
          phone?: string | null
          avatar_url?: string | null
          preferences?: Json
          last_seen_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          organisation_id?: string | null
          role?: 'parent' | 'school_admin' | 'marketing' | 'operations' | 'risk' | 'super_admin'
          first_name?: string
          last_name?: string
          phone?: string | null
          avatar_url?: string | null
          preferences?: Json
          last_seen_at?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      parents: {
        Row: {
          id: string
          profile_id: string
          emergency_contact_name: string | null
          emergency_contact_phone: string | null
          emergency_contact_relationship: string | null
          address: Json
          notes: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          profile_id: string
          emergency_contact_name?: string | null
          emergency_contact_phone?: string | null
          emergency_contact_relationship?: string | null
          address?: Json
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          profile_id?: string
          emergency_contact_name?: string | null
          emergency_contact_phone?: string | null
          emergency_contact_relationship?: string | null
          address?: Json
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      children: {
        Row: {
          id: string
          parent_id: string
          first_name: string
          last_name: string
          date_of_birth: string
          gender: string | null
          grade: string | null
          school_id: string | null
          photo_url: string | null
          medical_conditions: string | null
          allergies: string | null
          medications: string | null
          dietary_restrictions: string | null
          special_needs: string | null
          notes: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          parent_id: string
          first_name: string
          last_name: string
          date_of_birth: string
          gender?: string | null
          grade?: string | null
          school_id?: string | null
          photo_url?: string | null
          medical_conditions?: string | null
          allergies?: string | null
          medications?: string | null
          dietary_restrictions?: string | null
          special_needs?: string | null
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          parent_id?: string
          first_name?: string
          last_name?: string
          date_of_birth?: string
          gender?: string | null
          grade?: string | null
          school_id?: string | null
          photo_url?: string | null
          medical_conditions?: string | null
          allergies?: string | null
          medications?: string | null
          dietary_restrictions?: string | null
          special_needs?: string | null
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      camps: {
        Row: {
          id: string
          organisation_id: string
          name: string
          slug: string
          description: string | null
          category: 'sports' | 'arts' | 'stem' | 'language' | 'adventure' | 'general' | 'academic' | 'creative'
          age_min: number
          age_max: number
          grade_min: string | null
          grade_max: string | null
          start_date: string
          end_date: string
          schedule: Json
          capacity: number
          price: number
          currency: string
          early_bird_price: number | null
          early_bird_deadline: string | null
          payment_link: string | null
          enquiries_enabled: boolean
          enrolled_count: number
          featured_image_url: string | null
          video_url: string | null
          video_urls: Json
          video_metadata: Json
          gallery_urls: Json
          image_metadata: Json
          location: string
          what_to_bring: string | null
          requirements: string | null
          highlights: Json | null
          amenities: Json | null
          faqs: Json | null
          cancellation_policy: string | null
          refund_policy: string | null
          safety_protocols: string | null
          insurance_info: string | null
          staff_credentials: Json | null
          daily_schedule: Json | null
          included_in_price: Json | null
          not_included_in_price: Json | null
          status: 'draft' | 'published' | 'full' | 'cancelled' | 'completed'
          featured: boolean
          published_at: string | null
          created_by: string | null
          commission_rate: number | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          organisation_id: string
          name: string
          slug: string
          description?: string | null
          category?: 'sports' | 'arts' | 'stem' | 'language' | 'adventure' | 'general' | 'academic' | 'creative'
          age_min: number
          age_max: number
          grade_min?: string | null
          grade_max?: string | null
          start_date: string
          end_date: string
          schedule?: Json
          capacity?: number
          price: number
          currency?: string
          early_bird_price?: number | null
          early_bird_deadline?: string | null
          payment_link?: string | null
          enquiries_enabled?: boolean
          enrolled_count?: number
          featured_image_url?: string | null
          video_url?: string | null
          video_urls?: Json
          video_metadata?: Json
          gallery_urls?: Json
          image_metadata?: Json
          location: string
          what_to_bring?: string | null
          requirements?: string | null
          highlights?: Json | null
          amenities?: Json | null
          faqs?: Json | null
          cancellation_policy?: string | null
          refund_policy?: string | null
          safety_protocols?: string | null
          insurance_info?: string | null
          staff_credentials?: Json | null
          daily_schedule?: Json | null
          included_in_price?: Json | null
          not_included_in_price?: Json | null
          status?: 'draft' | 'published' | 'full' | 'cancelled' | 'completed'
          featured?: boolean
          published_at?: string | null
          created_by?: string | null
          commission_rate?: number | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          organisation_id?: string
          name?: string
          slug?: string
          description?: string | null
          category?: 'sports' | 'arts' | 'stem' | 'language' | 'adventure' | 'general' | 'academic' | 'creative'
          age_min?: number
          age_max?: number
          grade_min?: string | null
          grade_max?: string | null
          start_date?: string
          end_date?: string
          schedule?: Json
          capacity?: number
          price?: number
          currency?: string
          early_bird_price?: number | null
          early_bird_deadline?: string | null
          payment_link?: string | null
          enquiries_enabled?: boolean
          enrolled_count?: number
          featured_image_url?: string | null
          video_url?: string | null
          video_urls?: Json
          video_metadata?: Json
          gallery_urls?: Json
          image_metadata?: Json
          location?: string
          what_to_bring?: string | null
          requirements?: string | null
          highlights?: Json | null
          amenities?: Json | null
          faqs?: Json | null
          cancellation_policy?: string | null
          refund_policy?: string | null
          safety_protocols?: string | null
          insurance_info?: string | null
          staff_credentials?: Json | null
          daily_schedule?: Json | null
          included_in_price?: Json | null
          not_included_in_price?: Json | null
          status?: 'draft' | 'published' | 'full' | 'cancelled' | 'completed'
          featured?: boolean
          published_at?: string | null
          created_by?: string | null
          commission_rate?: number | null
          created_at?: string
          updated_at?: string
        }
      }
      enquiries: {
        Row: {
          id: string
          camp_id: string
          parent_id: string | null
          parent_name: string
          parent_email: string
          parent_phone: string | null
          subject: string
          message: string
          status: 'new' | 'in_progress' | 'resolved'
          response: string | null
          responded_by: string | null
          responded_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          camp_id: string
          parent_id?: string | null
          parent_name: string
          parent_email: string
          parent_phone?: string | null
          subject: string
          message: string
          status?: 'new' | 'in_progress' | 'resolved'
          response?: string | null
          responded_by?: string | null
          responded_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          camp_id?: string
          parent_id?: string | null
          parent_name?: string
          parent_email?: string
          parent_phone?: string | null
          subject?: string
          message?: string
          status?: 'new' | 'in_progress' | 'resolved'
          response?: string | null
          responded_by?: string | null
          responded_at?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      registrations: {
        Row: {
          id: string
          camp_id: string
          child_id: string
          parent_id: string
          status: 'pending' | 'confirmed' | 'waitlisted' | 'cancelled' | 'completed'
          payment_status: 'unpaid' | 'partial' | 'paid' | 'refunded'
          amount_paid: number
          amount_due: number
          registration_date: string
          confirmation_date: string | null
          cancellation_date: string | null
          cancellation_reason: string | null
          discount_code: string | null
          discount_amount: number
          notes: string | null
          forms_submitted: boolean
          photo_permission: boolean
          stripe_checkout_session_id: string | null
          form_completed: boolean
          form_completed_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          camp_id: string
          child_id: string
          parent_id: string
          status?: 'pending' | 'confirmed' | 'waitlisted' | 'cancelled' | 'completed'
          payment_status?: 'unpaid' | 'partial' | 'paid' | 'refunded'
          amount_paid?: number
          amount_due: number
          registration_date?: string
          confirmation_date?: string | null
          cancellation_date?: string | null
          cancellation_reason?: string | null
          discount_code?: string | null
          discount_amount?: number
          notes?: string | null
          forms_submitted?: boolean
          photo_permission?: boolean
          stripe_checkout_session_id?: string | null
          form_completed?: boolean
          form_completed_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          camp_id?: string
          child_id?: string
          parent_id?: string
          status?: 'pending' | 'confirmed' | 'waitlisted' | 'cancelled' | 'completed'
          payment_status?: 'unpaid' | 'partial' | 'paid' | 'refunded'
          amount_paid?: number
          amount_due?: number
          registration_date?: string
          confirmation_date?: string | null
          cancellation_date?: string | null
          cancellation_reason?: string | null
          discount_code?: string | null
          discount_amount?: number
          notes?: string | null
          forms_submitted?: boolean
          photo_permission?: boolean
          stripe_checkout_session_id?: string | null
          form_completed?: boolean
          form_completed_at?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      payment_records: {
        Row: {
          id: string
          registration_id: string
          stripe_payment_intent_id: string | null
          stripe_checkout_session_id: string | null
          amount: number
          currency: string
          status: string
          payment_method: string | null
          metadata: Json
          paid_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          registration_id: string
          stripe_payment_intent_id?: string | null
          stripe_checkout_session_id?: string | null
          amount: number
          currency?: string
          status?: string
          payment_method?: string | null
          metadata?: Json
          paid_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          registration_id?: string
          stripe_payment_intent_id?: string | null
          stripe_checkout_session_id?: string | null
          amount?: number
          currency?: string
          status?: string
          payment_method?: string | null
          metadata?: Json
          paid_at?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      registration_forms: {
        Row: {
          id: string
          registration_id: string
          child_id: string
          completed: boolean
          submitted_at: string | null
          form_data: Json
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          registration_id: string
          child_id: string
          completed?: boolean
          submitted_at?: string | null
          form_data?: Json
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          registration_id?: string
          child_id?: string
          completed?: boolean
          submitted_at?: string | null
          form_data?: Json
          created_at?: string
          updated_at?: string
        }
      }
      attendance: {
        Row: {
          id: string
          registration_id: string
          camp_id: string
          child_id: string
          date: string
          check_in_time: string | null
          check_out_time: string | null
          checked_in_by: string | null
          checked_out_by: string | null
          status: 'present' | 'absent' | 'late' | 'early_pickup'
          notes: string | null
          created_at: string
        }
        Insert: {
          id?: string
          registration_id: string
          camp_id: string
          child_id: string
          date: string
          check_in_time?: string | null
          check_out_time?: string | null
          checked_in_by?: string | null
          checked_out_by?: string | null
          status?: 'present' | 'absent' | 'late' | 'early_pickup'
          notes?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          registration_id?: string
          camp_id?: string
          child_id?: string
          date?: string
          check_in_time?: string | null
          check_out_time?: string | null
          checked_in_by?: string | null
          checked_out_by?: string | null
          status?: 'present' | 'absent' | 'late' | 'early_pickup'
          notes?: string | null
          created_at?: string
        }
      }
      communications: {
        Row: {
          id: string
          school_id: string
          type: 'email' | 'sms' | 'notification' | 'announcement'
          subject: string | null
          body: string
          recipient_type: 'all_parents' | 'camp_specific' | 'individual'
          recipient_ids: Json
          camp_id: string | null
          sent_by: string | null
          sent_at: string | null
          status: 'draft' | 'scheduled' | 'sent' | 'failed'
          scheduled_for: string | null
          metadata: Json
          created_at: string
        }
        Insert: {
          id?: string
          school_id: string
          type: 'email' | 'sms' | 'notification' | 'announcement'
          subject?: string | null
          body: string
          recipient_type: 'all_parents' | 'camp_specific' | 'individual'
          recipient_ids?: Json
          camp_id?: string | null
          sent_by?: string | null
          sent_at?: string | null
          status?: 'draft' | 'scheduled' | 'sent' | 'failed'
          scheduled_for?: string | null
          metadata?: Json
          created_at?: string
        }
        Update: {
          id?: string
          school_id?: string
          type?: 'email' | 'sms' | 'notification' | 'announcement'
          subject?: string | null
          body?: string
          recipient_type?: 'all_parents' | 'camp_specific' | 'individual'
          recipient_ids?: Json
          camp_id?: string | null
          sent_by?: string | null
          sent_at?: string | null
          status?: 'draft' | 'scheduled' | 'sent' | 'failed'
          scheduled_for?: string | null
          metadata?: Json
          created_at?: string
        }
      }
      feedback: {
        Row: {
          id: string
          camp_id: string
          parent_id: string
          child_id: string
          registration_id: string
          overall_rating: number
          staff_rating: number | null
          activities_rating: number | null
          facilities_rating: number | null
          value_rating: number | null
          comments: string | null
          would_recommend: boolean
          testimonial_permission: boolean
          photos: Json | null
          helpful_count: number
          verified_booking: boolean
          parent_location: string | null
          response_from_host: string | null
          response_date: string | null
          submitted_at: string
          created_at: string
        }
        Insert: {
          id?: string
          camp_id: string
          parent_id: string
          child_id: string
          registration_id: string
          overall_rating: number
          staff_rating?: number | null
          activities_rating?: number | null
          facilities_rating?: number | null
          value_rating?: number | null
          comments?: string | null
          would_recommend: boolean
          testimonial_permission?: boolean
          submitted_at?: string
          created_at?: string
        }
        Update: {
          id?: string
          camp_id?: string
          parent_id?: string
          child_id?: string
          registration_id?: string
          overall_rating?: number
          staff_rating?: number | null
          activities_rating?: number | null
          facilities_rating?: number | null
          value_rating?: number | null
          comments?: string | null
          would_recommend?: boolean
          testimonial_permission?: boolean
          submitted_at?: string
          created_at?: string
        }
      }
      incidents: {
        Row: {
          id: string
          camp_id: string
          child_id: string | null
          incident_type: 'injury' | 'behavioral' | 'medical' | 'other'
          severity: 'low' | 'medium' | 'high' | 'critical'
          description: string
          action_taken: string
          incident_date: string
          parent_notified: boolean
          parent_notified_at: string | null
          reported_by: string | null
          follow_up_required: boolean
          follow_up_completed: boolean
          follow_up_notes: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          camp_id: string
          child_id?: string | null
          incident_type: 'injury' | 'behavioral' | 'medical' | 'other'
          severity: 'low' | 'medium' | 'high' | 'critical'
          description: string
          action_taken: string
          incident_date: string
          parent_notified?: boolean
          parent_notified_at?: string | null
          reported_by?: string | null
          follow_up_required?: boolean
          follow_up_completed?: boolean
          follow_up_notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          camp_id?: string
          child_id?: string | null
          incident_type?: 'injury' | 'behavioral' | 'medical' | 'other'
          severity?: 'low' | 'medium' | 'high' | 'critical'
          description?: string
          action_taken?: string
          incident_date?: string
          parent_notified?: boolean
          parent_notified_at?: string | null
          reported_by?: string | null
          follow_up_required?: boolean
          follow_up_completed?: boolean
          follow_up_notes?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      discount_codes: {
        Row: {
          id: string
          school_id: string
          code: string
          description: string | null
          discount_type: 'percentage' | 'fixed_amount'
          discount_value: number
          min_purchase: number | null
          max_uses: number | null
          uses_count: number
          valid_from: string
          valid_until: string
          active: boolean
          applicable_camps: Json | null
          created_by: string | null
          created_at: string
        }
        Insert: {
          id?: string
          school_id: string
          code: string
          description?: string | null
          discount_type: 'percentage' | 'fixed_amount'
          discount_value: number
          min_purchase?: number | null
          max_uses?: number | null
          uses_count?: number
          valid_from: string
          valid_until: string
          active?: boolean
          applicable_camps?: Json | null
          created_by?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          school_id?: string
          code?: string
          description?: string | null
          discount_type?: 'percentage' | 'fixed_amount'
          discount_value?: number
          min_purchase?: number | null
          max_uses?: number | null
          uses_count?: number
          valid_from?: string
          valid_until?: string
          active?: boolean
          applicable_camps?: Json | null
          created_by?: string | null
          created_at?: string
        }
      }
      organisations: {
        Row: {
          id: string
          name: string
          slug: string
          logo_url: string | null
          website: string | null
          contact_email: string
          contact_phone: string | null
          address: Json
          settings: Json
          timezone: string
          active: boolean
          about: string | null
          verified: boolean
          response_rate: number
          response_time_hours: number
          total_camps_hosted: number
          established_year: number | null
          created_at: string
          updated_at: string
          billing_contact_name: string | null
          billing_contact_email: string | null
          billing_contact_phone: string | null
          bank_account_details: Json
          tax_id: string | null
          contract_start_date: string | null
          contract_end_date: string | null
        }
        Insert: {
          id?: string
          name: string
          slug: string
          logo_url?: string | null
          website?: string | null
          contact_email: string
          contact_phone?: string | null
          address?: Json
          settings?: Json
          timezone?: string
          active?: boolean
          about?: string | null
          verified?: boolean
          response_rate?: number
          response_time_hours?: number
          total_camps_hosted?: number
          established_year?: number | null
          created_at?: string
          updated_at?: string
          billing_contact_name?: string | null
          billing_contact_email?: string | null
          billing_contact_phone?: string | null
          bank_account_details?: Json
          tax_id?: string | null
          contract_start_date?: string | null
          contract_end_date?: string | null
        }
        Update: {
          id?: string
          name?: string
          slug?: string
          logo_url?: string | null
          website?: string | null
          contact_email?: string
          contact_phone?: string | null
          address?: Json
          settings?: Json
          timezone?: string
          active?: boolean
          about?: string | null
          verified?: boolean
          response_rate?: number
          response_time_hours?: number
          total_camps_hosted?: number
          established_year?: number | null
          created_at?: string
          updated_at?: string
          billing_contact_name?: string | null
          billing_contact_email?: string | null
          billing_contact_phone?: string | null
          bank_account_details?: Json
          tax_id?: string | null
          contract_start_date?: string | null
          contract_end_date?: string | null
        }
      }
      commission_records: {
        Row: {
          id: string
          organisation_id: string
          camp_id: string
          registration_id: string
          commission_rate: number
          registration_amount: number
          commission_amount: number
          payment_status: string
          payment_reference: string | null
          paid_date: string | null
          notes: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          organisation_id: string
          camp_id: string
          registration_id: string
          commission_rate: number
          registration_amount: number
          commission_amount: number
          payment_status?: string
          payment_reference?: string | null
          paid_date?: string | null
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          organisation_id?: string
          camp_id?: string
          registration_id?: string
          commission_rate?: number
          registration_amount?: number
          commission_amount?: number
          payment_status?: string
          payment_reference?: string | null
          paid_date?: string | null
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      camp_commission_rates: {
        Row: {
          id: string
          camp_id: string
          commission_rate: number
          effective_date: string
          end_date: string | null
          set_by: string | null
          notes: string | null
          created_at: string
        }
        Insert: {
          id?: string
          camp_id: string
          commission_rate: number
          effective_date: string
          end_date?: string | null
          set_by?: string | null
          notes?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          camp_id?: string
          commission_rate?: number
          effective_date?: string
          end_date?: string | null
          set_by?: string | null
          notes?: string | null
          created_at?: string
        }
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
  }
}
