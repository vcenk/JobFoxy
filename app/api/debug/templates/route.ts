// Debug route to check template count
import { NextResponse } from 'next/server'
import { ALL_TEMPLATES, CATEGORY_INFO } from '@/lib/templates/templateLibrary'

export async function GET() {
  return NextResponse.json({
    totalTemplates: ALL_TEMPLATES.length,
    categories: CATEGORY_INFO,
    firstTemplate: ALL_TEMPLATES[0],
    lastTemplate: ALL_TEMPLATES[ALL_TEMPLATES.length - 1],
    sampleIds: ALL_TEMPLATES.slice(0, 10).map(t => t.id),
  })
}
