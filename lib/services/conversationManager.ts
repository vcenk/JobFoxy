// lib/services/conversationManager.ts
// Conversation Manager - Orchestrates Mock Interview Flow

import { getPersonaByVoiceId, getInterviewerIntroduction } from '../data/interviewerPersonas'
import { generateSmallTalkExchange, analyzeSentiment, getSmallTalkResponse, getTransitionPhrase } from '../data/smallTalkTemplates'
import { getCompanyIntroduction, formatCompanyIntroForSpeech } from '../data/companyIntroTemplates'
import { getWeightedBackchannel, getResponseCloser, getTransitionPhrase as getQuestionTransition, shouldBackchannelNow } from '../data/backchannelPhrases'
import { textToSpeech, prepareInterviewerSpeech, estimateAudioDuration } from '../clients/elevenlabsClient'

export type InterviewPhase = 'welcome' | 'small_talk' | 'company_intro' | 'questions' | 'wrap_up' | 'completed'

export interface ConversationState {
  sessionId: string
  phase: InterviewPhase
  voiceId: string
  interviewerName: string
  interviewerTitle: string
  userName: string
  companyName?: string
  jobTitle?: string

  // Small talk state
  smallTalkTemplate?: any
  smallTalkOpening?: string
  smallTalkUserResponse?: string

  // Question state
  currentQuestionIndex: number
  totalQuestions: number
  questions: Array<{
    text: string
    type: string
    tips?: string[]
  }>

  // Timing
  userSpeakingStartTime?: number
  lastBackchannelTime?: number

  // Audio cache
  preloadedBackchannels?: Map<string, ArrayBuffer>
}

/**
 * Create initial conversation state
 */
export function createConversationState(params: {
  sessionId: string
  voiceId: string
  userName: string
  companyName?: string
  jobTitle?: string
  questions: Array<{ text: string; type: string; tips?: string[] }>
}): ConversationState {
  const persona = getPersonaByVoiceId(params.voiceId)

  if (!persona) {
    throw new Error(`Invalid voice ID: ${params.voiceId}`)
  }

  return {
    sessionId: params.sessionId,
    phase: 'welcome',
    voiceId: params.voiceId,
    interviewerName: persona.name,
    interviewerTitle: persona.default_title,
    userName: params.userName,
    companyName: params.companyName,
    jobTitle: params.jobTitle,
    currentQuestionIndex: 0,
    totalQuestions: params.questions.length,
    questions: params.questions
  }
}

/**
 * Generate welcome message
 */
export async function generateWelcomeMessage(state: ConversationState): Promise<{
  text: string
  audio: ArrayBuffer
}> {
  // Random welcome greeting
  const welcomeGreetings = [
    `Hi ${state.userName}! How are you doing today?`,
    `Hello ${state.userName}, good to meet you! [pause] How's your day going so far?`,
    `Hey ${state.userName}! Thanks for being here. [pause] How are you?`,
    `Hi ${state.userName}! [pause] Great to have you here today. How are you doing?`
  ]

  const greeting = welcomeGreetings[Math.floor(Math.random() * welcomeGreetings.length)]

  const text = prepareInterviewerSpeech(greeting, { isQuestion: false })

  const audio = await textToSpeech({
    voice_id: state.voiceId,
    text
  })

  return { text, audio }
}

/**
 * Generate small talk opening
 */
export async function generateSmallTalkOpening(state: ConversationState): Promise<{
  text: string
  template: any
}> {
  const { opening, template } = generateSmallTalkExchange(state.userName)

  // Store template for processing user response later
  return {
    text: opening,
    template
  }
}

/**
 * Process small talk user response and generate AI reply
 */
export async function processSmallTalkResponse(
  state: ConversationState,
  userResponse: string
): Promise<{
  text: string
  audio: ArrayBuffer
}> {
  // Analyze sentiment of user's response
  const sentiment = analyzeSentiment(userResponse)

  // Get appropriate response
  const response = getSmallTalkResponse(state.smallTalkTemplate, sentiment)

  // Add transition
  const transition = getTransitionPhrase(state.smallTalkTemplate)
  const fullText = `${response} ${transition}`

  const text = prepareInterviewerSpeech(fullText, { isTransition: true })

  const audio = await textToSpeech({
    voice_id: state.voiceId,
    text
  })

  return { text, audio }
}

