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
      audit_logs: {
        Row: {
          action: string
          created_at: string
          id: string
          new_values: Json | null
          old_values: Json | null
          record_id: string | null
          table_name: string
          user_id: string | null
        }
        Insert: {
          action: string
          created_at?: string
          id?: string
          new_values?: Json | null
          old_values?: Json | null
          record_id?: string | null
          table_name: string
          user_id?: string | null
        }
        Update: {
          action?: string
          created_at?: string
          id?: string
          new_values?: Json | null
          old_values?: Json | null
          record_id?: string | null
          table_name?: string
          user_id?: string | null
        }
        Relationships: []
      }
      geographic_boundaries: {
        Row: {
          admin_level: number | null
          bounds: Json
          center_lat: number | null
          center_lng: number | null
          country_code: string | null
          created_at: string | null
          geometry: Json
          google_place_id: string | null
          google_updated_at: string | null
          id: string
          name: string
          name_en: string | null
          parent_id: string | null
          population: number | null
          type: string
          updated_at: string | null
        }
        Insert: {
          admin_level?: number | null
          bounds: Json
          center_lat?: number | null
          center_lng?: number | null
          country_code?: string | null
          created_at?: string | null
          geometry: Json
          google_place_id?: string | null
          google_updated_at?: string | null
          id?: string
          name: string
          name_en?: string | null
          parent_id?: string | null
          population?: number | null
          type: string
          updated_at?: string | null
        }
        Update: {
          admin_level?: number | null
          bounds?: Json
          center_lat?: number | null
          center_lng?: number | null
          country_code?: string | null
          created_at?: string | null
          geometry?: Json
          google_place_id?: string | null
          google_updated_at?: string | null
          id?: string
          name?: string
          name_en?: string | null
          parent_id?: string | null
          population?: number | null
          type?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "geographic_boundaries_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "geographic_boundaries"
            referencedColumns: ["id"]
          },
        ]
      }
      locations: {
        Row: {
          coordinates: number[]
          created_at: string | null
          id: string
          intercessor_count: number | null
          last_activity: string | null
          level: number
          name: string
          parent_id: string | null
          type: Database["public"]["Enums"]["location_type"]
          updated_at: string | null
        }
        Insert: {
          coordinates: number[]
          created_at?: string | null
          id?: string
          intercessor_count?: number | null
          last_activity?: string | null
          level: number
          name: string
          parent_id?: string | null
          type: Database["public"]["Enums"]["location_type"]
          updated_at?: string | null
        }
        Update: {
          coordinates?: number[]
          created_at?: string | null
          id?: string
          intercessor_count?: number | null
          last_activity?: string | null
          level?: number
          name?: string
          parent_id?: string | null
          type?: Database["public"]["Enums"]["location_type"]
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "locations_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "locations"
            referencedColumns: ["id"]
          },
        ]
      }
      mission_bases: {
        Row: {
          contact: string
          created_at: string | null
          established: string
          focus: string[]
          id: string
          location_id: string
          name: string
          organization: string
          updated_at: string | null
        }
        Insert: {
          contact: string
          created_at?: string | null
          established: string
          focus: string[]
          id?: string
          location_id: string
          name: string
          organization: string
          updated_at?: string | null
        }
        Update: {
          contact?: string
          created_at?: string | null
          established?: string
          focus?: string[]
          id?: string
          location_id?: string
          name?: string
          organization?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "mission_bases_location_id_fkey"
            columns: ["location_id"]
            isOneToOne: false
            referencedRelation: "locations"
            referencedColumns: ["id"]
          },
        ]
      }
      prayer_targets: {
        Row: {
          category: Database["public"]["Enums"]["prayer_category"]
          created_at: string | null
          description: string
          id: string
          location_id: string
          title: string
          updated_at: string | null
          urgency: Database["public"]["Enums"]["urgency_level"]
        }
        Insert: {
          category: Database["public"]["Enums"]["prayer_category"]
          created_at?: string | null
          description: string
          id?: string
          location_id: string
          title: string
          updated_at?: string | null
          urgency: Database["public"]["Enums"]["urgency_level"]
        }
        Update: {
          category?: Database["public"]["Enums"]["prayer_category"]
          created_at?: string | null
          description?: string
          id?: string
          location_id?: string
          title?: string
          updated_at?: string | null
          urgency?: Database["public"]["Enums"]["urgency_level"]
        }
        Relationships: [
          {
            foreignKeyName: "prayer_targets_location_id_fkey"
            columns: ["location_id"]
            isOneToOne: false
            referencedRelation: "locations"
            referencedColumns: ["id"]
          },
        ]
      }
      prophetic_words: {
        Row: {
          author: string
          content: string
          created_at: string | null
          date: string
          id: string
          is_verified: boolean | null
          location_id: string
          updated_at: string | null
        }
        Insert: {
          author: string
          content: string
          created_at?: string | null
          date: string
          id?: string
          is_verified?: boolean | null
          location_id: string
          updated_at?: string | null
        }
        Update: {
          author?: string
          content?: string
          created_at?: string | null
          date?: string
          id?: string
          is_verified?: boolean | null
          location_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "prophetic_words_location_id_fkey"
            columns: ["location_id"]
            isOneToOne: false
            referencedRelation: "locations"
            referencedColumns: ["id"]
          },
        ]
      }
      spiritual_activities: {
        Row: {
          activity_type: string
          created_at: string
          created_by: string | null
          description: string | null
          id: string
          impact_description: string | null
          participants_count: number | null
          region_id: string
          title: string
          updated_at: string
        }
        Insert: {
          activity_type: string
          created_at?: string
          created_by?: string | null
          description?: string | null
          id?: string
          impact_description?: string | null
          participants_count?: number | null
          region_id: string
          title: string
          updated_at?: string
        }
        Update: {
          activity_type?: string
          created_at?: string
          created_by?: string | null
          description?: string | null
          id?: string
          impact_description?: string | null
          participants_count?: number | null
          region_id?: string
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "spiritual_activities_region_id_fkey"
            columns: ["region_id"]
            isOneToOne: false
            referencedRelation: "spiritual_regions"
            referencedColumns: ["id"]
          },
        ]
      }
      spiritual_alerts: {
        Row: {
          created_at: string | null
          description: string
          id: string
          location_id: string
          reported_at: string | null
          severity: Database["public"]["Enums"]["alert_severity"]
          title: string
          type: Database["public"]["Enums"]["spiritual_alert_type"]
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          description: string
          id?: string
          location_id: string
          reported_at?: string | null
          severity: Database["public"]["Enums"]["alert_severity"]
          title: string
          type: Database["public"]["Enums"]["spiritual_alert_type"]
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string
          id?: string
          location_id?: string
          reported_at?: string | null
          severity?: Database["public"]["Enums"]["alert_severity"]
          title?: string
          type?: Database["public"]["Enums"]["spiritual_alert_type"]
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "spiritual_alerts_location_id_fkey"
            columns: ["location_id"]
            isOneToOne: false
            referencedRelation: "locations"
            referencedColumns: ["id"]
          },
        ]
      }
      spiritual_prayer_targets: {
        Row: {
          category: string
          created_at: string
          created_by: string | null
          description: string | null
          id: string
          priority: number | null
          region_id: string
          status: string
          title: string
          updated_at: string
        }
        Insert: {
          category: string
          created_at?: string
          created_by?: string | null
          description?: string | null
          id?: string
          priority?: number | null
          region_id: string
          status?: string
          title: string
          updated_at?: string
        }
        Update: {
          category?: string
          created_at?: string
          created_by?: string | null
          description?: string | null
          id?: string
          priority?: number | null
          region_id?: string
          status?: string
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "spiritual_prayer_targets_region_id_fkey"
            columns: ["region_id"]
            isOneToOne: false
            referencedRelation: "spiritual_regions"
            referencedColumns: ["id"]
          },
        ]
      }
      spiritual_regions: {
        Row: {
          approved_at: string | null
          approved_by: string | null
          city_code: string | null
          coordinates: Json | null
          country_code: string | null
          created_at: string
          created_by: string | null
          data_source: string
          id: string
          name: string
          parent_id: string | null
          region_type: string
          spiritual_data: Json | null
          state_code: string | null
          status: string
          updated_at: string
        }
        Insert: {
          approved_at?: string | null
          approved_by?: string | null
          city_code?: string | null
          coordinates?: Json | null
          country_code?: string | null
          created_at?: string
          created_by?: string | null
          data_source?: string
          id?: string
          name: string
          parent_id?: string | null
          region_type: string
          spiritual_data?: Json | null
          state_code?: string | null
          status?: string
          updated_at?: string
        }
        Update: {
          approved_at?: string | null
          approved_by?: string | null
          city_code?: string | null
          coordinates?: Json | null
          country_code?: string | null
          created_at?: string
          created_by?: string | null
          data_source?: string
          id?: string
          name?: string
          parent_id?: string | null
          region_type?: string
          spiritual_data?: Json | null
          state_code?: string | null
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "spiritual_regions_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "spiritual_regions"
            referencedColumns: ["id"]
          },
        ]
      }
      testimonies: {
        Row: {
          author: string
          category: Database["public"]["Enums"]["testimony_category"]
          content: string
          created_at: string | null
          date: string
          id: string
          location_id: string
          title: string
          updated_at: string | null
        }
        Insert: {
          author: string
          category: Database["public"]["Enums"]["testimony_category"]
          content: string
          created_at?: string | null
          date: string
          id?: string
          location_id: string
          title: string
          updated_at?: string | null
        }
        Update: {
          author?: string
          category?: Database["public"]["Enums"]["testimony_category"]
          content?: string
          created_at?: string | null
          date?: string
          id?: string
          location_id?: string
          title?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "testimonies_location_id_fkey"
            columns: ["location_id"]
            isOneToOne: false
            referencedRelation: "locations"
            referencedColumns: ["id"]
          },
        ]
      }
      user_profiles: {
        Row: {
          created_at: string
          display_name: string | null
          full_name: string | null
          prayer_experience: string | null
          favorite_regions: string[] | null
          total_prayer_time: number
          total_sessions: number
          id: string
          role: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          display_name?: string | null
          full_name?: string | null
          prayer_experience?: string | null
          favorite_regions?: string[] | null
          total_prayer_time?: number
          total_sessions?: number
          id?: string
          role?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          display_name?: string | null
          full_name?: string | null
          prayer_experience?: string | null
          favorite_regions?: string[] | null
          total_prayer_time?: number
          total_sessions?: number
          id?: string
          role?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      prayer_sessions: {
        Row: {
          id: string
          user_id: string
          region_name: string
          region_type: string
          duration_seconds: number
          started_at: string
          finished_at: string
          prophetic_word: string
          personal_reflection: string | null
          spiritual_data: Json | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          region_name: string
          region_type: string
          duration_seconds: number
          started_at: string
          finished_at: string
          prophetic_word: string
          personal_reflection?: string | null
          spiritual_data?: Json | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          region_name?: string
          region_type?: string
          duration_seconds?: number
          started_at?: string
          finished_at?: string
          prophetic_word?: string
          personal_reflection?: string | null
          spiritual_data?: Json | null
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      region_prayer_stats: {
        Row: {
          id: string
          region_name: string
          region_type: string
          total_sessions: number
          total_prayer_time: number
          unique_intercessors: number
          last_prayer_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          region_name: string
          region_type: string
          total_sessions?: number
          total_prayer_time?: number
          unique_intercessors?: number
          last_prayer_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          region_name?: string
          region_type?: string
          total_sessions?: number
          total_prayer_time?: number
          unique_intercessors?: number
          last_prayer_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      intercessor_rankings: {
        Row: {
          id: string
          user_id: string
          total_prayer_time: number
          total_sessions: number
          regions_prayed_for: number
          longest_session: number
          current_streak: number
          last_prayer_date: string | null
          rank_position: number | null
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          total_prayer_time?: number
          total_sessions?: number
          regions_prayed_for?: number
          longest_session?: number
          current_streak?: number
          last_prayer_date?: string | null
          rank_position?: number | null
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          total_prayer_time?: number
          total_sessions?: number
          regions_prayed_for?: number
          longest_session?: number
          current_streak?: number
          last_prayer_date?: string | null
          rank_position?: number | null
          updated_at?: string
        }
        Relationships: []
      }
      ai_processing_queue: {
        Row: {
          id: string
          region_id: string | null
          region_name: string
          region_type: string
          continent: string | null
          country_code: string | null
          parent_region_name: string | null
          status: string
          priority_level: number
          queue_order: number | null
          estimated_cost_usd: number
          estimated_duration_seconds: number
          actual_cost_usd: number | null
          actual_duration_seconds: number | null
          ai_model: string
          custom_prompt: string | null
          max_attempts: number
          current_attempts: number
          ai_response: Json | null
          ai_tokens_used: number | null
          validation_score: number | null
          created_by: string | null
          created_at: string
          started_at: string | null
          completed_at: string | null
          last_error: string | null
          error_count: number
          batch_id: string | null
          processing_notes: string | null
          manual_review_required: boolean
          approved_by: string | null
          approved_at: string | null
        }
        Insert: {
          id?: string
          region_id?: string | null
          region_name: string
          region_type: string
          continent?: string | null
          country_code?: string | null
          parent_region_name?: string | null
          status?: string
          priority_level?: number
          queue_order?: number | null
          estimated_cost_usd?: number
          estimated_duration_seconds?: number
          actual_cost_usd?: number | null
          actual_duration_seconds?: number | null
          ai_model?: string
          custom_prompt?: string | null
          max_attempts?: number
          current_attempts?: number
          ai_response?: Json | null
          ai_tokens_used?: number | null
          validation_score?: number | null
          created_by?: string | null
          created_at?: string
          started_at?: string | null
          completed_at?: string | null
          last_error?: string | null
          error_count?: number
          batch_id?: string | null
          processing_notes?: string | null
          manual_review_required?: boolean
          approved_by?: string | null
          approved_at?: string | null
        }
        Update: {
          id?: string
          region_id?: string | null
          region_name?: string
          region_type?: string
          continent?: string | null
          country_code?: string | null
          parent_region_name?: string | null
          status?: string
          priority_level?: number
          queue_order?: number | null
          estimated_cost_usd?: number
          estimated_duration_seconds?: number
          actual_cost_usd?: number | null
          actual_duration_seconds?: number | null
          ai_model?: string
          custom_prompt?: string | null
          max_attempts?: number
          current_attempts?: number
          ai_response?: Json | null
          ai_tokens_used?: number | null
          validation_score?: number | null
          created_by?: string | null
          created_at?: string
          started_at?: string | null
          completed_at?: string | null
          last_error?: string | null
          error_count?: number
          batch_id?: string | null
          processing_notes?: string | null
          manual_review_required?: boolean
          approved_by?: string | null
          approved_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "ai_processing_queue_region_id_fkey"
            columns: ["region_id"]
            isOneToOne: false
            referencedRelation: "spiritual_regions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ai_processing_queue_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ai_processing_queue_approved_by_fkey"
            columns: ["approved_by"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          }
        ]
      }
      ai_processing_batches: {
        Row: {
          id: string
          name: string
          description: string | null
          continent: string | null
          region_types: string[] | null
          filters: Json | null
          status: string
          total_regions: number
          completed_regions: number
          failed_regions: number
          skipped_regions: number
          estimated_total_cost_usd: number | null
          actual_total_cost_usd: number
          estimated_duration_hours: number | null
          actual_duration_seconds: number | null
          created_by: string | null
          created_at: string
          started_at: string | null
          completed_at: string | null
          auto_approve: boolean
          quality_threshold: number
          processing_settings: Json | null
        }
        Insert: {
          id?: string
          name: string
          description?: string | null
          continent?: string | null
          region_types?: string[] | null
          filters?: Json | null
          status?: string
          total_regions?: number
          completed_regions?: number
          failed_regions?: number
          skipped_regions?: number
          estimated_total_cost_usd?: number | null
          actual_total_cost_usd?: number
          estimated_duration_hours?: number | null
          actual_duration_seconds?: number | null
          created_by?: string | null
          created_at?: string
          started_at?: string | null
          completed_at?: string | null
          auto_approve?: boolean
          quality_threshold?: number
          processing_settings?: Json | null
        }
        Update: {
          id?: string
          name?: string
          description?: string | null
          continent?: string | null
          region_types?: string[] | null
          filters?: Json | null
          status?: string
          total_regions?: number
          completed_regions?: number
          failed_regions?: number
          skipped_regions?: number
          estimated_total_cost_usd?: number | null
          actual_total_cost_usd?: number
          estimated_duration_hours?: number | null
          actual_duration_seconds?: number | null
          created_by?: string | null
          created_at?: string
          started_at?: string | null
          completed_at?: string | null
          auto_approve?: boolean
          quality_threshold?: number
          processing_settings?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "ai_processing_batches_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          }
        ]
      }
      ai_prompt_templates: {
        Row: {
          id: string
          name: string
          description: string | null
          region_type: string
          continent: string | null
          system_prompt: string
          user_prompt_template: string
          expected_output_format: Json | null
          model: string
          max_tokens: number
          temperature: number
          is_active: boolean
          version: number
          quality_score: number | null
          success_rate: number | null
          created_by: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          description?: string | null
          region_type: string
          continent?: string | null
          system_prompt: string
          user_prompt_template: string
          expected_output_format?: Json | null
          model?: string
          max_tokens?: number
          temperature?: number
          is_active?: boolean
          version?: number
          quality_score?: number | null
          success_rate?: number | null
          created_by?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          description?: string | null
          region_type?: string
          continent?: string | null
          system_prompt?: string
          user_prompt_template?: string
          expected_output_format?: Json | null
          model?: string
          max_tokens?: number
          temperature?: number
          is_active?: boolean
          version?: number
          quality_score?: number | null
          success_rate?: number | null
          created_by?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "ai_prompt_templates_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          }
        ]
      }
      ai_processing_logs: {
        Row: {
          id: string
          queue_item_id: string | null
          batch_id: string | null
          log_level: string
          message: string
          details: Json | null
          step: string | null
          duration_ms: number | null
          created_at: string
        }
        Insert: {
          id?: string
          queue_item_id?: string | null
          batch_id?: string | null
          log_level: string
          message: string
          details?: Json | null
          step?: string | null
          duration_ms?: number | null
          created_at?: string
        }
        Update: {
          id?: string
          queue_item_id?: string | null
          batch_id?: string | null
          log_level?: string
          message?: string
          details?: Json | null
          step?: string | null
          duration_ms?: number | null
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "ai_processing_logs_queue_item_id_fkey"
            columns: ["queue_item_id"]
            isOneToOne: false
            referencedRelation: "ai_processing_queue"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ai_processing_logs_batch_id_fkey"
            columns: ["batch_id"]
            isOneToOne: false
            referencedRelation: "ai_processing_batches"
            referencedColumns: ["id"]
          }
        ]
      }
      agent_personas: {
        Row: {
          id: string
          name: string
          description: string | null
          system_prompt: string
          context: string | null
          embedding: number[] | null
          model: string
          temperature: number
          max_tokens: number
          top_p: number
          personality: Json
          expertise: string[]
          spiritual_focus: string | null
          tone: string | null
          style: string | null
          is_active: boolean
          is_default: boolean
          version: number
          created_at: string
          updated_at: string
          created_by: string | null
        }
        Insert: {
          id?: string
          name: string
          description?: string | null
          system_prompt: string
          context?: string | null
          embedding?: number[] | null
          model?: string
          temperature?: number
          max_tokens?: number
          top_p?: number
          personality?: Json
          expertise?: string[]
          spiritual_focus?: string | null
          tone?: string | null
          style?: string | null
          is_active?: boolean
          is_default?: boolean
          version?: number
          created_at?: string
          updated_at?: string
          created_by?: string | null
        }
        Update: {
          id?: string
          name?: string
          description?: string | null
          system_prompt?: string
          context?: string | null
          embedding?: number[] | null
          model?: string
          temperature?: number
          max_tokens?: number
          top_p?: number
          personality?: Json
          expertise?: string[]
          spiritual_focus?: string | null
          tone?: string | null
          style?: string | null
          is_active?: boolean
          is_default?: boolean
          version?: number
          created_at?: string
          updated_at?: string
          created_by?: string | null
        }
        Relationships: []
      }
      agent_tasks: {
        Row: {
          id: string
          persona_id: string | null
          region_id: string | null
          created_by: string | null
          task_type: string
          status: string
          priority: number
          input_data: Json | null
          prompt_used: string | null
          result_data: Json | null
          raw_response: string | null
          tokens_used: number
          processing_time_ms: number
          confidence_score: number
          user_approved: boolean
          approved_at: string | null
          approved_by: string | null
          rejection_reason: string | null
          error_message: string | null
          error_code: string | null
          retry_count: number
          created_at: string
          started_at: string | null
          completed_at: string | null
          updated_at: string
        }
        Insert: {
          id?: string
          persona_id?: string | null
          region_id?: string | null
          created_by?: string | null
          task_type: string
          status?: string
          priority?: number
          input_data?: Json | null
          prompt_used?: string | null
          result_data?: Json | null
          raw_response?: string | null
          tokens_used?: number
          processing_time_ms?: number
          confidence_score?: number
          user_approved?: boolean
          approved_at?: string | null
          approved_by?: string | null
          rejection_reason?: string | null
          error_message?: string | null
          error_code?: string | null
          retry_count?: number
          created_at?: string
          started_at?: string | null
          completed_at?: string | null
          updated_at?: string
        }
        Update: {
          id?: string
          persona_id?: string | null
          region_id?: string | null
          created_by?: string | null
          task_type?: string
          status?: string
          priority?: number
          input_data?: Json | null
          prompt_used?: string | null
          result_data?: Json | null
          raw_response?: string | null
          tokens_used?: number
          processing_time_ms?: number
          confidence_score?: number
          user_approved?: boolean
          approved_at?: string | null
          approved_by?: string | null
          rejection_reason?: string | null
          error_message?: string | null
          error_code?: string | null
          retry_count?: number
          created_at?: string
          started_at?: string | null
          completed_at?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "agent_tasks_persona_id_fkey"
            columns: ["persona_id"]
            isOneToOne: false
            referencedRelation: "agent_personas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "agent_tasks_region_id_fkey"
            columns: ["region_id"]
            isOneToOne: false
            referencedRelation: "spiritual_regions"
            referencedColumns: ["id"]
          }
        ]
      }
      agent_sessions: {
        Row: {
          id: string
          session_name: string
          description: string | null
          persona_id: string | null
          target_regions: string[]
          task_types: string[]
          status: string
          total_tasks: number
          completed_tasks: number
          failed_tasks: number
          total_tokens_used: number
          total_processing_time_ms: number
          estimated_cost_usd: number
          created_at: string
          started_at: string | null
          completed_at: string | null
          updated_at: string
          created_by: string | null
        }
        Insert: {
          id?: string
          session_name: string
          description?: string | null
          persona_id?: string | null
          target_regions?: string[]
          task_types?: string[]
          status?: string
          total_tasks?: number
          completed_tasks?: number
          failed_tasks?: number
          total_tokens_used?: number
          total_processing_time_ms?: number
          estimated_cost_usd?: number
          created_at?: string
          started_at?: string | null
          completed_at?: string | null
          updated_at?: string
          created_by?: string | null
        }
        Update: {
          id?: string
          session_name?: string
          description?: string | null
          persona_id?: string | null
          target_regions?: string[]
          task_types?: string[]
          status?: string
          total_tasks?: number
          completed_tasks?: number
          failed_tasks?: number
          total_tokens_used?: number
          total_processing_time_ms?: number
          estimated_cost_usd?: number
          created_at?: string
          started_at?: string | null
          completed_at?: string | null
          updated_at?: string
          created_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "agent_sessions_persona_id_fkey"
            columns: ["persona_id"]
            isOneToOne: false
            referencedRelation: "agent_personas"
            referencedColumns: ["id"]
          }
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      promote_user_role: {
        Args: { target_user_id: string; new_role: string }
        Returns: boolean
      }
      update_rankings: {
        Args: {}
        Returns: undefined
      }
      get_batch_progress: {
        Args: { batch_uuid: string }
        Returns: Json
      }
      estimate_batch_cost: {
        Args: { batch_uuid: string }
        Returns: number
      }
      get_next_queue_item: {
        Args: {}
        Returns: {
          queue_id: string
          region_id: string
          region_name: string
          region_type: string
          continent: string
          prompt_text: string
        }[]
      }
      find_similar_personas: {
        Args: {
          query_embedding: number[]
          similarity_threshold?: number
          result_limit?: number
        }
        Returns: {
          persona_id: string
          name: string
          similarity_score: number
        }[]
      }
      calculate_session_stats: {
        Args: { session_uuid: string }
        Returns: {
          total_tasks: number
          completed_tasks: number
          failed_tasks: number
          pending_tasks: number
          processing_tasks: number
          total_tokens: number
          estimated_cost: number
          avg_processing_time_ms: number
          success_rate: number
        }[]
      }
    }
    Enums: {
      alert_severity: "info" | "warning" | "danger"
      location_type: "continent" | "country" | "state" | "city" | "neighborhood"
      prayer_category:
        | "spiritual"
        | "social"
        | "political"
        | "economic"
        | "natural"
      spiritual_alert_type:
        | "persecution"
        | "idolatry"
        | "warfare"
        | "breakthrough"
        | "revival"
      testimony_category:
        | "healing"
        | "salvation"
        | "breakthrough"
        | "revival"
        | "miracle"
      urgency_level: "low" | "medium" | "high" | "critical"
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
    Enums: {
      alert_severity: ["info", "warning", "danger"],
      location_type: ["continent", "country", "state", "city", "neighborhood"],
      prayer_category: [
        "spiritual",
        "social",
        "political",
        "economic",
        "natural",
      ],
      spiritual_alert_type: [
        "persecution",
        "idolatry",
        "warfare",
        "breakthrough",
        "revival",
      ],
      testimony_category: [
        "healing",
        "salvation",
        "breakthrough",
        "revival",
        "miracle",
      ],
      urgency_level: ["low", "medium", "high", "critical"],
    },
  },
} as const
