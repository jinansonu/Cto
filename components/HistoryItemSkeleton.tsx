import { Skeleton } from '@/components/ui/Skeleton'

export default function HistoryItemSkeleton() {
  return (
    <div className="bg-card border rounded-lg p-4">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          <Skeleton className="h-4 w-4 rounded" />
          <Skeleton className="h-4 w-16 rounded" />
          <Skeleton className="h-4 w-12 rounded" />
        </div>
        <Skeleton className="h-4 w-20 rounded" />
      </div>

      <div className="space-y-2">
        <div>
          <Skeleton className="h-4 w-16 rounded mb-2" />
          <Skeleton className="h-4 w-full rounded mb-1" />
          <Skeleton className="h-4 w-3/4 rounded" />
        </div>

        <div>
          <Skeleton className="h-4 w-12 rounded mb-2" />
          <Skeleton className="h-4 w-full rounded mb-1" />
          <Skeleton className="h-4 w-5/6 rounded mb-1" />
          <Skeleton className="h-4 w-4/6 rounded" />
        </div>

        <div>
          <Skeleton className="h-4 w-16 rounded mb-2" />
          <Skeleton className="h-4 w-2/3 rounded" />
        </div>
      </div>

      <div className="flex items-center gap-2 mt-4 pt-3 border-t">
        <Skeleton className="h-8 w-20 rounded" />
        <Skeleton className="h-8 w-20 rounded" />
        <Skeleton className="h-8 w-16 rounded ml-auto" />
      </div>
    </div>
  )
}