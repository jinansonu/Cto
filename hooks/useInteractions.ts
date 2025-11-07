'use client'

import useSWR from 'swr'
import { supabase, Interaction } from '@/lib/supabase'

interface InteractionsResponse {
  data: Interaction[] | null
  error: Error | null
  count: number | null
}

interface UseInteractionsParams {
  page?: number
  limit?: number
  mode?: 'voice' | 'text' | 'camera' | 'all'
  search?: string
}

const fetcher = async (url: string): Promise<InteractionsResponse> => {
  const response = await fetch(url)
  if (!response.ok) {
    throw new Error('Failed to fetch interactions')
  }
  return response.json()
}

export function useInteractions(params: UseInteractionsParams = {}) {
  const { page = 1, limit = 20, mode = 'all', search = '' } = params
  
  const queryParams = new URLSearchParams({
    page: page.toString(),
    limit: limit.toString(),
    mode,
    search,
  })

  const { data, error, isLoading, mutate } = useSWR<InteractionsResponse>(
    `/api/interactions?${queryParams}`,
    fetcher,
    {
      revalidateOnFocus: false,
      dedupingInterval: 5000,
    }
  )

  return {
    interactions: data?.data || [],
    count: data?.count || 0,
    isLoading,
    error,
    mutate,
    hasMore: (data?.count || 0) > page * limit,
  }
}

export async function deleteInteraction(id: string): Promise<void> {
  const { error } = await supabase
    .from('interactions')
    .delete()
    .eq('id', id)

  if (error) {
    throw new Error(`Failed to delete interaction: ${error.message}`)
  }
}