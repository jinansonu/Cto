import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

export const supabase = supabaseUrl && supabaseAnonKey 
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null

export interface InteractionRecord {
  id: string;
  mode: 'voice' | 'text';
  transcript?: string;
  response: string;
  confidence?: number;
  summary?: string;
  created_at: string;
  user_id: string;
}

export const saveInteraction = async (
  userId: string,
  mode: 'voice' | 'text',
  transcript: string,
  response: string,
  confidence?: number,
  summary?: string
): Promise<InteractionRecord | null> => {
  if (!supabase) {
    console.warn('Supabase not configured. Skipping interaction save.')
    return null
  }

  try {
    const { data, error } = await supabase
      .from('interactions')
      .insert([
        {
          user_id: userId,
          mode,
          transcript,
          response,
          confidence,
          summary,
        },
      ])
      .select()
      .single()

    if (error) {
      console.error('Error saving interaction:', error)
      throw error
    }

    return data
  } catch (error) {
    console.error('Failed to save interaction:', error)
    return null
  }
}

export const updateStreakInsights = async (userId: string): Promise<void> => {
  if (!supabase) {
    console.warn('Supabase not configured. Skipping streak update.')
    return
  }

  // This would trigger a database function or edge function
  // to update streak insights based on the new interaction
  try {
    const { error } = await supabase.rpc('update_user_streak', {
      p_user_id: userId,
    })

    if (error) {
      console.error('Error updating streak:', error)
    }
  } catch (error) {
    console.error('Error calling streak update function:', error)
  }
}