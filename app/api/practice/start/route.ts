// app/api/practice/start/route.ts
import { NextRequest } from 'next/server'
import { supabaseAdmin } from '@/lib/clients/supabaseClient'
import {
  getAuthUser,
  unauthorizedResponse,
  badRequestResponse,
  serverErrorResponse,
  successResponse,
  validateRequiredFields,
  checkUsageLimits,
  incrementUsage,
} from '@/lib/utils/apiHelpers'
// import { generateInterviewPlan } from '@/lib/engines/mockInterviewEngine' // TODO: Implement practice question generation

export async function POST(req: NextRequest) {
  const user = await getAuthUser(req)
  if (!user) return unauthorizedResponse()

  // Check usage limits
  const limitCheck = await checkUsageLimits(user.id, 'audio_practice')
  if (!limitCheck.allowed) {
    return Response.json(
      { success: false, error: limitCheck.reason, code: 'LIMIT_REACHED' },
      { status: 403 }
    )
  }

  try {
    const body = await req.json()
    const { resumeId, jobDescriptionId, questionCategory, totalQuestions = 5 } = body

    const validation = validateRequiredFields(body, ['resumeId', 'questionCategory'])
    if (!validation.valid) {
      return badRequestResponse(`Missing fields: ${validation.missing?.join(', ')}`)
    }

    const { data: resume } = await supabaseAdmin
      .from('resumes')
      .select('raw_text')
      .eq('id', resumeId)
      .eq('user_id', user.id)
      .single()
    if (!resume) return badRequestResponse('Resume not found')

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

    // Generate a plan with a single question for now, then get more as needed
    const generatedPlan = await generateInterviewPlan({
        resumeText: resume.raw_text,
        jobDescription: jobText,
        difficulty: 'standard', // Default for practice
        focus: questionCategory,
        durationMinutes: totalQuestions * 3 // Estimate duration for question generation
    });

    if (!generatedPlan || generatedPlan.questions.length === 0) {
        return serverErrorResponse('Failed to generate initial practice question.')
    }

    // Create a new practice session
    const { data: session, error: sessionError } = await supabaseAdmin
      .from('practice_sessions')
      .insert({
        user_id: user.id,
        resume_id: resumeId,
        job_description_id: jobDescriptionId,
        question_category: questionCategory,
        total_questions: generatedPlan.questions.length, // Use generated plan questions count
        title: `${questionCategory} Practice`,
        status: 'in_progress',
      })
      .select()
      .single()

    if (sessionError) {
      console.error('Failed to create practice session:', sessionError)
      return serverErrorResponse('Failed to create practice session')
    }

    // Insert the initial question
    const firstQuestion = generatedPlan.questions[0];
    const { data: newQuestion, error: questionError } = await supabaseAdmin
        .from('practice_questions')
        .insert({
            session_id: session.id,
            question_text: firstQuestion.text,
            question_category: firstQuestion.type,
            difficulty: 'medium', // Default
            expected_components: firstQuestion.ideal_answer_points,
            order_index: 0,
        })
        .select()
        .single();

    if (questionError) {
        console.error('Failed to insert initial practice question:', questionError);
        return serverErrorResponse('Failed to save initial question');
    }

    // Increment usage
    await incrementUsage(user.id, 'audio_practice_sessions_this_month')

    return successResponse({ session, currentQuestion: newQuestion })
  } catch (error) {
    console.error('[API Start Practice Session Error]:', error)
    return serverErrorResponse()
  }
}
