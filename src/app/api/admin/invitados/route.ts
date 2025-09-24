/**
 * API Route for admin invitado operations
 * Uses service role key server-side for secure admin operations
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

// GET - List all invitados
export async function GET(request: NextRequest) {
  if (!isValidAdminRequest(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const { data, error } = await supabaseAdmin
      .from('invitados')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) throw error

    return NextResponse.json({ data })
  } catch (error) {
    console.error('Error fetching invitados:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// POST - Create new invitado
export async function POST(request: NextRequest) {
  if (!isValidAdminRequest(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const body = await request.json()
    const { nombre_1, nombre_2, slug, foto_url, asistencia_1, asistencia_2, restriccion_1, restriccion_2, mensaje } = body

    // Validation
    if (!nombre_1 || !slug) {
      return NextResponse.json(
        { error: 'nombre_1 and slug are required' },
        { status: 400 }
      )
    }

    // Check if slug already exists
    const { data: existing } = await supabaseAdmin
      .from('invitados')
      .select('id')
      .eq('slug', slug)
      .single()

    if (existing) {
      return NextResponse.json(
        { error: 'Slug already exists' },
        { status: 409 }
      )
    }

    // Create invitado
    const { data, error } = await supabaseAdmin
      .from('invitados')
      .insert({
        nombre_1: nombre_1.trim(),
        nombre_2: nombre_2?.trim() || null,
        slug: slug.trim(),
        foto_url: foto_url || null,
        asistencia_1: asistencia_1 || 'pendiente',
        asistencia_2: asistencia_2 || 'pendiente',
        restriccion_1: restriccion_1?.trim() || null,
        restriccion_2: restriccion_2?.trim() || null,
        mensaje: mensaje?.trim() || null
      })
      .select()
      .single()

    if (error) throw error

    return NextResponse.json({ data })
  } catch (error) {
    console.error('Error creating invitado:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
