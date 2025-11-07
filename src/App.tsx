import { Routes, Route, Navigate } from 'react-router-dom'
import { Layout } from './components/Layout'
import { HomePage } from './pages/HomePage'
import { SpeechPage } from './pages/SpeechPage'
import { CameraPage } from './pages/CameraPage'
import { SettingsPage } from './pages/SettingsPage'
import { useCapabilityDetection } from './hooks/useCapabilityDetection'

function App() {
  const { isOnline } = useCapabilityDetection()

  return (
    <div className="min-h-screen bg-gray-50">
      {!isOnline && (
        <div className="bg-yellow-50 border-b border-yellow-200 px-4 py-3">
          <div className="max-w-7xl mx-auto flex items-center">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-yellow-700">
                You are currently offline. Some features may not be available.
              </p>
            </div>
          </div>
        </div>
      )}
      
      <Layout>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/speech" element={<SpeechPage />} />
          <Route path="/camera" element={<CameraPage />} />
          <Route path="/settings" element={<SettingsPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Layout>
    </div>
  )
}

export default App