// app/api/mock/[id]/speak/route.ts
// Generate AI Interviewer Speech for Mock Interview

import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/clients/supabaseClient'
import {
  getAuthUser,
  unauthorizedResponse,
  badRequestResponse,
  serverErrorResponse,
  successResponse,
  validateRequiredFields
} from '@/lib/utils/apiHelpers'
import {
  generateWelcomeMessage,
  generateSmallTalkOpening,
  processSmallTalkResponse,
  generateCompanyIntroduction,
  generateQuestion,
  generateBackchannel,
  generateAnswerResponse,
  generateWrapUp,
  generateGoodbye,
  advancePhase,
  ConversationState,
  InterviewPhase
} from '@/lib/services/conversationManager'

/**
 * POST /api/mock/[id]/speak
 *
 * Generates AI interviewer speech based on current conversation phase
 *
 * Request Body:
 * - action: 'welcome' | 'small_talk' | 'small_talk_response' | 'company_intro' | 'question' | 'backchannel' | 'answer_response' | 'wrap_up' | 'goodbye'
 * - userResponse?: string (required for 'small_talk_response')
 * - secondsElapsed?: number (required for 'backchannel')
 *
 * Response:
 * - text: string (what the AI said)
 * - audio: string (base64 encoded audio)
 * - phase: current interview phase
 * - nextAction?: what should happen next
 */
