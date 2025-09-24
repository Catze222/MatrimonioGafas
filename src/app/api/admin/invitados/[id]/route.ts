/**
 * API Route for updating specific invitado
 */
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

// Server-side admin client
const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

// Simple admin authentication check
function isValidAdminRequest(request: NextRequest): boolean {
  const adminPassword = request.headers.get('x-admin-password')
  const expectedPassword = process.env.NEXT_PUBLIC_ADMIN_PASSWORD || 'admin123'
  return adminPassword === expectedPassword
}

// PATCH - Update invitado
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!isValidAdminRequest(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const { id } = await params
    const body = await request.json()

    // Allowed fields to update
    const allowedFields = [
      'nombre_1', 'nombre_2', 'slug', 'foto_url',
      'asistencia_1', 'asistencia_2', 
      'restriccion_1', 'restriccion_2', 'mensaje'
    ]

    // Filter only allowed fields
    const updateData = Object.keys(body)
      .filter(key => allowedFields.includes(key))
      .reduce((obj, key) => {
        obj[key] = body[key]
        return obj
      }, {} as Record<string, unknown>)

    // Add updated_at timestamp
    updateData.updated_at = new Date().toISOString()

    // Update invitado
    const { data, error } = await supabaseAdmin
      .from('invitados')
      .update(updateData)
      .eq('id', id)
      .select()
      .single()

    if (error) throw error

    return NextResponse.json({ data })
  } catch (error) {
    console.error('Error updating invitado:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
