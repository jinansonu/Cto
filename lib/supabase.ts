import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export type Database = {
  public: {
    Tables: {
      interactions: {
        Row: {
          id: string
          user_id: string
          question: string
          answer: string
          summary: string | null
          confidence: number | null
          mode: 'voice' | 'text' | 'camera'
          image_url: string | null
          audio_url: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          question: string
          answer: string
          summary?: string | null
          confidence?: number | null
          mode: 'voice' | 'text' | 'camera'
          image_url?: string | null
          audio_url?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          question?: string
          answer?: string
          summary?: string | null
          confidence?: number | null
          mode?: 'voice' | 'text' | 'camera'
          image_url?: string | null
          audio_url?: string | null
          created_at?: string
          updated_at?: string
        }
      }
    }
  }
}

export type Interaction = Database['public']['Tables']['interactions']['Row']