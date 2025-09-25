/**
 * API Route for individual lista_espera operations
 */
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { generateSlug } from '@/lib/utils'

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

// DELETE - Remove from lista_espera
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!isValidAdminRequest(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const { id } = await params

    const { error } = await supabaseAdmin
      .from('lista_espera')
      .delete()
      .eq('id', id)

    if (error) throw error

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting lista_espera:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// POST - Convert lista_espera to invitado
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!isValidAdminRequest(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const { id } = await params

    // Get the lista_espera entry
    const { data: esperaData, error: esperaError } = await supabaseAdmin
      .from('lista_espera')
      .select('*')
      .eq('id', id)
      .single()

    if (esperaError) throw esperaError
    if (!esperaData) {
      return NextResponse.json({ error: 'Lista espera entry not found' }, { status: 404 })
    }

    // Generate slug
    const fullName = esperaData.nombre_2 
      ? `${esperaData.nombre_1} ${esperaData.nombre_2}`
      : esperaData.nombre_1
    const baseSlug = generateSlug(fullName)
    
    // Check if slug exists and generate unique one
    let slug = baseSlug
    let counter = 1
    
    while (true) {
      const { data: existing } = await supabaseAdmin
        .from('invitados')
        .select('id')
        .eq('slug', slug)
        .single()
      
      if (!existing) break
      
      slug = `${baseSlug}-${counter}`
      counter++
    }

    // Create invitado
    const { data: invitadoData, error: invitadoError } = await supabaseAdmin
      .from('invitados')
      .insert({
        nombre_1: esperaData.nombre_1,
        nombre_2: esperaData.nombre_2,
        slug: slug,
        de_quien: esperaData.de_quien,
        mensaje: esperaData.notas,
        asistencia_1: 'pendiente',
        asistencia_2: 'pendiente',
        invitacion_enviada: false
      })
      .select()
      .single()

    if (invitadoError) throw invitadoError

    // Delete from lista_espera
    const { error: deleteError } = await supabaseAdmin
      .from('lista_espera')
      .delete()
      .eq('id', id)

    if (deleteError) {
      console.error('Error deleting from lista_espera:', deleteError)
      // Don't throw here, invitado was created successfully
    }

    return NextResponse.json({ 
      data: invitadoData,
      message: 'Successfully converted to invitado'
    })
  } catch (error) {
    console.error('Error converting to invitado:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
