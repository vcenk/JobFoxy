// lib/engines/resumeOptimizationEngine.ts
// Engine to optimize resume content using power words, ATS keywords, and analysis improvements

import {
    POWER_WORD_SYNONYMS,
    WEAK_WORDS,
    ACTION_VERBS,
    INDUSTRY_POWER_WORDS,
    analyzeTextForPowerWords,
} from '@/lib/data/powerWords'

import {
    ATS_KEYWORDS_BY_INDUSTRY,
    getATSKeywordsByIndustry,
} from '@/lib/data/atsKeywords'

import {
    searchJobTitles,
    JobTitleData,
} from '@/lib/data/jobTitleTaxonomy'

// Types
interface BulletImprovement {
    before: string
    after: string
    reason: string
}

interface ResumeContent {
    header?: {
        name?: string
        title?: string
        email?: string
        phone?: string
        location?: string
        linkedin?: string
        website?: string
    }
    summary?: string
    experience?: Array<{
        title?: string
        company?: string
        date?: string
        bullets?: string[]
    }>
    education?: Array<{
        degree?: string
        school?: string
        date?: string
        details?: string
    }>
    skills?: Array<{
        category?: string
        items?: string[]
    }>
}

interface OptimizationParams {
    resumeContent: ResumeContent
    jobTitle?: string
    jobDescription?: string
    industry?: string
    bulletImprovements?: BulletImprovement[]
    missingKeywords?: string[]
}

interface OptimizationResult {
    optimizedContent: ResumeContent
    changes: {
        bulletsImproved: number
        weakWordsReplaced: number
        keywordsAdded: number
        summaryOptimized: boolean
    }
}

/**
 * Replace weak words with power words in text
 */
function replaceWeakWords(text: string): { text: string; replacements: number } {
    let result = text
    let replacements = 0

    // Replace each weak word pattern with a stronger alternative
    for (const [weak, alternatives] of Object.entries(POWER_WORD_SYNONYMS)) {
        const pattern = new RegExp(`\\b${weak}\\b`, 'gi')
        if (pattern.test(result)) {
            // Pick a random alternative for variety
            const replacement = alternatives[Math.floor(Math.random() * alternatives.length)]
            result = result.replace(pattern, replacement)
            replacements++
        }
    }

    // Replace common weak phrases
    const weakPhrases: Record<string, string> = {
        'responsible for': 'Led',
        'duties included': 'Delivered',
        'worked on': 'Executed',
        'helped with': 'Contributed to',
        'was in charge of': 'Directed',
        'assisted with': 'Supported',
        'took part in': 'Participated in',
    }

    for (const [weak, strong] of Object.entries(weakPhrases)) {
        const pattern = new RegExp(weak, 'gi')
        if (pattern.test(result)) {
            result = result.replace(pattern, strong)
            replacements++
        }
    }

    return { text: result, replacements }
}

/**
 * Apply bullet improvements from analysis
 */
function applyBulletImprovements(
    bullets: string[],
    improvements: BulletImprovement[]
): { bullets: string[]; applied: number } {
    if (!improvements || improvements.length === 0) {
        return { bullets, applied: 0 }
    }

    let applied = 0
    const result = bullets.map(bullet => {
        // Find matching improvement
        const improvement = improvements.find(imp => {
            // Fuzzy match - check if bullet contains significant portion of 'before'
            const beforeWords = imp.before.toLowerCase().split(/\s+/).slice(0, 5).join(' ')
            return bullet.toLowerCase().includes(beforeWords)
        })

        if (improvement) {
            applied++
            return improvement.after
        }
        return bullet
    })

    return { bullets: result, applied }
}

/**
 * Inject missing keywords into skills section
 */
function injectMissingKeywords(
    skills: Array<{ category?: string; items?: string[] }>,
    missingKeywords: string[],
    industry?: string
): { skills: Array<{ category?: string; items?: string[] }>; added: number } {
    if (!missingKeywords || missingKeywords.length === 0) {
        return { skills, added: 0 }
    }

    let added = 0
    const result = [...skills]

    // Get industry keywords for categorization
    const industryKeywords = industry ? getATSKeywordsByIndustry(industry) : null

    // Keywords to add (limit to top 5 most important)
    const keywordsToAdd = missingKeywords.slice(0, 5)

    // Find or create a "Technical Skills" or "Additional Skills" category
    let targetCategory = result.find(
        s => s.category?.toLowerCase().includes('technical') ||
            s.category?.toLowerCase().includes('skills') ||
            s.category?.toLowerCase().includes('tools')
    )

    if (!targetCategory) {
        // Create a new skills category
        targetCategory = { category: 'Technical Skills', items: [] }
        result.push(targetCategory)
    }

    // Add missing keywords that aren't already present
    for (const keyword of keywordsToAdd) {
        const alreadyExists = result.some(
            s => s.items?.some(item => item.toLowerCase().includes(keyword.toLowerCase()))
        )

        if (!alreadyExists && targetCategory.items) {
            targetCategory.items.push(keyword)
            added++
        }
    }

    return { skills: result, added }
}

