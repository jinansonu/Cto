'use client'

import { useState } from 'react'
import VoiceTab from '@/components/VoiceTab'

export default function Home() {
  // Mock user ID - in a real app, this would come from authentication
  const [userId] = useState('demo-user-123')

  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto py-8">
        <VoiceTab userId={userId} />
      </div>
    </main>
  )
}