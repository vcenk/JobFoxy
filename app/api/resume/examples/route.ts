// app/api/resume/examples/route.ts
// Public API endpoint for browsing published resume examples

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/clients/supabaseBrowserClient'

export async function GET(request: NextRequest) {
  try {
    const supabase = createClient()
    const { searchParams } = new URL(request.url)

    // Get filter parameters
    const industry = searchParams.get('industry')
    const experienceLevel = searchParams.get('experienceLevel')
    const searchQuery = searchParams.get('search')
    const limit = parseInt(searchParams.get('limit') || '50')
    const offset = parseInt(searchParams.get('offset') || '0')

    // Build query
    let query = supabase
      .from('resume_examples')
      .select('*')
      .eq('is_published', true)
      .order('quality_score', { ascending: false })
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)

    // Apply filters
    if (industry && industry !== 'all') {
      query = query.eq('industry', industry)
    }

    if (experienceLevel && experienceLevel !== 'all') {
      query = query.eq('experience_level', experienceLevel)
    }

    if (searchQuery) {
      query = query.or(`job_title.ilike.%${searchQuery}%,slug.ilike.%${searchQuery}%`)
    }

    const { data: examples, error, count } = await query

    if (error) {
      console.error('Error fetching resume examples:', error)
      return NextResponse.json(
        { error: 'Failed to fetch resume examples' },
        { status: 500 }
      )
    }

    // Get total count for pagination
    const { count: totalCount } = await supabase
      .from('resume_examples')
      .select('*', { count: 'exact', head: true })
      .eq('is_published', true)

    return NextResponse.json({
      success: true,
      examples,
      pagination: {
        total: totalCount || 0,
        limit,
        offset,
        hasMore: (offset + limit) < (totalCount || 0),
      },
    })
  } catch (error: any) {
    console.error('❌ Error in resume examples GET:', error)
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    )
  }
}
