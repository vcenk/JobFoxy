import { NextRequest } from 'next/server'
import { extractGaps } from '@/lib/engines/gapDefenseEngine'
import { supabaseAdmin } from '@/lib/clients/supabaseClient'
import {
  getAuthUser,
  unauthorizedResponse,
  badRequestResponse,
  serverErrorResponse,
  successResponse,
  validateRequiredFields,
} from '@/lib/utils/apiHelpers'

export async function POST(req: NextRequest) {
  const user = await getAuthUser(req)
  if (!user) {
    return unauthorizedResponse()
  }

  try {
    const body = await req.json()
    const validation = validateRequiredFields(body, ['resumeId', 'jobDescriptionId'])
    if (!validation.valid) {
      return badRequestResponse(`Missing fields: ${validation.missing?.join(', ')}`)
    }

    const { resumeId, jobDescriptionId } = body

    // 1. Get Resume context
    const { data: resume } = await supabaseAdmin
      .from('resumes')
      .select('raw_text')
      .eq('id', resumeId)
      .eq('user_id', user.id)
      .single()

    if (!resume) {
      return badRequestResponse('Resume not found')
    }

    // 2. Get Job Description context
    const { data: jd } = await supabaseAdmin
      .from('job_descriptions')
      .select('description')
      .eq('id', jobDescriptionId)
      .eq('user_id', user.id)
      .single()
    
    if (!jd) {
      return badRequestResponse('Job Description not found')
    }

    // 3. Extract Gaps
    const gaps = await extractGaps({
      resumeText: resume.raw_text,
      jobDescription: jd.description,
    })

    if (!gaps) {
      return serverErrorResponse('Failed to analyze gaps.')
    }

    return successResponse({ gaps })
  } catch (error) {
    console.error('[Gap Analysis API Error]:', error)
    return serverErrorResponse((error as Error).message)
  }
}
