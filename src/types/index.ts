export interface CameraInteraction {
  id: string;
  mode: 'camera';
  imageUrl: string;
  ocrText: string;
  aiResponse: string;
  createdAt: string;
}

export interface AiServiceResponse {
  answer: string;
  metadata?: Record<string, unknown> | null;
}
