/**
 * API Route to synchronize guests with table assignments
 * Creates PersonaSinAsignar list from invitados table
 */
import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

// POST /api/admin/mesas/sincronizar - Get unassigned people
export async function POST() {
  try {
    // Get all invitados
    const { data: invitados, error: invitadosError } = await supabase
      .from('invitados')
      .select('*')
      .order('nombre_1', { ascending: true })

    if (invitadosError) throw invitadosError

    // Get all current assignments
    const { data: asignaciones, error: asignacionesError } = await supabase
      .from('asignaciones_mesas')
      .select('invitado_id, persona_index')

    if (asignacionesError) throw asignacionesError

    // Create map of assigned people
    const assignedMap = new Map<string, Set<number>>()
    asignaciones?.forEach(a => {
      if (!assignedMap.has(a.invitado_id)) {
        assignedMap.set(a.invitado_id, new Set())
      }
      assignedMap.get(a.invitado_id)?.add(a.persona_index)
    })

    // Build list of unassigned people (only confirmados or pendientes)
    // Group couples to show only once in sidebar
    const personasSinAsignar = []

    for (const invitado of invitados || []) {
      const assignedIndexes = assignedMap.get(invitado.id) || new Set()

      const persona1Valid = invitado.asistencia_1 === 'si' || invitado.asistencia_1 === 'pendiente'
      const persona2Valid = invitado.nombre_2 && (invitado.asistencia_2 === 'si' || invitado.asistencia_2 === 'pendiente')

      // If both are unassigned and valid, show as couple (only once)
      if (!assignedIndexes.has(1) && !assignedIndexes.has(2) && persona1Valid && persona2Valid) {
        personasSinAsignar.push({
          id: `${invitado.id}-pareja`,
          invitado_id: invitado.id,
          nombre: `${invitado.nombre_1} & ${invitado.nombre_2}`,
          asistencia: invitado.asistencia_1, // Use first person's status
          tiene_acompanante: true,
          nombre_acompanante: invitado.nombre_2,
          restriccion_alimentaria: invitado.restriccion_1 || invitado.restriccion_2 ? 
            [invitado.restriccion_1, invitado.restriccion_2].filter(Boolean).join(', ') : null,
          de_quien: invitado.de_quien || 'jaime',
          persona_index: 1, // Will assign both
          es_pareja: true
        })
      } 
      // If only persona 1 is unassigned and valid
      else if (!assignedIndexes.has(1) && persona1Valid) {
        personasSinAsignar.push({
          id: `${invitado.id}-1`,
          invitado_id: invitado.id,
          nombre: invitado.nombre_1,
          asistencia: invitado.asistencia_1,
          tiene_acompanante: !!invitado.nombre_2,
          nombre_acompanante: invitado.nombre_2,
          restriccion_alimentaria: invitado.restriccion_1,
          de_quien: invitado.de_quien || 'jaime',
          persona_index: 1,
          es_pareja: false
        })
      }
      // If only persona 2 is unassigned and valid
      else if (!assignedIndexes.has(2) && persona2Valid) {
        personasSinAsignar.push({
          id: `${invitado.id}-2`,
          invitado_id: invitado.id,
          nombre: invitado.nombre_2,
          asistencia: invitado.asistencia_2,
          tiene_acompanante: true,
          nombre_acompanante: invitado.nombre_1,
          restriccion_alimentaria: invitado.restriccion_2,
          de_quien: invitado.de_quien || 'jaime',
          persona_index: 2,
          es_pareja: false
        })
      }
    }

    return NextResponse.json({
      success: true,
      data: personasSinAsignar,
      total: personasSinAsignar.length
    })
  } catch (error) {
    console.error('Error synchronizing table assignments:', error)
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Error desconocido' },
      { status: 500 }
    )
  }
}

