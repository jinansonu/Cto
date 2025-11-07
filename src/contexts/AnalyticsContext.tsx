import React, { createContext, useContext, useEffect } from 'react'
import { useAnalytics } from '../hooks/useAnalytics'
import { useLocation } from 'react-router-dom'

interface AnalyticsContextType {
  trackEvent: (event: string, properties?: Record<string, any>) => void
  logError: (message: string, error?: any) => void
  isEnabled: boolean
  toggleAnalytics: () => void
}

const AnalyticsContext = createContext<AnalyticsContextType | undefined>(undefined)

export const AnalyticsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const location = useLocation()
  const analytics = useAnalytics()

  useEffect(() => {
    analytics.logPageView(location.pathname)
  }, [location.pathname, analytics])

  const value: AnalyticsContextType = {
    trackEvent: analytics.trackEvent,
    logError: analytics.logError,
    isEnabled: analytics.isEnabled,
    toggleAnalytics: () => {
      if (analytics.isEnabled) {
        analytics.disableAnalytics()
      } else {
        analytics.enableAnalytics()
      }
    },
  }

  return (
    <AnalyticsContext.Provider value={value}>
      {children}
    </AnalyticsContext.Provider>
  )
}

export const useAnalyticsContext = () => {
  const context = useContext(AnalyticsContext)
  if (context === undefined) {
    throw new Error('useAnalyticsContext must be used within an AnalyticsProvider')
  }
  return context
}