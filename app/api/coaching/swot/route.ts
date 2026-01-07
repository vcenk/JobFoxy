// app/api/coaching/swot/route.ts
// Generate SWOT analysis

import { NextRequest } from 'next/server'
import { generateSwotAnalysis } from '@/lib/engines/swotEngine'  // lib/engines/swotEngine.ts
import { supabaseAdmin } from '@/lib/clients/supabaseClient'  // lib/clients/supabaseClient.ts
import {
  getAuthUser,
  unauthorizedResponse,
  badRequestResponse,
  serverErrorResponse,
  successResponse,
  validateRequiredFields,
  trackUsage,
} from '@/lib/utils/apiHelpers'  // lib/utils/apiHelpers.ts

export async function POST(req: NextRequest) {
  // Authenticate user
  const user = await getAuthUser(req)
  if (!user) {
    return unauthorizedResponse()
  }

  try {
    const body = await req.json()

    // Validate required fields
    const validation = validateRequiredFields(body, ['resumeId'])
    if (!validation.valid) {
      return badRequestResponse(`Missing fields: ${validation.missing?.join(', ')}`)
    }

    const { resumeId, jobDescriptionId } = body

    // Check if SWOT analysis for this resume+job already exists
    let existingQuery = supabaseAdmin
      .from('swot_analyses')
      .select('*')
      .eq('user_id', user.id)
      .eq('resume_id', resumeId)
      .order('created_at', { ascending: false })
      .limit(1)

    if (jobDescriptionId) {
      existingQuery = existingQuery.eq('job_description_id', jobDescriptionId)
    } else {
      existingQuery = existingQuery.is('job_description_id', null)
    }

    const { data: existingSwot } = await existingQuery.single()

    // If exists, return it instead of regenerating
    if (existingSwot) {
      return successResponse(existingSwot)
    }

    // Get resume
    const { data: resume } = await supabaseAdmin
      .from('resumes')
      .select('raw_text')
      .eq('id', resumeId)
      .eq('user_id', user.id)
      .single()

    if (!resume) {
      return badRequestResponse('Resume not found')
    }

    // Get job description if provided
    let jobText: string | undefined
    if (jobDescriptionId) {
      const { data: jd } = await supabaseAdmin
        .from('job_descriptions')
        .select('description')
        .eq('id', jobDescriptionId)
        .eq('user_id', user.id)
        .single()

      jobText = jd?.description
    }

    // Generate SWOT
    const swot = await generateSwotAnalysis({
      resumeText: resume.raw_text,
      jobText,
    })

    if (!swot) {
      return serverErrorResponse('Failed to generate SWOT analysis')
    }

    // Save to database
    const { data: savedSwot, error } = await supabaseAdmin
      .from('swot_analyses')
      .insert({
        user_id: user.id,
        resume_id: resumeId,
        job_description_id: jobDescriptionId,
        strengths: swot.strengths,
        weaknesses: swot.weaknesses,
        opportunities: swot.opportunities,
        threats: swot.threats,
        last_generated_at: new Date().toISOString(),
      })
      .select()
      .single()

    if (error) {
      console.error('[SWOT Save Error]:', error)
      return serverErrorResponse('Failed to save SWOT analysis')
    }

    // Track usage
    await trackUsage({
      userId: user.id,
      resourceType: 'swot_generation',
      metadata: { resumeId, jobDescriptionId },
    })

    return successResponse(savedSwot)
  } catch (error) {
    console.error('[SWOT API Error]:', error)
    return serverErrorResponse()
  }
}

export async function GET(req: NextRequest) {
  const user = await getAuthUser(req)
  if (!user) return unauthorizedResponse()

  const { searchParams } = new URL(req.url)
  const resumeId = searchParams.get('resumeId')
  const jobDescriptionId = searchParams.get('jobDescriptionId')

  if (!resumeId) return badRequestResponse('resumeId is required')

  try {
    let query = supabaseAdmin
      .from('swot_analyses')
      .select('*')
      .eq('user_id', user.id)
      .eq('resume_id', resumeId)
      .order('created_at', { ascending: false })
      .limit(1)

    if (jobDescriptionId) {
      query = query.eq('job_description_id', jobDescriptionId)
    } else {
      query = query.is('job_description_id', null)
    }

    const { data, error } = await query.single()

    if (error && error.code !== 'PGRST116') { // PGRST116 is "No rows found"
      console.error('[SWOT Fetch Error]:', error)
      return serverErrorResponse()
    }

    return successResponse(data) // Returns null if not found (which is fine)
  } catch (error) {
    console.error('[SWOT GET Error]:', error)
    return serverErrorResponse()
  }
}
