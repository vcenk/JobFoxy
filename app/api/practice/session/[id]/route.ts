// app/api/practice/session/[id]/route.ts (GET for a single practice session)
import { NextRequest } from 'next/server'
import { supabaseAdmin } from '@/lib/clients/supabaseClient'
import {
  getAuthUser,
  unauthorizedResponse,
  serverErrorResponse,
  successResponse,
} from '@/lib/utils/apiHelpers'

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const user = await getAuthUser(req)
  if (!user) return unauthorizedResponse()

  const { id } = params

  console.log('[Practice Session API] Fetching session:', id, 'for user:', user.id)

  try {
    const { data: session, error } = await supabaseAdmin
      .from('practice_sessions')
      .select(`
        *,
        practice_questions (
          *,
          practice_answers (*)
        )
      `)
      .eq('id', id)
      .eq('user_id', user.id)
      .single()

    if (error) {
      console.error('[Practice Session API] Database error:', error)
      if (error.code === 'PGRST116') { // No rows found
        console.log('[Practice Session API] No session found with ID:', id)
        return successResponse(null)
      }
      return serverErrorResponse('Failed to fetch practice session')
    }

    console.log('[Practice Session API] Session found:', session?.id, 'Questions:', session?.practice_questions?.length)
    return successResponse({ session })
  } catch (error) {
    console.error('[API Get Single Practice Session Error]:', error)
    return serverErrorResponse()
  }
}

// DELETE a practice session
export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const user = await getAuthUser(req)
  if (!user) return unauthorizedResponse()

  const { id } = params

  console.log('[Practice Session API] Deleting session:', id, 'for user:', user.id)

  try {
    // First verify the session belongs to this user
    const { data: existingSession } = await supabaseAdmin
      .from('practice_sessions')
      .select('id')
      .eq('id', id)
      .eq('user_id', user.id)
      .single()

    if (!existingSession) {
      return serverErrorResponse('Session not found or access denied')
    }

    // Delete the session (cascade will handle questions and answers)
    const { error } = await supabaseAdmin
      .from('practice_sessions')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id)

    if (error) {
      console.error('[Practice Session API] Delete error:', error)
      return serverErrorResponse('Failed to delete practice session')
    }

    console.log('[Practice Session API] Session deleted successfully:', id)
    return successResponse({ deleted: true })
  } catch (error) {
    console.error('[API Delete Practice Session Error]:', error)
    return serverErrorResponse()
  }
}