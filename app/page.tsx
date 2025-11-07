'use client'

import { useState } from 'react'
import HistoryModule from '@/components/HistoryModule'

export default function Home() {
  return (
    <main className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <header className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">
            History Module
          </h1>
          <p className="text-muted-foreground">
            View and manage your interaction history
          </p>
        </header>
        
        <HistoryModule />
      </div>
    </main>
  )
}