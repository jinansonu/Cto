'use client'

import { BookOpen, TrendingUp } from 'lucide-react'

interface TopicMasteryCardProps {
  frequentSubjects: Record<string, number>
}

export function TopicMasteryCard({ frequentSubjects }: TopicMasteryCardProps) {
  const sortedSubjects = Object.entries(frequentSubjects)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5)

  const totalInteractions = Object.values(frequentSubjects).reduce((sum, count) => sum + count, 0)

  const getMasteryLevel = (count: number) => {
    if (count >= 15) return { level: 'Expert', color: 'text-green-600', bg: 'bg-green-100' }
    if (count >= 10) return { level: 'Advanced', color: 'text-blue-600', bg: 'bg-blue-100' }
    if (count >= 5) return { level: 'Intermediate', color: 'text-yellow-600', bg: 'bg-yellow-100' }
    return { level: 'Beginner', color: 'text-gray-600', bg: 'bg-gray-100' }
  }

  if (Object.keys(frequentSubjects).length === 0) {
    return (
      <div className="stat-card">
        <div className="flex items-center space-x-2 mb-4">
          <BookOpen className="w-5 h-5 text-blue-500" />
          <h3 className="font-semibold text-gray-900">Topic Mastery</h3>
        </div>
        <div className="text-center py-8">
          <p className="text-gray-500 text-sm">No topics explored yet</p>
          <p className="text-gray-400 text-xs mt-1">Start learning to see your progress</p>
        </div>
      </div>
    )
  }

  return (
    <div className="stat-card">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <BookOpen className="w-5 h-5 text-blue-500" />
          <h3 className="font-semibold text-gray-900">Topic Mastery</h3>
        </div>
        <div className="flex items-center space-x-1 text-xs text-gray-500">
          <TrendingUp className="w-3 h-3" />
          <span>{totalInteractions} total</span>
        </div>
      </div>

      <div className="space-y-3">
        {sortedSubjects.map(([subject, count], index) => {
          const mastery = getMasteryLevel(count)
          const percentage = totalInteractions > 0 ? (count / totalInteractions) * 100 : 0
          
          return (
            <div key={subject} className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <span className="text-sm font-medium text-gray-900">{subject}</span>
                  <span className={`text-xs px-2 py-0.5 rounded-full ${mastery.bg} ${mastery.color}`}>
                    {mastery.level}
                  </span>
                </div>
                <span className="text-sm text-gray-600">{count}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-gradient-to-r from-blue-400 to-blue-600 h-2 rounded-full transition-all duration-500"
                  style={{ width: `${percentage}%` }}
                />
              </div>
            </div>
          )
        })}
      </div>

      {Object.keys(frequentSubjects).length > 5 && (
        <div className="mt-4 pt-4 border-t border-gray-200">
          <p className="text-xs text-gray-500 text-center">
            +{Object.keys(frequentSubjects).length - 5} more topics
          </p>
        </div>
      )}
    </div>
  )
}