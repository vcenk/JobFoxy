// app/api/cover-letter/list/route.ts
// List cover letters for a user or specific resume

import { NextRequest } from 'next/server'
import { supabaseAdmin } from '@/lib/clients/supabaseClient'
import {
  getAuthUser,
  unauthorizedResponse,
  serverErrorResponse,
  successResponse,
} from '@/lib/utils/apiHelpers'

export async function GET(req: NextRequest) {
  // Authenticate user
  const user = await getAuthUser(req)
  if (!user) {
    return unauthorizedResponse()
  }

  try {
    const { searchParams } = new URL(req.url)
    const resumeId = searchParams.get('resumeId')

    console.log('[Cover Letter List] Request params:', {
      userId: user.id,
      resumeId
    })

    let query = supabaseAdmin
      .from('cover_letters')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })

    // Filter by resume if specified
    if (resumeId) {
      query = query.eq('resume_id', resumeId)
    }

    const { data: coverLetters, error } = await query

    console.log('[Cover Letter List] Query result:', {
      count: coverLetters?.length || 0,
      error: error?.message,
      resumeIds: coverLetters?.map(c => c.resume_id)
    })

    if (error) {
      console.error('[Cover Letter List Error]:', error)
      return serverErrorResponse('Failed to fetch cover letters')
    }

    return successResponse({
      coverLetters: coverLetters || [],
    })
  } catch (error) {
    console.error('[Cover Letter List API Error]:', error)
    return serverErrorResponse()
  }
}
