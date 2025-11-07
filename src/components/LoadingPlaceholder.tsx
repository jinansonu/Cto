import React from 'react'

interface LoadingPlaceholderProps {
  type?: 'spinner' | 'skeleton' | 'dots'
  message?: string
  className?: string
}

export const LoadingPlaceholder: React.FC<LoadingPlaceholderProps> = ({
  type = 'spinner',
  message = 'Loading...',
  className = ''
}) => {
  const renderSpinner = () => (
    <div className="flex flex-col items-center justify-center space-y-4">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      {message && <p className="text-gray-600 text-sm">{message}</p>}
    </div>
  )

  const renderSkeleton = () => (
    <div className="animate-pulse space-y-4">
      <div className="h-4 bg-gray-200 rounded w-3/4"></div>
      <div className="h-4 bg-gray-200 rounded w-1/2"></div>
      <div className="h-4 bg-gray-200 rounded w-5/6"></div>
      {message && <p className="text-gray-400 text-sm text-center">{message}</p>}
    </div>
  )

  const renderDots = () => (
    <div className="flex flex-col items-center space-y-2">
      <div className="flex space-x-1">
        <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
        <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
        <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
      </div>
      {message && <p className="text-gray-600 text-sm">{message}</p>}
    </div>
  )

  return (
    <div className={`flex items-center justify-center p-8 ${className}`}>
      {type === 'skeleton' && renderSkeleton()}
      {type === 'dots' && renderDots()}
      {type === 'spinner' && renderSpinner()}
    </div>
  )
}