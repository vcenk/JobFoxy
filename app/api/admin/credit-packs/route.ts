// app/api/admin/credit-packs/route.ts
// Admin endpoint for managing credit packs

import { NextRequest } from 'next/server'
import { supabaseAdmin } from '@/lib/clients/supabaseClient'
import {
  getAuthUser,
  unauthorizedResponse,
  badRequestResponse,
  serverErrorResponse,
  successResponse,
} from '@/lib/utils/apiHelpers'

// GET - Fetch all credit packs
export async function GET(req: NextRequest) {
  const user = await getAuthUser(req)
  if (!user) return unauthorizedResponse()

  try {
    // Check if user is admin
    const { data: profile } = await supabaseAdmin
      .from('profiles')
      .select('is_admin')
      .eq('id', user.id)
      .single()

    if (!profile?.is_admin) {
      return Response.json(
        { success: false, error: 'Access denied. Admin only.' },
        { status: 403 }
      )
    }

    // Fetch all credit packs
    const { data: packs, error } = await supabaseAdmin
      .from('credit_packs')
      .select('*')
      .order('display_order', { ascending: true })

    if (error) {
      console.error('[Admin Credit Packs GET Error]:', error)
      return serverErrorResponse('Failed to fetch credit packs')
    }

    return successResponse({ packs })
  } catch (error) {
    console.error('[Admin Credit Packs GET Error]:', error)
    return serverErrorResponse()
  }
}

// PUT - Update existing credit pack
export async function PUT(req: NextRequest) {
  const user = await getAuthUser(req)
  if (!user) return unauthorizedResponse()

  try {
    // Check if user is admin
    const { data: profile } = await supabaseAdmin
      .from('profiles')
      .select('is_admin')
      .eq('id', user.id)
      .single()

    if (!profile?.is_admin) {
      return Response.json(
        { success: false, error: 'Access denied. Admin only.' },
        { status: 403 }
      )
    }

    const body = await req.json()
    const { id, ...updates } = body

    if (!id) {
      return badRequestResponse('Missing pack ID')
    }

    // Update pack
    const { data: pack, error } = await supabaseAdmin
      .from('credit_packs')
      .update(updates)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.error('[Admin Credit Packs PUT Error]:', error)
      return serverErrorResponse('Failed to update credit pack')
    }

    return successResponse({ pack })
  } catch (error) {
    console.error('[Admin Credit Packs PUT Error]:', error)
    return serverErrorResponse()
  }
}