/**
 * Generate company introduction
 */
export async function generateCompanyIntroduction(state: ConversationState, jobDescription?: string): Promise<{
  text: string
  audio: ArrayBuffer
}> {
  const intro = getCompanyIntroduction({
    companyName: state.companyName,
    jobTitle: state.jobTitle,
    jobDescription,
    usePreBuilt: !jobDescription
  })

  const text = formatCompanyIntroForSpeech(intro)

  const audio = await textToSpeech({
    voice_id: state.voiceId,
    text
  })

  return { text, audio }
}

/**
 * Generate question
 */
export async function generateQuestion(state: ConversationState): Promise<{
  text: string
  audio: ArrayBuffer
  questionData: {
    text: string
    type: string
    tips?: string[]
  }
} | null> {
  // Check if we have more questions
  if (state.currentQuestionIndex >= state.totalQuestions) {
    return null
  }

  const questionData = state.questions[state.currentQuestionIndex]

  // Format question with natural speech tags
  const text = prepareInterviewerSpeech(questionData.text, { isQuestion: true })

  const audio = await textToSpeech({
    voice_id: state.voiceId,
    text
  })

  return {
    text,
    audio,
    questionData
  }
}

/**
 * Generate backchannel response (during user speaking)
 */
export async function generateBackchannel(state: ConversationState, secondsElapsed: number): Promise<{
  text: string
  audio: ArrayBuffer
} | null> {
  const secondsSinceLastBackchannel = state.lastBackchannelTime
    ? (Date.now() - state.lastBackchannelTime) / 1000
    : secondsElapsed

  // Check if we should backchannel now
  if (!shouldBackchannelNow(secondsSinceLastBackchannel, secondsElapsed)) {
    return null
  }

  // Get appropriate backchannel
  const backchannel = getWeightedBackchannel()

  const text = prepareInterviewerSpeech(backchannel.text, { isBackchannel: true })

  const audio = await textToSpeech({
    voice_id: state.voiceId,
    text,
    voice_settings: {
      stability: 0.6,
      similarity_boost: 0.7,
      style: 0.3, // Less expressive for backchannels
      use_speaker_boost: false
    }
  })

  return { text, audio }
}

/**
 * Generate response to user's answer (acknowledgment + transition)
 */
export async function generateAnswerResponse(state: ConversationState): Promise<{
  text: string
  audio: ArrayBuffer
}> {
  // Get response closer
  const closer = getResponseCloser()

  // Get transition to next question or wrap-up
  const isLastQuestion = state.currentQuestionIndex >= state.totalQuestions - 1

  let fullText: string
  if (isLastQuestion) {
    fullText = `${closer} Those are all the questions I have for today.`
  } else {
    const transition = getQuestionTransition()
    fullText = `${closer} ${transition}`
  }

  const text = prepareInterviewerSpeech(fullText, { isTransition: true })

  const audio = await textToSpeech({
    voice_id: state.voiceId,
    text
  })

  return { text, audio }
}

/**
 * Generate wrap-up message
 */
export async function generateWrapUp(state: ConversationState): Promise<{
  text: string
  audio: ArrayBuffer
}> {
  const wrapUpMessages = [
    `Alright ${state.userName}, [pause] those are all the questions I have for you today. [pause] I really enjoyed hearing about your experiences. [pause] Before we wrap up, do you have any questions for me about the role or the company?`,

    `Great! [pause] That's everything I wanted to cover today. [pause] You shared some really interesting examples. [pause] Do you have any questions for me before we finish up?`,

    `Perfect, ${state.userName}. [pause] We've covered all my questions. [pause] I appreciate you taking the time to provide such thoughtful answers. [pause] Is there anything you'd like to ask me about the position or our company?`,

    `Okay, [pause] we've gone through all the questions I prepared. [pause] You did a great job walking me through your experiences. [pause] What questions do you have for me?`,

    `Excellent, ${state.userName}! [pause] That wraps up the formal interview portion. [pause] I know you've been answering questions for a while, [pause] so now it's your turn. [pause] What would you like to know about the role or the team?`,

    `Alright, [pause] we've finished with all my prepared questions. [pause] I really appreciate the detail you provided in your responses. [pause] Now, [pause] what questions can I answer for you about the opportunity?`
  ]

  const message = wrapUpMessages[Math.floor(Math.random() * wrapUpMessages.length)]

  const text = prepareInterviewerSpeech(message, { isQuestion: true })

  const audio = await textToSpeech({
    voice_id: state.voiceId,
    text
  })

  return { text, audio }
}