export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const user = await getAuthUser(req)
  if (!user) return unauthorizedResponse()

  const sessionId = params.id

  try {
    const body = await req.json()
    const { action, userResponse, secondsElapsed } = body

    if (!action) {
      return badRequestResponse('Missing required field: action')
    }

    // 1. Fetch Session
    const { data: session, error: sessionError } = await supabaseAdmin
      .from('mock_interview_sessions')
      .select('*')
      .eq('id', sessionId)
      .eq('user_id', user.id)
      .single()

    if (sessionError || !session) {
      return badRequestResponse('Interview session not found or access denied')
    }

    if (session.status === 'completed') {
      return badRequestResponse('Interview already completed')
    }

    // 2. Get User Profile
    const { data: profile } = await supabaseAdmin
      .from('profiles')
      .select('full_name')
      .eq('id', user.id)
      .single()

    // 3. Build Conversation State
    const conversationState: ConversationState = {
      sessionId: session.id,
      phase: session.current_phase as InterviewPhase,
      voiceId: session.interviewer_voice,
      interviewerName: session.interviewer_name,
      interviewerTitle: session.interviewer_title,
      userName: profile?.full_name || 'Candidate',
      companyName: session.company_name,
      jobTitle: session.job_title,
      currentQuestionIndex: session.current_question_index || 0,
      totalQuestions: session.total_questions,
      questions: session.interview_plan?.questions || [],
      smallTalkTemplate: session.conversation_history?.[0]?.smallTalkTemplate,
      smallTalkOpening: session.conversation_history?.[0]?.smallTalkOpening,
      userSpeakingStartTime: session.conversation_history?.[session.conversation_history?.length - 1]?.timestamp,
      lastBackchannelTime: session.conversation_history?.[session.conversation_history?.length - 1]?.lastBackchannelTime
    }

    let result: {
      text: string
      audio: ArrayBuffer
      questionData?: any
    } | null = null

    let nextAction: string | undefined
    let shouldAdvancePhase = false
    let newPhase: InterviewPhase | undefined

    // 4. Generate Speech Based on Action
    switch (action) {
      case 'welcome':
        result = await generateWelcomeMessage(conversationState)
        nextAction = 'wait_for_user_response'
        break

      case 'small_talk':
        const { text: stText, template } = await generateSmallTalkOpening(conversationState)
        // Generate audio from text
        const { textToSpeech } = await import('@/lib/clients/elevenlabsClient')
        const stAudio = await textToSpeech({
          voice_id: conversationState.voiceId,
          text: stText
        })
        result = { text: stText, audio: stAudio }

        // Store template in conversation history for processing response later
        await supabaseAdmin
          .from('mock_interview_sessions')
          .update({
            conversation_history: [
              ...(session.conversation_history || []),
              {
                type: 'small_talk_opening',
                text: stText,
                smallTalkTemplate: template,
                timestamp: new Date().toISOString()
              }
            ]
          })
          .eq('id', sessionId)

        nextAction = 'wait_for_user_response'
        break

      case 'small_talk_response':
        if (!userResponse) {
          return badRequestResponse('userResponse required for small_talk_response')
        }
        result = await processSmallTalkResponse(conversationState, userResponse)
        shouldAdvancePhase = true
        newPhase = 'company_intro'
        nextAction = 'company_intro'
        break

      case 'company_intro':
        // Get job description if available
        let jobDescription: string | undefined
        if (session.job_description_id) {
          const { data: jd } = await supabaseAdmin
            .from('job_descriptions')
            .select('description')
            .eq('id', session.job_description_id)
            .single()
          jobDescription = jd?.description
        }
        result = await generateCompanyIntroduction(conversationState, jobDescription)
        shouldAdvancePhase = true
        newPhase = 'questions'
        nextAction = 'question'
        break

      case 'question':
        result = await generateQuestion(conversationState)
        if (!result) {
          // No more questions, move to wrap-up
          shouldAdvancePhase = true
          newPhase = 'wrap_up'
          nextAction = 'wrap_up'
          return successResponse({
            text: '',
            audio: '',
            phase: 'wrap_up',
            nextAction: 'wrap_up',
            message: 'All questions completed'
          })
        }
        nextAction = 'wait_for_user_answer'
        break

      case 'backchannel':
        if (secondsElapsed === undefined) {
          return badRequestResponse('secondsElapsed required for backchannel')
        }
        result = await generateBackchannel(conversationState, secondsElapsed)
        if (!result) {
          return successResponse({
            text: '',
            audio: '',
            phase: conversationState.phase,
            nextAction: 'continue_listening',
            message: 'No backchannel needed yet'
          })
        }
        nextAction = 'continue_listening'
        break

      case 'answer_response':
        result = await generateAnswerResponse(conversationState)
        // Increment question index
        await supabaseAdmin
          .from('mock_interview_sessions')
          .update({
            current_question_index: conversationState.currentQuestionIndex + 1
          })
          .eq('id', sessionId)

        // Check if more questions remain
        if (conversationState.currentQuestionIndex + 1 >= conversationState.totalQuestions) {
          shouldAdvancePhase = true
          newPhase = 'wrap_up'
          nextAction = 'wrap_up'
        } else {
          nextAction = 'question'
        }
        break

      case 'wrap_up':
        result = await generateWrapUp(conversationState)
        nextAction = 'wait_for_user_questions'
        break

      case 'wrap_up_response':
        if (!userResponse) {
          return badRequestResponse('userResponse required for wrap_up_response')
        }
        const { generateWrapUpResponse } = await import('@/lib/services/conversationManager')
        result = await generateWrapUpResponse(conversationState, userResponse)
        nextAction = 'wait_for_more_questions_or_goodbye'
        break

      case 'goodbye':
        result = await generateGoodbye(conversationState)
        shouldAdvancePhase = true
        newPhase = 'completed'
        nextAction = 'generate_report'

        // Mark session as completed
        await supabaseAdmin
          .from('mock_interview_sessions')
          .update({
            status: 'completed',
            completed_at: new Date().toISOString(),
            current_phase: 'completed'
          })
          .eq('id', sessionId)
        break

      default:
        return badRequestResponse(`Invalid action: ${action}`)
    }

    if (!result) {
      return serverErrorResponse('Failed to generate speech')
    }

    // 5. Update Conversation History
    const historyEntry = {
      type: action,
      text: result.text,
      timestamp: new Date().toISOString(),
      phase: conversationState.phase
    }

    await supabaseAdmin
      .from('mock_interview_sessions')
      .update({
        conversation_history: [
          ...(session.conversation_history || []),
          historyEntry
        ],
        ...(shouldAdvancePhase && newPhase ? { current_phase: newPhase } : {})
      })
      .eq('id', sessionId)

    // 6. Convert ArrayBuffer to base64 for JSON response
    const audioBase64 = Buffer.from(result.audio).toString('base64')

    // 7. Return Response
    return successResponse({
      text: result.text,
      audio: audioBase64,
      audioFormat: 'mp3',
      phase: newPhase || conversationState.phase,
      nextAction,
      questionData: result.questionData,
      metadata: {
        currentQuestionIndex: conversationState.currentQuestionIndex,
        totalQuestions: conversationState.totalQuestions,
        interviewer: {
          name: conversationState.interviewerName,
          title: conversationState.interviewerTitle
        }
      }
    })

  } catch (error) {
    console.error('[Mock Speak Error]:', error)
    return serverErrorResponse('An unexpected error occurred while generating speech')
  }
}
