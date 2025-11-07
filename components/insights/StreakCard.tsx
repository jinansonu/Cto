'use client'

import { Flame, Calendar } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'

interface StreakCardProps {
  streakCount: number
  lastActive: string | null
}

export function StreakCard({ streakCount, lastActive }: StreakCardProps) {
  const getLastActiveText = () => {
    if (!lastActive) return 'No activity yet'
    
    try {
      const date = new Date(lastActive)
      return `Active ${formatDistanceToNow(date, { addSuffix: true })}`
    } catch {
      return 'Unknown'
    }
  }

  const getStreakMessage = () => {
    if (streakCount === 0) return 'Start your streak!'
    if (streakCount === 1) return 'Great start!'
    if (streakCount < 7) return 'Keep it going!'
    if (streakCount < 30) return 'On fire! 🔥'
    return 'Incredible consistency!'
  }

  return (
    <div className="stat-card">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <Flame className="w-5 h-5 text-orange-500" />
          <h3 className="font-semibold text-gray-900">Streak</h3>
        </div>
        <div className="text-2xl font-bold text-orange-600">
          {streakCount}
        </div>
      </div>
      
      <div className="space-y-2">
        <div className="text-sm text-gray-600">
          {getStreakMessage()}
        </div>
        <div className="flex items-center space-x-1 text-xs text-gray-500">
          <Calendar className="w-3 h-3" />
          <span>{getLastActiveText()}</span>
        </div>
      </div>

      {streakCount > 0 && (
        <div className="mt-4 pt-4 border-t border-gray-200">
          <div className="flex space-x-1">
            {Array.from({ length: Math.min(streakCount, 7) }).map((_, i) => (
              <div
                key={i}
                className="flex-1 h-2 bg-gradient-to-r from-orange-400 to-orange-600 rounded-full"
              />
            ))}
            {streakCount > 7 && (
              <div className="flex items-center justify-center w-4 h-2 text-xs text-orange-600 font-semibold">
                +{streakCount - 7}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}