/**
 * Generate response to user's questions during wrap-up
 */
export async function generateWrapUpResponse(
  state: ConversationState,
  userQuestion: string
): Promise<{
  text: string
  audio: ArrayBuffer
}> {
  // Acknowledge their question and provide a thoughtful generic response
  // In a real scenario, you could use AI to generate a more specific answer
  const responses = [
    `That's a great question, ${state.userName}. [pause] ${state.companyName || 'The company'} values collaboration and innovation. [pause] You'd be working with a talented team on challenging projects that make a real impact. [pause] The culture here is supportive and we invest heavily in professional development. [pause] Is there anything else you'd like to know?`,

    `Excellent question! [pause] From what I can tell you, ${state.companyName || 'our company'} offers a dynamic work environment with opportunities for growth. [pause] The role you're interviewing for would give you exposure to cutting-edge ${state.jobTitle ? 'work in ' + state.jobTitle : 'technologies and methodologies'}. [pause] We also have great benefits and work-life balance. [pause] Any other questions?`,

    `I'm glad you asked! [pause] ${state.companyName || 'We'} pride ourselves on creating an inclusive and engaging workplace. [pause] You'd have the chance to work on meaningful projects and continuously develop your skills. [pause] The team is collaborative and everyone supports each other's success. [pause] What else would you like to know?`,

    `Thanks for asking that. [pause] In this role, you'd have the autonomy to make decisions and drive projects forward. [pause] ${state.companyName || 'The organization'} invests in its people through training, mentorship, and clear career paths. [pause] It's a place where your contributions are valued and recognized. [pause] Anything else on your mind?`
  ]

  const response = responses[Math.floor(Math.random() * responses.length)]

  const text = prepareInterviewerSpeech(response, { isQuestion: true })

  const audio = await textToSpeech({
    voice_id: state.voiceId,
    text
  })

  return { text, audio }
}

/**
 * Generate final goodbye message
 */
export async function generateGoodbye(state: ConversationState): Promise<{
  text: string
  audio: ArrayBuffer
}> {
  const goodbyeMessages = [
    `Thanks so much for your time today, ${state.userName}. [pause] It was really great getting to know you and hearing about your background. [pause] You'll get detailed feedback on your answers in just a moment. [pause] I wish you the very best with your job search and future interviews. [pause] Take care!`,

    `I really appreciate you taking the time to chat with me today, ${state.userName}. [pause] You brought some excellent examples and I enjoyed our conversation. [pause] Your comprehensive feedback report will be ready shortly. [pause] Best of luck out there, [pause] and I hope your next interview goes even better!`,

    `Thank you so much, ${state.userName}! [pause] That was a great conversation and you did a wonderful job. [pause] You'll see your detailed feedback report in just a moment with specific areas to work on. [pause] Keep practicing and you'll nail those real interviews. [pause] All the best to you!`,

    `Great talking with you today, ${state.userName}. [pause] I really enjoyed hearing about your experiences and accomplishments. [pause] Your personalized feedback report will be ready in just a few seconds. [pause] Remember to keep practicing with the STAR method. [pause] Good luck with everything, [pause] and thanks for using our platform!`,

    `Well ${state.userName}, [pause] this has been excellent. [pause] You've got some really strong experiences to draw from. [pause] Take a look at the feedback report when it's ready, [pause] it'll give you some great insights to improve even further. [pause] I'm confident you'll do great in your real interviews. [pause] Best wishes!`,

    `Alright ${state.userName}, [pause] that wraps up our interview today. [pause] Thank you for being so engaged and thoughtful with your responses. [pause] Your detailed report with scores and recommendations will appear shortly. [pause] Keep building on your strengths and working on those areas for improvement. [pause] You've got this! [pause] Take care and good luck!`,

    `Thank you, ${state.userName}. [pause] It's been a pleasure conducting this interview with you. [pause] You showed a lot of great qualities today. [pause] Make sure to review your feedback carefully when it arrives. [pause] I know you're going to do wonderfully in your actual interviews. [pause] All the best with your career journey!`,

    `Wonderful, ${state.userName}! [pause] That concludes our mock interview session. [pause] I appreciate your time and the effort you put into your answers. [pause] Your personalized report is being generated now and will include specific tips to help you improve. [pause] Stay confident, [pause] keep practicing, [pause] and you'll succeed. [pause] Thanks again and best of luck!`
  ]

  const message = goodbyeMessages[Math.floor(Math.random() * goodbyeMessages.length)]

  const text = prepareInterviewerSpeech(message, { isTransition: false })

  const audio = await textToSpeech({
    voice_id: state.voiceId,
    text
  })

  return { text, audio }
}

