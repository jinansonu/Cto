import type { AiServiceResponse } from '../types';

export interface AiServicePayload {
  imageUrl: string;
  text: string;
}

export const sendToAiService = async (payload: AiServicePayload): Promise<AiServiceResponse> => {
  const endpoint = (import.meta.env.VITE_AI_SERVICE_URL as string | undefined)?.trim();

  if (!endpoint) {
    throw new Error('AI service endpoint is not configured. Set VITE_AI_SERVICE_URL.');
  }

  const apiKey = (import.meta.env.VITE_AI_SERVICE_API_KEY as string | undefined)?.trim();

  const response = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(apiKey ? { Authorization: `Bearer ${apiKey}` } : {})
    },
    body: JSON.stringify({
      mode: 'camera',
      image_url: payload.imageUrl,
      text: payload.text
    })
  });

  if (!response.ok) {
    const message = await response.text();
    throw new Error(`AI service request failed: ${response.status} ${message}`);
  }

  const data = (await response.json()) as Partial<AiServiceResponse>;

  const answer = typeof data.answer === 'string' ? data.answer.trim() : '';

  return {
    answer,
    metadata: data.metadata ?? null
  };
};
