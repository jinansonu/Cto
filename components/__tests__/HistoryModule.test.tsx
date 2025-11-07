import { render, screen } from '@testing-library/react'
import '@testing-library/jest-dom'
import HistoryModule from '@/components/HistoryModule'

// Mock the hooks
jest.mock('@/hooks/useInteractions', () => ({
  useInteractions: () => ({
    interactions: [],
    count: 0,
    isLoading: false,
    error: null,
    mutate: jest.fn(),
    hasMore: false,
  }),
}))

jest.mock('@/hooks/useTTS', () => ({
  useTTS: () => ({
    speak: jest.fn(),
    stop: jest.fn(),
    isSpeaking: false,
    isSupported: true,
  }),
}))

describe('HistoryModule', () => {
  it('renders the history module with filters', () => {
    render(<HistoryModule />)
    
    expect(screen.getByPlaceholderText('Search interactions...')).toBeInTheDocument()
    expect(screen.getByDisplayValue('all')).toBeInTheDocument()
  })

  it('shows empty state when no interactions', () => {
    render(<HistoryModule />)
    
    expect(screen.getByText('No interactions yet')).toBeInTheDocument()
  })
})