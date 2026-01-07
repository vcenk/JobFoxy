// lib/types/mock.ts

export interface MockInterviewAttemptResponse {
  follow_up: {
    should_ask: boolean
    question_text: string
    reason?: string
  }
  scoring: {
    overall: number // 0-10
    content: number // 0-10
    delivery: number // 0-10
    content_breakdown: {
      star: number
      relevance: number
      clarity: number
      impact: number
    }
    delivery_breakdown: {
      pace: number
      fillers: number
      pauses: number
      confidence: number
      eye_contact_proxy: number | null
    }
  }
  content_feedback: {
    headline: string
    top_strengths: string[]
    top_improvements: string[]
    star_checklist: {
      situation: { status: 'present' | 'weak' | 'missing'; note: string }
      task: { status: 'present' | 'weak' | 'missing'; note: string }
      action: { status: 'present' | 'weak' | 'missing'; note: string }
      result: { status: 'present' | 'weak' | 'missing'; note: string }
    }
    relevance_note: string
    one_action_tip: string
  }
  delivery_feedback: {
    headline: string
    metrics: {
      wpm: number
      filler_count: number
      long_pause_count: number
      clarity_note: string
    }
    one_action_tip: string
  }
  rewrite: {
    polished_answer: string
    star_version: {
      situation: string
      task: string
      action: string
      result: string
    }
    keywords_to_include: string[]
  }
  coach_notes: Array<{
    change_type: string
    original_snippet: string
    revised_snippet: string
    reason: string
  }>
  library_suggestion: {
    should_save: boolean
    suggested_title: string
    category: string
    why_save: string
  }
  metadata: {
    model_version: string
    policy_version: string
    follow_up_type: 'none' | 'missing_star' | 'low_relevance'
  }
}
