import { createClient, SupabaseClient } from '@supabase/supabase-js';

let cachedClient: SupabaseClient | null = null;

const getSupabaseCredentials = () => {
  const url = import.meta.env.VITE_SUPABASE_URL as string | undefined;
  const key = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;

  if (!url || !key) {
    throw new Error('Supabase credentials are not configured. Ensure VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY are set.');
  }

  return { url, key };
};

export const getSupabaseClient = (): SupabaseClient => {
  if (cachedClient) {
    return cachedClient;
  }

  const { url, key } = getSupabaseCredentials();
  cachedClient = createClient(url, key, {
    auth: {
      persistSession: false
    }
  });

  return cachedClient;
};

const getStorageBucket = () => {
  const bucket = (import.meta.env.VITE_SUPABASE_STORAGE_BUCKET as string | undefined)?.trim();
  return bucket && bucket.length > 0 ? bucket : 'camera-uploads';
};

export interface UploadResult {
  storagePath: string;
  publicUrl: string;
}

export const uploadImageToStorage = async (blob: Blob, fileName: string): Promise<UploadResult> => {
  const supabase = getSupabaseClient();
  const bucket = getStorageBucket();
  const sanitizedName = fileName.replace(/[^a-zA-Z0-9-_\.]/g, '_');
  const storagePath = `captures/${Date.now()}-${sanitizedName}`;

  const { error: uploadError } = await supabase.storage
    .from(bucket)
    .upload(storagePath, blob, {
      cacheControl: '3600',
      upsert: false,
      contentType: blob.type || 'image/jpeg'
    });

  if (uploadError) {
    throw uploadError;
  }

  const {
    data: { publicUrl }
  } = supabase.storage.from(bucket).getPublicUrl(storagePath, {
    transform: {
      width: 1280,
      quality: 90
    }
  });

  return {
    storagePath,
    publicUrl
  };
};

export const deleteImageFromStorage = async (storagePath: string): Promise<void> => {
  const supabase = getSupabaseClient();
  const bucket = getStorageBucket();
  await supabase.storage.from(bucket).remove([storagePath]);
};
