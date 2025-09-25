/**
 * API Route for admin lista_espera operations
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

// GET - List all lista_espera entries
export async function GET(request: NextRequest) {
  if (!isValidAdminRequest(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const { data, error } = await supabaseAdmin
      .from('lista_espera')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) throw error

    return NextResponse.json({ data })
  } catch (error) {
    console.error('Error fetching lista_espera:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// POST - Create new lista_espera entry
export async function POST(request: NextRequest) {
  if (!isValidAdminRequest(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const body = await request.json()
    const { nombre_1, nombre_2, de_quien, notas, prioridad } = body

    // Validation
    if (!nombre_1 || !de_quien) {
      return NextResponse.json(
        { error: 'nombre_1 and de_quien are required' },
        { status: 400 }
      )
    }

    // Create lista_espera entry
    const { data, error } = await supabaseAdmin
      .from('lista_espera')
      .insert({
        nombre_1: nombre_1.trim(),
        nombre_2: nombre_2?.trim() || null,
        de_quien: de_quien,
        notas: notas?.trim() || null,
        prioridad: prioridad || 'media'
      })
      .select()
      .single()

    if (error) throw error

    return NextResponse.json({ data })
  } catch (error) {
    console.error('Error creating lista_espera:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
