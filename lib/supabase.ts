import { createClient } from '@supabase/supabase-js'
import { createBrowserClient } from '@supabase/ssr'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

export const supabase = supabaseUrl && supabaseAnonKey 
  ? createBrowserClient(supabaseUrl, supabaseAnonKey)
  : null

export type Database = {
  public: {
    Tables: {
      interactions: {
        Row: {
          id: string
          user_id: string
          subject: string
          confidence: number
          summary: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          subject: string
          confidence: number
          summary: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          subject?: string
          confidence?: number
          summary?: string
          created_at?: string
          updated_at?: string
        }
      }
      insights: {
        Row: {
          id: string
          user_id: string
          streak_count: number
          last_active: string
          frequent_subjects: Record<string, number>
          confidence_trend: number[]
          highlights: {
            best_answers: string[]
            areas_to_review: string[]
            achievements: string[]
          }
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          streak_count: number
          last_active: string
          frequent_subjects: Record<string, number>
          confidence_trend: number[]
          highlights: {
            best_answers: string[]
            areas_to_review: string[]
            achievements: string[]
          }
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          streak_count?: number
          last_active?: string
          frequent_subjects?: Record<string, number>
          confidence_trend?: number[]
          highlights?: {
            best_answers: string[]
            areas_to_review: string[]
            achievements: string[]
          }
          created_at?: string
          updated_at?: string
        }
      }
    }
    Functions: {
      get_user_insights: {
        Args: {
          user_id: string
        }
        Returns: {
          streak_count: number
          last_active: string
          frequent_subjects: Record<string, number>
          confidence_trend: number[]
          highlights: {
            best_answers: string[]
            areas_to_review: string[]
            achievements: string[]
          }
        }
      }
      update_insights_after_interaction: {
        Args: {
          p_user_id: string
          p_subject: string
          p_confidence: number
          p_summary: string
        }
        Returns: void
      }
    }
  }
}