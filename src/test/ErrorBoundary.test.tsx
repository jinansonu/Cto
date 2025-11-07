import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Toaster } from 'react-hot-toast'
import { ErrorBoundary } from '../components/ErrorBoundary'

const TestWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  })

  return (
    <BrowserRouter>
      <QueryClientProvider client={queryClient}>
        <ErrorBoundary>
          {children}
          <Toaster />
        </ErrorBoundary>
      </QueryClientProvider>
    </BrowserRouter>
  )
}

describe('ErrorBoundary', () => {
  beforeEach(() => {
    // Clear console.error to avoid noise in tests
    vi.spyOn(console, 'error').mockImplementation(() => {})
  })

  it('renders children when there is no error', () => {
    render(
      <TestWrapper>
        <div>Test content</div>
      </TestWrapper>
    )

    expect(screen.getByText('Test content')).toBeInTheDocument()
  })

  it('catches errors and displays error UI', () => {
    const ThrowError = () => {
      throw new Error('Test error')
    }

    render(
      <TestWrapper>
        <ThrowError />
      </TestWrapper>
    )

    expect(screen.getByText('Something went wrong')).toBeInTheDocument()
    expect(screen.getByText('Reload Page')).toBeInTheDocument()
    expect(screen.getByText('Try Again')).toBeInTheDocument()
  })

  it('allows recovery from error state', () => {
    let shouldThrow = true
    const ThrowError = () => {
      if (shouldThrow) {
        throw new Error('Test error')
      }
      return <div>Recovered content</div>
    }

    const { rerender } = render(
      <TestWrapper>
        <ThrowError />
      </TestWrapper>
    )

    expect(screen.getByText('Something went wrong')).toBeInTheDocument()

    // Try to recover
    shouldThrow = false
    fireEvent.click(screen.getByText('Try Again'))

    rerender(
      <TestWrapper>
        <ThrowError />
      </TestWrapper>
    )

    expect(screen.getByText('Recovered content')).toBeInTheDocument()
  })
})