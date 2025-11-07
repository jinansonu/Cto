'use client'

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { TrendingUp, TrendingDown, Minus } from 'lucide-react'

interface ConfidenceTrendCardProps {
  confidenceTrend: number[]
}

export function ConfidenceTrendCard({ confidenceTrend }: ConfidenceTrendCardProps) {
  if (confidenceTrend.length === 0) {
    return (
      <div className="stat-card">
        <div className="flex items-center space-x-2 mb-4">
          <TrendingUp className="w-5 h-5 text-green-500" />
          <h3 className="font-semibold text-gray-900">Confidence Trend</h3>
        </div>
        <div className="text-center py-8">
          <p className="text-gray-500 text-sm">No confidence data yet</p>
          <p className="text-gray-400 text-xs mt-1">Complete more interactions to see trends</p>
        </div>
      </div>
    )
  }

  const chartData = confidenceTrend.map((confidence, index) => ({
    day: `Day ${index + 1}`,
    confidence,
  }))

  const averageConfidence = confidenceTrend.reduce((sum, conf) => sum + conf, 0) / confidenceTrend.length
  const recentAverage = confidenceTrend.slice(-5).reduce((sum, conf) => sum + conf, 0) / Math.min(5, confidenceTrend.length)
  const earlierAverage = confidenceTrend.slice(0, Math.min(5, confidenceTrend.length)).reduce((sum, conf) => sum + conf, 0) / Math.min(5, confidenceTrend.length)
  
  const trend = recentAverage - earlierAverage
  const TrendIcon = trend > 0.5 ? TrendingUp : trend < -0.5 ? TrendingDown : Minus
  const trendColor = trend > 0.5 ? 'text-green-600' : trend < -0.5 ? 'text-red-600' : 'text-gray-600'

  const getConfidenceLabel = (confidence: number) => {
    if (confidence <= 2) return 'Low'
    if (confidence <= 3) return 'Medium'
    if (confidence <= 4) return 'High'
    return 'Very High'
  }

  const getConfidenceColor = (confidence: number) => {
    if (confidence <= 2) return '#ef4444' // red
    if (confidence <= 3) return '#f59e0b' // yellow
    if (confidence <= 4) return '#22c55e' // green
    return '#059669' // emerald
  }

  return (
    <div className="stat-card">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <TrendingUp className="w-5 h-5 text-green-500" />
          <h3 className="font-semibold text-gray-900">Confidence Trend</h3>
        </div>
        <div className="flex items-center space-x-1">
          <TrendIcon className={`w-4 h-4 ${trendColor}`} />
          <span className={`text-sm font-medium ${trendColor}`}>
            {averageConfidence.toFixed(1)}
          </span>
        </div>
      </div>

      <div className="mb-4">
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-gray-500">Current Level</span>
            <div className="font-medium text-gray-900">
              {getConfidenceLabel(recentAverage)}
            </div>
          </div>
          <div>
            <span className="text-gray-500">Total Sessions</span>
            <div className="font-medium text-gray-900">
              {confidenceTrend.length}
            </div>
          </div>
        </div>
      </div>

      <div className="h-32">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis 
              dataKey="day" 
              tick={{ fontSize: 10 }}
              interval="preserveStartEnd"
            />
            <YAxis 
              domain={[1, 5]}
              ticks={[1, 2, 3, 4, 5]}
              tick={{ fontSize: 10 }}
            />
            <Tooltip 
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  const data = payload[0].payload
                  return (
                    <div className="bg-white p-2 border border-gray-200 rounded shadow-sm">
                      <p className="text-xs font-medium">{data.day}</p>
                      <p className="text-xs text-gray-600">
                        Confidence: {data.confidence}/5 ({getConfidenceLabel(data.confidence)})
                      </p>
                    </div>
                  )
                }
                return null
              }}
            />
            <Line
              type="monotone"
              dataKey="confidence"
              stroke={getConfidenceColor(recentAverage)}
              strokeWidth={2}
              dot={{ fill: getConfidenceColor(recentAverage), r: 3 }}
              activeDot={{ r: 4 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="mt-4 pt-4 border-t border-gray-200">
        <div className="flex justify-between text-xs text-gray-500">
          <span>Low (1-2)</span>
          <span>Medium (3)</span>
          <span>High (4-5)</span>
        </div>
      </div>
    </div>
  )
}