/**
 * API Route for reordering tables (drag & drop)
 * POST: Reorder tables by updating orden_display
 */
import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

// POST /api/admin/mesas/reordenar - Reorder tables
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { draggedMesa, targetMesa, insertBefore } = body
    // draggedMesa: numero_mesa being moved
    // targetMesa: numero_mesa of the drop target
    // insertBefore: boolean - true if inserting before target, false if after

    console.log('🔄 Reordenando mesas:', { draggedMesa, targetMesa, insertBefore })

    if (!draggedMesa || !targetMesa) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Get current configurations with orden_display
    const { data: configs, error: fetchError } = await supabase
      .from('configuracion_mesas')
      .select('numero_mesa, orden_display')
      .order('orden_display', { ascending: true })

    if (fetchError) throw fetchError

    if (!configs || configs.length === 0) {
      return NextResponse.json(
        { success: false, error: 'No configurations found' },
        { status: 404 }
      )
    }

    // Find the dragged and target configs
    const draggedConfig = configs.find(c => c.numero_mesa === draggedMesa)
    const targetConfig = configs.find(c => c.numero_mesa === targetMesa)

    if (!draggedConfig || !targetConfig) {
      return NextResponse.json(
        { success: false, error: 'Mesa not found' },
        { status: 404 }
      )
    }

    // Remove dragged item from array
    const filteredConfigs = configs.filter(c => c.numero_mesa !== draggedMesa)

    // Find insertion index
    const targetIndex = filteredConfigs.findIndex(c => c.numero_mesa === targetMesa)
    const insertIndex = insertBefore ? targetIndex : targetIndex + 1

    // Insert dragged item at new position
    filteredConfigs.splice(insertIndex, 0, draggedConfig)

    // SUPER SIMPLE: Sin constraint único, podemos actualizar directamente en paralelo
    console.log('🚀 Actualizando órdenes en paralelo...')
    
    const updates = filteredConfigs.map((config, index) =>
      supabase
        .from('configuracion_mesas')
        .update({ orden_display: index + 1 })
        .eq('numero_mesa', config.numero_mesa)
    )
    
    const results = await Promise.all(updates)
    const failed = results.find(r => r.error)
    
    if (failed?.error) {
      console.error('❌ Error actualizando:', failed.error)
      throw failed.error
    }

    console.log('✅ Reordenamiento completado (~100ms)')

    return NextResponse.json({
      success: true,
      message: 'Orden actualizado correctamente',
      newOrder: updates
    })

  } catch (error: any) {
    console.error('Error reordering tables:', error)
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    )
  }
}

