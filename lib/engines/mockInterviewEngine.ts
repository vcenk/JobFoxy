// lib/engines/mockInterviewEngine.ts
// AI-Powered Mock Interview Question Generation and Answer Analysis

import { callLLMJSON } from '../clients/openaiClient'

// ============================================================================
// TYPES
// ============================================================================

export interface MockInterviewContext {
  resumeData: any // Resume data from database (content field)
  jobTitle?: string
  jobDescription?: string
  companyName?: string
  duration: number // minutes (15, 20, or 30)
  industry?: string
  seniorityLevel?: 'entry' | 'mid' | 'senior' | 'lead' | 'executive'
}

export interface GeneratedQuestion {
  text: string
  type: 'behavioral' | 'technical' | 'situational' | 'leadership' | 'values'
  difficulty: 'easy' | 'medium' | 'hard'
  expectedDuration: number // seconds
  tips: string[]
  focusAreas: string[] // What the interviewer is looking for
  followUpQuestions?: string[]
  starFramework?: {
    situation: string
    task: string
    action: string
    result: string
  }
}

export interface AnswerAnalysis {
  score: number // 0-10
  strengths: string[]
  improvements: string[]
  detailedFeedback: string
  starAnalysis: {
    hasSituation: boolean
    hasTask: boolean
    hasAction: boolean
    hasResult: boolean
    completenessScore: number // 0-10
  }
  specificity: number // 0-10 (how concrete vs vague)
  relevance: number // 0-10 (how well it answers the question)
  impact: number // 0-10 (quantified results, measurable outcomes)
  suggestions: string[]
}

export interface InterviewReport {
  overallScore: number // 0-10 average
  summary: string
  keyStrengths: string[] // Top 3
  areasForImprovement: string[] // Top 3
  detailedFeedback: string
  recommendations: string[]
  questionScores: Array<{
    question: string
    score: number
    feedback: string
  }>
}

// ============================================================================
// QUESTION GENERATION
// ============================================================================

/**
 * Calculate how many questions to ask based on duration
 */
export function calculateQuestionCount(durationMinutes: number): number {
  // Breakdown:
  // - Welcome + small talk: ~3 min
  // - Company intro: ~2 min
  // - Each question + answer + feedback: ~3-4 min
  // - Wrap-up: ~2 min

  if (durationMinutes === 15) {
    return 3 // 15 min = 3 questions (tight)
  } else if (durationMinutes === 20) {
    return 4 // 20 min = 4 questions (balanced)
  } else if (durationMinutes === 30) {
    return 5 // 30 min = 5 questions (thorough)
  }

  return 3 // Default fallback
}

/**
 * Generate interview questions using AI based on resume and job context
 */
export async function generateInterviewQuestions(
  context: MockInterviewContext
): Promise<GeneratedQuestion[]> {
  const questionCount = calculateQuestionCount(context.duration)

  // Build resume context for LLM
  const resumeContext = buildResumeContext(context.resumeData)

  // Build job context
  const jobContext = context.jobDescription
    ? context.jobDescription
    : `Job Title: ${context.jobTitle || 'Not specified'}\nCompany: ${context.companyName || 'Not specified'}`

  const systemPrompt = `You are an expert HR interviewer conducting a realistic behavioral interview.

Your task is to generate ${questionCount} PERSONALIZED behavioral interview questions based on the candidate's resume and target job.

CRITICAL REQUIREMENTS:
1. Questions MUST reference specific experiences from their resume
2. Questions should match the seniority level (${context.seniorityLevel || 'mid'})
3. Mix difficulty levels: 1-2 easy, ${questionCount - 2} medium/hard
4. Focus on BEHAVIORAL questions (past experiences, not hypothetical)
5. Questions should align with the job requirements

QUESTION TYPES:
- Behavioral: "Tell me about a time when..."
- Situational: "Describe a situation where..."
- Leadership: "How did you handle..." (for senior+ roles)
- Values: "What drives you..." (culture fit)

OUTPUT FORMAT (JSON array):
[
  {
    "text": "The interview question",
    "type": "behavioral" | "technical" | "situational" | "leadership" | "values",
    "difficulty": "easy" | "medium" | "hard",
    "expectedDuration": 180,
    "tips": ["What to focus on", "What the interviewer wants to hear"],
    "focusAreas": ["Problem-solving", "Leadership", "Communication"],
    "followUpQuestions": ["Optional follow-ups if user's answer is vague"]
  }
]

Generate questions that feel natural and conversational, not robotic.`

  const userPrompt = `CANDIDATE'S RESUME:
${resumeContext}

TARGET JOB:
${jobContext}

INTERVIEW DURATION: ${context.duration} minutes
NUMBER OF QUESTIONS: ${questionCount}

Generate ${questionCount} personalized behavioral interview questions that reference specific experiences from the candidate's resume and align with the target job requirements.`

  try {
    const parsed = await callLLMJSON<{ questions?: GeneratedQuestion[] } | GeneratedQuestion[]>({
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ],
      temperature: 0.8,
      maxTokens: 2000
    })

    if (!parsed) {
      throw new Error('No response from LLM')
    }

    // Handle both formats: {questions: [...]} or [...]
    const questions: GeneratedQuestion[] = Array.isArray(parsed)
      ? parsed
      : (parsed.questions || [])

    // Validate and return
    if (!Array.isArray(questions) || questions.length === 0) {
      throw new Error('Invalid question format from LLM')
    }

    return questions.slice(0, questionCount)
  } catch (error) {
    console.error('Error generating interview questions:', error)
    // Fallback to generic questions
    return generateFallbackQuestions(context)
  }
}

