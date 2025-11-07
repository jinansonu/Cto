import React, { useState } from 'react'
import { ErrorBoundary } from '../components/ErrorBoundary'
import { useCapabilityDetection } from '../hooks/useCapabilityDetection'
import { useAnalyticsContext } from '../contexts/AnalyticsContext'
import toast from 'react-hot-toast'

interface Settings {
  enableAnalytics: boolean
  enableNotifications: boolean
  theme: 'light' | 'dark' | 'system'
  language: string
  autoSave: boolean
}

export const SettingsPage: React.FC = () => {
  const capabilities = useCapabilityDetection()
  const { trackEvent, isEnabled: analyticsEnabled, toggleAnalytics } = useAnalyticsContext()
  const [settings, setSettings] = useState<Settings>({
    enableAnalytics: analyticsEnabled,
    enableNotifications: true,
    theme: 'system',
    language: 'en',
    autoSave: true,
  })
  const [textInput, setTextInput] = useState('')

  const handleSettingChange = (key: keyof Settings, value: any) => {
    setSettings(prev => ({ ...prev, [key]: value }))
    trackEvent('setting_changed', { setting: key, value })
    
    if (key === 'enableAnalytics') {
      toggleAnalytics()
    }
  }

  const saveSettings = () => {
    try {
      localStorage.setItem('cto-app-settings', JSON.stringify(settings))
      toast.success('Settings saved successfully!')
      trackEvent('settings_saved')
    } catch (error) {
      toast.error('Failed to save settings')
      console.error('Failed to save settings:', error)
    }
  }

  const loadSettings = () => {
    try {
      const saved = localStorage.getItem('cto-app-settings')
      if (saved) {
        const parsedSettings = JSON.parse(saved)
        setSettings(parsedSettings)
        toast.success('Settings loaded successfully!')
        trackEvent('settings_loaded')
      } else {
        toast.info('No saved settings found')
      }
    } catch (error) {
      toast.error('Failed to load settings')
      console.error('Failed to load settings:', error)
    }
  }

  const exportData = () => {
    const data = {
      settings,
      capabilities,
      timestamp: new Date().toISOString(),
    }
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `cto-app-data-${Date.now()}.json`
    a.click()
    URL.revokeObjectURL(url)
    
    toast.success('Data exported successfully!')
    trackEvent('data_exported')
  }

  const clearAllData = () => {
    if (confirm('Are you sure you want to clear all data? This action cannot be undone.')) {
      try {
        localStorage.clear()
        setTextInput('')
        toast.success('All data cleared successfully!')
        trackEvent('data_cleared')
      } catch (error) {
        toast.error('Failed to clear data')
        console.error('Failed to clear data:', error)
      }
    }
  }

  return (
    <ErrorBoundary>
      <div className="max-w-4xl mx-auto space-y-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Settings</h1>
          <p className="text-gray-600">
            Configure your preferences and manage application data.
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">General Settings</h2>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <label htmlFor="analytics" className="font-medium text-gray-900">Analytics</label>
                <p className="text-sm text-gray-600">Help us improve by sharing usage data</p>
              </div>
              <button
                id="analytics"
                onClick={() => handleSettingChange('enableAnalytics', !settings.enableAnalytics)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  settings.enableAnalytics ? 'bg-blue-600' : 'bg-gray-200'
                }`}
                role="switch"
                aria-checked={settings.enableAnalytics}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    settings.enableAnalytics ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <label htmlFor="notifications" className="font-medium text-gray-900">Notifications</label>
                <p className="text-sm text-gray-600">Show toast notifications for events</p>
              </div>
              <button
                id="notifications"
                onClick={() => handleSettingChange('enableNotifications', !settings.enableNotifications)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  settings.enableNotifications ? 'bg-blue-600' : 'bg-gray-200'
                }`}
                role="switch"
                aria-checked={settings.enableNotifications}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    settings.enableNotifications ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <label htmlFor="autosave" className="font-medium text-gray-900">Auto-save</label>
                <p className="text-sm text-gray-600">Automatically save your work</p>
              </div>
              <button
                id="autosave"
                onClick={() => handleSettingChange('autoSave', !settings.autoSave)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  settings.autoSave ? 'bg-blue-600' : 'bg-gray-200'
                }`}
                role="switch"
                aria-checked={settings.autoSave}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    settings.autoSave ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>

            <div>
              <label htmlFor="theme" className="block font-medium text-gray-900 mb-2">Theme</label>
              <select
                id="theme"
                value={settings.theme}
                onChange={(e) => handleSettingChange('theme', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="light">Light</option>
                <option value="dark">Dark</option>
                <option value="system">System</option>
              </select>
            </div>

            <div>
              <label htmlFor="language" className="block font-medium text-gray-900 mb-2">Language</label>
              <select
                id="language"
                value={settings.language}
                onChange={(e) => handleSettingChange('language', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="en">English</option>
                <option value="es">Español</option>
                <option value="fr">Français</option>
                <option value="de">Deutsch</option>
                <option value="zh">中文</option>
              </select>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Text Mode (Alternative Input)</h2>
          <p className="text-gray-600 mb-4">
            Use text input as an alternative when speech or camera features aren't available.
          </p>
          
          <div className="space-y-4">
            <div>
              <label htmlFor="text-input" className="block font-medium text-gray-900 mb-2">
                Enter your text here:
              </label>
              <textarea
                id="text-input"
                value={textInput}
                onChange={(e) => setTextInput(e.target.value)}
                placeholder="Type your message here..."
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows={4}
              />
            </div>
            
            <div className="flex space-x-2">
              <button
                onClick={() => {
                  if (textInput.trim()) {
                    toast.success('Text processed successfully!')
                    trackEvent('text_processed', { length: textInput.length })
                  }
                }}
                disabled={!textInput.trim()}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium transition-colors"
              >
                Process Text
              </button>
              
              <button
                onClick={() => setTextInput('')}
                disabled={!textInput.trim()}
                className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed font-medium transition-colors"
              >
                Clear
              </button>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Data Management</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <button
              onClick={saveSettings}
              className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 font-medium transition-colors"
            >
              Save Settings
            </button>
            
            <button
              onClick={loadSettings}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 font-medium transition-colors"
            >
              Load Settings
            </button>
            
            <button
              onClick={exportData}
              className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 font-medium transition-colors"
            >
              Export Data
            </button>
            
            <button
              onClick={clearAllData}
              className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 font-medium transition-colors"
            >
              Clear All Data
            </button>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">System Information</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <span className="font-medium text-gray-700">Browser:</span>
              <span className="ml-2 text-gray-600">{navigator.userAgent.split(' ').pop()}</span>
            </div>
            <div>
              <span className="font-medium text-gray-700">Platform:</span>
              <span className="ml-2 text-gray-600">{navigator.platform}</span>
            </div>
            <div>
              <span className="font-medium text-gray-700">Online Status:</span>
              <span className={`ml-2 ${capabilities.isOnline ? 'text-green-600' : 'text-red-600'}`}>
                {capabilities.isOnline ? 'Online' : 'Offline'}
              </span>
            </div>
            <div>
              <span className="font-medium text-gray-700">Local Storage:</span>
              <span className={`ml-2 ${capabilities.localStorage ? 'text-green-600' : 'text-red-600'}`}>
                {capabilities.localStorage ? 'Available' : 'Not Available'}
              </span>
            </div>
          </div>
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 className="font-semibold text-blue-900 mb-2">Accessibility Features</h3>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• Full keyboard navigation support</li>
            <li>• Screen reader compatible with ARIA labels</li>
            <li>• High contrast mode support</li>
            <li>• Focus indicators for all interactive elements</li>
            <li>• Semantic HTML structure</li>
          </ul>
        </div>
      </div>
    </ErrorBoundary>
  )
}