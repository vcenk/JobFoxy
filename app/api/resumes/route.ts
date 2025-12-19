// app/api/resumes/route.ts
// Get list of user's resumes

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
    // Fetch user's resumes
    const { data: resumes, error } = await supabaseAdmin
      .from('resumes')
      .select('id, title, content, created_at, updated_at')
      .eq('user_id', user.id)
      .order('updated_at', { ascending: false })

    if (error) {
      console.error('[Resumes List Error]:', error)
      return serverErrorResponse('Failed to fetch resumes')
    }

    return successResponse({
      resumes: resumes || [],
    })
  } catch (error) {
    console.error('[Resumes API Error]:', error)
    return serverErrorResponse()
  }
}
