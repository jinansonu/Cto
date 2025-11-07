import { ChangeEvent, useEffect, useMemo, useRef, useState } from 'react';
import Tesseract from 'tesseract.js';
import {
  deleteImageFromStorage,
  uploadImageToStorage
} from '../services/supabaseClient';
import { sendToAiService } from '../services/aiService';
import {
  fetchCameraInteractions,
  saveCameraInteraction
} from '../services/interactionRepository';
import type { CameraInteraction } from '../types';

const supportsCameraAPI = () =>
  typeof navigator !== 'undefined' && !!navigator.mediaDevices?.getUserMedia;

type PermissionState = 'idle' | 'pending' | 'granted' | 'denied';

type OcrStatus = 'idle' | 'processing' | 'complete' | 'error';

const blobToDataUrl = (blob: Blob) =>
  new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(new Error('Unable to read captured image.'));
    reader.readAsDataURL(blob);
  });

const CameraTab = () => {
  const isCameraSupported = useMemo(supportsCameraAPI, []);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const [mediaStream, setMediaStream] = useState<MediaStream | null>(null);
  const [permissionState, setPermissionState] = useState<PermissionState>(
    isCameraSupported ? 'idle' : 'denied'
  );

  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [imageBlob, setImageBlob] = useState<Blob | null>(null);

  const [ocrStatus, setOcrStatus] = useState<OcrStatus>('idle');
  const [ocrProgress, setOcrProgress] = useState(0);
  const [ocrMessage, setOcrMessage] = useState('');
  const [ocrText, setOcrText] = useState('');
  const [ocrError, setOcrError] = useState<string | null>(null);

  const [aiResponse, setAiResponse] = useState<string | null>(null);
  const [aiMetadata, setAiMetadata] = useState<Record<string, unknown> | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const [history, setHistory] = useState<CameraInteraction[]>([]);
  const [historyError, setHistoryError] = useState<string | null>(null);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);

  useEffect(() => {
    let isMounted = true;

    const loadHistory = async () => {
      try {
        setIsLoadingHistory(true);
        const records = await fetchCameraInteractions();
        if (isMounted) {
          setHistory(records);
        }
      } catch (error) {
        if (isMounted) {
          const message =
            error instanceof Error
              ? error.message
              : 'Unable to load previous interactions.';
          setHistoryError(message);
        }
      } finally {
        if (isMounted) {
          setIsLoadingHistory(false);
        }
      }
    };

    loadHistory();

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    if (videoRef.current && mediaStream) {
      videoRef.current.srcObject = mediaStream;
    }
  }, [mediaStream]);

  useEffect(() => {
    return () => {
      if (mediaStream) {
        mediaStream.getTracks().forEach((track) => track.stop());
      }
    };
  }, [mediaStream]);

  const startCamera = async () => {
    if (!isCameraSupported) {
      setSubmitError('Camera API is not supported in this browser.');
      return;
    }

    if (mediaStream) {
      return;
    }

    setSubmitError(null);
    setPermissionState('pending');

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: 'environment'
        }
      });

      setMediaStream(stream);
      setPermissionState('granted');
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : 'Unable to access the camera.';
      setPermissionState('denied');
      setSubmitError(message);
    }
  };

  const stopCamera = () => {
    if (mediaStream) {
      mediaStream.getTracks().forEach((track) => track.stop());
      setMediaStream(null);
    }
  };

  const captureFromCamera = async () => {
    if (!videoRef.current) {
      setSubmitError('Camera is not ready yet.');
      return;
    }

    const video = videoRef.current;

    if (!video.videoWidth || !video.videoHeight) {
      setSubmitError('Waiting for camera focus. Try again in a second.');
      return;
    }

    if (!canvasRef.current) {
      canvasRef.current = document.createElement('canvas');
    }

    const canvas = canvasRef.current;

    if (!canvas) {
      setSubmitError('Unable to access capture canvas.');
      return;
    }

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const context = canvas.getContext('2d');

    if (!context) {
      setSubmitError('Unable to capture frame from camera.');
      return;
    }

    context.drawImage(video, 0, 0, canvas.width, canvas.height);

    try {
      const blob = await new Promise<Blob>((resolve, reject) => {
        canvas.toBlob(
          (result) => {
            if (result) {
              resolve(result);
            } else {
              reject(new Error('Unable to capture image.'));
            }
          },
          'image/jpeg',
          0.92
        );
      });

      const dataUrl = await blobToDataUrl(blob);

      setPreviewImage(dataUrl);
      setImageBlob(blob);
      setAiResponse(null);
      setAiMetadata(null);
      stopCamera();
      await runOcr(blob);
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : 'Unable to capture image from camera.';
      setSubmitError(message);
    }
  };

  const runOcr = async (blob: Blob) => {
    setOcrStatus('processing');
    setOcrError(null);
    setOcrProgress(3);
    setOcrMessage('Initializing OCR engine');

    try {
      const result = await Tesseract.recognize(blob, 'eng', {
        logger: (message) => {
          if (typeof message.progress === 'number') {
            setOcrProgress(Math.min(100, Math.max(0, Math.round(message.progress * 100))));
          }
          if (message.status) {
            setOcrMessage(message.status.replace(/_/g, ' '));
          }
        }
      });

      const text = result.data?.text?.trim() ?? '';
      setOcrText(text);
      setOcrStatus('complete');
      setOcrProgress(100);
      setOcrMessage('Completed');
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'OCR failed for the captured image.';
      setOcrStatus('error');
      setOcrError(message);
    }
  };

  const handleFileUpload = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = '';

    if (!file) {
      return;
    }

    stopCamera();

    try {
      const dataUrl = await blobToDataUrl(file);
      setPreviewImage(dataUrl);
      setImageBlob(file);
      setAiResponse(null);
      setAiMetadata(null);
      await runOcr(file);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Unable to process the selected file.';
      setSubmitError(message);
    }
  };

  const handleRetake = () => {
    setPreviewImage(null);
    setImageBlob(null);
    setAiResponse(null);
    setAiMetadata(null);
    setOcrStatus('idle');
    setOcrProgress(0);
    setOcrMessage('');
    setOcrText('');
    setOcrError(null);
    setSubmitError(null);

    if (isCameraSupported) {
      startCamera().catch(() => {
        /* no-op; submitError already handled */
      });
    }
  };

  const handleSubmit = async () => {
    if (!imageBlob) {
      setSubmitError('Capture or upload an image before submitting.');
      return;
    }

    const text = ocrText.trim();
    if (!text) {
      setSubmitError('Add or edit the text before submitting.');
      return;
    }

    setIsSubmitting(true);
    setSubmitError(null);

    let uploadedPath: string | null = null;

    try {
      const { storagePath, publicUrl } = await uploadImageToStorage(
        imageBlob,
        imageBlob instanceof File ? imageBlob.name : 'capture.jpg'
      );
      uploadedPath = storagePath;

      const aiResult = await sendToAiService({
        imageUrl: publicUrl,
        text
      });

      const savedInteraction = await saveCameraInteraction({
        imageUrl: publicUrl,
        ocrText: text,
        aiResponse: aiResult.answer
      });

      setAiResponse(aiResult.answer);
      setAiMetadata(aiResult.metadata ?? null);
      setHistory((prev) => [savedInteraction, ...prev]);
    } catch (error) {
      if (uploadedPath) {
        try {
          await deleteImageFromStorage(uploadedPath);
        } catch (cleanupError) {
          console.error('Failed to cleanup uploaded image after failure.', cleanupError);
        }
      }

      const message =
        error instanceof Error ? error.message : 'Submission failed. Please try again.';
      setSubmitError(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="camera-tab">
      <div className="camera-stage">
        <div className="camera-preview">
          {previewImage ? (
            <img src={previewImage} alt="Captured preview" />
          ) : isCameraSupported && permissionState !== 'denied' ? (
            <video ref={videoRef} playsInline autoPlay muted />
          ) : (
            <div className="status-pill">Camera preview unavailable</div>
          )}
        </div>

        <div className="camera-controls">
          <div className="status-pill">
            {(() => {
              switch (permissionState) {
                case 'pending':
                  return 'Waiting for camera access…';
                case 'granted':
                  return 'Camera ready';
                case 'denied':
                  return 'Camera permission denied';
                default:
                  return isCameraSupported
                    ? 'Camera permission not requested'
                    : 'Camera not supported';
              }
            })()}
          </div>

          <div className="control-group">
            {isCameraSupported && !previewImage && (
              <button
                className="button"
                type="button"
                onClick={startCamera}
                disabled={permissionState === 'pending'}
              >
                {(() => {
                  if (permissionState === 'granted' && mediaStream) {
                    return 'Camera active';
                  }
                  if (permissionState === 'denied') {
                    return 'Retry camera access';
                  }
                  return 'Start camera';
                })()}
              </button>
            )}

            {isCameraSupported && mediaStream && (
              <button className="button" type="button" onClick={captureFromCamera}>
                Capture frame
              </button>
            )}

            {previewImage && (
              <button className="button secondary" type="button" onClick={handleRetake}>
                Retake
              </button>
            )}

            <button
              className="button secondary"
              type="button"
              onClick={() => fileInputRef.current?.click()}
            >
              Upload photo
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              style={{ display: 'none' }}
              onChange={handleFileUpload}
            />
          </div>

          <div className="control-group">
            <label htmlFor="ocr-text">Extracted text</label>
            <textarea
              id="ocr-text"
              className="textarea"
              placeholder="Captured OCR text will appear here…"
              value={ocrText}
              onChange={(event) => setOcrText(event.target.value)}
            />
          </div>

          {ocrStatus === 'processing' && (
            <div className="control-group">
              <p>{ocrMessage}</p>
              <div className="progress-track">
                <div className="progress-fill" style={{ width: `${ocrProgress}%` }} />
              </div>
            </div>
          )}

          {ocrError && <div className="alert">{ocrError}</div>}

          <button
            className="button"
            type="button"
            disabled={isSubmitting || !imageBlob || ocrStatus === 'processing'}
            onClick={handleSubmit}
          >
            {isSubmitting ? 'Submitting…' : 'Send to assistant'}
          </button>

          {submitError && <div className="alert">{submitError}</div>}

          {aiResponse && (
            <div className="ai-response">
              <h3 className="section-title">Assistant response</h3>
              <p className="interaction-text">{aiResponse}</p>
              {aiMetadata && (
                <pre className="interaction-text">
                  {JSON.stringify(aiMetadata, null, 2)}
                </pre>
              )}
            </div>
          )}
        </div>
      </div>

      <div className="history section-card">
        <h2 className="section-title">Recent camera interactions</h2>
        {isLoadingHistory && <div className="status-pill">Loading history…</div>}
        {historyError && <div className="alert">{historyError}</div>}
        {!isLoadingHistory && !history.length && !historyError && (
          <p>No camera-based interactions yet.</p>
        )}
        <div className="interactions-list">
          {history.map((item) => (
            <article key={item.id} className="interaction-item">
              <div className="interaction-meta">
                <span>{new Date(item.createdAt).toLocaleString()}</span>
                <a href={item.imageUrl} target="_blank" rel="noreferrer">
                  View image
                </a>
              </div>
              <div className="interaction-text">{item.ocrText}</div>
              {item.aiResponse && (
                <div className="interaction-text" style={{ marginTop: '12px' }}>
                  <strong>Assistant:</strong>
                  <div>{item.aiResponse}</div>
                </div>
              )}
            </article>
          ))}
        </div>
      </div>

      <canvas ref={canvasRef} style={{ display: 'none' }} />
    </div>
  );
};

export default CameraTab;
