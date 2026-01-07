// lib/engines/starBuilderEngine.ts
// Generate STAR method stories from resume experience

import { callLLMJSON } from '../clients/openaiClient'  // lib/clients/openaiClient.ts

export interface StarStory {
  situation: string
  task: string
  action: string
  result: string
  metrics?: string[]
  skills_demonstrated?: string[]
}

/**
 * Generate a STAR story from a question and resume experience
 */
export async function generateStarStory({
  question,
  resumeSummary,
  experienceSnippet,
}: {
  question: string
  resumeSummary: string
  experienceSnippet?: string
}): Promise<StarStory | null> {
  const system = `
You help candidates build STAR stories (Situation, Task, Action, Result)
for behavioral interview questions.
Create compelling, specific stories with quantifiable results.
Return strict JSON only.
`.trim()

  const user = `
Generate a STAR story to answer this behavioral question.

QUESTION:
"${question}"

RESUME SUMMARY:
"""
${resumeSummary}
"""

${experienceSnippet ? `RELEVANT EXPERIENCE:\n"""\n${experienceSnippet}\n"""` : ''}

Create a strong STAR story with:
- Situation: Set the context (when, where, background)
- Task: What needed to be done and why
- Action: Specific steps YOU took (use "I", not "we")
- Result: Quantifiable outcomes and impact

Return JSON:
{
  "situation": "Detailed context...",
  "task": "What needed to be accomplished...",
  "action": "Specific actions I took...",
  "result": "Quantifiable outcomes with metrics...",
  "metrics": ["Increased revenue by 25%", "Reduced time by 40%"],
  "skills_demonstrated": ["Leadership", "Problem-solving", "Communication"]
}
`.trim()

  try {
    const result = await callLLMJSON<StarStory>({
      messages: [
        { role: 'system', content: system },
        { role: 'user', content: user },
      ],
      temperature: 0.4,
      maxTokens: 800,
    })

    return result
  } catch (error) {
    console.error('[STAR Story Generation Error]:', error)
    return null
  }
}

/**
 * Improve/refine an existing STAR story
 */
export async function refineStarStory({
  story,
  focusArea,
}: {
  story: StarStory
  focusArea?: 'situation' | 'task' | 'action' | 'result' | 'metrics'
}): Promise<StarStory | null> {
  const system = `
You are an interview coach helping refine STAR stories.
Make them more specific, impactful, and interview-ready.
Add quantifiable metrics where possible.
Return strict JSON only.
`.trim()

  const user = `
Refine this STAR story to be more compelling.
${focusArea ? `Focus especially on improving the ${focusArea.toUpperCase()} section.` : ''}

CURRENT STORY:
Situation: ${story.situation}
Task: ${story.task}
Action: ${story.action}
Result: ${story.result}

Improvements needed:
- Add specific numbers and metrics
- Use stronger action verbs
- Make the impact clearer
- Ensure it's told from "I" perspective

Return the improved STAR story in the same JSON format.
`.trim()

  try {
    const result = await callLLMJSON<StarStory>({
      messages: [
        { role: 'system', content: system },
        { role: 'user', content: user },
      ],
      temperature: 0.4,
      maxTokens: 800,
    })

    return result
  } catch (error) {
    console.error('[STAR Story Refinement Error]:', error)
    return null
  }
}

/**
 * Generate multiple STAR stories for common question categories
 */
export async function generateStarStorySet({
  resumeSummary,
  categories = ['leadership', 'conflict', 'failure', 'achievement'],
}: {
  resumeSummary: string
  categories?: string[]
}): Promise<Record<string, StarStory> | null> {
  const system = `
You are an interview coach creating a set of STAR stories.
Generate one strong story for each category.
Return strict JSON only.
`.trim()

  const user = `
Generate STAR stories for these categories: ${categories.join(', ')}

RESUME:
"""
${resumeSummary}
"""

Return JSON with one story per category:
{
  "leadership": {
    "situation": "...",
    "task": "...",
    "action": "...",
    "result": "...",
    "metrics": ["..."],
    "skills_demonstrated": ["..."]
  },
  "conflict": { ... },
  ...
}
`.trim()

  try {
    const result = await callLLMJSON<Record<string, StarStory>>({
      messages: [
        { role: 'system', content: system },
        { role: 'user', content: user },
      ],
      temperature: 0.4,
      maxTokens: 2000,
    })

    return result
  } catch (error) {
    console.error('[STAR Story Set Generation Error]:', error)
    return null
  }
}

/**
 * Predict interview questions based on Resume and Job Description
 */
export async function predictInterviewQuestions({
  resumeText,
  jobDescription,
}: {
  resumeText: string
  jobDescription: string
}): Promise<Array<{
  question: string
  type: 'behavioral' | 'situational' | 'technical_soft'
  difficulty: 'easy' | 'medium' | 'hard'
  reasoning: string
  suggested_focus: string
}> | null> {
  const system = `
You are an expert hiring manager preparing for an interview.
Generate 3-5 high-value interview questions tailored to the candidate and the role.
Focus on:
1. Validating key strengths mentioned in the resume.
2. Probing areas where the candidate might be weak relative to the JD.
3. Assessing cultural fit and soft skills relevant to the role.
Return strict JSON only.
`.trim()

  const user = `
Generate interview questions.

RESUME:
"""
${resumeText.slice(0, 3000)}
"""

JOB DESCRIPTION:
"""
${jobDescription.slice(0, 3000)}
"""

Return JSON array:
[
  {
    "question": "The actual question text...",
    "type": "behavioral" | "situational" | "technical_soft",
    "difficulty": "easy" | "medium" | "hard",
    "reasoning": "Why ask this? (e.g. 'Checks leadership experience mentioned in JD')",
    "suggested_focus": "What the candidate should highlight in their answer (e.g. 'Focus on conflict resolution')"
  }
]
`.trim()

  try {
    const result = await callLLMJSON<Array<{
      question: string
      type: 'behavioral' | 'situational' | 'technical_soft'
      difficulty: 'easy' | 'medium' | 'hard'
      reasoning: string
      suggested_focus: string
    }>>({
      messages: [
        { role: 'system', content: system },
        { role: 'user', content: user },
      ],
      temperature: 0.5,
      maxTokens: 1500,
    })

    return result
  } catch (error) {
    console.error('[Question Prediction Error]:', error)
    return null
  }
}