/**
 * Build resume context string for LLM
 */
function buildResumeContext(resume: any): string {
  let context = ''

  // Professional summary
  if (resume.summary) {
    // Handle both string and RichText (JSONContent) formats
    const summaryText = typeof resume.summary === 'string'
      ? resume.summary
      : extractTextFromRichText(resume.summary)
    context += `PROFESSIONAL SUMMARY:\n${summaryText}\n\n`
  }

  // Work experience - handle both old (work_experience) and new (experience) formats
  const experiences = resume.experience || resume.work_experience
  if (experiences && experiences.length > 0) {
    context += 'WORK EXPERIENCE:\n'
    experiences.forEach((job: any, idx: number) => {
      const title = job.position || job.title
      const startDate = job.startDate || job.start_date
      const endDate = job.endDate || job.end_date || (job.current ? 'Present' : '')
      context += `${idx + 1}. ${title} at ${job.company} (${startDate} - ${endDate})\n`

      if (job.description) {
        context += `   ${job.description}\n`
      }

      // Handle bullets (RichText[]) or achievements (string[])
      const items = job.bullets || job.achievements
      if (items && items.length > 0) {
        context += `   Key achievements:\n`
        items.forEach((item: any) => {
          const text = typeof item === 'string' ? item : extractTextFromRichText(item)
          context += `   - ${text}\n`
        })
      }
      context += '\n'
    })
  }

  // Skills - handle both array and object formats
  if (resume.skills) {
    context += 'SKILLS:\n'
    if (Array.isArray(resume.skills)) {
      // Old format: array of {name, level}
      resume.skills.forEach((skill: any) => {
        context += `- ${skill.name}${skill.level ? ` (${skill.level})` : ''}\n`
      })
    } else {
      // New format: {technical, soft, other}
      const { technical, soft, other } = resume.skills
      if (technical && technical.length > 0) {
        context += `Technical: ${technical.join(', ')}\n`
      }
      if (soft && soft.length > 0) {
        context += `Soft Skills: ${soft.join(', ')}\n`
      }
      if (other && other.length > 0) {
        context += `Other: ${other.join(', ')}\n`
      }
    }
    context += '\n'
  }

  // Education
  if (resume.education && resume.education.length > 0) {
    context += 'EDUCATION:\n'
    resume.education.forEach((edu: any) => {
      const degree = edu.degree || edu.field_of_study || edu.field
      const date = edu.graduationDate || edu.graduation_date || edu.end_date
      context += `- ${degree} from ${edu.institution} (${date || 'N/A'})\n`
    })
    context += '\n'
  }

  // Projects
  if (resume.projects && resume.projects.length > 0) {
    context += 'PROJECTS:\n'
    resume.projects.forEach((project: any) => {
      context += `- ${project.name}: ${project.description}\n`
    })
    context += '\n'
  }

  return context.trim()
}

/**
 * Extract plain text from RichText (JSONContent) format
 */
function extractTextFromRichText(richText: any): string {
  if (!richText) return ''
  if (typeof richText === 'string') return richText

  let text = ''
  if (richText.type === 'text') {
    return richText.text || ''
  }

  if (richText.content && Array.isArray(richText.content)) {
    richText.content.forEach((node: any) => {
      text += extractTextFromRichText(node) + ' '
    })
  }

  return text.trim()
}

