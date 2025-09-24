/**
 * API Route for admin product operations
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
  const adminPassword = process.env.NEXT_PUBLIC_ADMIN_PASSWORD || 'admin123'
  const requestPassword = request.headers.get('x-admin-password')
  return requestPassword === adminPassword
}

// GET - List all productos
export async function GET(request: NextRequest) {
  if (!isValidAdminRequest(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const { data, error } = await supabaseAdmin
      .from('productos')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) throw error

    return NextResponse.json({ data })
  } catch (error) {
    console.error('Error fetching productos:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// POST - Create new producto
export async function POST(request: NextRequest) {
  if (!isValidAdminRequest(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const body = await request.json()
    const { titulo, descripcion, imagen_url } = body

    // Validation
    if (!titulo || !descripcion || !imagen_url) {
      return NextResponse.json(
        { error: 'titulo, descripcion and imagen_url are required' },
        { status: 400 }
      )
    }

    // Create producto
    const { data, error } = await supabaseAdmin
      .from('productos')
      .insert({
        titulo: titulo.trim(),
        descripcion: descripcion.trim(),
        imagen_url: imagen_url.trim()
      })
      .select()
      .single()

    if (error) throw error

    return NextResponse.json({ data })
  } catch (error: unknown) {
    console.error('Error creating producto:', error)
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Unknown error' }, { status: 500 })
  }
}
