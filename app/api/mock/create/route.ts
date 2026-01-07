// app/api/mock/create/route.ts
// Create New Voice-Only Mock Interview Session

import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/clients/supabaseClient'
import {
  generateInterviewQuestions,
  calculateQuestionCount,
  detectSeniorityLevel,
  extractIndustry,
  MockInterviewContext
} from '@/lib/engines/mockInterviewEngine'
import {
  getAuthUser,
  unauthorizedResponse,
  badRequestResponse,
  serverErrorResponse,
  successResponse,
  checkUsageLimits,
  trackUsage,
  validateRequiredFields,
  incrementUsage
} from '@/lib/utils/apiHelpers'
import {
  getPersonaByVoiceId,
  getRecommendedPersona,
  getPersonaTitle,
  ALL_PERSONAS
} from '@/lib/data/interviewerPersonas'
import { createConversationState } from '@/lib/services/conversationManager'

/**
 * POST /api/mock/create
 *
 * Creates a new voice-only mock interview session with ElevenLabs
 *
 * Request Body:
 * - resumeId: string (required)
 * - jobDescriptionId?: string (optional)
 * - durationMinutes: 15 | 20 | 30 (required)
 * - voiceId?: string (optional, uses user preference if not provided)
 *
 * Response:
 * - session: Interview session data
 * - questions: Generated interview questions
 * - interviewer: Persona details
 */
