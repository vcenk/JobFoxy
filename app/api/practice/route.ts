// app/api/practice/route.ts (GET for all practice sessions)
import { NextRequest } from 'next/server'
import { supabaseAdmin } from '@/lib/clients/supabaseClient'
import {
  getAuthUser,
  unauthorizedResponse,
  serverErrorResponse,
  successResponse,
} from '@/lib/utils/apiHelpers'

export async function GET(req: NextRequest) {
  const user = await getAuthUser(req)
  if (!user) return unauthorizedResponse()

  try {
    const { data: sessions, error } = await supabaseAdmin
      .from('practice_sessions')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Failed to fetch practice sessions:', error)
      return serverErrorResponse('Failed to fetch practice sessions')
    }

    return successResponse({ sessions })
  } catch (error) {
    console.error('[API Get All Practice Sessions Error]:', error)
    return serverErrorResponse()
  }
}

// DELETE for a specific practice session
export async function DELETE(
  req: NextRequest,
) {
  const user = await getAuthUser(req)
  if (!user) return unauthorizedResponse()

  const { searchParams } = new URL(req.url);
  const sessionId = searchParams.get('id');

  if (!sessionId) {
    return serverErrorResponse('Session ID is required');
  }

  try {
    const { error } = await supabaseAdmin
      .from('practice_sessions')
      .delete()
      .eq('id', sessionId)
      .eq('user_id', user.id);

    if (error) {
      console.error('Failed to delete practice session:', error);
      return serverErrorResponse('Failed to delete practice session');
    }

    return successResponse({ message: 'Session deleted successfully' });
  } catch (error) {
    console.error('[API Delete Practice Session Error]:', error);
    return serverErrorResponse();
  }
}
