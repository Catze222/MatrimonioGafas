/**
 * API Routes for table configuration (capacity settings)
 * GET: Fetch all table configurations
 * PUT: Update table capacity
 */
import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

// GET /api/admin/mesas/configuracion - Get all table configurations
export async function GET() {
  try {
    const { data, error } = await supabase
      .from('configuracion_mesas')
      .select('*')
      .order('orden_display', { ascending: true }) // Order by custom display order

    if (error) throw error

    // Return full configs array (includes capacidad, orden_display, etc.)
    return NextResponse.json({ success: true, data: data || [] })
  } catch (error) {
    console.error('Error fetching table configurations:', error)
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Error desconocido' },
      { status: 500 }
    )
  }
}

// PUT /api/admin/mesas/configuracion - Update table capacity
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { numero_mesa, capacidad } = body

    if (!numero_mesa || !capacidad) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      )
    }

    if (capacidad < 1 || capacidad > 10) {
      return NextResponse.json(
        { success: false, error: 'Capacidad debe ser entre 1 y 10' },
        { status: 400 }
      )
    }

    // Check how many people are currently assigned to this table
    const { data: asignaciones, error: asignacionesError } = await supabase
      .from('asignaciones_mesas')
      .select('id')
      .eq('numero_mesa', numero_mesa)

    if (asignacionesError) throw asignacionesError

    const currentOccupancy = asignaciones?.length || 0

    if (currentOccupancy > capacidad) {
      return NextResponse.json(
        { 
          success: false, 
          error: `No puedes reducir la capacidad a ${capacidad}. Actualmente hay ${currentOccupancy} personas asignadas. Remueve algunas personas primero.` 
        },
        { status: 400 }
      )
    }

    // Update capacity
    const { error: updateError } = await supabase
      .from('configuracion_mesas')
      .update({ capacidad })
      .eq('numero_mesa', numero_mesa)

    if (updateError) throw updateError

    return NextResponse.json({ 
      success: true, 
      message: `Capacidad de Mesa ${numero_mesa} actualizada a ${capacidad}` 
    })
  } catch (error) {
    console.error('Error updating table configuration:', error)
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Error desconocido' },
      { status: 500 }
    )
  }
}

