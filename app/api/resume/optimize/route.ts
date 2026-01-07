// app/api/resume/optimize/route.ts
// Apply AI optimizations to resume in-place (same resume, not a copy)

import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/clients/supabaseClient'
import {
    getAuthUser,
    unauthorizedResponse,
    badRequestResponse,
    serverErrorResponse,
    successResponse,
} from '@/lib/utils/apiHelpers'
import {
    optimizeResumeContent,
    generateOptimizationSummary,
} from '@/lib/engines/resumeOptimizationEngine'

export async function POST(req: NextRequest) {
    // Authenticate user
    const user = await getAuthUser(req)
    if (!user) {
        return unauthorizedResponse()
    }

    try {
        const body = await req.json()
        const { resumeId, jobTitle, jobDescription, industry } = body

        if (!resumeId) {
            return badRequestResponse('Resume ID is required')
        }

        // Get resume with analysis results
        const { data: resume, error: fetchError } = await supabaseAdmin
            .from('resumes')
            .select('*, analysis_results')
            .eq('id', resumeId)
            .eq('user_id', user.id)
            .single()

        if (fetchError || !resume) {
            return badRequestResponse('Resume not found')
        }

        if (!resume.content) {
            return badRequestResponse('Resume has no content to optimize')
        }

        // Get analysis results for bullet improvements and missing keywords
        const analysisResults = resume.analysis_results || {}
        const bulletImprovements = analysisResults.bullet_improvements || []
        const missingKeywords = analysisResults.missing_keywords || []

        // Run optimization engine
        const { optimizedContent, changes } = await optimizeResumeContent({
            resumeContent: resume.content,
            jobTitle: jobTitle || analysisResults.job_title,
            jobDescription: jobDescription,
            industry: industry || analysisResults.industry,
            bulletImprovements,
            missingKeywords,
        })

        // Check if any changes were made
        const totalChanges =
            changes.bulletsImproved +
            changes.weakWordsReplaced +
            changes.keywordsAdded +
            (changes.summaryOptimized ? 1 : 0)

        if (totalChanges === 0) {
            return successResponse({
                message: 'Resume is already well-optimized!',
                changes,
                optimized: false,
            })
        }

        // Update resume content in-place
        const { error: updateError } = await supabaseAdmin
            .from('resumes')
            .update({
                content: optimizedContent,
                updated_at: new Date().toISOString(),
            })
            .eq('id', resumeId)
            .eq('user_id', user.id)

        if (updateError) {
            console.error('[Resume Optimization Update Error]:', updateError)
            return serverErrorResponse('Failed to save optimized resume')
        }

        // Generate summary message
        const summaryMessage = generateOptimizationSummary(changes)

        return successResponse({
            message: summaryMessage,
            changes,
            optimized: true,
            optimizedContent, // Return for immediate UI update
        })

    } catch (error) {
        console.error('[Resume Optimize API Error]:', error)
        return serverErrorResponse('Failed to optimize resume')
    }
}
