// app/api/mock/[id]/route.ts
// Get Single Mock Interview Session

import { NextRequest } from 'next/server'
import { supabaseAdmin } from '@/lib/clients/supabaseClient'
import {
  getAuthUser,
  unauthorizedResponse,
  badRequestResponse,
  serverErrorResponse,
  successResponse
} from '@/lib/utils/apiHelpers'

/**
 * GET /api/mock/[id]
 *
 * Fetches a single mock interview session by ID
 */
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const user = await getAuthUser(req)
  if (!user) return unauthorizedResponse()

  const sessionId = params.id

  try {
    const { data: session, error } = await supabaseAdmin
      .from('mock_interview_sessions')
      .select('*')
      .eq('id', sessionId)
      .eq('user_id', user.id)
      .single()

    if (error || !session) {
      return badRequestResponse('Interview session not found or access denied')
    }

    return successResponse(session)
  } catch (error) {
    console.error('[Mock Get] Unexpected error:', error)
    return serverErrorResponse('An unexpected error occurred')
  }
}

/**
 * DELETE /api/mock/[id]
 *
 * Deletes a mock interview session and its related exchanges
 */
export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const user = await getAuthUser(req)
  if (!user) return unauthorizedResponse()

  const sessionId = params.id

  try {
    // First verify the session belongs to this user
    const { data: session, error: fetchError } = await supabaseAdmin
      .from('mock_interview_sessions')
      .select('id')
      .eq('id', sessionId)
      .eq('user_id', user.id)
      .single()

    if (fetchError || !session) {
      return badRequestResponse('Interview session not found or access denied')
    }

    // Delete related exchanges first (foreign key constraint)
    await supabaseAdmin
      .from('mock_interview_exchanges')
      .delete()
      .eq('session_id', sessionId)

    // Delete the session
    const { error: deleteError } = await supabaseAdmin
      .from('mock_interview_sessions')
      .delete()
      .eq('id', sessionId)
      .eq('user_id', user.id)

    if (deleteError) {
      console.error('[Mock Delete] Error:', deleteError)
      return serverErrorResponse('Failed to delete interview session')
    }

    return successResponse({ deleted: true })
  } catch (error) {
    console.error('[Mock Delete] Unexpected error:', error)
    return serverErrorResponse('An unexpected error occurred')
  }
}
