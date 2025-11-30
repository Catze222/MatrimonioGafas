import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

// POST /api/admin/mesas/swap - Swap two people/couples in one atomic operation
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { persona1_id, persona2_id } = body

    console.log('🔄 SWAP API - Iniciando:', { persona1_id, persona2_id })

    // Fetch both assignments with their companions
    const { data: assignments, error: fetchError } = await supabase
      .from('asignaciones_mesas')
      .select('*')
      .in('id', [persona1_id, persona2_id])

    if (fetchError) throw fetchError
    if (!assignments || assignments.length !== 2) {
      return NextResponse.json(
        { success: false, error: 'No se encontraron las asignaciones' },
        { status: 404 }
      )
    }

    const persona1 = assignments.find(a => a.id === persona1_id)!
    const persona2 = assignments.find(a => a.id === persona2_id)!

    // Get companions if they exist
    const companionIds = [persona1.acompanante_id, persona2.acompanante_id].filter(Boolean)
    let companions: any[] = []
    
    if (companionIds.length > 0) {
      const { data: companionsData, error: companionsError } = await supabase
        .from('asignaciones_mesas')
        .select('*')
        .in('id', companionIds)
      
      if (companionsError) throw companionsError
      companions = companionsData || []
    }

    const companion1 = companions.find(c => c.id === persona1.acompanante_id)
    const companion2 = companions.find(c => c.id === persona2.acompanante_id)

    console.log('📦 Personas a intercambiar:', {
      persona1: { id: persona1.id, nombre: persona1.nombre_persona, mesa: persona1.numero_mesa, pos: persona1.posicion_silla },
      persona2: { id: persona2.id, nombre: persona2.nombre_persona, mesa: persona2.numero_mesa, pos: persona2.posicion_silla },
      companion1: companion1 ? { id: companion1.id, nombre: companion1.nombre_persona, pos: companion1.posicion_silla } : null,
      companion2: companion2 ? { id: companion2.id, nombre: companion2.nombre_persona, pos: companion2.posicion_silla } : null,
    })

    // Helper function: Get consecutive position (next clockwise)
    const getConsecutivePosition = (position: number): number => {
      return position === 8 ? 1 : position + 1
    }

    const getPrevConsecutivePosition = (position: number): number => {
      return position === 1 ? 8 : position - 1
    }

    // VALIDATE: If swapping couples, ensure consecutive positions are available in both mesas
    if (companion1 && companion2) {
      console.log('🔍 VALIDANDO SWAP DE PAREJAS...')
      
      // Get all occupants of each mesa (excluding the ones being swapped)
      const idsLeavingMesa1 = [persona1.id, companion1.id]
      const idsLeavingMesa2 = [persona2.id, companion2.id]

      console.log('IDs saliendo de Mesa', persona1.numero_mesa, ':', idsLeavingMesa1)
      console.log('IDs saliendo de Mesa', persona2.numero_mesa, ':', idsLeavingMesa2)

      const { data: mesa1Occupants } = await supabase
        .from('asignaciones_mesas')
        .select('posicion_silla')
        .eq('numero_mesa', persona1.numero_mesa)
        .not('id', 'in', `(${idsLeavingMesa1.join(',')})`)

      const { data: mesa2Occupants } = await supabase
        .from('asignaciones_mesas')
        .select('posicion_silla')
        .eq('numero_mesa', persona2.numero_mesa)
        .not('id', 'in', `(${idsLeavingMesa2.join(',')})`)

      const mesa1OccupiedPositions = mesa1Occupants?.map(o => o.posicion_silla) || []
      const mesa2OccupiedPositions = mesa2Occupants?.map(o => o.posicion_silla) || []

      console.log('Mesa', persona1.numero_mesa, 'ocupadas (sin los que se van):', mesa1OccupiedPositions)
      console.log('Mesa', persona2.numero_mesa, 'ocupadas (sin los que se van):', mesa2OccupiedPositions)

      // Check if persona1's target position (persona2.posicion_silla) has a consecutive spot available
      const targetPos1 = persona2.posicion_silla
      const nextPos1 = getConsecutivePosition(targetPos1)
      const prevPos1 = getPrevConsecutivePosition(targetPos1)

      console.log(`Mesa ${persona2.numero_mesa}: Persona1 va a silla ${targetPos1}`)
      console.log(`  - Siguiente (${nextPos1}) ocupada?`, mesa2OccupiedPositions.includes(nextPos1))
      console.log(`  - Anterior (${prevPos1}) ocupada?`, mesa2OccupiedPositions.includes(prevPos1))

      const hasConsecutiveInMesa2 = !mesa2OccupiedPositions.includes(nextPos1) || !mesa2OccupiedPositions.includes(prevPos1)
      console.log(`  - ¿Tiene consecutiva disponible?`, hasConsecutiveInMesa2)

      if (!hasConsecutiveInMesa2) {
        console.log('❌ NO HAY CONSECUTIVAS EN MESA', persona2.numero_mesa)
        return NextResponse.json(
          { success: false, error: `⚠️ No hay 2 sillas consecutivas disponibles en la Mesa ${persona2.numero_mesa} para la pareja.\n\nPor favor elige otra mesa o mueve a alguien primero.` },
          { status: 400 }
        )
      }

      // Check if persona2's target position (persona1.posicion_silla) has a consecutive spot available
      const targetPos2 = persona1.posicion_silla
      const nextPos2 = getConsecutivePosition(targetPos2)
      const prevPos2 = getPrevConsecutivePosition(targetPos2)

      console.log(`Mesa ${persona1.numero_mesa}: Persona2 va a silla ${targetPos2}`)
      console.log(`  - Siguiente (${nextPos2}) ocupada?`, mesa1OccupiedPositions.includes(nextPos2))
      console.log(`  - Anterior (${prevPos2}) ocupada?`, mesa1OccupiedPositions.includes(prevPos2))

      const hasConsecutiveInMesa1 = !mesa1OccupiedPositions.includes(nextPos2) || !mesa1OccupiedPositions.includes(prevPos2)
      console.log(`  - ¿Tiene consecutiva disponible?`, hasConsecutiveInMesa1)

      if (!hasConsecutiveInMesa1) {
        console.log('❌ NO HAY CONSECUTIVAS EN MESA', persona1.numero_mesa)
        return NextResponse.json(
          { success: false, error: `⚠️ No hay 2 sillas consecutivas disponibles en la Mesa ${persona1.numero_mesa} para la pareja.\n\nPor favor elige otra mesa o mueve a alguien primero.` },
          { status: 400 }
        )
      }

      console.log('✅ Validación consecutiva: Ambas mesas tienen espacio para parejas')
    }

    // Get available colors for each destination table
    const getAvailableColor = async (mesaNumero: number, excludeIds: string[]) => {
      const { data: mesaAssignments } = await supabase
        .from('asignaciones_mesas')
        .select('color_pareja')
        .eq('numero_mesa', mesaNumero)
        .not('id', 'in', `(${excludeIds.join(',')})`)
        .not('color_pareja', 'is', null)

      const usedColors = new Set(mesaAssignments?.map(a => a.color_pareja) || [])
      const availableColors = ['blue', 'green', 'purple', 'pink'].filter(c => !usedColors.has(c))
      return availableColors[0] || 'blue'
    }

    // Determine new colors for each mesa
    const idsMovingToMesa1 = [persona2.id, companion2?.id].filter(Boolean)
    const idsMovingToMesa2 = [persona1.id, companion1?.id].filter(Boolean)
    
    const newColorMesa1 = persona2.acompanante_id 
      ? await getAvailableColor(persona1.numero_mesa, idsMovingToMesa1)
      : null
    const newColorMesa2 = persona1.acompanante_id 
      ? await getAvailableColor(persona2.numero_mesa, idsMovingToMesa2)
      : null

    console.log('🎨 Nuevos colores:', { newColorMesa1, newColorMesa2 })

    // Prepare all updates
    const updates = []

    // PASO 1: Mover todos a mesa temporal 999
    updates.push({
      id: persona1.id,
      numero_mesa: 999,
      posicion_silla: 90,
      color_pareja: persona1.color_pareja
    })
    if (companion1) {
      updates.push({
        id: companion1.id,
        numero_mesa: 999,
        posicion_silla: 91,
        color_pareja: companion1.color_pareja
      })
    }
    updates.push({
      id: persona2.id,
      numero_mesa: 999,
      posicion_silla: 92,
      color_pareja: persona2.color_pareja
    })
    if (companion2) {
      updates.push({
        id: companion2.id,
        numero_mesa: 999,
        posicion_silla: 93,
        color_pareja: companion2.color_pareja
      })
    }

    console.log('📦 PASO 1: Moviendo a mesa temporal 999...')
    
    // Execute updates to temp table
    for (const update of updates) {
      const { error } = await supabase
        .from('asignaciones_mesas')
        .update({
          numero_mesa: update.numero_mesa,
          posicion_silla: update.posicion_silla
        })
        .eq('id', update.id)
      
      if (error) {
        console.error('❌ Error en paso 1:', error)
        throw error
      }
    }

    console.log('✅ PASO 1 Completado')

    // PASO 2: Mover a posiciones finales con nuevos colores
    // Note: getConsecutivePosition and getPrevConsecutivePosition are defined above in validation
    const finalUpdates = [
      {
        id: persona1.id,
        numero_mesa: persona2.numero_mesa,
        posicion_silla: persona2.posicion_silla,
        color_pareja: newColorMesa2
      },
      {
        id: persona2.id,
        numero_mesa: persona1.numero_mesa,
        posicion_silla: persona1.posicion_silla,
        color_pareja: newColorMesa1
      }
    ]

    // For couples, companions MUST be in consecutive positions
    if (companion1) {
      console.log('🔧 Asignando posición para Companion1...')
      // Companion1 goes to mesa2 (where persona1 is going)
      // Determine which consecutive position is available
      const targetPos = persona2.posicion_silla
      const nextPos = getConsecutivePosition(targetPos)
      const prevPos = getPrevConsecutivePosition(targetPos)

      console.log(`  Persona1 va a silla ${targetPos}, opciones consecutivas: ${nextPos} (next) o ${prevPos} (prev)`)

      // Get occupied positions in mesa2 (excluding those being swapped out)
      const { data: mesa2Occupants } = await supabase
        .from('asignaciones_mesas')
        .select('posicion_silla')
        .eq('numero_mesa', persona2.numero_mesa)
        .not('id', 'in', `(${[persona2.id, companion2?.id].filter(Boolean).join(',')})`)

      const mesa2Occupied = mesa2Occupants?.map(o => o.posicion_silla) || []
      console.log(`  Mesa ${persona2.numero_mesa} ocupadas (sin swappers):`, mesa2Occupied)

      // Choose next or prev based on availability
      const companionPos = !mesa2Occupied.includes(nextPos) ? nextPos : prevPos
      console.log(`  ✅ Companion1 irá a silla ${companionPos}`)

      finalUpdates.push({
        id: companion1.id,
        numero_mesa: persona2.numero_mesa,
        posicion_silla: companionPos,
        color_pareja: newColorMesa2
      })
    }

    if (companion2) {
      console.log('🔧 Asignando posición para Companion2...')
      // Companion2 goes to mesa1 (where persona2 is going)
      // Determine which consecutive position is available
      const targetPos = persona1.posicion_silla
      const nextPos = getConsecutivePosition(targetPos)
      const prevPos = getPrevConsecutivePosition(targetPos)

      console.log(`  Persona2 va a silla ${targetPos}, opciones consecutivas: ${nextPos} (next) o ${prevPos} (prev)`)

      // Get occupied positions in mesa1 (excluding those being swapped out)
      const { data: mesa1Occupants } = await supabase
        .from('asignaciones_mesas')
        .select('posicion_silla')
        .eq('numero_mesa', persona1.numero_mesa)
        .not('id', 'in', `(${[persona1.id, companion1?.id].filter(Boolean).join(',')})`)

      const mesa1Occupied = mesa1Occupants?.map(o => o.posicion_silla) || []
      console.log(`  Mesa ${persona1.numero_mesa} ocupadas (sin swappers):`, mesa1Occupied)

      // Choose next or prev based on availability
      const companionPos = !mesa1Occupied.includes(nextPos) ? nextPos : prevPos
      console.log(`  ✅ Companion2 irá a silla ${companionPos}`)

      finalUpdates.push({
        id: companion2.id,
        numero_mesa: persona1.numero_mesa,
        posicion_silla: companionPos,
        color_pareja: newColorMesa1
      })
    }

    console.log('📦 PASO 2: Moviendo a posiciones finales con nuevos colores...')

    // Execute final updates
    for (const update of finalUpdates) {
      const { error } = await supabase
        .from('asignaciones_mesas')
        .update({
          numero_mesa: update.numero_mesa,
          posicion_silla: update.posicion_silla,
          color_pareja: update.color_pareja
        })
        .eq('id', update.id)
      
      if (error) {
        console.error('❌ Error en paso 2:', error)
        throw error
      }
    }

    console.log('✅ SWAP COMPLETADO')

    return NextResponse.json({ 
      success: true, 
      message: 'Intercambio realizado con éxito'
    })

  } catch (error: any) {
    console.error('❌ Error in swap:', error)
    return NextResponse.json(
      { success: false, error: error.message || 'Error al intercambiar' },
      { status: 500 }
    )
  }
}

