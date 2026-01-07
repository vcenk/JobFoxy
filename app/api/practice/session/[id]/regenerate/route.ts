// app/api/practice/session/[id]/regenerate/route.ts
// Regenerate the current question in a practice session

import { NextRequest } from 'next/server'
import { supabaseAdmin } from '@/lib/clients/supabaseClient'
import {
  getAuthUser,
  unauthorizedResponse,
  badRequestResponse,
  serverErrorResponse,
  successResponse,
} from '@/lib/utils/apiHelpers'
// import { generateInterviewPlan } from '@/lib/engines/mockInterviewEngine' // TODO: Implement practice question generation

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const user = await getAuthUser(req)
  if (!user) return unauthorizedResponse()

  const { id: sessionId } = params

  try {
    const body = await req.json()
    const { questionId } = body

    if (!questionId) {
      return badRequestResponse('Question ID is required')
    }

    // Fetch session details to get context
    const { data: sessionData, error: sessionError } = await supabaseAdmin
      .from('practice_sessions')
      .select('resume_id, job_description_id, question_category, difficulty, user_id')
      .eq('id', sessionId)
      .eq('user_id', user.id)
      .single()

    if (sessionError || !sessionData) {
      console.error('Failed to fetch session:', sessionError)
      return serverErrorResponse('Session not found')
    }

    // Get resume context
    const { data: resume, error: resumeError } = await supabaseAdmin
      .from('resumes')
      .select('raw_text')
      .eq('id', sessionData.resume_id)
      .single()

    if (resumeError || !resume) {
      return badRequestResponse('Resume not found')
    }

    // Get job description if provided
    let jobText: string | undefined
    if (sessionData.job_description_id) {
      const { data: jd } = await supabaseAdmin
        .from('job_descriptions')
        .select('description')
        .eq('id', sessionData.job_description_id)
        .single()
      jobText = jd?.description
    }

    // Generate new question
    const plan = await generateInterviewPlan({
      resumeText: resume.raw_text,
      jobDescription: jobText,
      difficulty: sessionData.difficulty || 'standard',
      focus: sessionData.question_category,
      durationMinutes: 1, // Just one question
    })

    if (!plan || !plan.questions || plan.questions.length === 0) {
      return serverErrorResponse('Failed to generate new question')
    }

    const newQuestionData = plan.questions[0]

    // Update the existing question with new text
    const { data: updatedQuestion, error: updateError } = await supabaseAdmin
      .from('practice_questions')
      .update({
        question_text: newQuestionData.text,
        expected_components: newQuestionData.ideal_answer_points,
      })
      .eq('id', questionId)
      .eq('session_id', sessionId)
      .select()
      .single()

    if (updateError || !updatedQuestion) {
      console.error('Failed to update question:', updateError)
      return serverErrorResponse('Failed to update question')
    }

    console.log('[Regenerate Question] Success for question:', questionId)
    return successResponse({ question: updatedQuestion })
  } catch (error) {
    console.error('[API Regenerate Question Error]:', error)
    return serverErrorResponse()
  }
}