export async function POST(req: NextRequest) {
  const user = await getAuthUser(req)
  if (!user) return unauthorizedResponse()

  try {
    const body = await req.json()
    const { valid, missing } = validateRequiredFields(body, [
      'resumeId',
      'durationMinutes'
    ])

    if (!valid) {
      console.error('[Mock Create] Validation failed:', missing)
      return badRequestResponse(`Missing required fields: ${missing?.join(', ')}`)
    }

    const {
      resumeId,
      jobDescriptionId,
      durationMinutes
    } = body

    // Validate duration
    if (![15, 20, 30].includes(durationMinutes)) {
      return badRequestResponse('Duration must be 15, 20, or 30 minutes')
    }

    // 1. Check Usage Limits (Mock Interview)
    const limitCheck = await checkUsageLimits(user.id, 'mock_interview')
    if (!limitCheck.allowed) {
      console.warn('[Mock Create] Usage limit reached for user:', user.id)
      return NextResponse.json(
        {
          success: false,
          error: limitCheck.reason,
          code: 'LIMIT_REACHED'
        },
        { status: 403 }
      )
    }

    // 2. Get User Profile (for voice preferences)
    const { data: profile, error: profileError } = await supabaseAdmin
      .from('profiles')
      .select('preferred_interviewer_voice, preferred_interviewer_gender, full_name')
      .eq('id', user.id)
      .single()

    if (profileError) {
      console.error('[Mock Create] Profile fetch error:', profileError)
      // Continue with defaults
    }

    // 3. Fetch Resume
    const { data: resume, error: resumeError } = await supabaseAdmin
      .from('resumes')
      .select('*')
      .eq('id', resumeId)
      .eq('user_id', user.id)
      .single()

    if (resumeError || !resume) {
      return badRequestResponse('Resume not found or access denied')
    }

    // 4. Fetch Job Description (if provided)
    let jobDescription: any = null
    let jobTitle = ''
    let companyName = ''

    if (jobDescriptionId) {
      const { data: jd, error: jdError } = await supabaseAdmin
        .from('job_descriptions')
        .select('*')
        .eq('id', jobDescriptionId)
        .eq('user_id', user.id)
        .single()

      if (!jdError && jd) {
        jobDescription = jd
        jobTitle = jd.title || ''
        companyName = jd.company || ''
      }
    }

    // 5. Determine Interviewer Voice & Persona
    let voiceId = body.voiceId || profile?.preferred_interviewer_voice

    // If no voice ID, get recommended persona based on job
    if (!voiceId) {
      const recommendedPersona = getRecommendedPersona(jobTitle, profile?.preferred_interviewer_gender)
      voiceId = recommendedPersona.voice_id
    }

    const persona = getPersonaByVoiceId(voiceId)
    if (!persona) {
      return badRequestResponse('Invalid voice/persona selection')
    }

    // Adjust interviewer title based on job context
    const interviewerTitle = getPersonaTitle(persona, jobTitle)

    // 6. Build Context for Question Generation
    const resumeContent = resume.content || {}
    const seniorityLevel = detectSeniorityLevel(jobTitle, resumeContent)
    const industry = extractIndustry(jobDescription?.description, resumeContent)

    const questionContext: MockInterviewContext = {
      resumeData: resumeContent,
      jobTitle,
      jobDescription: jobDescription?.description,
      companyName,
      duration: durationMinutes,
      industry,
      seniorityLevel
    }

    // 7. Generate Interview Questions
    console.log('[Mock Create] Generating questions for:', {
      duration: durationMinutes,
      seniority: seniorityLevel,
      industry
    })

    const questions = await generateInterviewQuestions(questionContext)

    if (!questions || questions.length === 0) {
      return serverErrorResponse('Failed to generate interview questions')
    }

    console.log('[Mock Create] Generated', questions.length, 'questions')

    // 8. Create Interview Session
    const { data: session, error: sessionError } = await supabaseAdmin
      .from('mock_interview_sessions')
      .insert({
        user_id: user.id,
        resume_id: resumeId,
        job_description_id: jobDescriptionId,
        duration_minutes: durationMinutes,
        interviewer_voice: voiceId,
        interviewer_name: persona.name,
        interviewer_title: interviewerTitle,
        interviewer_gender: persona.gender,
        job_title: jobTitle,
        company_name: companyName,
        interview_plan: {
          questions: questions.map(q => ({
            text: q.text,
            type: q.type,
            difficulty: q.difficulty,
            expectedDuration: q.expectedDuration,
            tips: q.tips,
            focusAreas: q.focusAreas
          })),
          seniority_level: seniorityLevel,
          industry,
          duration: durationMinutes
        },
        conversation_history: [],
        status: 'in_progress',
        current_phase: 'welcome',
        current_question_index: 0,
        total_questions: questions.length
      })
      .select()
      .single()

    if (sessionError) {
      console.error('[Mock Create] Session creation error:', sessionError)
      return serverErrorResponse('Failed to create interview session')
    }

    // 9. Create Question Exchanges (pre-populate with generated questions)
    // Map question types to valid database exchange_type values
    // Allowed: 'welcome', 'small_talk', 'company_intro', 'behavioral', 'technical', 'leadership', 'follow_up', 'wrap_up'
    const mapQuestionTypeToExchangeType = (type: string): string => {
      const typeMap: Record<string, string> = {
        'behavioral': 'behavioral',
        'technical': 'technical',
        'leadership': 'leadership',
        'situational': 'behavioral', // Map situational to behavioral
        'values': 'behavioral'       // Map values to behavioral
      }
      return typeMap[type] || 'behavioral'
    }

    const exchanges = questions.map((q, index) => ({
      session_id: session.id,
      exchange_type: mapQuestionTypeToExchangeType(q.type),
      order_index: index + 1,
      question_text: q.text
      // Note: Question metadata (difficulty, tips, etc.) is stored in session.interview_plan
    }))

    const { error: exchangesError } = await supabaseAdmin
      .from('mock_interview_exchanges')
      .insert(exchanges)

    if (exchangesError) {
      console.error('[Mock Create] Exchanges creation error:', exchangesError)
      // Clean up session?
      await supabaseAdmin
        .from('mock_interview_sessions')
        .delete()
        .eq('id', session.id)
      return serverErrorResponse('Failed to initialize interview questions')
    }

    // 10. Initialize Conversation State (for first request)
    const conversationState = createConversationState({
      sessionId: session.id,
      voiceId,
      userName: profile?.full_name || 'Candidate',
      companyName,
      jobTitle,
      questions: questions.map(q => ({
        text: q.text,
        type: q.type,
        tips: q.tips
      }))
    })

    // 11. Track Usage
    await trackUsage({
      userId: user.id,
      resourceType: 'mock_interview',
      resourceCount: 1,
      sessionId: session.id
    })

    await incrementUsage(user.id, 'mock_interviews_this_month')

    // 12. Return Success
    return successResponse({
      session: {
        id: session.id,
        status: session.status,
        currentPhase: session.current_phase,
        durationMinutes: session.duration_minutes,
        totalQuestions: session.total_questions,
        createdAt: session.created_at
      },
      interviewer: {
        name: persona.name,
        title: interviewerTitle,
        voiceId,
        gender: persona.gender,
        personality: persona.personality
      },
      questions: questions.map(q => ({
        text: q.text,
        type: q.type,
        difficulty: q.difficulty,
        tips: q.tips
      })),
      conversationState,
      jobContext: {
        title: jobTitle || 'General Interview',
        company: companyName || 'Company',
        industry
      }
    })

  } catch (error) {
    console.error('[Mock Create Error]:', error)
    return serverErrorResponse('An unexpected error occurred while creating the interview')
  }
}
