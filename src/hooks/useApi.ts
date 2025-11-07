import { useQuery } from '@tanstack/react-query'
import toast from 'react-hot-toast'

interface ApiOptions {
  retryCount?: number
  showToast?: boolean
}

export const useApi = <T>(
  key: string[],
  fetcher: () => Promise<T>,
  options: ApiOptions = {}
) => {
  const { retryCount = 3, showToast = true } = options

  return useQuery({
    queryKey: key,
    queryFn: async () => {
      try {
        const result = await fetcher()
        if (showToast) {
          toast.success('Data loaded successfully')
        }
        return result
      } catch (error) {
        if (showToast) {
          if (error instanceof Error) {
            toast.error(`Failed to load data: ${error.message}`)
          } else {
            toast.error('Failed to load data')
          }
        }
        throw error
      }
    },
    retry: (failureCount, error) => {
      if (failureCount >= retryCount) return false
      
      // Don't retry on 4xx errors
      if (error && typeof error === 'object' && 'status' in error) {
        const status = error.status as number
        if (status >= 400 && status < 500) return false
      }
      
      return true
    },
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  })
}