import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.REACT_APP_SUPABASE_URL || 'https://your-project.supabase.co';
const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY || 'your-anon-key';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Database types
export interface Interaction {
  id: string;
  title: string;
  content: string;
  created_at: string;
  updated_at: string;
  user_id: string;
}

export interface Favorite {
  id: string;
  interaction_id: string;
  note: string;
  created_at: string;
  updated_at: string;
  user_id: string;
  interaction?: Interaction;
}

export interface Settings {
  id: string;
  voice_tone: 'friendly' | 'professional' | 'casual';
  default_interaction_mode: 'chat' | 'voice' | 'text';
  dark_mode: boolean;
  user_id: string;
  created_at: string;
  updated_at: string;
}

export type VoiceTone = Settings['voice_tone'];
export type InteractionMode = Settings['default_interaction_mode'];