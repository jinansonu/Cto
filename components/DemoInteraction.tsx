'use client'

import { useState } from 'react'
import { Brain, Plus } from 'lucide-react'
import { InsightsService } from '@/lib/insights-service'

const subjects = [
  'Mathematics',
  'Physics', 
  'Chemistry',
  'Biology',
  'History',
  'Literature',
  'Computer Science',
  'Geography',
  'Art',
  'Music'
]

export function DemoInteraction() {
  const [isOpen, setIsOpen] = useState(false)
  const [subject, setSubject] = useState('')
  const [confidence, setConfidence] = useState(3)
  const [summary, setSummary] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [message, setMessage] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!subject || !summary.trim()) {
      setMessage('Please fill in all fields')
      return
    }

    setIsSubmitting(true)
    setMessage('')

    try {
      // For demo purposes, use a mock user ID
      const userId = '00000000-0000-0000-0000-000000000000'
      
      const result = await InsightsService.recordInteraction(
        userId,
        subject,
        confidence,
        summary
      )

      if (result.success) {
        setMessage('Interaction recorded successfully! 🎉')
        // Reset form
        setSubject('')
        setConfidence(3)
        setSummary('')
        setIsOpen(false)
        
        // Trigger a refresh of the insights dashboard
        setTimeout(() => {
          window.dispatchEvent(new CustomEvent('refresh-insights'))
        }, 500)
      } else {
        setMessage(`Error: ${result.error}`)
      }
    } catch (error) {
      setMessage('Failed to record interaction')
    } finally {
      setIsSubmitting(false)
    }
  }

  const getConfidenceLabel = (value: number) => {
    switch (value) {
      case 1: return 'Very Low'
      case 2: return 'Low'
      case 3: return 'Medium'
      case 4: return 'High'
      case 5: return 'Very High'
      default: return 'Medium'
    }
  }

  const getConfidenceColor = (value: number) => {
    if (value <= 2) return 'bg-red-500'
    if (value <= 3) return 'bg-yellow-500'
    return 'bg-green-500'
  }

  if (!isOpen) {
    return (
      <div className="fixed bottom-6 right-6 z-50">
        <button
          onClick={() => setIsOpen(true)}
          className="bg-primary-600 text-white rounded-full p-4 shadow-lg hover:bg-primary-700 transition-colors flex items-center space-x-2"
        >
          <Plus className="w-5 h-5" />
          <span>Record Learning</span>
        </button>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg p-6 max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <Brain className="w-5 h-5 text-primary-600" />
            <h2 className="text-lg font-semibold">Record Learning Session</h2>
          </div>
          <button
            onClick={() => setIsOpen(false)}
            className="text-gray-400 hover:text-gray-600"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Subject
            </label>
            <select
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              required
            >
              <option value="">Select a subject...</option>
              {subjects.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Confidence Level: {getConfidenceLabel(confidence)}
            </label>
            <div className="flex items-center space-x-2">
              <input
                type="range"
                min="1"
                max="5"
                value={confidence}
                onChange={(e) => setConfidence(Number(e.target.value))}
                className="flex-1"
              />
              <div className={`w-8 h-8 rounded-full ${getConfidenceColor(confidence)} text-white flex items-center justify-center text-sm font-bold`}>
                {confidence}
              </div>
            </div>
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>Very Low</span>
              <span>Medium</span>
              <span>Very High</span>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Summary
            </label>
            <textarea
              value={summary}
              onChange={(e) => setSummary(e.target.value)}
              placeholder="Describe what you learned or accomplished..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              rows={3}
              required
            />
          </div>

          {message && (
            <div className={`p-3 rounded-lg text-sm ${
              message.includes('Error') 
                ? 'bg-red-50 text-red-700 border border-red-200' 
                : 'bg-green-50 text-green-700 border border-green-200'
            }`}>
              {message}
            </div>
          )}

          <div className="flex space-x-3">
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 bg-primary-600 text-white py-2 px-4 rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-50"
            >
              {isSubmitting ? 'Recording...' : 'Record Session'}
            </button>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="flex-1 bg-gray-200 text-gray-800 py-2 px-4 rounded-lg hover:bg-gray-300 transition-colors"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}