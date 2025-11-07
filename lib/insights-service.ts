import { getSupabaseClient } from '@/lib/supabase-client'

export interface Interaction {
  id: string
  user_id: string
  subject: string
  confidence: number
  summary: string
  created_at: string
  updated_at: string
}

export interface Insights {
  streak_count: number
  last_active: string | null
  frequent_subjects: Record<string, number>
  confidence_trend: number[]
  highlights: {
    best_answers: string[]
    areas_to_review: string[]
    achievements: string[]
  }
}

export class InsightsService {
  static async getUserInsights(userId: string): Promise<Insights | null> {
    try {
      const supabase = getSupabaseClient()
      
      if (!supabase) {
        // Return mock data when Supabase is not available
        return this.generateMockInsights()
      }

      const { data, error } = await supabase.rpc('get_user_insights', {
        user_id_param: userId
      } as any)

      if (error) {
        console.error('Error fetching insights:', error)
        return this.generateMockInsights()
      }

      return (data as any) && (data as any).length > 0 ? (data as any)[0] : this.generateMockInsights()
    } catch (error) {
      console.error('Error in getUserInsights:', error)
      return this.generateMockInsights()
    }
  }

  static async recordInteraction(
    userId: string,
    subject: string,
    confidence: number,
    summary: string
  ): Promise<{ success: boolean; error?: string }> {
    try {
      // Validate confidence is between 1 and 5
      if (confidence < 1 || confidence > 5) {
        return { success: false, error: 'Confidence must be between 1 and 5' }
      }

      const supabase = getSupabaseClient()
      
      if (!supabase) {
        // Mock success when Supabase is not available
        return { success: true }
      }

      const { error } = await (supabase as any)
        .from('interactions')
        .insert({
          user_id: userId,
          subject,
          confidence,
          summary
        })

      if (error) {
        console.error('Error recording interaction:', error)
        return { success: false, error: error.message }
      }

      // The trigger will automatically update insights
      return { success: true }
    } catch (error) {
      console.error('Error in recordInteraction:', error)
      return { success: false, error: 'Failed to record interaction' }
    }
  }

  static async getRecentInteractions(userId: string, limit: number = 10): Promise<Interaction[]> {
    try {
      const supabase = getSupabaseClient()
      
      if (!supabase) {
        return []
      }

      const { data, error } = await (supabase as any)
        .from('interactions')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(limit)

      if (error) {
        console.error('Error fetching recent interactions:', error)
        return []
      }

      return data || []
    } catch (error) {
      console.error('Error in getRecentInteractions:', error)
      return []
    }
  }

  static async getInteractionsBySubject(userId: string, subject: string): Promise<Interaction[]> {
    try {
      const supabase = getSupabaseClient()
      
      if (!supabase) {
        return []
      }

      const { data, error } = await (supabase as any)
        .from('interactions')
        .select('*')
        .eq('user_id', userId)
        .eq('subject', subject)
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Error fetching interactions by subject:', error)
        return []
      }

      return data || []
    } catch (error) {
      console.error('Error in getInteractionsBySubject:', error)
      return []
    }
  }

  static generateMockInsights(): Insights {
    return {
      streak_count: Math.floor(Math.random() * 30) + 1,
      last_active: new Date().toISOString(),
      frequent_subjects: {
        'Mathematics': Math.floor(Math.random() * 20) + 5,
        'Physics': Math.floor(Math.random() * 15) + 3,
        'Chemistry': Math.floor(Math.random() * 12) + 2,
        'Biology': Math.floor(Math.random() * 10) + 1,
        'History': Math.floor(Math.random() * 8) + 1,
        'Literature': Math.floor(Math.random() * 6) + 1,
      },
      confidence_trend: Array.from({ length: 15 }, () => Math.floor(Math.random() * 5) + 1),
      highlights: {
        best_answers: [
          'Solved complex calculus problem with perfect score',
          'Explained quantum physics concept clearly',
          'Identified historical patterns accurately',
          'Mastered organic chemistry mechanisms'
        ].filter(() => Math.random() > 0.3),
        areas_to_review: [
          'Organic chemistry reactions',
          'Medieval European history',
          'Statistical analysis methods',
          'Advanced calculus techniques'
        ].filter(() => Math.random() > 0.4),
        achievements: [
          '7-day streak achieved!',
          'High confidence maintained',
          'Consistent progress in Mathematics',
          'Expert level in Physics',
          'Completed 50 interactions'
        ].filter(() => Math.random() > 0.2)
      }
    }
  }
}