/**
 * Fallback questions if AI generation fails
 */
function generateFallbackQuestions(context: MockInterviewContext): GeneratedQuestion[] {
  const questionCount = calculateQuestionCount(context.duration)

  const fallbackQuestions: GeneratedQuestion[] = [
    {
      text: "Tell me about yourself and walk me through your background.",
      type: 'behavioral',
      difficulty: 'easy',
      expectedDuration: 120,
      tips: [
        'Start with current role and recent experience',
        'Highlight relevant skills for this position',
        'Keep it concise (2 minutes max)'
      ],
      focusAreas: ['Communication', 'Relevance', 'Clarity']
    },
    {
      text: "Describe a challenging project you worked on. What was your role and how did you overcome obstacles?",
      type: 'behavioral',
      difficulty: 'medium',
      expectedDuration: 180,
      tips: [
        'Use STAR method (Situation, Task, Action, Result)',
        'Focus on YOUR specific actions',
        'Quantify the impact if possible'
      ],
      focusAreas: ['Problem-solving', 'Resilience', 'Impact'],
      followUpQuestions: [
        'What would you do differently if you faced this situation again?',
        'How did this experience change your approach to similar problems?'
      ]
    },
    {
      text: "Tell me about a time when you had to work with a difficult team member or stakeholder. How did you handle it?",
      type: 'behavioral',
      difficulty: 'medium',
      expectedDuration: 180,
      tips: [
        'Show emotional intelligence and professionalism',
        'Focus on resolution, not blame',
        'Demonstrate communication and conflict resolution skills'
      ],
      focusAreas: ['Collaboration', 'Communication', 'Conflict Resolution']
    },
    {
      text: "Describe a situation where you had to learn something new quickly to complete a project or task. How did you approach it?",
      type: 'behavioral',
      difficulty: 'medium',
      expectedDuration: 180,
      tips: [
        'Highlight your learning process',
        'Show resourcefulness and initiative',
        'Explain the outcome and what you learned'
      ],
      focusAreas: ['Learning Agility', 'Initiative', 'Adaptability']
    },
    {
      text: "Tell me about a time when you failed or made a mistake. What did you learn from it?",
      type: 'behavioral',
      difficulty: 'hard',
      expectedDuration: 180,
      tips: [
        'Choose a real failure (authenticity matters)',
        'Focus on what you learned and how you grew',
        'Show self-awareness and accountability'
      ],
      focusAreas: ['Self-awareness', 'Growth Mindset', 'Accountability']
    },
    {
      text: "Why are you interested in this role and what makes you a good fit?",
      type: 'values',
      difficulty: 'easy',
      expectedDuration: 120,
      tips: [
        'Connect your experience to job requirements',
        'Show genuine interest in the company/role',
        'Be specific about what excites you'
      ],
      focusAreas: ['Motivation', 'Cultural Fit', 'Alignment']
    }
  ]

  return fallbackQuestions.slice(0, questionCount)
}

// ============================================================================
// ANSWER ANALYSIS
// ============================================================================

/**
 * Analyze user's answer using AI and STAR framework
 */
