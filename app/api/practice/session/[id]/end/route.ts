// app/api/practice/session/[id]/end/route.ts
import { NextRequest } from 'next/server'
import { supabaseAdmin } from '@/lib/clients/supabaseClient'
import {
  getAuthUser,
  serverErrorResponse,
  successResponse,
  unauthorizedResponse,
} from '@/lib/utils/apiHelpers'
import { generatePracticeSummary } from '@/lib/engines/practiceSummaryEngine'

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const user = await getAuthUser(req)
  if (!user) return unauthorizedResponse()

  const { id: sessionId } = params

  try {
    // 1. Get all questions and answers for this session
    const { data: sessionData, error: sessionError } = await supabaseAdmin
      .from('practice_sessions')
      .select(`
        *,
        practice_questions (
          *,
          practice_answers (*)
        )
      `)
      .eq('id', sessionId)
      .eq('user_id', user.id)
      .single()

    if (sessionError || !sessionData) {
      console.error('Failed to fetch session for summary:', sessionError)
      return serverErrorResponse('Session not found or not authorized')
    }

    const allQuestions = sessionData.practice_questions || []
    const allAnswers = allQuestions.flatMap((q: any) => q.practice_answers || []);

    const scores = allAnswers.map((a: any) => a.overall_score || 0);
    const questionCategories = allQuestions.map((q: any) => q.question_category || 'general');
    const strengths = allAnswers.map((a: any) => a.strengths || []);
    const improvements = allAnswers.map((a: any) => a.improvements || []);

    // 2. Generate summary
    const summary = await generatePracticeSummary({
      scores,
      questionCategories,
      strengths,
      improvements,
    })

    let averageScore = 0;
    if (scores.length > 0) {
        averageScore = scores.reduce((sum: number, s: number) => sum + s, 0) / scores.length;
    }

    // 3. Update session status and summary
    const { data: updatedSession, error: updateError } = await supabaseAdmin
      .from('practice_sessions')
      .update({
        status: 'completed',
        completed_at: new Date().toISOString(),
        average_score: averageScore,
        overall_feedback: summary || {},
      })
      .eq('id', sessionId)
      .eq('user_id', user.id)
      .select()
      .single()

    if (updateError) {
      console.error('Failed to update practice session status and summary:', updateError)
      return serverErrorResponse('Failed to finalize practice session')
    }

    return successResponse({ summary: summary || {}, session: updatedSession })
  } catch (error) {
    console.error('[API End Practice Session Error]:', error)
    return serverErrorResponse()
  }
}
