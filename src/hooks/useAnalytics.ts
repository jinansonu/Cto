import { create } from 'zustand'

interface AnalyticsEvent {
  event: string
  properties?: Record<string, any>
  timestamp: number
}

interface AnalyticsState {
  events: AnalyticsEvent[]
  isEnabled: boolean
  trackEvent: (event: string, properties?: Record<string, any>) => void
  logError: (message: string, error?: any) => void
  logPageView: (path: string) => void
  clearEvents: () => void
  enableAnalytics: () => void
  disableAnalytics: () => void
}

export const useAnalytics = create<AnalyticsState>((set, get) => ({
  events: [],
  isEnabled: true,

  trackEvent: (event, properties) => {
    if (!get().isEnabled) return
    
    const analyticsEvent: AnalyticsEvent = {
      event,
      properties,
      timestamp: Date.now(),
    }

    set(state => ({
      events: [...state.events, analyticsEvent],
    }))

    // In a real app, you would send this to your analytics service
    console.log('Analytics Event:', analyticsEvent)
  },

  logError: (message, error) => {
    if (!get().isEnabled) return
    
    const analyticsEvent: AnalyticsEvent = {
      event: 'error',
      properties: { message, error },
      timestamp: Date.now(),
    }

    set(state => ({
      events: [...state.events, analyticsEvent],
    }))

    console.error('Analytics Error:', analyticsEvent)
  },

  logPageView: (path) => {
    if (!get().isEnabled) return
    
    const analyticsEvent: AnalyticsEvent = {
      event: 'page_view',
      properties: { path },
      timestamp: Date.now(),
    }

    set(state => ({
      events: [...state.events, analyticsEvent],
    }))

    console.log('Analytics Page View:', analyticsEvent)
  },

  clearEvents: () => set({ events: [] }),

  enableAnalytics: () => set({ isEnabled: true }),

  disableAnalytics: () => set({ isEnabled: false }),
}))