/**
 * Advance conversation to next phase
 */
export function advancePhase(state: ConversationState): InterviewPhase {
  const phaseOrder: InterviewPhase[] = ['welcome', 'small_talk', 'company_intro', 'questions', 'wrap_up', 'completed']
  const currentIndex = phaseOrder.indexOf(state.phase)

  if (currentIndex < phaseOrder.length - 1) {
    return phaseOrder[currentIndex + 1]
  }

  return 'completed'
}

/**
 * Check if interview is complete
 */
export function isInterviewComplete(state: ConversationState): boolean {
  return state.phase === 'completed' || (state.phase === 'questions' && state.currentQuestionIndex >= state.totalQuestions)
}

/**
 * Get progress percentage
 */
export function getProgressPercentage(state: ConversationState): number {
  const phaseWeights = {
    welcome: 5,
    small_talk: 10,
    company_intro: 15,
    questions: 65,
    wrap_up: 5,
    completed: 100
  }

  let progress = 0

  // Add completed phases
  if (state.phase === 'small_talk' || state.phase === 'company_intro' || state.phase === 'questions' || state.phase === 'wrap_up' || state.phase === 'completed') {
    progress += phaseWeights.welcome
  }

  if (state.phase === 'company_intro' || state.phase === 'questions' || state.phase === 'wrap_up' || state.phase === 'completed') {
    progress += phaseWeights.small_talk
  }

  if (state.phase === 'questions' || state.phase === 'wrap_up' || state.phase === 'completed') {
    progress += phaseWeights.company_intro
  }

  // Add questions progress
  if (state.phase === 'questions' || state.phase === 'wrap_up' || state.phase === 'completed') {
    const questionProgress = (state.currentQuestionIndex / state.totalQuestions) * phaseWeights.questions
    progress += questionProgress
  }

  if (state.phase === 'wrap_up' || state.phase === 'completed') {
    progress += phaseWeights.questions
  }

  if (state.phase === 'completed') {
    progress = 100
  }

  return Math.min(100, Math.round(progress))
}

/**
 * Get current phase display name
 */
export function getPhaseDisplayName(phase: InterviewPhase): string {
  const names: Record<InterviewPhase, string> = {
    welcome: 'Welcome',
    small_talk: 'Small Talk',
    company_intro: 'Company Introduction',
    questions: 'Interview Questions',
    wrap_up: 'Wrap-up',
    completed: 'Completed'
  }

  return names[phase]
}

/**
 * Estimate remaining time (in seconds)
 */
export function estimateRemainingTime(state: ConversationState, durationMinutes: number): number {
  const totalSeconds = durationMinutes * 60
  const progress = getProgressPercentage(state) / 100
  const elapsed = totalSeconds * progress
  const remaining = totalSeconds - elapsed

  return Math.max(0, Math.round(remaining))
}

/**
 * Format time for display (MM:SS)
 */
export function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60)
  const secs = seconds % 60
  return `${mins}:${secs.toString().padStart(2, '0')}`
}

/**
 * Get conversation statistics
 */
export function getConversationStats(state: ConversationState): {
  phase: string
  progress: number
  questionsAnswered: number
  questionsRemaining: number
  isComplete: boolean
} {
  return {
    phase: getPhaseDisplayName(state.phase),
    progress: getProgressPercentage(state),
    questionsAnswered: state.currentQuestionIndex,
    questionsRemaining: state.totalQuestions - state.currentQuestionIndex,
    isComplete: isInterviewComplete(state)
  }
}
