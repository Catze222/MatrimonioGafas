/**
 * API Routes for individual table assignment operations
 * PUT: Update assignment (move to different table/position)
 * DELETE: Remove assignment
 */
import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

// PUT /api/admin/mesas/[id] - Update assignment
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()
    const { numero_mesa, posicion_silla, is_swap } = body

    console.log('🔵 API PUT - Received:', { id, numero_mesa, posicion_silla, is_swap })

    if (!numero_mesa || !posicion_silla) {
      console.error('❌ Missing fields:', { numero_mesa, posicion_silla })
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Get current assignment
    const { data: currentAssignment, error: fetchError } = await supabase
      .from('asignaciones_mesas')
      .select('*')
      .eq('id', id)
      .single()

    if (fetchError) {
      console.error('❌ Fetch error:', fetchError)
      throw fetchError
    }
    if (!currentAssignment) {
      console.error('❌ Assignment not found:', id)
      return NextResponse.json(
        { success: false, error: 'Assignment not found' },
        { status: 404 }
      )
    }

    console.log('Current assignment:', currentAssignment)

    // Check if position is available (skip check if it's a swap)
    if (!is_swap) {
      const { data: existingAtPosition, error: checkError } = await supabase
        .from('asignaciones_mesas')
        .select('id')
        .eq('numero_mesa', numero_mesa)
        .eq('posicion_silla', posicion_silla)
        .neq('id', id)
        .single()

      if (checkError && checkError.code !== 'PGRST116') throw checkError
      if (existingAtPosition) {
        return NextResponse.json(
          { success: false, error: 'Esta posición ya está ocupada' },
          { status: 400 }
        )
      }
    }

    // If it's a swap, just update the position directly (no space validation needed)
    if (is_swap) {
      console.log(`📝 Updating: ${currentAssignment.nombre_persona} to Mesa ${numero_mesa}, Pos ${posicion_silla}`)
      
      const { error: updateError } = await supabase
        .from('asignaciones_mesas')
        .update({ numero_mesa, posicion_silla })
        .eq('id', id)

      if (updateError) {
        console.error('❌ Update error:', updateError)
        throw updateError
      }

      console.log('✅ Update successful')
      return NextResponse.json({
        success: true,
        message: 'Intercambio exitoso'
      })
    }

    // If person has companion, move both together (only for non-swap moves)
    if (currentAssignment.acompanante_id) {
      // Get companion
      const { data: companion, error: companionError } = await supabase
        .from('asignaciones_mesas')
        .select('*')
        .eq('id', currentAssignment.acompanante_id)
        .single()

      if (companionError) throw companionError

      // Get table capacity from configuration
      const { data: configData, error: configError } = await supabase
        .from('configuracion_mesas')
        .select('capacidad')
        .eq('numero_mesa', numero_mesa)
        .single()

      if (configError) throw configError
      const tableCapacity = configData?.capacidad || 8

      // Check if there's space for both
      const { data: tableAssignments, error: tableError } = await supabase
        .from('asignaciones_mesas')
        .select('posicion_silla')
        .eq('numero_mesa', numero_mesa)
        .neq('id', id)
        .neq('id', currentAssignment.acompanante_id)

      if (tableError) throw tableError

      const occupiedPositions = tableAssignments?.map(a => a.posicion_silla) || []
      const allPositions = Array.from({ length: tableCapacity }, (_, i) => i + 1)
      const availablePositions = allPositions.filter(pos => !occupiedPositions.includes(pos))

      if (availablePositions.length < 2) {
        return NextResponse.json(
          { success: false, error: 'No hay suficiente espacio para la pareja en esta mesa' },
          { status: 400 }
        )
      }

      // VALIDATE: Find consecutive positions for the couple
      let position1: number | null = null
      let position2: number | null = null

      // Try to use posicion_silla as target if it's available
      if (availablePositions.includes(posicion_silla)) {
        position1 = posicion_silla
        const nextPos = posicion_silla === tableCapacity ? 1 : posicion_silla + 1
        const prevPos = posicion_silla === 1 ? tableCapacity : posicion_silla - 1

        if (availablePositions.includes(nextPos)) {
          position2 = nextPos
        } else if (availablePositions.includes(prevPos)) {
          position2 = prevPos
        }
      }

      // If target position doesn't have consecutive available, find any consecutive pair
      if (!position1 || !position2) {
        for (let i = 1; i <= tableCapacity; i++) {
          const next = i === tableCapacity ? 1 : i + 1
          if (availablePositions.includes(i) && availablePositions.includes(next)) {
            position1 = i
            position2 = next
            break
          }
        }
      }

      // If no consecutive positions found, reject
      if (!position1 || !position2) {
        return NextResponse.json(
          { success: false, error: '⚠️ No hay 2 sillas consecutivas disponibles para la pareja en esta mesa.\n\nPor favor usa una mesa diferente o mueve a alguien primero.' },
          { status: 400 }
        )
      }

      console.log(`✅ Posiciones consecutivas encontradas: ${position1} y ${position2}`)

      // Find new color for couple in target table
      const { data: targetTableAssignments } = await supabase
        .from('asignaciones_mesas')
        .select('color_pareja')
        .eq('numero_mesa', numero_mesa)

      const usedColors = targetTableAssignments
        ?.map(a => a.color_pareja)
        .filter(Boolean) || []
      const availableColors = ['blue', 'green', 'purple', 'pink'].filter(
        c => !usedColors.includes(c)
      )
      const newColor = availableColors[0] || 'blue'

      console.log(`🎨 Nuevo color para la pareja: ${newColor}`)

      // Update both assignments
      const updates = [
        supabase
          .from('asignaciones_mesas')
          .update({
            numero_mesa,
            posicion_silla: position1,
            color_pareja: newColor
          })
          .eq('id', id),
        supabase
          .from('asignaciones_mesas')
          .update({
            numero_mesa,
            posicion_silla: position2,
            color_pareja: newColor
          })
          .eq('id', currentAssignment.acompanante_id)
      ]

      await Promise.all(updates)

      return NextResponse.json({
        success: true,
        message: 'Pareja movida exitosamente'
      })
    } else {
      // Move single person
      const { error: updateError } = await supabase
        .from('asignaciones_mesas')
        .update({ numero_mesa, posicion_silla })
        .eq('id', id)

      if (updateError) throw updateError

      return NextResponse.json({
        success: true,
        message: 'Persona movida exitosamente'
      })
    }
  } catch (error: any) {
    console.error('Error updating table assignment:', error)
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    )
  }
}

// DELETE /api/admin/mesas/[id] - Remove assignment
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    // Get current assignment
    const { data: currentAssignment, error: fetchError } = await supabase
      .from('asignaciones_mesas')
      .select('*')
      .eq('id', id)
      .single()

    if (fetchError) throw fetchError
    if (!currentAssignment) {
      return NextResponse.json(
        { success: false, error: 'Assignment not found' },
        { status: 404 }
      )
    }

    // If has companion, remove both
    if (currentAssignment.acompanante_id) {
      await supabase
        .from('asignaciones_mesas')
        .delete()
        .in('id', [id, currentAssignment.acompanante_id])
    } else {
      await supabase
        .from('asignaciones_mesas')
        .delete()
        .eq('id', id)
    }

    return NextResponse.json({
      success: true,
      message: 'Asignación eliminada exitosamente'
    })
  } catch (error: any) {
    console.error('Error deleting table assignment:', error)
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    )
  }
}

