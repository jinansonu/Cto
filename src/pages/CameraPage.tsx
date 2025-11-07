import React, { useState, useRef, useEffect } from 'react'
import { LoadingPlaceholder } from '../components/LoadingPlaceholder'
import { ErrorBoundary } from '../components/ErrorBoundary'
import { useCapabilityDetection } from '../hooks/useCapabilityDetection'
import { useAnalyticsContext } from '../contexts/AnalyticsContext'
import toast from 'react-hot-toast'

export const CameraPage: React.FC = () => {
  const { camera: isSupported } = useCapabilityDetection()
  const { trackEvent, logError } = useAnalyticsContext()
  const [stream, setStream] = useState<MediaStream | null>(null)
  const [isCameraOn, setIsCameraOn] = useState(false)
  const [error, setError] = useState<string>('')
  const [photo, setPhoto] = useState<string>('')
  const [devices, setDevices] = useState<MediaDeviceInfo[]>([])
  const [selectedDevice, setSelectedDevice] = useState<string>('')
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    if (!isSupported) return

    const getDevices = async () => {
      try {
        const deviceList = await navigator.mediaDevices.enumerateDevices()
        const videoDevices = deviceList.filter(device => device.kind === 'videoinput')
        setDevices(videoDevices)
        if (videoDevices.length > 0 && !selectedDevice) {
          setSelectedDevice(videoDevices[0].deviceId)
        }
      } catch (err) {
        logError('Failed to enumerate devices', err)
      }
    }

    getDevices()

    const handleDeviceChange = () => {
      getDevices()
    }

    navigator.mediaDevices.addEventListener('devicechange', handleDeviceChange)
    return () => {
      navigator.mediaDevices.removeEventListener('devicechange', handleDeviceChange)
    }
  }, [isSupported, selectedDevice, logError])

  useEffect(() => {
    if (stream && videoRef.current) {
      videoRef.current.srcObject = stream
    }
  }, [stream])

  const startCamera = async () => {
    if (!isSupported) {
      toast.error('Camera is not supported in your browser')
      return
    }

    try {
      setError('')
      const constraints: MediaStreamConstraints = {
        video: selectedDevice ? { deviceId: { exact: selectedDevice } } : true,
        audio: false,
      }

      const mediaStream = await navigator.mediaDevices.getUserMedia(constraints)
      setStream(mediaStream)
      setIsCameraOn(true)
      setPhoto('')
      trackEvent('camera_started', { deviceId: selectedDevice })
      toast.success('Camera started successfully')
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error'
      setError(errorMessage)
      logError('Failed to start camera', err)
      
      if (errorMessage.includes('Permission denied')) {
        toast.error('Camera permission denied. Please allow camera access in your browser settings.')
      } else if (errorMessage.includes('NotFound')) {
        toast.error('No camera found. Please connect a camera and try again.')
      } else {
        toast.error(`Failed to start camera: ${errorMessage}`)
      }
    }
  }

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop())
      setStream(null)
      setIsCameraOn(false)
      trackEvent('camera_stopped')
      toast.success('Camera stopped')
    }
  }

  const takePhoto = () => {
    if (!videoRef.current || !canvasRef.current) return

    const video = videoRef.current
    const canvas = canvasRef.current
    const context = canvas.getContext('2d')
    
    if (!context) return

    canvas.width = video.videoWidth
    canvas.height = video.videoHeight
    context.drawImage(video, 0, 0)
    
    const photoData = canvas.toDataURL('image/png')
    setPhoto(photoData)
    trackEvent('photo_taken')
    toast.success('Photo captured!')
  }

  const downloadPhoto = () => {
    if (!photo) return

    const link = document.createElement('a')
    link.href = photo
    link.download = `photo-${Date.now()}.png`
    link.click()
    trackEvent('photo_downloaded')
  }

  const clearPhoto = () => {
    setPhoto('')
    trackEvent('photo_cleared')
  }

  useEffect(() => {
    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop())
      }
    }
  }, [stream])

  if (!isSupported) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
          <h2 className="text-2xl font-bold text-yellow-900 mb-4">Camera Not Available</h2>
          <p className="text-yellow-800 mb-4">
            Your browser doesn't support camera access or no camera is detected. 
            Please try using a modern browser with a connected camera.
          </p>
          <div className="bg-yellow-100 rounded p-4">
            <h3 className="font-semibold text-yellow-900 mb-2">Possible solutions:</h3>
            <ul className="text-sm text-yellow-800 space-y-1">
              <li>• Connect a camera to your device</li>
              <li>• Check browser permissions for camera access</li>
              <li>• Try using a different browser (Chrome, Edge, Firefox)</li>
              <li>• Ensure you're using HTTPS (required for camera access)</li>
            </ul>
          </div>
        </div>
      </div>
    )
  }

  return (
    <ErrorBoundary>
      <div className="max-w-4xl mx-auto space-y-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Camera Access</h1>
          <p className="text-gray-600">
            Test camera functionality and capture photos from your device.
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="space-y-4">
            {devices.length > 1 && (
              <div>
                <label htmlFor="camera-select" className="block text-sm font-medium text-gray-700 mb-2">
                  Select Camera:
                </label>
                <select
                  id="camera-select"
                  value={selectedDevice}
                  onChange={(e) => setSelectedDevice(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  disabled={isCameraOn}
                >
                  {devices.map((device) => (
                    <option key={device.deviceId} value={device.deviceId}>
                      {device.label || `Camera ${device.deviceId.slice(0, 8)}`}
                    </option>
                  ))}
                </select>
              </div>
            )}

            <div className="flex items-center space-x-4">
              {!isCameraOn ? (
                <button
                  onClick={startCamera}
                  className="px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 font-medium transition-colors"
                >
                  Start Camera
                </button>
              ) : (
                <>
                  <button
                    onClick={stopCamera}
                    className="px-6 py-3 bg-red-600 text-white rounded-md hover:bg-red-700 font-medium transition-colors"
                  >
                    Stop Camera
                  </button>
                  <button
                    onClick={takePhoto}
                    className="px-6 py-3 bg-green-600 text-white rounded-md hover:bg-green-700 font-medium transition-colors"
                  >
                    📸 Take Photo
                  </button>
                </>
              )}
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <p className="text-red-800 text-sm">{error}</p>
              </div>
            )}
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Camera Preview</h3>
            <div className="relative bg-gray-900 rounded-lg overflow-hidden" style={{ minHeight: '300px' }}>
              {isCameraOn ? (
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  className="w-full h-full object-cover"
                  aria-label="Camera preview"
                />
              ) : (
                <div className="flex items-center justify-center h-64">
                  <div className="text-center">
                    <div className="text-4xl mb-2">📷</div>
                    <p className="text-gray-400">Camera is off</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Captured Photo</h3>
            <div className="relative bg-gray-100 rounded-lg overflow-hidden" style={{ minHeight: '300px' }}>
              {photo ? (
                <div className="space-y-4">
                  <img
                    src={photo}
                    alt="Captured photo"
                    className="w-full h-auto rounded-lg"
                  />
                  <div className="flex space-x-2">
                    <button
                      onClick={downloadPhoto}
                      className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 font-medium transition-colors text-sm"
                    >
                      Download
                    </button>
                    <button
                      onClick={clearPhoto}
                      className="flex-1 px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 font-medium transition-colors text-sm"
                    >
                      Clear
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-center h-64">
                  <div className="text-center">
                    <div className="text-4xl mb-2">🖼️</div>
                    <p className="text-gray-400">No photo captured</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        <canvas ref={canvasRef} className="hidden" aria-hidden="true" />

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 className="font-semibold text-blue-900 mb-2">Camera Tips:</h3>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• Ensure you're using a secure connection (HTTPS) for camera access</li>
            <li>• Allow camera permissions when prompted by your browser</li>
            <li>• Good lighting improves photo quality</li>
            <li>• Some cameras may take a moment to initialize</li>
          </ul>
        </div>
      </div>
    </ErrorBoundary>
  )
}