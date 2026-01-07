// app/api/mock/list/route.ts
// List All Mock Interviews for User

import { NextRequest } from 'next/server'
import { supabaseAdmin } from '@/lib/clients/supabaseClient'
import {
  getAuthUser,
  unauthorizedResponse,
  serverErrorResponse,
  successResponse
} from '@/lib/utils/apiHelpers'

/**
 * GET /api/mock/list
 *
 * Fetches all mock interview sessions for the authenticated user
 */
export async function GET(req: NextRequest) {
  const user = await getAuthUser(req)
  if (!user) return unauthorizedResponse()

  try {
    const { data: interviews, error } = await supabaseAdmin
      .from('mock_interview_sessions')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('[Mock List] Error fetching interviews:', error)
      return serverErrorResponse('Failed to fetch interviews')
    }

    return successResponse(interviews || [])
  } catch (error) {
    console.error('[Mock List] Unexpected error:', error)
    return serverErrorResponse('An unexpected error occurred')
  }
}
