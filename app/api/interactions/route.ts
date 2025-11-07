import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
const supabase = createClient(supabaseUrl, supabaseAnonKey)

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const mode = searchParams.get('mode') || 'all'
    const search = searchParams.get('search') || ''

    const offset = (page - 1) * limit

    let query = supabase
      .from('interactions')
      .select('*', { count: 'exact' })
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)

    // Apply mode filter
    if (mode !== 'all') {
      query = query.eq('mode', mode)
    }

    // Apply search filter
    if (search) {
      query = query.or(`question.ilike.%${search}%,answer.ilike.%${search}%,summary.ilike.%${search}%`)
    }

    const { data, error, count } = await query

    if (error) {
      console.error('Supabase error:', error)
      return NextResponse.json(
        { error: 'Failed to fetch interactions' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      data,
      error: null,
      count,
    })
  } catch (error) {
    console.error('API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}