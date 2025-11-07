'use client'

import { useState, useCallback } from 'react'
import { useInteractions, deleteInteraction } from '@/hooks/useInteractions'
import HistoryItem from '@/components/HistoryItem'
import HistoryItemSkeleton from '@/components/HistoryItemSkeleton'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { groupByDate } from '@/lib/utils'
import { Search, Mic, Type, Camera, RefreshCw } from 'lucide-react'

interface HistoryFilters {
  mode: 'voice' | 'text' | 'camera' | 'all'
  search: string
}

export default function HistoryModule() {
  const [page, setPage] = useState(1)
  const [filters, setFilters] = useState<HistoryFilters>({
    mode: 'all',
    search: '',
  })

  const { interactions, count, isLoading, error, mutate, hasMore } = useInteractions({
    page,
    limit: 20,
    mode: filters.mode,
    search: filters.search,
  })

  const handleModeChange = (newMode: string) => {
    setFilters(prev => ({ ...prev, mode: newMode as HistoryFilters['mode'] }))
    setPage(1)
  }

  const handleSearchChange = (newSearch: string) => {
    setFilters(prev => ({ ...prev, search: newSearch }))
    setPage(1)
  }

  const handleDelete = useCallback(async (id: string) => {
    try {
      await deleteInteraction(id)
      mutate()
    } catch (error) {
      console.error('Failed to delete interaction:', error)
    }
  }, [mutate])

  const handleLoadMore = () => {
    setPage(prev => prev + 1)
  }

  const groupedInteractions = groupByDate(interactions, 'created_at')

  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-destructive mb-4">Failed to load interactions</p>
        <Button onClick={() => mutate()} variant="outline">
          <RefreshCw className="h-4 w-4 mr-2" />
          Try Again
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search interactions..."
            value={filters.search}
            onChange={(e) => handleSearchChange(e.target.value)}
            className="pl-10"
          />
        </div>
        
        <Select
          value={filters.mode}
          onChange={(e) => handleModeChange(e.target.value)}
          className="w-full sm:w-40"
        >
          <option value="all">All Modes</option>
          <option value="voice">
            🎤 Voice
          </option>
          <option value="text">
            💬 Text
          </option>
          <option value="camera">
            📷 Camera
          </option>
        </Select>
      </div>

      {/* Results Summary */}
      {!isLoading && interactions.length > 0 && (
        <div className="text-sm text-muted-foreground">
          Showing {interactions.length} of {count} interactions
        </div>
      )}

      {/* Interactions List */}
      <div className="space-y-6">
        {isLoading && page === 1 ? (
          // Show skeletons on initial load
          Array.from({ length: 5 }).map((_, i) => (
            <HistoryItemSkeleton key={i} />
          ))
        ) : interactions.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-muted-foreground mb-2">
              {filters.search || filters.mode !== 'all' 
                ? 'No interactions found matching your filters'
                : 'No interactions yet'
              }
            </div>
            {(filters.search || filters.mode !== 'all') && (
              <Button
                variant="outline"
                onClick={() => {
                  setFilters({ mode: 'all', search: '' })
                  setPage(1)
                }}
              >
                Clear Filters
              </Button>
            )}
          </div>
        ) : (
          Object.entries(groupedInteractions).map(([date, dateInteractions]) => (
            <div key={date}>
              <h3 className="text-lg font-semibold text-foreground mb-3 sticky top-0 bg-background/95 backdrop-blur-sm py-2 border-b">
                {date}
              </h3>
              <div className="space-y-3">
                {dateInteractions.map((interaction) => (
                  <HistoryItem
                    key={interaction.id}
                    interaction={interaction}
                    onDelete={handleDelete}
                  />
                ))}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Load More Button */}
      {!isLoading && hasMore && interactions.length > 0 && (
        <div className="text-center pt-4">
          <Button
            onClick={handleLoadMore}
            variant="outline"
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                Loading...
              </>
            ) : (
              'Load More'
            )}
          </Button>
        </div>
      )}

      {/* Loading indicator for pagination */}
      {isLoading && page > 1 && (
        <div className="text-center py-4">
          <RefreshCw className="h-6 w-6 animate-spin mx-auto text-muted-foreground" />
        </div>
      )}
    </div>
  )
}