'use client'

import { useState, useEffect } from 'react'
import { InsightsService } from '@/lib/insights-service'
import { StreakCard } from './insights/StreakCard'
import { TopicMasteryCard } from './insights/TopicMasteryCard'
import { ConfidenceTrendCard } from './insights/ConfidenceTrendCard'
import { HighlightsCard } from './insights/HighlightsCard'
import { Loader2, AlertCircle } from 'lucide-react'

interface InsightsData {
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

export function InsightsDashboard() {
  const [insights, setInsights] = useState<InsightsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchInsights()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const fetchInsights = async () => {
    try {
      setLoading(true)
      setError(null)
      
      // For demo purposes, we'll use a mock user ID
      // In a real app, this would come from authentication
      const userId = '00000000-0000-0000-0000-000000000000'
      
      // Get insights using the service
      const insights = await InsightsService.getUserInsights(userId)
      
      if (insights) {
        setInsights(insights)
      } else {
        setError('Failed to load insights. Please try again.')
        setInsights(getMockInsights())
      }
    } catch (err) {
      console.error('Error:', err)
      setError('Failed to load insights. Please try again.')
      // Fall back to mock data
      setInsights(getMockInsights())
    } finally {
      setLoading(false)
    }
  }

  const getMockInsights = (): InsightsData => ({
    streak_count: 7,
    last_active: new Date().toISOString(),
    frequent_subjects: {
      'Mathematics': 15,
      'Physics': 12,
      'Chemistry': 8,
      'Biology': 6,
      'History': 4
    },
    confidence_trend: [3, 4, 3, 5, 4, 4, 5, 3, 4, 5, 4, 3, 4, 5, 5],
    highlights: {
      best_answers: [
        'Solved complex calculus problem with perfect score',
        'Explained quantum physics concept clearly',
        'Identified historical patterns accurately'
      ],
      areas_to_review: [
        'Organic chemistry reactions',
        'Medieval European history',
        'Statistical analysis methods'
      ],
      achievements: [
        '7-day streak achieved!',
        'High confidence maintained',
        'Consistent progress in Mathematics'
      ]
    }
  })

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-primary-600" />
        <span className="ml-2 text-gray-600">Loading insights...</span>
      </div>
    )
  }

  if (error && !insights) {
    return (
      <div className="flex items-center justify-center py-12">
        <AlertCircle className="w-8 h-8 text-red-500" />
        <span className="ml-2 text-red-600">{error}</span>
      </div>
    )
  }

  if (!insights) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">No insights available yet. Start learning to see your progress!</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StreakCard streakCount={insights.streak_count} lastActive={insights.last_active} />
        <TopicMasteryCard frequentSubjects={insights.frequent_subjects} />
        <ConfidenceTrendCard confidenceTrend={insights.confidence_trend} />
      </div>

      {/* Highlights */}
      <HighlightsCard highlights={insights.highlights} />

      {/* Refresh Button */}
      <div className="flex justify-center">
        <button
          onClick={fetchInsights}
          className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
        >
          Refresh Insights
        </button>
      </div>
    </div>
  )
}