import React, { useState, useEffect, useRef } from 'react'
import { LoadingPlaceholder } from '../components/LoadingPlaceholder'
import { ErrorBoundary } from '../components/ErrorBoundary'
import { useCapabilityDetection } from '../hooks/useCapabilityDetection'
import { useAnalyticsContext } from '../contexts/AnalyticsContext'
import toast from 'react-hot-toast'

interface SpeechRecognitionEvent extends Event {
  results: SpeechRecognitionResultList
  resultIndex: number
}

interface SpeechRecognitionResultList {
  length: number
  item(index: number): SpeechRecognitionResult
  [index: number]: SpeechRecognitionResult
}

interface SpeechRecognitionResult {
  isFinal: boolean
  length: number
  item(index: number): SpeechRecognitionAlternative
  [index: number]: SpeechRecognitionAlternative
}

interface SpeechRecognitionAlternative {
  transcript: string
  confidence: number
}

declare global {
  interface Window {
    SpeechRecognition: any
    webkitSpeechRecognition: any
  }
}

export const SpeechPage: React.FC = () => {
  const { speechRecognition: isSupported, speechSynthesis: isSynthesisSupported } = useCapabilityDetection()
  const { trackEvent, logError } = useAnalyticsContext()
  const [isListening, setIsListening] = useState(false)
  const [transcript, setTranscript] = useState('')
  const [interimTranscript, setInterimTranscript] = useState('')
  const [synthesisText, setSynthesisText] = useState('Hello, this is a test of speech synthesis.')
  const [isSpeaking, setIsSpeaking] = useState(false)
  const recognitionRef = useRef<any>(null)

  useEffect(() => {
    if (!isSupported) return

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
    if (!SpeechRecognition) return

    const recognition = new SpeechRecognition()
    recognition.continuous = true
    recognition.interimResults = true
    recognition.lang = 'en-US'

    recognition.onstart = () => {
      setIsListening(true)
      trackEvent('speech_recognition_started')
    }

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      let finalTranscript = ''
      let interim = ''

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i]
        if (result.isFinal) {
          finalTranscript += result[0].transcript
        } else {
          interim += result[0].transcript
        }
      }

      setTranscript(prev => prev + finalTranscript)
      setInterimTranscript(interim)
    }

    recognition.onerror = (event: any) => {
      logError('Speech recognition error', { error: event.error })
      toast.error(`Speech recognition error: ${event.error}`)
      setIsListening(false)
    }

    recognition.onend = () => {
      setIsListening(false)
      trackEvent('speech_recognition_ended')
    }

    recognitionRef.current = recognition

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop()
      }
    }
  }, [isSupported, trackEvent, logError])

  const toggleListening = () => {
    if (!recognitionRef.current) {
      toast.error('Speech recognition not initialized')
      return
    }

    if (isListening) {
      recognitionRef.current.stop()
    } else {
      recognitionRef.current.start()
    }
  }

  const clearTranscript = () => {
    setTranscript('')
    setInterimTranscript('')
    trackEvent('transcript_cleared')
  }

  const speakText = () => {
    if (!isSynthesisSupported) {
      toast.error('Speech synthesis is not supported in your browser')
      return
    }

    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel()
      const utterance = new SpeechSynthesisUtterance(synthesisText)
      utterance.onstart = () => {
        setIsSpeaking(true)
        trackEvent('speech_synthesis_started')
      }
      utterance.onend = () => {
        setIsSpeaking(false)
        trackEvent('speech_synthesis_ended')
      }
      utterance.onerror = (event) => {
        logError('Speech synthesis error', { error: event })
        toast.error('Speech synthesis error')
        setIsSpeaking(false)
      }
      window.speechSynthesis.speak(utterance)
    }
  }

  const stopSpeaking = () => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel()
      setIsSpeaking(false)
    }
  }

  if (!isSupported && !isSynthesisSupported) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
          <h2 className="text-2xl font-bold text-yellow-900 mb-4">Speech Features Not Available</h2>
          <p className="text-yellow-800 mb-4">
            Your browser doesn't support speech recognition or speech synthesis. 
            Please try using a modern browser like Chrome, Edge, or Safari.
          </p>
          <p className="text-yellow-700 text-sm">
            As an alternative, you can use the text mode in Settings for similar functionality.
          </p>
        </div>
      </div>
    )
  }

  return (
    <ErrorBoundary>
      <div className="max-w-4xl mx-auto space-y-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Speech Features</h1>
          <p className="text-gray-600">
            Test speech recognition and synthesis capabilities in your browser.
          </p>
        </div>

        {isSupported && (
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Speech Recognition</h2>
            
            <div className="space-y-4">
              <div className="flex items-center space-x-4">
                <button
                  onClick={toggleListening}
                  className={`px-6 py-3 rounded-md font-medium transition-colors ${
                    isListening
                      ? 'bg-red-600 hover:bg-red-700 text-white'
                      : 'bg-blue-600 hover:bg-blue-700 text-white'
                  }`}
                  aria-label={isListening ? 'Stop listening' : 'Start listening'}
                >
                  {isListening ? (
                    <>
                      <span className="inline-block w-2 h-2 bg-white rounded-full mr-2 animate-pulse"></span>
                      Stop Listening
                    </>
                  ) : (
                    'Start Listening'
                  )}
                </button>
                
                <button
                  onClick={clearTranscript}
                  disabled={!transcript}
                  className="px-6 py-3 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed font-medium transition-colors"
                >
                  Clear
                </button>
              </div>

              <div className="bg-gray-50 rounded-lg p-4 min-h-[150px]">
                <p className="text-sm text-gray-600 mb-2">Transcript:</p>
                <div className="text-gray-900 whitespace-pre-wrap">
                  {transcript}
                  {interimTranscript && (
                    <span className="text-gray-500 italic">{interimTranscript}</span>
                  )}
                </div>
                {!transcript && !interimTranscript && !isListening && (
                  <p className="text-gray-400 italic">Click "Start Listening" to begin...</p>
                )}
              </div>
            </div>
          </div>
        )}

        {isSynthesisSupported && (
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Speech Synthesis</h2>
            
            <div className="space-y-4">
              <div>
                <label htmlFor="synthesis-text" className="block text-sm font-medium text-gray-700 mb-2">
                  Text to speak:
                </label>
                <textarea
                  id="synthesis-text"
                  value={synthesisText}
                  onChange={(e) => setSynthesisText(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows={3}
                  aria-label="Text to synthesize"
                />
              </div>

              <div className="flex items-center space-x-4">
                <button
                  onClick={speakText}
                  disabled={isSpeaking || !synthesisText.trim()}
                  className="px-6 py-3 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium transition-colors"
                >
                  {isSpeaking ? 'Speaking...' : 'Speak Text'}
                </button>
                
                {isSpeaking && (
                  <button
                    onClick={stopSpeaking}
                    className="px-6 py-3 bg-red-600 text-white rounded-md hover:bg-red-700 font-medium transition-colors"
                  >
                    Stop
                  </button>
                )}
              </div>
            </div>
          </div>
        )}

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 className="font-semibold text-blue-900 mb-2">Tips:</h3>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• Speak clearly and at a moderate pace for best recognition results</li>
            <li>• Allow microphone access when prompted by your browser</li>
            <li>• Speech synthesis works better with shorter text segments</li>
            <li>• Try different voices in your browser settings for synthesis</li>
          </ul>
        </div>
      </div>
    </ErrorBoundary>
  )
}