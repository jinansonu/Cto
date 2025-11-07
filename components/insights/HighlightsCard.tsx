'use client'

import { Star, AlertTriangle, Trophy, Target } from 'lucide-react'

interface Highlights {
  best_answers: string[]
  areas_to_review: string[]
  achievements: string[]
}

interface HighlightsCardProps {
  highlights: Highlights
}

export function HighlightsCard({ highlights }: HighlightsCardProps) {
  const hasContent = highlights.best_answers.length > 0 || 
                    highlights.areas_to_review.length > 0 || 
                    highlights.achievements.length > 0

  if (!hasContent) {
    return (
      <div className="card">
        <h3 className="font-semibold text-gray-900 mb-4 flex items-center space-x-2">
          <Star className="w-5 h-5 text-yellow-500" />
          <span>Highlights</span>
        </h3>
        <div className="text-center py-8">
          <Star className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500 text-sm">No highlights yet</p>
          <p className="text-gray-400 text-xs mt-1">Keep learning to unlock achievements and insights</p>
        </div>
      </div>
    )
  }

  return (
    <div className="card">
      <h3 className="font-semibold text-gray-900 mb-6 flex items-center space-x-2">
        <Star className="w-5 h-5 text-yellow-500" />
        <span>Highlights</span>
      </h3>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Best Answers */}
        {highlights.best_answers.length > 0 && (
          <div className="space-y-3">
            <div className="flex items-center space-x-2 text-green-600">
              <Trophy className="w-4 h-4" />
              <h4 className="font-medium text-sm">Best Answers</h4>
            </div>
            <div className="space-y-2">
              {highlights.best_answers.map((answer, index) => (
                <div key={index} className="insight-card">
                  <p className="text-sm text-gray-700">{answer}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Areas to Review */}
        {highlights.areas_to_review.length > 0 && (
          <div className="space-y-3">
            <div className="flex items-center space-x-2 text-yellow-600">
              <AlertTriangle className="w-4 h-4" />
              <h4 className="font-medium text-sm">Areas to Review</h4>
            </div>
            <div className="space-y-2">
              {highlights.areas_to_review.map((area, index) => (
                <div key={index} className="bg-yellow-50 rounded-lg p-3 border border-yellow-200">
                  <p className="text-sm text-gray-700">{area}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Achievements */}
        {highlights.achievements.length > 0 && (
          <div className="space-y-3">
            <div className="flex items-center space-x-2 text-purple-600">
              <Target className="w-4 h-4" />
              <h4 className="font-medium text-sm">Achievements</h4>
            </div>
            <div className="space-y-2">
              {highlights.achievements.map((achievement, index) => (
                <div key={index} className="bg-purple-50 rounded-lg p-3 border border-purple-200">
                  <p className="text-sm text-gray-700">{achievement}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Summary Stats */}
      <div className="mt-6 pt-6 border-t border-gray-200">
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <div className="text-2xl font-bold text-green-600">{highlights.best_answers.length}</div>
            <div className="text-xs text-gray-500">Best Answers</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-yellow-600">{highlights.areas_to_review.length}</div>
            <div className="text-xs text-gray-500">Review Areas</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-purple-600">{highlights.achievements.length}</div>
            <div className="text-xs text-gray-500">Achievements</div>
          </div>
        </div>
      </div>
    </div>
  )
}