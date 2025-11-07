'use client'

import { useState, useEffect } from 'react'
import { InsightsDashboard } from '@/components/InsightsDashboard'
import { TabNavigation } from '@/components/TabNavigation'
import { DemoInteraction } from '@/components/DemoInteraction'

export default function Home() {
  const [activeTab, setActiveTab] = useState('insights')
  const [refreshKey, setRefreshKey] = useState(0)

  useEffect(() => {
    const handleRefresh = () => {
      setRefreshKey(prev => prev + 1)
    }

    window.addEventListener('refresh-insights', handleRefresh)
    return () => window.removeEventListener('refresh-insights', handleRefresh)
  }, [])

  return (
    <main className="container mx-auto px-4 py-8 max-w-7xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Learning Dashboard</h1>
        <p className="text-gray-600">Track your progress and gain insights into your learning journey</p>
      </div>
      
      <TabNavigation activeTab={activeTab} onTabChange={setActiveTab} />
      
      <div className="mt-8">
        {activeTab === 'insights' && <InsightsDashboard key={refreshKey} />}
        {activeTab === 'learning' && (
          <div className="text-center py-12">
            <p className="text-gray-500">Learning interface coming soon...</p>
          </div>
        )}
        {activeTab === 'settings' && (
          <div className="text-center py-12">
            <p className="text-gray-500">Settings coming soon...</p>
          </div>
        )}
      </div>

      <DemoInteraction />
    </main>
  )
}