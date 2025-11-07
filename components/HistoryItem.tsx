'use client'

import { useState } from 'react'
import Image from 'next/image'
import { Interaction } from '@/lib/supabase'
import { useTTS } from '@/hooks/useTTS'
import { Button } from '@/components/ui/Button'
import { Dialog, DialogHeader, DialogTitle, DialogContent, DialogFooter } from '@/components/ui/Dialog'
import { 
  ChevronDown, 
  ChevronUp, 
  Mic, 
  Type, 
  Camera, 
  Volume2, 
  VolumeX, 
  Image as ImageIcon, 
  Trash2,
  Calendar,
  TrendingUp
} from 'lucide-react'
import { cn, truncateText, formatRelativeTime, formatConfidence } from '@/lib/utils'

interface HistoryItemProps {
  interaction: Interaction
  onDelete: (id: string) => void
}

export default function HistoryItem({ interaction, onDelete }: HistoryItemProps) {
  const [isExpanded, setIsExpanded] = useState(false)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [showImageDialog, setShowImageDialog] = useState(false)
  const { speak, stop, isSpeaking, isSupported } = useTTS()

  const getModeIcon = (mode: string) => {
    switch (mode) {
      case 'voice':
        return <Mic className="h-4 w-4" />
      case 'text':
        return <Type className="h-4 w-4" />
      case 'camera':
        return <Camera className="h-4 w-4" />
      default:
        return <Type className="h-4 w-4" />
    }
  }

  const getModeColor = (mode: string) => {
    switch (mode) {
      case 'voice':
        return 'text-blue-500'
      case 'text':
        return 'text-green-500'
      case 'camera':
        return 'text-purple-500'
      default:
        return 'text-gray-500'
    }
  }

  const handleVoiceReplay = () => {
    if (isSpeaking) {
      stop()
    } else {
      speak(interaction.answer)
    }
  }

  const handleDelete = () => {
    onDelete(interaction.id)
    setShowDeleteDialog(false)
  }

  return (
    <>
      <div className="bg-card border rounded-lg p-4 hover:shadow-md transition-shadow">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-2">
            <span className={cn(getModeColor(interaction.mode))}>
              {getModeIcon(interaction.mode)}
            </span>
            <span className="text-sm text-muted-foreground capitalize">
              {interaction.mode}
            </span>
            {interaction.confidence && (
              <div className="flex items-center gap-1 text-sm text-muted-foreground">
                <TrendingUp className="h-3 w-3" />
                {formatConfidence(interaction.confidence)}
              </div>
            )}
          </div>
          <div className="flex items-center gap-1 text-sm text-muted-foreground">
            <Calendar className="h-3 w-3" />
            {formatRelativeTime(interaction.created_at)}
          </div>
        </div>

        <div className="space-y-2">
          <div>
            <h3 className="font-medium text-sm mb-1">Question:</h3>
            <p className="text-sm text-foreground">{interaction.question}</p>
          </div>

          <div>
            <h3 className="font-medium text-sm mb-1">Answer:</h3>
            <p className="text-sm text-muted-foreground">
              {isExpanded ? interaction.answer : truncateText(interaction.answer)}
            </p>
            {interaction.answer.length > 150 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsExpanded(!isExpanded)}
                className="mt-1 h-auto p-0 text-xs"
              >
                {isExpanded ? (
                  <>
                    Show less <ChevronUp className="h-3 w-3 ml-1" />
                  </>
                ) : (
                  <>
                    Show more <ChevronDown className="h-3 w-3 ml-1" />
                  </>
                )}
              </Button>
            )}
          </div>

          {interaction.summary && (
            <div>
              <h3 className="font-medium text-sm mb-1">Summary:</h3>
              <p className="text-sm text-muted-foreground italic">
                {interaction.summary}
              </p>
            </div>
          )}
        </div>

        <div className="flex items-center gap-2 mt-4 pt-3 border-t">
          {interaction.mode === 'voice' && isSupported && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleVoiceReplay}
              className="flex items-center gap-1"
            >
              {isSpeaking ? (
                <>
                  <VolumeX className="h-3 w-3" />
                  Stop
                </>
              ) : (
                <>
                  <Volume2 className="h-3 w-3" />
                  Replay
                </>
              )}
            </Button>
          )}

          {interaction.image_url && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowImageDialog(true)}
              className="flex items-center gap-1"
            >
              <ImageIcon className="h-3 w-3" />
              View Image
            </Button>
          )}

          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowDeleteDialog(true)}
            className="flex items-center gap-1 text-destructive hover:text-destructive ml-auto"
          >
            <Trash2 className="h-3 w-3" />
            Delete
          </Button>
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogHeader>
          <DialogTitle>Delete Interaction</DialogTitle>
        </DialogHeader>
        <DialogContent>
          <p className="text-sm text-muted-foreground">
            Are you sure you want to delete this interaction? This action cannot be undone.
          </p>
        </DialogContent>
        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => setShowDeleteDialog(false)}
          >
            Cancel
          </Button>
          <Button variant="destructive" onClick={handleDelete}>
            Delete
          </Button>
        </DialogFooter>
      </Dialog>

      {/* Image Dialog */}
      <Dialog open={showImageDialog} onOpenChange={setShowImageDialog}>
        <DialogHeader>
          <DialogTitle>Associated Image</DialogTitle>
        </DialogHeader>
        <DialogContent>
          {interaction.image_url && (
            <div className="relative w-full h-64">
              <Image
                src={interaction.image_url}
                alt="Associated image"
                fill
                className="object-contain rounded-md"
              />
            </div>
          )}
        </DialogContent>
        <DialogFooter>
          <Button onClick={() => setShowImageDialog(false)}>
            Close
          </Button>
        </DialogFooter>
      </Dialog>
    </>
  )
}