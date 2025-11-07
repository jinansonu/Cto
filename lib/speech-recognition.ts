'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { VoiceSettings, SpeechRecognitionEvent, SpeechRecognitionErrorEvent } from '@/types/voice'

export interface UseSpeechRecognitionReturn {
  isListening: boolean;
  transcript: string;
  isSupported: boolean;
  error: string | null;
  startListening: () => void;
  stopListening: () => void;
  resetTranscript: () => void;
}

export const useSpeechRecognition = (settings: VoiceSettings): UseSpeechRecognitionReturn => {
  const [isListening, setIsListening] = useState(false)
  const [transcript, setTranscript] = useState('')
  const [isSupported, setIsSupported] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  const recognitionRef = useRef<any>(null)
  const timeoutRef = useRef<NodeJS.Timeout>()

  const stopListening = useCallback(() => {
    if (recognitionRef.current && isListening) {
      recognitionRef.current.stop()
    }
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }
  }, [isListening])

  useEffect(() => {
    // Check if Speech Recognition is supported
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
    
    if (!SpeechRecognition) {
      setIsSupported(false)
      return
    }

    setIsSupported(true)
    
    recognitionRef.current = new SpeechRecognition()
    const recognition = recognitionRef.current

    recognition.continuous = true
    recognition.interimResults = true
    recognition.lang = settings.language

    recognition.onstart = () => {
      setIsListening(true)
      setError(null)
      // Set timeout for automatic stop after 30 seconds of silence
      timeoutRef.current = setTimeout(() => {
        stopListening()
      }, 30000)
    }

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      let finalTranscript = ''
      let interimTranscript = ''

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript
        if (event.results[i].isFinal) {
          finalTranscript += transcript + ' '
        } else {
          interimTranscript += transcript
        }
      }

      setTranscript(finalTranscript + interimTranscript)

      // Reset timeout when we get results
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
        timeoutRef.current = setTimeout(() => {
          stopListening()
        }, 30000)
      }
    }

    recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
      console.error('Speech recognition error:', event.error)
      
      switch (event.error) {
        case 'not-allowed':
        case 'service-not-allowed':
          setError('Microphone access denied. Please allow microphone permissions and try again.')
          break
        case 'network':
          setError('Network error. Please check your internet connection.')
          break
        case 'no-speech':
          setError('No speech detected. Please try speaking clearly.')
          break
        case 'audio-capture':
          setError('Microphone not found or not working.')
          break
        case 'timeout':
          setError('Speech recognition timed out. Please try again.')
          break
        default:
          setError(`Speech recognition error: ${event.error}`)
      }
      
      setIsListening(false)
    }

    recognition.onend = () => {
      setIsListening(false)
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop()
      }
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }
  }, [settings.language, stopListening])

  const startListening = () => {
    if (!isSupported || !recognitionRef.current) {
      setError('Speech recognition is not supported in this browser.')
      return
    }

    try {
      setTranscript('')
      setError(null)
      recognitionRef.current.start()
    } catch (err) {
      console.error('Error starting speech recognition:', err)
      setError('Failed to start speech recognition. Please try again.')
    }
  }

  const resetTranscript = useCallback(() => {
    setTranscript('')
    setError(null)
  }, [])

  return {
    isListening,
    transcript,
    isSupported,
    error,
    startListening,
    stopListening,
    resetTranscript,
  }
}