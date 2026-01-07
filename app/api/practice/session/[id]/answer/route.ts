// app/api/practice/session/[id]/answer/route.ts
import { NextRequest } from 'next/server'
import { supabaseAdmin } from '@/lib/clients/supabaseClient'
import {
  getAuthUser,
  unauthorizedResponse,
  badRequestResponse,
  serverErrorResponse,
  successResponse,
  validateRequiredFields,
} from '@/lib/utils/apiHelpers'
import { scoreAnswer } from '@/lib/engines/answerScoringEngine'
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
    const { questionId, userAnswer, questionText, questionType, questionCategory, currentQuestionIndex, totalQuestionsInSession, suggestedDifficulty } = body

    const validation = validateRequiredFields(body, ['questionId', 'userAnswer', 'questionText', 'questionType', 'currentQuestionIndex'])
    if (!validation.valid) {
      return badRequestResponse(`Missing fields: ${validation.missing?.join(', ')}`)
    }

    // Fetch session details to get resume/job context for evaluation
    const { data: sessionData, error: sessionFetchError } = await supabaseAdmin
      .from('practice_sessions')
      .select('resume_id, job_description_id')
      .eq('id', sessionId)
      .single();

    if (sessionFetchError || !sessionData) {
      console.error('Failed to fetch session for evaluation:', sessionFetchError);
      return serverErrorResponse('Failed to get context for answer evaluation');
    }

    const { data: resume, error: resumeError } = await supabaseAdmin
      .from('resumes')
      .select('raw_text, title, analysis_results') // analysis_results for skills
      .eq('id', sessionData.resume_id)
      .single();
    if (resumeError || !resume) return badRequestResponse('Resume not found for answer evaluation');

    // Prepare resume summary for evaluation
    const resumeSummary = resume.raw_text?.substring(0, 2000) || resume.title || 'No resume available';

    // Get job description for evaluation
    let jobSummary: string | undefined;
    if (sessionData.job_description_id) {
      const { data: jd, error: jdError } = await supabaseAdmin
        .from('job_descriptions')
        .select('description, title')
        .eq('id', sessionData.job_description_id)
        .single();
      if (jdError) console.error('Failed to fetch JD for evaluation:', jdError);
      if (jd) {
        jobSummary = `${jd.title}\n\n${jd.description}`.substring(0, 2000);
      }
    }

    // 1. Evaluate the user's answer using scoreAnswer
    const evaluationResponse = await scoreAnswer({
      question: questionText,
      transcript: userAnswer.transcript,
      resumeSummary,
      jobSummary,
    });

    if (!evaluationResponse) {
      console.error('[Answer Evaluation Error]: scoreAnswer returned null');
      return serverErrorResponse('Failed to evaluate answer using AI engine');
    }

    // Map evaluation response to practice_answers table schema
    const evaluation = {
      overall_score: evaluationResponse.overall_score,
      star_analysis: {
        situation: evaluationResponse.star.has_situation,
        task: evaluationResponse.star.has_task,
        action: evaluationResponse.star.has_action,
        result: evaluationResponse.star.has_result,
      },
      strengths: evaluationResponse.strengths,
      improvements: evaluationResponse.areas_for_improvement,
      summary: evaluationResponse.one_sentence_summary,
      clarity_score: evaluationResponse.clarity_score,
      relevance_score: evaluationResponse.relevance_score,
      impact_score: evaluationResponse.impact_score,
    };

    // 2. Save the user's answer and evaluation
    const { data: savedAnswer, error: answerError } = await supabaseAdmin
      .from('practice_answers')
      .insert({
        question_id: questionId,
        user_id: user.id,
        transcript: userAnswer.transcript,
        audio_url: userAnswer.audioUrl,
        duration_seconds: Math.round(userAnswer.duration), // Ensure duration is an integer
        overall_score: evaluation.overall_score,
        star_analysis: evaluation.star_analysis,
        strengths: evaluation.strengths,
        improvements: evaluation.improvements,
        summary: evaluation.summary,
        clarity_score: evaluation.clarity_score,
        relevance_score: evaluation.relevance_score,
        impact_score: evaluation.impact_score,
      })
      .select()
      .single()

    if (answerError) {
      console.error('Failed to save practice answer:', answerError)
      return serverErrorResponse('Failed to save answer')
    }

    // 3. Update practice session with completed question count
    await supabaseAdmin
      .from('practice_sessions')
      .update({ completed_questions: currentQuestionIndex + 1 })
      .eq('id', sessionId)
      .eq('user_id', user.id);


    // 4. Generate next question (if not all questions are completed)
    let nextQuestion = null;
    let isSessionFinished = false;

    if (currentQuestionIndex + 1 < totalQuestionsInSession) {
      // Fetch session details to get resume/job context for next question generation
      const { data: sessionData, error: sessionFetchError } = await supabaseAdmin
        .from('practice_sessions')
        .select('resume_id, job_description_id, question_category')
        .eq('id', sessionId)
        .single();

      if (sessionFetchError || !sessionData) {
        console.error('Failed to fetch session for next question:', sessionFetchError);
        return serverErrorResponse('Failed to get context for next question');
      }

      const { data: resume, error: resumeError } = await supabaseAdmin
        .from('resumes')
        .select('raw_text')
        .eq('id', sessionData.resume_id)
        .single();
      if (resumeError || !resume) return badRequestResponse('Resume not found for next question generation');

      let jobText: string | undefined;
      if (sessionData.job_description_id) {
        const { data: jd, error: jdError } = await supabaseAdmin
          .from('job_descriptions')
          .select('description')
          .eq('id', sessionData.job_description_id)
          .single();
        if (jdError) console.error('Failed to fetch JD for next question:', jdError);
        jobText = jd?.description;
      }

      // Map suggested difficulty to engine format
      const difficultyMap: Record<string, string> = {
        'easy': 'easy',
        'medium': 'standard',
        'hard': 'challenging'
      }
      const engineDifficulty = difficultyMap[suggestedDifficulty] || 'standard'

      const nextPlan = await generateInterviewPlan({
        resumeText: resume.raw_text,
        jobDescription: jobText,
        difficulty: engineDifficulty as 'easy' | 'standard' | 'challenging',
        focus: sessionData.question_category,
        durationMinutes: 3, // Just generate one question
      });

      if (nextPlan && nextPlan.questions.length > 0) {
        const newQ = nextPlan.questions[0];
        const { data: insertedQuestion, error: insertQError } = await supabaseAdmin
          .from('practice_questions')
          .insert({
            session_id: sessionId,
            question_text: newQ.text,
            question_category: newQ.type,
            difficulty: suggestedDifficulty || 'medium',
            expected_components: newQ.ideal_answer_points,
            order_index: currentQuestionIndex + 1,
          })
          .select()
          .single();

        if (insertQError) {
          console.error('Failed to insert next practice question:', insertQError);
          return serverErrorResponse('Failed to save next question');
        }
        nextQuestion = insertedQuestion;
      } else {
        // If AI fails to generate a new question, end session
        isSessionFinished = true;
      }
    } else {
      isSessionFinished = true;
    }

    return successResponse({
      evaluation,
      savedAnswer,
      nextQuestion,
      isSessionFinished
    })
  } catch (error) {
    console.error('[API Practice Answer Error]:', error)
    return serverErrorResponse()
  }
}
