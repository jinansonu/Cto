import { NextResponse } from 'next/server';
import { createRouteClient } from '@/lib/supabase/server';
import type { Database } from '@/types/database';

export async function GET() {
  const supabase = createRouteClient();

  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  }

  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .maybeSingle();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  if (!data) {
    const insertPayload: Database['public']['Tables']['profiles']['Insert'] = {
      id: user.id,
      email: user.email,
      display_name: user.user_metadata?.display_name ?? null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    const { data: inserted, error: insertError } = await supabase
      .from('profiles')
      .insert(insertPayload)
      .select('*')
      .single();

    if (insertError) {
      return NextResponse.json({ error: insertError.message }, { status: 500 });
    }

    return NextResponse.json({ profile: inserted });
  }

  return NextResponse.json({ profile: data });
}

export async function PATCH(request: Request) {
  const supabase = createRouteClient();

  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  }

  const payload = (await request.json()) as {
    display_name?: string | null;
  };

  const updates: Database['public']['Tables']['profiles']['Insert'] = {
    id: user.id,
    email: user.email ?? undefined,
    updated_at: new Date().toISOString()
  };

  if (payload.display_name !== undefined) {
    updates.display_name = payload.display_name;
  }

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