export async function analyzeAnswer(params: {
  question: string
  questionType: string
  userAnswer: string
  resumeContext?: string
  jobContext?: string
}): Promise<AnswerAnalysis> {
  const { question, questionType, userAnswer, resumeContext, jobContext } = params

  const systemPrompt = `You are an expert interview coach analyzing a candidate's interview answer.

Evaluate the answer based on:
1. STAR Framework Completeness (Situation, Task, Action, Result)
2. Specificity (concrete details vs vague generalizations)
3. Relevance (how well it answers the question)
4. Impact (quantified results, measurable outcomes)

Provide constructive feedback that helps the candidate improve.

OUTPUT FORMAT (JSON):
{
  "score": 7.5,
  "strengths": ["Specific strength 1", "Specific strength 2"],
  "improvements": ["Specific improvement 1", "Specific improvement 2"],
  "detailedFeedback": "Paragraph of detailed feedback",
  "starAnalysis": {
    "hasSituation": true,
    "hasTask": true,
    "hasAction": true,
    "hasResult": false,
    "completenessScore": 7.5
  },
  "specificity": 8.0,
  "relevance": 9.0,
  "impact": 6.0,
  "suggestions": ["Actionable suggestion 1", "Actionable suggestion 2"]
}`

  const userPrompt = `QUESTION: ${question}
QUESTION TYPE: ${questionType}

USER'S ANSWER:
${userAnswer}

${resumeContext ? `CANDIDATE'S BACKGROUND:\n${resumeContext}\n` : ''}
${jobContext ? `TARGET JOB:\n${jobContext}\n` : ''}

Analyze this interview answer and provide constructive feedback.`

  try {
    const analysis = await callLLMJSON<AnswerAnalysis>({
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ],
      temperature: 0.3, // Lower temperature for consistent analysis
      maxTokens: 1000
    })

    if (!analysis) {
      throw new Error('No response from LLM')
    }

    // Validate score is in range
    analysis.score = Math.max(0, Math.min(10, analysis.score))

    return analysis
  } catch (error) {
    console.error('Error analyzing answer:', error)
    // Fallback to basic analysis
    return analyzeAnswerFallback(userAnswer, question)
  }
}

/**
 * Fallback answer analysis if AI fails
 */
function analyzeAnswerFallback(userAnswer: string, question: string): AnswerAnalysis {
  const wordCount = userAnswer.split(/\s+/).length
  const hasNumbers = /\d+/.test(userAnswer)

  // Simple heuristic scoring
  let score = 5.0

  // Length check
  if (wordCount < 50) score -= 1.5
  if (wordCount > 150 && wordCount < 300) score += 1.0
  if (wordCount > 300) score -= 0.5

  // Quantification check
  if (hasNumbers) score += 1.0

  // STAR keywords check
  const hasSituation = /situation|context|background|project|when/i.test(userAnswer)
  const hasTask = /task|goal|objective|needed to|responsible/i.test(userAnswer)
  const hasAction = /\bI\b.*\b(did|implemented|created|built|led|managed|developed)/i.test(userAnswer)
  const hasResult = /result|outcome|impact|achieved|improved|increased|decreased/i.test(userAnswer)

  const starCount = [hasSituation, hasTask, hasAction, hasResult].filter(Boolean).length
  score += (starCount / 4) * 2 // Up to +2 for complete STAR

  score = Math.max(0, Math.min(10, score))

  return {
    score: parseFloat(score.toFixed(1)),
    strengths: wordCount > 100 ? ['Provided detailed response'] : [],
    improvements: wordCount < 100 ? ['Provide more specific details and examples'] : [],
    detailedFeedback: `Your answer ${wordCount > 150 ? 'was comprehensive' : 'could be more detailed'}. ${hasResult ? 'Good job quantifying results.' : 'Try to include specific outcomes and impact.'}`,
    starAnalysis: {
      hasSituation,
      hasTask,
      hasAction,
      hasResult,
      completenessScore: (starCount / 4) * 10
    },
    specificity: hasNumbers ? 7.0 : 5.0,
    relevance: 7.0,
    impact: hasResult ? 7.0 : 4.0,
    suggestions: [
      'Use the STAR method: Situation, Task, Action, Result',
      'Include specific numbers and metrics when possible',
      'Focus on YOUR actions and contributions'
    ]
  }
}

// ============================================================================
// REPORT GENERATION
// ============================================================================

/**
 * Generate comprehensive interview report
 */
export async function generateInterviewReport(params: {
  exchanges: Array<{
    question: string
    answer: string
    analysis: AnswerAnalysis
  }>
  resumeContext?: string
  jobContext?: string
}): Promise<InterviewReport> {
  const { exchanges } = params

  // Calculate overall score
  const overallScore = parseFloat(
    (exchanges.reduce((sum, ex) => sum + ex.analysis.score, 0) / exchanges.length).toFixed(1)
  )

  // Collect all strengths and improvements
  const allStrengths = exchanges.flatMap(ex => ex.analysis.strengths)
  const allImprovements = exchanges.flatMap(ex => ex.analysis.improvements)

  // Get top 3 strengths (most common)
  const strengthCounts: Record<string, number> = {}
  allStrengths.forEach(s => {
    strengthCounts[s] = (strengthCounts[s] || 0) + 1
  })
  const keyStrengths = Object.entries(strengthCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([strength]) => strength)

  // Get top 3 improvements (most common)
  const improvementCounts: Record<string, number> = {}
  allImprovements.forEach(i => {
    improvementCounts[i] = (improvementCounts[i] || 0) + 1
  })
  const areasForImprovement = Object.entries(improvementCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([improvement]) => improvement)

  // Build question scores
  const questionScores = exchanges.map(ex => ({
    question: ex.question,
    score: ex.analysis.score,
    feedback: ex.analysis.detailedFeedback
  }))

  // Generate summary
  let summary = ''
  if (overallScore >= 8) {
    summary = 'Excellent interview performance! You demonstrated strong communication skills and provided detailed, relevant examples.'
  } else if (overallScore >= 6) {
    summary = 'Good interview performance overall. You answered questions well but there are opportunities to strengthen your responses.'
  } else if (overallScore >= 4) {
    summary = 'Decent interview performance with room for improvement. Focus on providing more specific examples and quantifying your impact.'
  } else {
    summary = 'Your interview needs improvement. Work on structuring answers with the STAR method and providing concrete examples.'
  }

  // Generate detailed feedback
  const detailedFeedback = `
Overall, you scored ${overallScore}/10 across ${exchanges.length} interview questions.

Your strongest areas include: ${keyStrengths.length > 0 ? keyStrengths.join(', ') : 'communication and clarity'}.

To improve your interview performance, focus on: ${areasForImprovement.length > 0 ? areasForImprovement.join(', ') : 'providing more specific examples and quantifying results'}.

${exchanges.length > 0 ? `Your best answer was to "${exchanges.sort((a, b) => b.analysis.score - a.analysis.score)[0].question}" with a score of ${exchanges.sort((a, b) => b.analysis.score - a.analysis.score)[0].analysis.score}/10.` : ''}
`.trim()

  // Generate recommendations
  const recommendations: string[] = [
    'Practice using the STAR method (Situation, Task, Action, Result) for behavioral questions',
    'Prepare 5-7 strong examples from your experience that showcase different skills',
    'Quantify your impact with specific numbers and metrics whenever possible',
    'Research the company and role thoroughly before interviews',
    'Practice out loud to improve your delivery and confidence'
  ]

  return {
    overallScore,
    summary,
    keyStrengths: keyStrengths.length > 0 ? keyStrengths : ['Clear communication'],
    areasForImprovement: areasForImprovement.length > 0 ? areasForImprovement : ['Provide more specific examples'],
    detailedFeedback,
    recommendations,
    questionScores
  }
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Detect seniority level from job title or resume
 */
export function detectSeniorityLevel(jobTitle?: string, resume?: any): 'entry' | 'mid' | 'senior' | 'lead' | 'executive' {
  if (jobTitle) {
    const titleLower = jobTitle.toLowerCase()
    if (titleLower.match(/ceo|cto|cfo|cpo|vp|vice president|chief|director|head of/)) return 'executive'
    if (titleLower.match(/lead|principal|staff|architect|manager/)) return 'lead'
    if (titleLower.match(/senior|sr\./)) return 'senior'
    if (titleLower.match(/junior|jr\.|entry|associate|intern/)) return 'entry'
  }

  // Check years of experience from resume
  if (resume?.work_experience) {
    const totalYears = resume.work_experience.reduce((years: number, job: { start_date?: string; end_date?: string }) => {
      const start = new Date(job.start_date || '2020-01-01')
      const end = job.end_date ? new Date(job.end_date) : new Date()
      const jobYears = (end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24 * 365)
      return years + jobYears
    }, 0)

    if (totalYears < 2) return 'entry'
    if (totalYears < 5) return 'mid'
    if (totalYears < 8) return 'senior'
    return 'lead'
  }

  return 'mid' // Default
}

/**
 * Extract industry from job description or resume
 */
export function extractIndustry(jobDescription?: string, resume?: any): string | undefined {
  const text = `${jobDescription || ''} ${resume?.summary || ''}`.toLowerCase()

  if (text.match(/software|tech|engineering|developer|saas|platform/)) return 'tech'
  if (text.match(/finance|banking|fintech|investment|trading/)) return 'finance'
  if (text.match(/healthcare|medical|hospital|patient|clinical/)) return 'healthcare'
  if (text.match(/education|learning|teaching|student|school/)) return 'education'
  if (text.match(/ecommerce|e-commerce|retail|shopping|marketplace/)) return 'ecommerce'
  if (text.match(/consulting|advisory|strategy/)) return 'consulting'
  if (text.match(/media|journalism|content|publishing/)) return 'media'

  return undefined
}
