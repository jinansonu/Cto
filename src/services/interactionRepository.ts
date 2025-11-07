import { getSupabaseClient } from './supabaseClient';
import type { CameraInteraction } from '../types';

interface InteractionRow {
  id: string;
  mode: string;
  image_url: string;
  ocr_text: string;
  ai_response: string;
  created_at: string;
}

const mapRowToInteraction = (row: InteractionRow): CameraInteraction => ({
  id: row.id,
  mode: 'camera',
  imageUrl: row.image_url,
  ocrText: row.ocr_text,
  aiResponse: row.ai_response,
  createdAt: row.created_at
});

export const fetchCameraInteractions = async (): Promise<CameraInteraction[]> => {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from('interactions')
    .select('id, mode, image_url, ocr_text, ai_response, created_at')
    .eq('mode', 'camera')
    .order('created_at', { ascending: false })
    .limit(25);

  if (error) {
    throw error;
  }

  return (data ?? []).map(mapRowToInteraction);
};

export const saveCameraInteraction = async (payload: {
  imageUrl: string;
  ocrText: string;
  aiResponse: string;
}): Promise<CameraInteraction> => {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from('interactions')
    .insert({
      mode: 'camera',
      image_url: payload.imageUrl,
      ocr_text: payload.ocrText,
      ai_response: payload.aiResponse
    })
    .select('id, mode, image_url, ocr_text, ai_response, created_at')
    .single();

  if (error || !data) {
    throw error ?? new Error('Unable to persist interaction.');
  }

  return mapRowToInteraction(data as InteractionRow);
};
