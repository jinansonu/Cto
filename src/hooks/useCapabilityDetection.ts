import { useState, useEffect } from 'react'

interface Capabilities {
  isOnline: boolean
  speechRecognition: boolean
  speechSynthesis: boolean
  camera: boolean
  geolocation: boolean
  localStorage: boolean
  webGL: boolean
}

export const useCapabilityDetection = () => {
  const [capabilities, setCapabilities] = useState<Capabilities>({
    isOnline: navigator.onLine,
    speechRecognition: !!(window as any).SpeechRecognition || !!(window as any).webkitSpeechRecognition,
    speechSynthesis: 'speechSynthesis' in window,
    camera: !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia),
    geolocation: 'geolocation' in navigator,
    localStorage: typeof Storage !== 'undefined',
    webGL: (() => {
      try {
        const canvas = document.createElement('canvas')
        return !!(window.WebGLRenderingContext && 
          (canvas.getContext('webgl') || canvas.getContext('experimental-webgl')))
      } catch (e) {
        return false
      }
    })(),
  })

  useEffect(() => {
    const handleOnline = () => setCapabilities(prev => ({ ...prev, isOnline: true }))
    const handleOffline = () => setCapabilities(prev => ({ ...prev, isOnline: false }))

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  return capabilities
}