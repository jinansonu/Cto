import React from 'react'
import { Link } from 'react-router-dom'
import { LoadingPlaceholder } from '../components/LoadingPlaceholder'
import { useCapabilityDetection } from '../hooks/useCapabilityDetection'
import { useAnalyticsContext } from '../contexts/AnalyticsContext'
import { ErrorBoundary } from '../components/ErrorBoundary'

export const HomePage: React.FC = () => {
  const capabilities = useCapabilityDetection()
  const { trackEvent } = useAnalyticsContext()

  const features = [
    {
      name: 'Speech Recognition',
      description: 'Convert speech to text using your microphone',
      href: '/speech',
      icon: '🎤',
      available: capabilities.speechRecognition,
      fallback: 'Speech recognition is not supported in your browser',
    },
    {
      name: 'Camera Access',
      description: 'Access your camera for photos and video',
      href: '/camera',
      icon: '📷',
      available: capabilities.camera,
      fallback: 'Camera access is not available or not permitted',
    },
    {
      name: 'Text Mode',
      description: 'Use text-based alternatives when voice/camera aren\'t available',
      href: '/settings',
      icon: '💬',
      available: true,
      fallback: '',
    },
  ]

  const handleFeatureClick = (featureName: string) => {
    trackEvent('feature_clicked', { feature: featureName })
  }

  return (
    <ErrorBoundary>
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Welcome to CTO App
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            A modern web application with comprehensive error handling, accessibility features, 
            and capability detection for the best user experience.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {features.map((feature) => (
            <div
              key={feature.name}
              className={`bg-white rounded-lg shadow-md p-6 transition-all duration-200 ${
                feature.available 
                  ? 'hover:shadow-lg cursor-pointer border border-gray-200' 
                  : 'opacity-60 cursor-not-allowed border border-gray-100'
              }`}
              onClick={() => feature.available && handleFeatureClick(feature.name)}
            >
              <div className="text-4xl mb-4 text-center" role="img" aria-label={feature.name}>
                {feature.icon}
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                {feature.name}
              </h3>
              <p className="text-gray-600 text-sm mb-4">
                {feature.description}
              </p>
              
              {feature.available ? (
                <Link
                  to={feature.href}
                  className="inline-flex items-center text-blue-600 hover:text-blue-800 font-medium text-sm"
                  aria-label={`Navigate to ${feature.name}`}
                >
                  Try it now
                  <svg className="ml-1 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </Link>
              ) : (
                <div className="text-yellow-600 text-sm">
                  ⚠️ {feature.fallback}
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">System Status</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            <div className="text-center">
              <div className={`w-3 h-3 rounded-full mx-auto mb-2 ${
                capabilities.isOnline ? 'bg-green-500' : 'bg-red-500'
              }`}></div>
              <p className="text-sm text-gray-600">Network</p>
              <p className="text-xs font-medium">{capabilities.isOnline ? 'Online' : 'Offline'}</p>
            </div>
            <div className="text-center">
              <div className={`w-3 h-3 rounded-full mx-auto mb-2 ${
                capabilities.speechRecognition ? 'bg-green-500' : 'bg-gray-300'
              }`}></div>
              <p className="text-sm text-gray-600">Speech Recognition</p>
              <p className="text-xs font-medium">{capabilities.speechRecognition ? 'Available' : 'Unavailable'}</p>
            </div>
            <div className="text-center">
              <div className={`w-3 h-3 rounded-full mx-auto mb-2 ${
                capabilities.speechSynthesis ? 'bg-green-500' : 'bg-gray-300'
              }`}></div>
              <p className="text-sm text-gray-600">Speech Synthesis</p>
              <p className="text-xs font-medium">{capabilities.speechSynthesis ? 'Available' : 'Unavailable'}</p>
            </div>
            <div className="text-center">
              <div className={`w-3 h-3 rounded-full mx-auto mb-2 ${
                capabilities.camera ? 'bg-green-500' : 'bg-gray-300'
              }`}></div>
              <p className="text-sm text-gray-600">Camera</p>
              <p className="text-xs font-medium">{capabilities.camera ? 'Available' : 'Unavailable'}</p>
            </div>
          </div>
        </div>

        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-blue-900 mb-2">Keyboard Shortcuts</h3>
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div><kbd className="px-2 py-1 bg-white rounded border border-blue-300">Alt+H</kbd> Home</div>
            <div><kbd className="px-2 py-1 bg-white rounded border border-blue-300">Alt+S</kbd> Speech</div>
            <div><kbd className="px-2 py-1 bg-white rounded border border-blue-300">Alt+C</kbd> Camera</div>
            <div><kbd className="px-2 py-1 bg-white rounded border border-blue-300">Alt+,</kbd> Settings</div>
          </div>
        </div>
      </div>
    </ErrorBoundary>
  )
}