import { createBrowserClient } from '@supabase/ssr'

let supabaseClient: ReturnType<typeof createBrowserClient> | null = null

export const getSupabaseClient = () => {
  if (typeof window === 'undefined') {
    return null // Don't create client on server side
  }

  if (!supabaseClient) {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

    if (supabaseUrl && supabaseAnonKey) {
      supabaseClient = createBrowserClient(supabaseUrl, supabaseAnonKey)
    }
  }

  return supabaseClient
}

export const supabase = getSupabaseClient()