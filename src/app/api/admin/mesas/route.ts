/**
 * API Routes for wedding table assignments (seating chart)
 * GET: Fetch all table assignments
 * POST: Create new assignment
 */
import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

// GET /api/admin/mesas - Get all table assignments
export async function GET(request: NextRequest) {
  try {
    const { data, error } = await supabase
      .from('asignaciones_mesas')
      .select('*')
      .order('numero_mesa', { ascending: true })
      .order('posicion_silla', { ascending: true })

    if (error) throw error

    return NextResponse.json({ success: true, data })
  } catch (error: any) {
    console.error('Error fetching table assignments:', error)
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    )
  }
}

// POST /api/admin/mesas - Create new assignment(s)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { invitado_id, numero_mesa, persona_index, nombre_persona, restriccion_alimentaria, acompanante_data, posicion_silla } = body

    // Validate required fields
    if (!invitado_id || !numero_mesa || !persona_index || !nombre_persona) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Get table capacity from configuration
    const { data: configData, error: configError } = await supabase
      .from('configuracion_mesas')
      .select('capacidad')
      .eq('numero_mesa', numero_mesa)
      .single()

    if (configError) throw configError
    const tableCapacity = configData?.capacidad || 8

    // Check table capacity
    const { data: existingAssignments, error: checkError } = await supabase
      .from('asignaciones_mesas')
      .select('*')
      .eq('numero_mesa', numero_mesa)

    if (checkError) throw checkError

    const availableSlots = tableCapacity - (existingAssignments?.length || 0)
    const slotsNeeded = acompanante_data ? 2 : 1

    if (availableSlots < slotsNeeded) {
      return NextResponse.json(
        { success: false, error: `Mesa ${numero_mesa} no tiene suficiente espacio. Disponibles: ${availableSlots}, necesarios: ${slotsNeeded}` },
        { status: 400 }
      )
    }

    const occupiedPositions = existingAssignments?.map(a => a.posicion_silla) || []
    
    // Determine positions for assignment
    let position1: number = 0 // Will be assigned below
    let position2: number | null = null

    if (posicion_silla) {
      // Use specified position for first person
      position1 = posicion_silla
      
      // For companion, find next clockwise position (MUST be consecutive)
      if (acompanante_data) {
        // Check if neighbors are available
        const nextClockwise = position1 === 8 ? 1 : position1 + 1
        const prevClockwise = position1 === 1 ? 8 : position1 - 1
        
        if (!occupiedPositions.includes(nextClockwise)) {
          position2 = nextClockwise
        } else if (!occupiedPositions.includes(prevClockwise)) {
          position2 = prevClockwise
        } else {
          // No consecutive positions available
          return NextResponse.json(
            { success: false, error: '⚠️ No hay 2 sillas consecutivas disponibles para la pareja en esta posición.\n\nPor favor elige otra silla o usa una mesa diferente.' },
            { status: 400 }
          )
        }
      }
    } else {
      // Auto-assign positions - find consecutive pairs for couples (DYNAMIC based on capacity)
      const allPositions = Array.from({ length: tableCapacity }, (_, i) => i + 1)
      const availablePositions = allPositions.filter(pos => !occupiedPositions.includes(pos))
      
      if (availablePositions.length < slotsNeeded) {
        return NextResponse.json(
          { success: false, error: 'No hay posiciones disponibles en esta mesa' },
          { status: 400 }
        )
      }
      
      if (acompanante_data) {
        // For couples, MUST find consecutive positions
        let foundConsecutive = false
        
        // Check all possible consecutive pairs (dynamic)
        for (let i = 1; i <= tableCapacity; i++) {
          const next = i === tableCapacity ? 1 : i + 1
          if (availablePositions.includes(i) && availablePositions.includes(next)) {
            position1 = i
            position2 = next
            foundConsecutive = true
            break
          }
        }
        
        if (!foundConsecutive) {
          return NextResponse.json(
            { success: false, error: '⚠️ No hay 2 sillas consecutivas disponibles para la pareja en esta mesa.\n\nPor favor usa una mesa diferente o mueve a alguien primero.' },
            { status: 400 }
          )
        }
      } else {
        // Single person - any available position is fine
        position1 = availablePositions[0]
      }
    }

    // Assign color for couple if needed
    let color_pareja = null
    if (acompanante_data) {
      const usedColors = existingAssignments
        ?.map(a => a.color_pareja)
        .filter(Boolean) || []
      const availableColors = ['blue', 'green', 'purple', 'pink'].filter(
        c => !usedColors.includes(c)
      )
      color_pareja = availableColors[0] || 'blue'
    }

    // Create assignment(s)
    const assignments = []
    
    // First person
    const assignment1 = {
      invitado_id,
      numero_mesa,
      posicion_silla: position1,
      persona_index,
      nombre_persona,
      restriccion_alimentaria,
      color_pareja,
      acompanante_id: null // Will be updated if there's a companion
    }
    assignments.push(assignment1)

    // Companion if exists
    if (acompanante_data && position2) {
      const assignment2 = {
        invitado_id: acompanante_data.invitado_id,
        numero_mesa,
        posicion_silla: position2,
        persona_index: acompanante_data.persona_index,
        nombre_persona: acompanante_data.nombre_persona,
        restriccion_alimentaria: acompanante_data.restriccion_alimentaria,
        color_pareja,
        acompanante_id: null
      }
      assignments.push(assignment2)
    }

    // Insert assignments
    const { data: insertedData, error: insertError } = await supabase
      .from('asignaciones_mesas')
      .insert(assignments)
      .select()

    if (insertError) throw insertError

    // Update acompanante_id references if couple
    if (acompanante_data && insertedData && insertedData.length === 2) {
      await supabase
        .from('asignaciones_mesas')
        .update({ acompanante_id: insertedData[1].id })
        .eq('id', insertedData[0].id)

      await supabase
        .from('asignaciones_mesas')
        .update({ acompanante_id: insertedData[0].id })
        .eq('id', insertedData[1].id)
    }

    return NextResponse.json({ success: true, data: insertedData })
  } catch (error: any) {
    console.error('Error creating table assignment:', error)
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    )
  }
}

