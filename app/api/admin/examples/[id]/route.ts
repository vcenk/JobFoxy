// app/api/admin/examples/[id]/route.ts
// API endpoints for individual resume example operations

import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/clients/supabaseClient'

// ============================================
// ADMIN AUTHENTICATION HELPER
// ============================================

async function verifyAdmin(request: NextRequest) {
  // Get the JWT token from the Authorization header
  const authHeader = request.headers.get('authorization')
  const token = authHeader?.replace('Bearer ', '')

  if (!token) {
    return { isAdmin: false, error: 'Unauthorized: No token provided' }
  }

  // Verify the token and get the user
  const {
    data: { user },
    error: authError,
  } = await supabaseAdmin.auth.getUser(token)

  if (authError || !user) {
    return { isAdmin: false, error: 'Unauthorized: Invalid token' }
  }

  const { data: profile, error: profileError } = await supabaseAdmin
    .from('profiles')
    .select('email, is_admin')
    .eq('id', user.id)
    .single()

  if (profileError || !profile) {
    return { isAdmin: false, error: 'Profile not found' }
  }

  const isAdmin =
    profile.is_admin === true ||
    (profile.email && profile.email.endsWith('@jobfoxy.com'))

  if (!isAdmin) {
    return { isAdmin: false, error: 'Forbidden: Admin access required' }
  }

  return { isAdmin: true, userId: user.id }
}

// ============================================
// PATCH /api/admin/examples/[id]
// Update example (e.g., toggle publish status)
// ============================================

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Verify admin access
    const authResult = await verifyAdmin(request)
    if (!authResult.isAdmin) {
      return NextResponse.json({ error: authResult.error }, { status: 403 })
    }

    const body = await request.json()
    const { is_published } = body
    const id = params.id

    // Update the example
    const { data, error } = await supabaseAdmin
      .from('resume_examples')
      .update({ is_published })
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.error('Error updating example:', error)
      return NextResponse.json({ error: 'Failed to update example' }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      example: data,
    })
  } catch (error: any) {
    console.error('❌ Error in example PATCH:', error)
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    )
  }
}

// ============================================
// DELETE /api/admin/examples/[id]
// Delete a resume example
// ============================================

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Verify admin access
    const authResult = await verifyAdmin(request)
    if (!authResult.isAdmin) {
      return NextResponse.json({ error: authResult.error }, { status: 403 })
    }

    const id = params.id

    // Delete the example
    const { error } = await supabaseAdmin
      .from('resume_examples')
      .delete()
      .eq('id', id)

    if (error) {
      console.error('Error deleting example:', error)
      return NextResponse.json({ error: 'Failed to delete example' }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      message: 'Example deleted successfully',
    })
  } catch (error: any) {
    console.error('❌ Error in example DELETE:', error)
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    )
  }
}
