// app/api/mock/[id]/complete/route.ts
// Complete Mock Interview and Generate Report

import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/clients/supabaseClient'
import {
  generateInterviewReport,
  AnswerAnalysis,
  InterviewReport
} from '@/lib/engines/mockInterviewEngine'
import {
  getAuthUser,
  unauthorizedResponse,
  badRequestResponse,
  serverErrorResponse,
  successResponse
} from '@/lib/utils/apiHelpers'

/**
 * POST /api/mock/[id]/complete
 *
 * Completes the mock interview session and generates comprehensive report
 *
 * Request Body: (optional, can be empty)
 *
 * Response:
 * - report: InterviewReport object
 * - session: Updated session data
 */
export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const user = await getAuthUser(req)
  if (!user) return unauthorizedResponse()

  const sessionId = params.id

  try {
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
      // Already completed, fetch existing report
      const { data: exchanges } = await supabaseAdmin
        .from('mock_interview_exchanges')
        .select('*')
        .eq('session_id', sessionId)
        .order('exchange_order', { ascending: true })

      if (!session.final_report || !exchanges) {
        return badRequestResponse('Interview completed but report not available')
      }

      return successResponse({
        report: session.final_report,
        session: {
          id: session.id,
          status: session.status,
          completedAt: session.completed_at
        },
        alreadyCompleted: true
      })
    }

    console.log('[Complete] Generating report for session:', sessionId)

    // 2. Fetch All Exchanges with Answers
    const { data: exchanges, error: exchangesError } = await supabaseAdmin
      .from('mock_interview_exchanges')
      .select('*')
      .eq('session_id', sessionId)
      .order('exchange_order', { ascending: true })

    if (exchangesError) {
      console.error('[Complete] Exchanges fetch error:', exchangesError)
      return serverErrorResponse('Failed to fetch interview questions')
    }

    if (!exchanges || exchanges.length === 0) {
      return badRequestResponse('No questions found for this interview')
    }

    // 3. Filter Answered Questions and Build Exchanges Array
    const answeredExchanges = exchanges.filter(ex =>
      ex.user_answer_text && ex.answer_score !== null
    )

    if (answeredExchanges.length === 0) {
      return badRequestResponse('No questions have been answered yet')
    }

    console.log('[Complete] Found', answeredExchanges.length, 'answered questions')

    // Build exchanges array for report generation
    const reportExchanges = answeredExchanges.map(ex => {
      const analysis: AnswerAnalysis = {
        score: ex.answer_score || 0,
        strengths: ex.strengths || [],
        improvements: ex.improvements || [],
        detailedFeedback: ex.feedback || '',
        starAnalysis: ex.answer_metrics?.star_analysis || {
          hasSituation: false,
          hasTask: false,
          hasAction: false,
          hasResult: false,
          completenessScore: 0
        },
        specificity: ex.answer_metrics?.specificity || 5,
        relevance: ex.answer_metrics?.relevance || 5,
        impact: ex.answer_metrics?.impact || 5,
        suggestions: ex.answer_metrics?.suggestions || []
      }

      return {
        question: ex.question_text,
        answer: ex.user_answer_text || '',
        analysis
      }
    })

    // 4. Get Resume & Job Context (for comprehensive report)
    let resumeContext: string | undefined
    if (session.resume_id) {
      const { data: resume } = await supabaseAdmin
        .from('resumes')
        .select('summary, work_experience')
        .eq('id', session.resume_id)
        .single()

      if (resume) {
        resumeContext = JSON.stringify(resume)
      }
    }

    let jobContext: string | undefined
    if (session.job_description_id) {
      const { data: jd } = await supabaseAdmin
        .from('job_descriptions')
        .select('description, title')
        .eq('id', session.job_description_id)
        .single()

      if (jd) {
        jobContext = `${jd.title}: ${jd.description}`
      }
    }

    // 5. Generate Comprehensive Report
    console.log('[Complete] Generating interview report...')

    const report: InterviewReport = await generateInterviewReport({
      exchanges: reportExchanges,
      resumeContext,
      jobContext
    })

    console.log('[Complete] Report generated, overall score:', report.overallScore)

    // 6. Update Session with Report and Mark as Completed
    const { error: updateError } = await supabaseAdmin
      .from('mock_interview_sessions')
      .update({
        status: 'completed',
        current_phase: 'completed',
        completed_at: new Date().toISOString(),
        final_report: report,
        overall_score: report.overallScore
      })
      .eq('id', sessionId)

    if (updateError) {
      console.error('[Complete] Failed to update session:', updateError)
      return serverErrorResponse('Report generated but failed to save')
    }

    // 7. Calculate Additional Session Stats
    const totalDuration = answeredExchanges.reduce((sum, ex) => {
      return sum + (ex.answer_metrics?.duration_seconds || 0)
    }, 0)

    const avgWPM = answeredExchanges.reduce((sum, ex) => {
      return sum + (ex.answer_metrics?.wpm || 0)
    }, 0) / answeredExchanges.length

    const totalFillers = answeredExchanges.reduce((sum, ex) => {
      return sum + (ex.answer_metrics?.filler_count || 0)
    }, 0)

    // 8. Return Complete Report
    return successResponse({
      report,
      session: {
        id: session.id,
        status: 'completed',
        completedAt: new Date().toISOString(),
        totalQuestions: exchanges.length,
        answeredQuestions: answeredExchanges.length,
        overallScore: report.overallScore
      },
      statistics: {
        totalDurationSeconds: totalDuration,
        averageWPM: Math.round(avgWPM),
        totalFillerWords: totalFillers,
        questionsAnswered: answeredExchanges.length,
        questionsSkipped: exchanges.length - answeredExchanges.length
      },
      interviewer: {
        name: session.interviewer_name,
        title: session.interviewer_title
      }
    })

  } catch (error) {
    console.error('[Complete Error]:', error)
    return serverErrorResponse('An unexpected error occurred while completing the interview')
  }
}
