import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function truncateText(text: string, maxLength: number = 150): string {
  if (text.length <= maxLength) return text
  return text.slice(0, maxLength) + '...'
}

export function formatRelativeTime(date: string): string {
  const now = new Date()
  const past = new Date(date)
  const diffInSeconds = Math.floor((now.getTime() - past.getTime()) / 1000)

  if (diffInSeconds < 60) return 'just now'
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`
  if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d ago`
  
  return past.toLocaleDateString()
}

export function formatConfidence(confidence: number | null): string {
  if (confidence === null) return 'N/A'
  return `${Math.round(confidence * 100)}%`
}

export function groupByDate<T>(items: T[], dateKey: keyof T): Record<string, T[]> {
  return items.reduce((groups, item) => {
    const date = new Date(item[dateKey] as string).toDateString()
    if (!groups[date]) {
      groups[date] = []
    }
    groups[date].push(item)
    return groups
  }, {} as Record<string, T[]>)
}