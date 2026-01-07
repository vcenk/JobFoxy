// app/api/admin/examples/route.ts
// API endpoints for fetching and managing resume examples

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
// GET /api/admin/examples
// Fetch all resume examples
// ============================================

export async function GET(request: NextRequest) {
  try {
    // Verify admin access
    const authResult = await verifyAdmin(request)
    if (!authResult.isAdmin) {
      return NextResponse.json({ error: authResult.error }, { status: 403 })
    }

    // Fetch all examples
    const { data: examples, error } = await supabaseAdmin
      .from('resume_examples')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching examples:', error)
      return NextResponse.json({ error: 'Failed to fetch examples' }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      examples,
    })
  } catch (error: any) {
    console.error('❌ Error in examples GET:', error)
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    )
  }
}
