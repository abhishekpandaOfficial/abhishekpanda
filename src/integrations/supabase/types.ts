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
      activity_log: {
        Row: {
          action: string
          created_at: string
          id: string
          module: string
          new_values: Json | null
          old_values: Json | null
          record_id: string
          user_id: string
        }
        Insert: {
          action: string
          created_at?: string
          id?: string
          module: string
          new_values?: Json | null
          old_values?: Json | null
          record_id: string
          user_id: string
        }
        Update: {
          action?: string
          created_at?: string
          id?: string
          module?: string
          new_values?: Json | null
          old_values?: Json | null
          record_id?: string
          user_id?: string
        }
        Relationships: []
      }
      admin_mfa_sessions: {
        Row: {
          expires_at: string
          fully_verified_at: string | null
          otp_verified_at: string | null
          updated_at: string
          user_id: string
          webauthn_step4_verified_at: string | null
          webauthn_step5_verified_at: string | null
        }
        Insert: {
          expires_at: string
          fully_verified_at?: string | null
          otp_verified_at?: string | null
          updated_at?: string
          user_id: string
          webauthn_step4_verified_at?: string | null
          webauthn_step5_verified_at?: string | null
        }
        Update: {
          expires_at?: string
          fully_verified_at?: string | null
          otp_verified_at?: string | null
          updated_at?: string
          user_id?: string
          webauthn_step4_verified_at?: string | null
          webauthn_step5_verified_at?: string | null
        }
        Relationships: []
      }
      admin_otp_codes: {
        Row: {
          created_at: string | null
          expires_at: string
          id: string
          otp_code: string
          used: boolean | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          expires_at: string
          id?: string
          otp_code: string
          used?: boolean | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          expires_at?: string
          id?: string
          otp_code?: string
          used?: boolean | null
          user_id?: string
        }
        Relationships: []
      }
      admin_sessions: {
        Row: {
          browser: string
          created_at: string
          device_name: string
          device_type: string
          expires_at: string
          id: string
          ip_address: string | null
          is_active: boolean
          last_active_at: string
          location: string | null
          session_token: string
          user_agent: string | null
          user_id: string
        }
        Insert: {
          browser: string
          created_at?: string
          device_name: string
          device_type: string
          expires_at?: string
          id?: string
          ip_address?: string | null
          is_active?: boolean
          last_active_at?: string
          location?: string | null
          session_token: string
          user_agent?: string | null
          user_id: string
        }
        Update: {
          browser?: string
          created_at?: string
          device_name?: string
          device_type?: string
          expires_at?: string
          id?: string
          ip_address?: string | null
          is_active?: boolean
          last_active_at?: string
          location?: string | null
          session_token?: string
          user_agent?: string | null
          user_id?: string
        }
        Relationships: []
      }
      admin_settings: {
        Row: {
          created_at: string
          haptic_enabled: boolean
          id: string
          inactivity_timeout: number
          sound_enabled: boolean
          updated_at: string
          user_id: string
          volume: number
        }
        Insert: {
          created_at?: string
          haptic_enabled?: boolean
          id?: string
          inactivity_timeout?: number
          sound_enabled?: boolean
          updated_at?: string
          user_id: string
          volume?: number
        }
        Update: {
          created_at?: string
          haptic_enabled?: boolean
          id?: string
          inactivity_timeout?: number
          sound_enabled?: boolean
          updated_at?: string
          user_id?: string
          volume?: number
        }
        Relationships: []
      }
      blog_posts: {
        Row: {
          author_id: string | null
          code_theme: string | null
          color: string | null
          content: string | null
          created_at: string
          excerpt: string | null
          hero_image: string | null
          id: string
          is_locked: boolean | null
          is_premium: boolean | null
          is_published: boolean | null
          level: string | null
          meta_description: string | null
          meta_title: string | null
          original_published_at: string | null
          published_at: string | null
          section_id: string | null
          slug: string
          sort_order: number | null
          tags: string[] | null
          title: string
          updated_at: string
          views: number | null
        }
        Insert: {
          author_id?: string | null
          code_theme?: string | null
          color?: string | null
          content?: string | null
          created_at?: string
          excerpt?: string | null
          hero_image?: string | null
          id?: string
          is_locked?: boolean | null
          is_premium?: boolean | null
          is_published?: boolean | null
          level?: string | null
          meta_description?: string | null
          meta_title?: string | null
          original_published_at?: string | null
          published_at?: string | null
          section_id?: string | null
          slug: string
          sort_order?: number | null
          tags?: string[] | null
          title: string
          updated_at?: string
          views?: number | null
        }
        Update: {
          author_id?: string | null
          code_theme?: string | null
          color?: string | null
          content?: string | null
          created_at?: string
          excerpt?: string | null
          hero_image?: string | null
          id?: string
          is_locked?: boolean | null
          is_premium?: boolean | null
          is_published?: boolean | null
          level?: string | null
          meta_description?: string | null
          meta_title?: string | null
          original_published_at?: string | null
          published_at?: string | null
          section_id?: string | null
          slug?: string
          sort_order?: number | null
          tags?: string[] | null
          title?: string
          updated_at?: string
          views?: number | null
        }
        Relationships: []
      }
      blog_tasks: {
        Row: {
          created_at: string
          description: string | null
          due_at: string | null
          id: string
          priority: string
          related_post_id: string | null
          status: string
          title: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          due_at?: string | null
          id?: string
          priority?: string
          related_post_id?: string | null
          status?: string
          title: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          due_at?: string | null
          id?: string
          priority?: string
          related_post_id?: string | null
          status?: string
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "blog_tasks_related_post_id_fkey"
            columns: ["related_post_id"]
            isOneToOne: false
            referencedRelation: "blog_posts"
            referencedColumns: ["id"]
          },
        ]
      }
      blog_posts_public_cache: {
        Row: {
          code_theme: string | null
          color: string | null
          content: string | null
          created_at: string
          excerpt: string | null
          hero_image: string | null
          id: string
          is_locked: boolean | null
          is_premium: boolean
          is_published: boolean
          level: string | null
          meta_description: string | null
          meta_title: string | null
          original_published_at: string | null
          published_at: string | null
          reading_time_minutes: number
          section_id: string | null
          slug: string
          sort_order: number | null
          tags: string[] | null
          title: string
          updated_at: string
          views: number
          word_count: number
        }
        Insert: {
          code_theme?: string | null
          color?: string | null
          content?: string | null
          created_at?: string
          excerpt?: string | null
          hero_image?: string | null
          id: string
          is_locked?: boolean | null
          is_premium?: boolean
          is_published?: boolean
          level?: string | null
          meta_description?: string | null
          meta_title?: string | null
          original_published_at?: string | null
          published_at?: string | null
          reading_time_minutes?: number
          section_id?: string | null
          slug: string
          sort_order?: number | null
          tags?: string[] | null
          title: string
          updated_at?: string
          views?: number
          word_count?: number
        }
        Update: {
          code_theme?: string | null
          color?: string | null
          content?: string | null
          created_at?: string
          excerpt?: string | null
          hero_image?: string | null
          id?: string
          is_locked?: boolean | null
          is_premium?: boolean
          is_published?: boolean
          level?: string | null
          meta_description?: string | null
          meta_title?: string | null
          original_published_at?: string | null
          published_at?: string | null
          reading_time_minutes?: number
          section_id?: string | null
          slug?: string
          sort_order?: number | null
          tags?: string[] | null
          title?: string
          updated_at?: string
          views?: number
          word_count?: number
        }
        Relationships: []
      }
      contact_requests: {
        Row: {
          created_at: string
          email: string
          id: string
          intent: string
          ip_address: string | null
          name: string
          reason: string
          user_agent: string | null
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          intent: string
          ip_address?: string | null
          name: string
          reason: string
          user_agent?: string | null
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          intent?: string
          ip_address?: string | null
          name?: string
          reason?: string
          user_agent?: string | null
        }
        Relationships: []
      }
      courses: {
        Row: {
          created_at: string
          description: string | null
          duration: string | null
          id: string
          is_premium: boolean | null
          is_published: boolean | null
          level: string | null
          long_description: string | null
          modules: Json | null
          outcomes: string[] | null
          price_amount: number | null
          price_currency: string | null
          rating: number | null
          requirements: string[] | null
          reviews_count: number | null
          slug: string
          students_count: number | null
          tags: string[] | null
          thumbnail: string | null
          title: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          duration?: string | null
          id?: string
          is_premium?: boolean | null
          is_published?: boolean | null
          level?: string | null
          long_description?: string | null
          modules?: Json | null
          outcomes?: string[] | null
          price_amount?: number | null
          price_currency?: string | null
          rating?: number | null
          requirements?: string[] | null
          reviews_count?: number | null
          slug: string
          students_count?: number | null
          tags?: string[] | null
          thumbnail?: string | null
          title: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          duration?: string | null
          id?: string
          is_premium?: boolean | null
          is_published?: boolean | null
          level?: string | null
          long_description?: string | null
          modules?: Json | null
          outcomes?: string[] | null
          price_amount?: number | null
          price_currency?: string | null
          rating?: number | null
          requirements?: string[] | null
          reviews_count?: number | null
          slug?: string
          students_count?: number | null
          tags?: string[] | null
          thumbnail?: string | null
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      cv_downloads: {
        Row: {
          city: string | null
          company_name: string | null
          country: string | null
          created_at: string
          custom_objectives: string | null
          download_reason: string
          id: string
          ip_address: string | null
          job_title: string | null
          user_agent: string | null
          visitor_email: string | null
          visitor_name: string
        }
        Insert: {
          city?: string | null
          company_name?: string | null
          country?: string | null
          created_at?: string
          custom_objectives?: string | null
          download_reason: string
          id?: string
          ip_address?: string | null
          job_title?: string | null
          user_agent?: string | null
          visitor_email?: string | null
          visitor_name: string
        }
        Update: {
          city?: string | null
          company_name?: string | null
          country?: string | null
          created_at?: string
          custom_objectives?: string | null
          download_reason?: string
          id?: string
          ip_address?: string | null
          job_title?: string | null
          user_agent?: string | null
          visitor_email?: string | null
          visitor_name?: string
        }
        Relationships: []
      }
      dashboard_widgets: {
        Row: {
          created_at: string
          height: number | null
          id: string
          is_visible: boolean | null
          position_x: number | null
          position_y: number | null
          updated_at: string
          user_id: string
          widget_config: Json | null
          widget_type: string
          width: number | null
        }
        Insert: {
          created_at?: string
          height?: number | null
          id?: string
          is_visible?: boolean | null
          position_x?: number | null
          position_y?: number | null
          updated_at?: string
          user_id: string
          widget_config?: Json | null
          widget_type: string
          width?: number | null
        }
        Update: {
          created_at?: string
          height?: number | null
          id?: string
          is_visible?: boolean | null
          position_x?: number | null
          position_y?: number | null
          updated_at?: string
          user_id?: string
          widget_config?: Json | null
          widget_type?: string
          width?: number | null
        }
        Relationships: []
      }
      email_templates: {
        Row: {
          body_html: string | null
          body_json: Json
          created_at: string
          id: string
          is_active: boolean | null
          name: string
          subject: string
          updated_at: string
          variables: string[] | null
        }
        Insert: {
          body_html?: string | null
          body_json?: Json
          created_at?: string
          id?: string
          is_active?: boolean | null
          name: string
          subject: string
          updated_at?: string
          variables?: string[] | null
        }
        Update: {
          body_html?: string | null
          body_json?: Json
          created_at?: string
          id?: string
          is_active?: boolean | null
          name?: string
          subject?: string
          updated_at?: string
          variables?: string[] | null
        }
        Relationships: []
      }
      emi_payments: {
        Row: {
          created_at: string
          emi_amount: number
          id: string
          interest_component: number
          loan_id: string
          notes: string | null
          payment_date: string
          payment_number: number
          principal_component: number
          remaining_principal: number
          user_id: string
        }
        Insert: {
          created_at?: string
          emi_amount: number
          id?: string
          interest_component: number
          loan_id: string
          notes?: string | null
          payment_date: string
          payment_number: number
          principal_component: number
          remaining_principal: number
          user_id: string
        }
        Update: {
          created_at?: string
          emi_amount?: number
          id?: string
          interest_component?: number
          loan_id?: string
          notes?: string | null
          payment_date?: string
          payment_number?: number
          principal_component?: number
          remaining_principal?: number
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "emi_payments_loan_id_fkey"
            columns: ["loan_id"]
            isOneToOne: false
            referencedRelation: "loans"
            referencedColumns: ["id"]
          },
        ]
      }
      enrollments: {
        Row: {
          amount_paid: number | null
          completed_at: string | null
          course_id: string
          enrolled_at: string
          id: string
          payment_id: string | null
          payment_status: string | null
          progress: Json | null
          user_id: string
        }
        Insert: {
          amount_paid?: number | null
          completed_at?: string | null
          course_id: string
          enrolled_at?: string
          id?: string
          payment_id?: string | null
          payment_status?: string | null
          progress?: Json | null
          user_id: string
        }
        Update: {
          amount_paid?: number | null
          completed_at?: string | null
          course_id?: string
          enrolled_at?: string
          id?: string
          payment_id?: string | null
          payment_status?: string | null
          progress?: Json | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "enrollments_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
        ]
      }
      family_members: {
        Row: {
          address: string | null
          created_at: string
          date_of_birth: string | null
          email: string | null
          generation: number
          id: string
          name: string
          notes: string | null
          occupation: string | null
          parent_id: string | null
          phone: string | null
          photo_url: string | null
          position_x: number | null
          position_y: number | null
          relationship: string
          spouse_id: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          address?: string | null
          created_at?: string
          date_of_birth?: string | null
          email?: string | null
          generation?: number
          id?: string
          name: string
          notes?: string | null
          occupation?: string | null
          parent_id?: string | null
          phone?: string | null
          photo_url?: string | null
          position_x?: number | null
          position_y?: number | null
          relationship: string
          spouse_id?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          address?: string | null
          created_at?: string
          date_of_birth?: string | null
          email?: string | null
          generation?: number
          id?: string
          name?: string
          notes?: string | null
          occupation?: string | null
          parent_id?: string | null
          phone?: string | null
          photo_url?: string | null
          position_x?: number | null
          position_y?: number | null
          relationship?: string
          spouse_id?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      insurance_documents: {
        Row: {
          created_at: string
          document_name: string
          document_type: string | null
          document_url: string
          document_year: number
          id: string
          policy_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          document_name: string
          document_type?: string | null
          document_url: string
          document_year: number
          id?: string
          policy_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          document_name?: string
          document_type?: string | null
          document_url?: string
          document_year?: number
          id?: string
          policy_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "insurance_documents_policy_id_fkey"
            columns: ["policy_id"]
            isOneToOne: false
            referencedRelation: "insurance_policies"
            referencedColumns: ["id"]
          },
        ]
      }
      insurance_policies: {
        Row: {
          created_at: string
          id: string
          is_active: boolean | null
          maturity_date: string | null
          nominee_name: string | null
          nominee_relation: string | null
          notes: string | null
          policy_name: string
          policy_number: string | null
          policy_type: string
          premium_amount: number
          premium_frequency: string | null
          provider: string
          renewal_date: string
          start_date: string
          sum_assured: number | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_active?: boolean | null
          maturity_date?: string | null
          nominee_name?: string | null
          nominee_relation?: string | null
          notes?: string | null
          policy_name: string
          policy_number?: string | null
          policy_type: string
          premium_amount: number
          premium_frequency?: string | null
          provider: string
          renewal_date: string
          start_date: string
          sum_assured?: number | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          is_active?: boolean | null
          maturity_date?: string | null
          nominee_name?: string | null
          nominee_relation?: string | null
          notes?: string | null
          policy_name?: string
          policy_number?: string | null
          policy_type?: string
          premium_amount?: number
          premium_frequency?: string | null
          provider?: string
          renewal_date?: string
          start_date?: string
          sum_assured?: number | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      invoices: {
        Row: {
          amount: number
          billing_details: Json | null
          created_at: string
          id: string
          invoice_number: string
          payment_id: string | null
          status: string | null
          tax_amount: number | null
          total_amount: number
          user_id: string | null
        }
        Insert: {
          amount: number
          billing_details?: Json | null
          created_at?: string
          id?: string
          invoice_number: string
          payment_id?: string | null
          status?: string | null
          tax_amount?: number | null
          total_amount: number
          user_id?: string | null
        }
        Update: {
          amount?: number
          billing_details?: Json | null
          created_at?: string
          id?: string
          invoice_number?: string
          payment_id?: string | null
          status?: string | null
          tax_amount?: number | null
          total_amount?: number
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "invoices_payment_id_fkey"
            columns: ["payment_id"]
            isOneToOne: false
            referencedRelation: "payments"
            referencedColumns: ["id"]
          },
        ]
      }
      ip_access_rules: {
        Row: {
          created_at: string
          created_by: string | null
          expires_at: string | null
          id: string
          ip_address: string
          is_active: boolean | null
          reason: string | null
          rule_type: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          expires_at?: string | null
          id?: string
          ip_address: string
          is_active?: boolean | null
          reason?: string | null
          rule_type: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          expires_at?: string | null
          id?: string
          ip_address?: string
          is_active?: boolean | null
          reason?: string | null
          rule_type?: string
          updated_at?: string
        }
        Relationships: []
      }
      job_executions: {
        Row: {
          completed_at: string | null
          created_at: string
          duration_ms: number | null
          error: string | null
          id: string
          job_id: string | null
          output: string | null
          started_at: string
          status: string
        }
        Insert: {
          completed_at?: string | null
          created_at?: string
          duration_ms?: number | null
          error?: string | null
          id?: string
          job_id?: string | null
          output?: string | null
          started_at?: string
          status?: string
        }
        Update: {
          completed_at?: string | null
          created_at?: string
          duration_ms?: number | null
          error?: string | null
          id?: string
          job_id?: string | null
          output?: string | null
          started_at?: string
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "job_executions_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "scheduled_jobs"
            referencedColumns: ["id"]
          },
        ]
      }
      life_achievements: {
        Row: {
          achievement_date: string
          category: string | null
          created_at: string
          description: string | null
          id: string
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          achievement_date: string
          category?: string | null
          created_at?: string
          description?: string | null
          id?: string
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          achievement_date?: string
          category?: string | null
          created_at?: string
          description?: string | null
          id?: string
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      life_settings: {
        Row: {
          created_at: string
          date_of_birth: string
          id: string
          target_lifespan_years: number
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          date_of_birth: string
          id?: string
          target_lifespan_years?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          date_of_birth?: string
          id?: string
          target_lifespan_years?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      llm_models: {
        Row: {
          api_docs_url: string | null
          architecture: string | null
          benchmarks: Json | null
          color: string | null
          company: string
          considerations: string[] | null
          context_window: string | null
          created_at: string
          description: string | null
          homepage_url: string | null
          huggingface_url: string | null
          id: string
          is_multimodal: boolean | null
          is_open_source: boolean | null
          is_trending: boolean | null
          license: string | null
          logo: string | null
          name: string
          parameters: string | null
          pricing: string | null
          release_date: string | null
          slug: string
          speed: string | null
          strengths: string[] | null
          updated_at: string
          use_cases: string[] | null
          versions: Json | null
          weaknesses: string[] | null
        }
        Insert: {
          api_docs_url?: string | null
          architecture?: string | null
          benchmarks?: Json | null
          color?: string | null
          company: string
          considerations?: string[] | null
          context_window?: string | null
          created_at?: string
          description?: string | null
          homepage_url?: string | null
          huggingface_url?: string | null
          id?: string
          is_multimodal?: boolean | null
          is_open_source?: boolean | null
          is_trending?: boolean | null
          license?: string | null
          logo?: string | null
          name: string
          parameters?: string | null
          pricing?: string | null
          release_date?: string | null
          slug: string
          speed?: string | null
          strengths?: string[] | null
          updated_at?: string
          use_cases?: string[] | null
          versions?: Json | null
          weaknesses?: string[] | null
        }
        Update: {
          api_docs_url?: string | null
          architecture?: string | null
          benchmarks?: Json | null
          color?: string | null
          company?: string
          considerations?: string[] | null
          context_window?: string | null
          created_at?: string
          description?: string | null
          homepage_url?: string | null
          huggingface_url?: string | null
          id?: string
          is_multimodal?: boolean | null
          is_open_source?: boolean | null
          is_trending?: boolean | null
          license?: string | null
          logo?: string | null
          name?: string
          parameters?: string | null
          pricing?: string | null
          release_date?: string | null
          slug?: string
          speed?: string | null
          strengths?: string[] | null
          updated_at?: string
          use_cases?: string[] | null
          versions?: Json | null
          weaknesses?: string[] | null
        }
        Relationships: []
      }
      loans: {
        Row: {
          created_at: string
          emi_amount: number
          id: string
          interest_rate: number
          is_active: boolean | null
          lender_name: string
          loan_type: string
          notes: string | null
          principal_amount: number
          remaining_principal: number | null
          start_date: string
          tenure_months: number
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          emi_amount: number
          id?: string
          interest_rate: number
          is_active?: boolean | null
          lender_name: string
          loan_type: string
          notes?: string | null
          principal_amount: number
          remaining_principal?: number | null
          start_date: string
          tenure_months: number
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          emi_amount?: number
          id?: string
          interest_rate?: number
          is_active?: boolean | null
          lender_name?: string
          loan_type?: string
          notes?: string | null
          principal_amount?: number
          remaining_principal?: number | null
          start_date?: string
          tenure_months?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      login_audit_logs: {
        Row: {
          browser: string | null
          city: string | null
          country: string | null
          created_at: string
          device_type: string | null
          email: string
          failure_reason: string | null
          id: string
          ip_address: string | null
          status: string
          user_agent: string | null
        }
        Insert: {
          browser?: string | null
          city?: string | null
          country?: string | null
          created_at?: string
          device_type?: string | null
          email: string
          failure_reason?: string | null
          id?: string
          ip_address?: string | null
          status?: string
          user_agent?: string | null
        }
        Update: {
          browser?: string | null
          city?: string | null
          country?: string | null
          created_at?: string
          device_type?: string | null
          email?: string
          failure_reason?: string | null
          id?: string
          ip_address?: string | null
          status?: string
          user_agent?: string | null
        }
        Relationships: []
      }
      login_location_confirmations: {
        Row: {
          city: string | null
          confirmation_token: string
          confirmed_at: string | null
          country: string | null
          created_at: string
          email: string
          expires_at: string
          id: string
          ip_address: string
          status: string
          user_id: string
        }
        Insert: {
          city?: string | null
          confirmation_token: string
          confirmed_at?: string | null
          country?: string | null
          created_at?: string
          email: string
          expires_at: string
          id?: string
          ip_address: string
          status?: string
          user_id: string
        }
        Update: {
          city?: string | null
          confirmation_token?: string
          confirmed_at?: string | null
          country?: string | null
          created_at?: string
          email?: string
          expires_at?: string
          id?: string
          ip_address?: string
          status?: string
          user_id?: string
        }
        Relationships: []
      }
      mentorship_bookings: {
        Row: {
          amount: number
          created_at: string
          currency: string
          duration_minutes: number
          email: string
          id: string
          metadata: Json | null
          mobile: string
          name: string
          package_name: string
          payment_row_id: string | null
          razorpay_order_id: string
          razorpay_payment_id: string
          scheduled_end: string
          scheduled_start: string
          session_reason: string
          status: string
          timezone: string
          topic: string
          topic_other: string | null
        }
        Insert: {
          amount: number
          created_at?: string
          currency?: string
          duration_minutes: number
          email: string
          id?: string
          metadata?: Json | null
          mobile: string
          name: string
          package_name: string
          payment_row_id?: string | null
          razorpay_order_id: string
          razorpay_payment_id: string
          scheduled_end: string
          scheduled_start: string
          session_reason: string
          status?: string
          timezone?: string
          topic: string
          topic_other?: string | null
        }
        Update: {
          amount?: number
          created_at?: string
          currency?: string
          duration_minutes?: number
          email?: string
          id?: string
          metadata?: Json | null
          mobile?: string
          name?: string
          package_name?: string
          payment_row_id?: string | null
          razorpay_order_id?: string
          razorpay_payment_id?: string
          scheduled_end?: string
          scheduled_start?: string
          session_reason?: string
          status?: string
          timezone?: string
          topic?: string
          topic_other?: string | null
        }
        Relationships: []
      }
      notification_settings: {
        Row: {
          created_at: string
          email_contact_requests: boolean | null
          email_course_enrollments: boolean | null
          email_cv_downloads: boolean | null
          email_payments: boolean | null
          email_templates: Json | null
          id: string
          sound_enabled: boolean | null
          sound_volume: number | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          email_contact_requests?: boolean | null
          email_course_enrollments?: boolean | null
          email_cv_downloads?: boolean | null
          email_payments?: boolean | null
          email_templates?: Json | null
          id?: string
          sound_enabled?: boolean | null
          sound_volume?: number | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          email_contact_requests?: boolean | null
          email_course_enrollments?: boolean | null
          email_cv_downloads?: boolean | null
          email_payments?: boolean | null
          email_templates?: Json | null
          id?: string
          sound_enabled?: boolean | null
          sound_volume?: number | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      otp_rate_limits: {
        Row: {
          attempt_count: number
          created_at: string
          first_attempt_at: string
          id: string
          identifier: string
          identifier_type: string
          last_attempt_at: string
          locked_until: string | null
        }
        Insert: {
          attempt_count?: number
          created_at?: string
          first_attempt_at?: string
          id?: string
          identifier: string
          identifier_type: string
          last_attempt_at?: string
          locked_until?: string | null
        }
        Update: {
          attempt_count?: number
          created_at?: string
          first_attempt_at?: string
          id?: string
          identifier?: string
          identifier_type?: string
          last_attempt_at?: string
          locked_until?: string | null
        }
        Relationships: []
      }
      page_views: {
        Row: {
          browser: string | null
          city: string | null
          country: string | null
          created_at: string
          device_type: string | null
          id: string
          ip_address: string | null
          page_path: string
          page_title: string | null
          referrer: string | null
          session_id: string | null
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          browser?: string | null
          city?: string | null
          country?: string | null
          created_at?: string
          device_type?: string | null
          id?: string
          ip_address?: string | null
          page_path: string
          page_title?: string | null
          referrer?: string | null
          session_id?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          browser?: string | null
          city?: string | null
          country?: string | null
          created_at?: string
          device_type?: string | null
          id?: string
          ip_address?: string | null
          page_path?: string
          page_title?: string | null
          referrer?: string | null
          session_id?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      passkey_credentials: {
        Row: {
          counter: number
          created_at: string
          credential_id: string
          device_name: string | null
          device_type: string | null
          id: string
          is_active: boolean | null
          last_used_at: string | null
          public_key: string
          transports: string[] | null
          user_id: string
        }
        Insert: {
          counter?: number
          created_at?: string
          credential_id: string
          device_name?: string | null
          device_type?: string | null
          id?: string
          is_active?: boolean | null
          last_used_at?: string | null
          public_key: string
          transports?: string[] | null
          user_id: string
        }
        Update: {
          counter?: number
          created_at?: string
          credential_id?: string
          device_name?: string | null
          device_type?: string | null
          id?: string
          is_active?: boolean | null
          last_used_at?: string | null
          public_key?: string
          transports?: string[] | null
          user_id?: string
        }
        Relationships: []
      }
      payments: {
        Row: {
          amount: number
          created_at: string
          currency: string | null
          id: string
          metadata: Json | null
          order_id: string
          payment_id: string | null
          product_id: string
          product_type: string
          status: string | null
          updated_at: string
          user_id: string | null
        }
        Insert: {
          amount: number
          created_at?: string
          currency?: string | null
          id?: string
          metadata?: Json | null
          order_id: string
          payment_id?: string | null
          product_id: string
          product_type: string
          status?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          amount?: number
          created_at?: string
          currency?: string | null
          id?: string
          metadata?: Json | null
          order_id?: string
          payment_id?: string | null
          product_id?: string
          product_type?: string
          status?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      personal_todos: {
        Row: {
          category: string | null
          completed_at: string | null
          created_at: string
          description: string | null
          due_date: string
          id: string
          status: string
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          category?: string | null
          completed_at?: string | null
          created_at?: string
          description?: string | null
          due_date?: string
          id?: string
          status?: string
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          category?: string | null
          completed_at?: string | null
          created_at?: string
          description?: string | null
          due_date?: string
          id?: string
          status?: string
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      products: {
        Row: {
          category: string | null
          created_at: string
          description: string | null
          downloads_count: number | null
          file_url: string | null
          id: string
          is_published: boolean | null
          price_amount: number | null
          price_currency: string | null
          slug: string
          tags: string[] | null
          thumbnail: string | null
          title: string
          updated_at: string
        }
        Insert: {
          category?: string | null
          created_at?: string
          description?: string | null
          downloads_count?: number | null
          file_url?: string | null
          id?: string
          is_published?: boolean | null
          price_amount?: number | null
          price_currency?: string | null
          slug: string
          tags?: string[] | null
          thumbnail?: string | null
          title: string
          updated_at?: string
        }
        Update: {
          category?: string | null
          created_at?: string
          description?: string | null
          downloads_count?: number | null
          file_url?: string | null
          id?: string
          is_published?: boolean | null
          price_amount?: number | null
          price_currency?: string | null
          slug?: string
          tags?: string[] | null
          thumbnail?: string | null
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          email: string | null
          full_name: string | null
          id: string
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          email?: string | null
          full_name?: string | null
          id: string
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          email?: string | null
          full_name?: string | null
          id?: string
          updated_at?: string
        }
        Relationships: []
      }
      scheduled_jobs: {
        Row: {
          created_at: string
          cron_job_id: number | null
          description: string | null
          edge_function_name: string | null
          fail_count: number | null
          id: string
          is_active: boolean | null
          job_type: string
          last_run: string | null
          name: string
          next_run: string | null
          payload: Json | null
          run_count: number | null
          schedule: string
          schedule_description: string | null
          success_count: number | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          cron_job_id?: number | null
          description?: string | null
          edge_function_name?: string | null
          fail_count?: number | null
          id?: string
          is_active?: boolean | null
          job_type?: string
          last_run?: string | null
          name: string
          next_run?: string | null
          payload?: Json | null
          run_count?: number | null
          schedule: string
          schedule_description?: string | null
          success_count?: number | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          cron_job_id?: number | null
          description?: string | null
          edge_function_name?: string | null
          fail_count?: number | null
          id?: string
          is_active?: boolean | null
          job_type?: string
          last_run?: string | null
          name?: string
          next_run?: string | null
          payload?: Json | null
          run_count?: number | null
          schedule?: string
          schedule_description?: string | null
          success_count?: number | null
          updated_at?: string
        }
        Relationships: []
      }
      site_metrics: {
        Row: {
          slug: string
          updated_at: string
          visits: number
        }
        Insert: {
          slug: string
          updated_at?: string
          visits?: number
        }
        Update: {
          slug?: string
          updated_at?: string
          visits?: number
        }
        Relationships: []
      }
      social_profiles: {
        Row: {
          brand_bg: string | null
          brand_color: string | null
          category: string
          connected: boolean
          created_at: string
          credential_hints: Json | null
          description: string | null
          display_name: string
          followers: number
          icon_key: string
          id: string
          is_visible: boolean
          platform: string
          profile_url: string | null
          sort_order: number
          updated_at: string
          username: string | null
        }
        Insert: {
          brand_bg?: string | null
          brand_color?: string | null
          category?: string
          connected?: boolean
          created_at?: string
          credential_hints?: Json | null
          description?: string | null
          display_name: string
          followers?: number
          icon_key: string
          id?: string
          is_visible?: boolean
          platform: string
          profile_url?: string | null
          sort_order?: number
          updated_at?: string
          username?: string | null
        }
        Update: {
          brand_bg?: string | null
          brand_color?: string | null
          category?: string
          connected?: boolean
          created_at?: string
          credential_hints?: Json | null
          description?: string | null
          display_name?: string
          followers?: number
          icon_key?: string
          id?: string
          is_visible?: boolean
          platform?: string
          profile_url?: string | null
          sort_order?: number
          updated_at?: string
          username?: string | null
        }
        Relationships: []
      }
      omniflow_posts: {
        Row: {
          base_content: string
          created_at: string
          created_by: string | null
          id: string
          published_at: string | null
          selected_platforms: string[]
          source_type: string
          source_url: string | null
          status: string
          title: string
          updated_at: string
        }
        Insert: {
          base_content: string
          created_at?: string
          created_by?: string | null
          id?: string
          published_at?: string | null
          selected_platforms?: string[]
          source_type?: string
          source_url?: string | null
          status?: string
          title: string
          updated_at?: string
        }
        Update: {
          base_content?: string
          created_at?: string
          created_by?: string | null
          id?: string
          published_at?: string | null
          selected_platforms?: string[]
          source_type?: string
          source_url?: string | null
          status?: string
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      omniflow_post_variants: {
        Row: {
          ai_score: number
          approval_status: string
          approved_at: string | null
          compressed_url: string | null
          created_at: string
          generated_content: string
          hashtags: string[]
          id: string
          last_error: string | null
          platform: string
          post_id: string
          preview_payload: Json | null
          publish_status: string
          published_at: string | null
          quality_notes: string[]
          seo_score: number
          updated_at: string
        }
        Insert: {
          ai_score?: number
          approval_status?: string
          approved_at?: string | null
          compressed_url?: string | null
          created_at?: string
          generated_content: string
          hashtags?: string[]
          id?: string
          last_error?: string | null
          platform: string
          post_id: string
          preview_payload?: Json | null
          publish_status?: string
          published_at?: string | null
          quality_notes?: string[]
          seo_score?: number
          updated_at?: string
        }
        Update: {
          ai_score?: number
          approval_status?: string
          approved_at?: string | null
          compressed_url?: string | null
          created_at?: string
          generated_content?: string
          hashtags?: string[]
          id?: string
          last_error?: string | null
          platform?: string
          post_id?: string
          preview_payload?: Json | null
          publish_status?: string
          published_at?: string | null
          quality_notes?: string[]
          seo_score?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "omniflow_post_variants_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "omniflow_posts"
            referencedColumns: ["id"]
          },
        ]
      }
      omniflow_publish_logs: {
        Row: {
          created_at: string
          error: string | null
          id: string
          platform: string
          post_id: string
          request_payload: Json | null
          response_payload: Json | null
          status: string
          variant_id: string | null
        }
        Insert: {
          created_at?: string
          error?: string | null
          id?: string
          platform: string
          post_id: string
          request_payload?: Json | null
          response_payload?: Json | null
          status: string
          variant_id?: string | null
        }
        Update: {
          created_at?: string
          error?: string | null
          id?: string
          platform?: string
          post_id?: string
          request_payload?: Json | null
          response_payload?: Json | null
          status?: string
          variant_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "omniflow_publish_logs_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "omniflow_posts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "omniflow_publish_logs_variant_id_fkey"
            columns: ["variant_id"]
            isOneToOne: false
            referencedRelation: "omniflow_post_variants"
            referencedColumns: ["id"]
          },
        ]
      }
      study_sessions: {
        Row: {
          created_at: string
          duration_minutes: number
          id: string
          notes: string | null
          session_date: string
          subject: string
          topic: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          duration_minutes?: number
          id?: string
          notes?: string | null
          session_date?: string
          subject: string
          topic?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          duration_minutes?: number
          id?: string
          notes?: string | null
          session_date?: string
          subject?: string
          topic?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_entitlements: {
        Row: {
          created_at: string
          entitlement: string
          expires_at: string | null
          id: string
          source: string | null
          source_ref: string | null
          user_id: string
        }
        Insert: {
          created_at?: string
          entitlement: string
          expires_at?: string | null
          id?: string
          source?: string | null
          source_ref?: string | null
          user_id: string
        }
        Update: {
          created_at?: string
          entitlement?: string
          expires_at?: string | null
          id?: string
          source?: string | null
          source_ref?: string | null
          user_id?: string
        }
        Relationships: []
      }
      user_interactions: {
        Row: {
          created_at: string
          element_id: string | null
          element_name: string | null
          id: string
          interaction_type: string
          metadata: Json | null
          page_path: string
          session_id: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string
          element_id?: string | null
          element_name?: string | null
          id?: string
          interaction_type: string
          metadata?: Json | null
          page_path: string
          session_id?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string
          element_id?: string | null
          element_name?: string | null
          id?: string
          interaction_type?: string
          metadata?: Json | null
          page_path?: string
          session_id?: string | null
          user_id?: string | null
        }
        Relationships: []
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
          role?: Database["public"]["Enums"]["app_role"]
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
      webauthn_challenges: {
        Row: {
          challenge: string
          created_at: string
          expires_at: string
          id: string
          kind: string
          origin: string
          rp_id: string
          used: boolean
          user_id: string
        }
        Insert: {
          challenge: string
          created_at?: string
          expires_at: string
          id?: string
          kind: string
          origin: string
          rp_id: string
          used?: boolean
          user_id: string
        }
        Update: {
          challenge?: string
          created_at?: string
          expires_at?: string
          id?: string
          kind?: string
          origin?: string
          rp_id?: string
          used?: boolean
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_entitlement: {
        Args: { _entitlement: string; _user_id: string }
        Returns: boolean
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      increment_blog_post_view: { Args: { _slug: string }; Returns: undefined }
      increment_site_visit: { Args: { _slug?: string }; Returns: number }
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
    Enums: {
      app_role: ["admin", "moderator", "user"],
    },
  },
} as const
