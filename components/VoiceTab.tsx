'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Mic, MicOff, Play, Square, Volume2, VolumeX, Settings, Loader2, AlertCircle } from 'lucide-react'
import { useSpeechRecognition } from '@/lib/speech-recognition'
import { useSpeechSynthesis } from '@/lib/speech-synthesis'
import { AIService } from '@/lib/ai-service'
import { saveInteraction, updateStreakInsights } from '@/lib/supabase'
import { VoiceSettings, AIResponse } from '@/types/voice'

interface VoiceTabProps {
  userId: string
}

export default function VoiceTab({ userId }: VoiceTabProps) {
  const [settings, setSettings] = useState<VoiceSettings>({
    voiceTone: 'default',
    language: 'en-US',
    autoReplay: true,
  })

  const [isProcessing, setIsProcessing] = useState(false)
  const [aiResponse, setAiResponse] = useState<AIResponse | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [showSettings, setShowSettings] = useState(false)

  const {
    isListening,
    transcript,
    isSupported: speechRecognitionSupported,
    error: speechError,
    startListening,
    stopListening,
    resetTranscript,
  } = useSpeechRecognition(settings)

  const {
    isSpeaking,
    speak,
    stop: stopSpeaking,
    isSupported: speechSynthesisSupported,
  } = useSpeechSynthesis()

  const aiService = AIService.getInstance()

  const handleStartRecording = () => {
    setError(null)
    resetTranscript()
    setAiResponse(null)
    startListening()
  }

  const handleStopRecording = async () => {
    stopListening()
    
    if (!transcript.trim()) {
      setError('No speech detected. Please try again.')
      return
    }

    setIsProcessing(true)
    setError(null)

    try {
      // Process the transcript with AI
      const response = await aiService.processVoiceInput(transcript)
      setAiResponse(response)

      // Save to Supabase
      await saveInteraction(
        userId,
        'voice',
        transcript,
        response.text,
        response.confidence,
        response.summary
      )

      // Update streak insights
      await updateStreakInsights(userId)

      // Auto-replay if enabled
      if (settings.autoReplay && speechSynthesisSupported) {
        speak(response.text, settings)
      }
    } catch (err) {
      console.error('Error processing voice input:', err)
      setError('Failed to process your request. Please try again.')
    } finally {
      setIsProcessing(false)
    }
  }

  const handleReplayResponse = () => {
    if (aiResponse && speechSynthesisSupported) {
      speak(aiResponse.text, settings)
    }
  }

  const handleStopSpeaking = () => {
    stopSpeaking()
  }

  const handleVoiceToneChange = (tone: VoiceSettings['voiceTone']) => {
    setSettings(prev => ({ ...prev, voiceTone: tone }))
  }

  const handleLanguageChange = (language: string) => {
    setSettings(prev => ({ ...prev, language }))
  }

  const handleAutoReplayToggle = () => {
    setSettings(prev => ({ ...prev, autoReplay: !prev.autoReplay }))
  }

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold text-gray-900">Voice Assistant</h1>
        <p className="text-gray-600">Click the microphone and start speaking</p>
      </div>

      {/* Browser Support Warning */}
      {!speechRecognitionSupported && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 flex items-center space-x-3"
        >
          <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0" />
          <div className="text-sm text-yellow-800">
            <p className="font-medium">Speech Recognition Not Supported</p>
            <p>Your browser doesn&apos;t support speech recognition. Please try Chrome, Edge, or Safari.</p>
          </div>
        </motion.div>
      )}

      {/* Error Display */}
      {(error || speechError) && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center space-x-3"
        >
          <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
          <p className="text-sm text-red-800">{error || speechError}</p>
        </motion.div>
      )}

      {/* Main Controls */}
      <div className="flex flex-col items-center space-y-6">
        {/* Microphone Button */}
        <motion.div
          className="relative"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <button
            onClick={isListening ? handleStopRecording : handleStartRecording}
            disabled={!speechRecognitionSupported || isProcessing}
            className={`relative w-32 h-32 rounded-full flex items-center justify-center transition-all duration-200 ${
              isListening
                ? 'bg-red-500 hover:bg-red-600 animate-pulse'
                : 'bg-blue-500 hover:bg-blue-600'
            } disabled:opacity-50 disabled:cursor-not-allowed text-white shadow-lg`}
          >
            {isListening ? (
              <MicOff className="w-12 h-12" />
            ) : (
              <Mic className="w-12 h-12" />
            )}
            
            {/* Recording Animation */}
            {isListening && (
              <motion.div
                className="absolute inset-0 rounded-full border-4 border-red-300"
                animate={{
                  scale: [1, 1.3, 1],
                  opacity: [1, 0, 1],
                }}
                transition={{
                  duration: 1.5,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              />
            )}
          </button>
        </motion.div>

        {/* Status Text */}
        <div className="text-center space-y-2">
          {isListening && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-lg font-medium text-red-600"
            >
              Listening... Speak now
            </motion.p>
          )}
          
          {isProcessing && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex items-center space-x-2 text-blue-600"
            >
              <Loader2 className="w-5 h-5 animate-spin" />
              <span className="text-lg font-medium">Processing your request...</span>
            </motion.div>
          )}
        </div>

        {/* Transcript Display */}
        {transcript && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="w-full max-w-2xl"
          >
            <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
              <h3 className="text-sm font-medium text-gray-700 mb-2">You said:</h3>
              <p className="text-gray-900">{transcript}</p>
            </div>
          </motion.div>
        )}

        {/* AI Response */}
        {aiResponse && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="w-full max-w-2xl space-y-4"
          >
            <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
              <div className="flex items-start justify-between mb-2">
                <h3 className="text-sm font-medium text-blue-700">AI Response:</h3>
                {speechSynthesisSupported && (
                  <div className="flex space-x-2">
                    {isSpeaking ? (
                      <button
                        onClick={handleStopSpeaking}
                        className="p-1 rounded hover:bg-blue-100 transition-colors"
                        title="Stop speaking"
                      >
                        <Square className="w-4 h-4 text-blue-600" />
                      </button>
                    ) : (
                      <button
                        onClick={handleReplayResponse}
                        className="p-1 rounded hover:bg-blue-100 transition-colors"
                        title="Replay response"
                      >
                        <Play className="w-4 h-4 text-blue-600" />
                      </button>
                    )}
                  </div>
                )}
              </div>
              <p className="text-gray-900 mb-3">{aiResponse.text}</p>
              
              {/* Response Metadata */}
              <div className="flex flex-wrap gap-2">
                {aiResponse.summary && (
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                    📝 {aiResponse.summary}
                  </span>
                )}
                {aiResponse.confidence && (
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    ✅ {Math.round(aiResponse.confidence * 100)}% confidence
                  </span>
                )}
              </div>
            </div>
          </motion.div>
        )}

        {/* Settings Button */}
        <button
          onClick={() => setShowSettings(!showSettings)}
          className="flex items-center space-x-2 px-4 py-2 rounded-lg bg-gray-100 hover:bg-gray-200 transition-colors"
        >
          <Settings className="w-4 h-4" />
          <span className="text-sm font-medium">Settings</span>
        </button>

        {/* Settings Panel */}
        {showSettings && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="w-full max-w-md bg-white rounded-lg border border-gray-200 p-6 space-y-4"
          >
            <h3 className="text-lg font-medium text-gray-900">Voice Settings</h3>
            
            {/* Voice Tone */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Voice Tone</label>
              <div className="grid grid-cols-2 gap-2">
                {(['default', 'male', 'female', 'robotic'] as const).map((tone) => (
                  <button
                    key={tone}
                    onClick={() => handleVoiceToneChange(tone)}
                    className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                      settings.voiceTone === tone
                        ? 'bg-blue-500 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {tone.charAt(0).toUpperCase() + tone.slice(1)}
                  </button>
                ))}
              </div>
            </div>

            {/* Language */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Language</label>
              <select
                value={settings.language}
                onChange={(e) => handleLanguageChange(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="en-US">English (US)</option>
                <option value="en-GB">English (UK)</option>
                <option value="es-ES">Spanish</option>
                <option value="fr-FR">French</option>
                <option value="de-DE">German</option>
                <option value="it-IT">Italian</option>
                <option value="pt-BR">Portuguese (Brazil)</option>
                <option value="zh-CN">Chinese (Mandarin)</option>
                <option value="ja-JP">Japanese</option>
              </select>
            </div>

            {/* Auto Replay */}
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium text-gray-700">Auto Replay Responses</label>
              <button
                onClick={handleAutoReplayToggle}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  settings.autoReplay ? 'bg-blue-500' : 'bg-gray-200'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    settings.autoReplay ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  )
}