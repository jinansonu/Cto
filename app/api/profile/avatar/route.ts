import { randomUUID } from 'crypto';
import { NextResponse } from 'next/server';
import { createRouteClient } from '@/lib/supabase/server';
import type { Database } from '@/types/database';

export async function POST(request: Request) {
  const supabase = createRouteClient();

  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  }

  const formData = await request.formData();
  const file = formData.get('file');

  if (!file || !(file instanceof File)) {
    return NextResponse.json({ error: 'Invalid file upload request' }, { status: 400 });
  }

  const arrayBuffer = await file.arrayBuffer();
  const fileBuffer = Buffer.from(arrayBuffer);
  const fileExt = file.name.split('.').pop();
  const fileName = `${randomUUID()}.${fileExt ?? 'png'}`;
  const filePath = `${user.id}/${fileName}`;

  const { error: uploadError } = await supabase.storage
    .from('avatars')
    .upload(filePath, fileBuffer, {
      contentType: file.type,
      upsert: true
    });

  if (uploadError) {
    return NextResponse.json({ error: uploadError.message }, { status: 500 });
  }

  const {
    data: { publicUrl }
  } = supabase.storage.from('avatars').getPublicUrl(filePath);

  const updates: Database['public']['Tables']['profiles']['Insert'] = {
    id: user.id,
    email: user.email ?? undefined,
    avatar_url: publicUrl,
    updated_at: new Date().toISOString()
  };

  const { data, error } = await supabase
    .from('profiles')
    .upsert(updates, { onConflict: 'id' })
    .select('*')
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ profile: data });
}
