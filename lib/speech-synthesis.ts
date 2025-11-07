'use client'

import { useState, useRef, useEffect } from 'react'
import { VoiceSettings } from '@/types/voice'

export interface UseSpeechSynthesisReturn {
  isSpeaking: boolean;
  speak: (text: string, settings?: VoiceSettings) => void;
  stop: () => void;
  pause: () => void;
  resume: () => void;
  isSupported: boolean;
}

export const useSpeechSynthesis = (): UseSpeechSynthesisReturn => {
  const [isSpeaking, setIsSpeaking] = useState(false)
  const [isSupported, setIsSupported] = useState(false)
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null)

  useEffect(() => {
    setIsSupported('speechSynthesis' in window)
  }, [])

  const speak = (text: string, settings?: VoiceSettings) => {
    if (!isSupported) {
      console.warn('Speech synthesis is not supported in this browser.')
      return
    }

    // Stop any current speech
    window.speechSynthesis.cancel()

    const utterance = new SpeechSynthesisUtterance(text)
    utteranceRef.current = utterance

    // Apply voice settings
    if (settings) {
      utterance.rate = 1.0
      utterance.pitch = 1.0
      utterance.volume = 1.0

      // Set voice based on tone preference
      const voices = window.speechSynthesis.getVoices()
      
      switch (settings.voiceTone) {
        case 'male':
          const maleVoice = voices.find(voice => 
            voice.name.toLowerCase().includes('male') || 
            voice.name.toLowerCase().includes('david') ||
            voice.name.toLowerCase().includes('alex')
          )
          if (maleVoice) utterance.voice = maleVoice
          break
        case 'female':
          const femaleVoice = voices.find(voice => 
            voice.name.toLowerCase().includes('female') || 
            voice.name.toLowerCase().includes('siri') ||
            voice.name.toLowerCase().includes('karen')
          )
          if (femaleVoice) utterance.voice = femaleVoice
          break
        case 'robotic':
          utterance.pitch = 0.5
          utterance.rate = 0.8
          break
      }
    }

    utterance.onstart = () => {
      setIsSpeaking(true)
    }

    utterance.onend = () => {
      setIsSpeaking(false)
    }

    utterance.onerror = (event) => {
      console.error('Speech synthesis error:', event)
      setIsSpeaking(false)
    }

    window.speechSynthesis.speak(utterance)
  }

  const stop = () => {
    if (isSupported) {
      window.speechSynthesis.cancel()
      setIsSpeaking(false)
    }
  }

  const pause = () => {
    if (isSupported && isSpeaking) {
      window.speechSynthesis.pause()
    }
  }

  const resume = () => {
    if (isSupported) {
      window.speechSynthesis.resume()
    }
  }

  return {
    isSpeaking,
    speak,
    stop,
    pause,
    resume,
    isSupported,
  }
}