/**
 * Optimize professional summary with keywords and power words
 */
function optimizeSummary(
    summary: string,
    jobTitle?: string,
    missingKeywords?: string[]
): { summary: string; optimized: boolean } {
    if (!summary) {
        return { summary: '', optimized: false }
    }

    let optimized = false
    let result = summary

    // Replace weak words
    const { text: strongerText, replacements } = replaceWeakWords(result)
    if (replacements > 0) {
        result = strongerText
        optimized = true
    }

    // Try to incorporate 1-2 missing keywords naturally if not present
    if (missingKeywords && missingKeywords.length > 0) {
        const topKeywords = missingKeywords.slice(0, 2)

        for (const keyword of topKeywords) {
            if (!result.toLowerCase().includes(keyword.toLowerCase())) {
                // Add to end of summary if possible
                if (result.endsWith('.')) {
                    result = result.slice(0, -1) + `, with expertise in ${keyword}.`
                    optimized = true
                    break // Only add one keyword to keep it natural
                }
            }
        }
    }

    return { summary: result, optimized }
}

/**
 * Get relevant skills from job title taxonomy
 */
function getSkillsFromJobTaxonomy(jobTitle: string): string[] {
    const matches = searchJobTitles(jobTitle)
    if (matches.length === 0) return []

    const topMatch = matches[0]
    return [
        ...(topMatch.typicalSkills?.technical || []).slice(0, 5),
        ...(topMatch.typicalSkills?.soft || []).slice(0, 3),
    ]
}

/**
 * Main optimization function - optimizes resume content in place
 */
export async function optimizeResumeContent(
    params: OptimizationParams
): Promise<OptimizationResult> {
    const {
        resumeContent,
        jobTitle,
        jobDescription,
        industry,
        bulletImprovements,
        missingKeywords,
    } = params

    // Deep clone to avoid mutation
    const content: ResumeContent = JSON.parse(JSON.stringify(resumeContent))

    const changes = {
        bulletsImproved: 0,
        weakWordsReplaced: 0,
        keywordsAdded: 0,
        summaryOptimized: false,
    }

    // 1. Apply bullet improvements from analysis
    if (content.experience && bulletImprovements) {
        for (const exp of content.experience) {
            if (exp.bullets) {
                const { bullets, applied } = applyBulletImprovements(exp.bullets, bulletImprovements)
                exp.bullets = bullets
                changes.bulletsImproved += applied
            }
        }
    }

    // 2. Replace weak words in all bullets
    if (content.experience) {
        for (const exp of content.experience) {
            if (exp.bullets) {
                exp.bullets = exp.bullets.map(bullet => {
                    const { text, replacements } = replaceWeakWords(bullet)
                    changes.weakWordsReplaced += replacements
                    return text
                })
            }
        }
    }

    // 3. Inject missing keywords into skills
    if (content.skills && missingKeywords) {
        const { skills, added } = injectMissingKeywords(content.skills, missingKeywords, industry)
        content.skills = skills
        changes.keywordsAdded = added
    }

    // 4. Optimize professional summary
    if (content.summary) {
        const { summary, optimized } = optimizeSummary(content.summary, jobTitle, missingKeywords)
        content.summary = summary
        changes.summaryOptimized = optimized
    }

    // 5. Get skills from job taxonomy and ensure they're represented
    if (jobTitle && content.skills) {
        const taxonomySkills = getSkillsFromJobTaxonomy(jobTitle)
        const existingSkillsLower = content.skills
            .flatMap(s => s.items || [])
            .map(i => i.toLowerCase())

        const newSkills = taxonomySkills.filter(
            skill => !existingSkillsLower.includes(skill.toLowerCase())
        ).slice(0, 3) // Limit additions

        if (newSkills.length > 0) {
            const { skills, added } = injectMissingKeywords(content.skills, newSkills, industry)
            content.skills = skills
            changes.keywordsAdded += added
        }
    }

    return {
        optimizedContent: content,
        changes,
    }
}

/**
 * Generate optimization summary for user feedback
 */
export function generateOptimizationSummary(changes: OptimizationResult['changes']): string {
    const parts = []

    if (changes.bulletsImproved > 0) {
        parts.push(`${changes.bulletsImproved} bullet${changes.bulletsImproved > 1 ? 's' : ''} improved`)
    }
    if (changes.weakWordsReplaced > 0) {
        parts.push(`${changes.weakWordsReplaced} weak word${changes.weakWordsReplaced > 1 ? 's' : ''} strengthened`)
    }
    if (changes.keywordsAdded > 0) {
        parts.push(`${changes.keywordsAdded} keyword${changes.keywordsAdded > 1 ? 's' : ''} added`)
    }
    if (changes.summaryOptimized) {
        parts.push('summary optimized')
    }

    if (parts.length === 0) {
        return 'Resume is already well-optimized!'
    }

    return `Optimization complete: ${parts.join(', ')}.`
}
