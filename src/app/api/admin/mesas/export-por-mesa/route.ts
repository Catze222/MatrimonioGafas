import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import * as XLSX from 'xlsx'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export async function GET() {
  try {
    // Fetch all assignments
    const { data: asignaciones, error: asignacionesError } = await supabase
      .from('asignaciones_mesas')
      .select('*')

    if (asignacionesError) throw asignacionesError

    // Fetch table configurations to get orden_display
    const { data: configuraciones, error: configError } = await supabase
      .from('configuracion_mesas')
      .select('numero_mesa, orden_display')

    if (configError) throw configError

    // Create a map of numero_mesa -> orden_display
    const mesaToDisplay = new Map(
      configuraciones?.map(c => [c.numero_mesa, c.orden_display]) || []
    )

    // Transform data for Excel (by mesa and silla)
    const excelData = (asignaciones || []).map(a => ({
      'Mesa': mesaToDisplay.get(a.numero_mesa) || a.numero_mesa,
      'Silla': a.posicion_silla,
      'Nombre Completo': a.nombre_persona,
      'Restricción Alimentaria': a.restriccion_alimentaria || 'Ninguna'
    }))

    // Sort by Mesa (display order), then by Silla
    excelData.sort((a, b) => {
      if (a.Mesa !== b.Mesa) return a.Mesa - b.Mesa
      return a.Silla - b.Silla
    })

    // Create workbook and worksheet
    const worksheet = XLSX.utils.json_to_sheet(excelData)
    const workbook = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Por Mesa')

    // Set column widths
    worksheet['!cols'] = [
      { wch: 8 },  // Mesa
      { wch: 8 },  // Silla
      { wch: 35 }, // Nombre Completo
      { wch: 25 }  // Restricción Alimentaria
    ]

    // Generate buffer
    const buffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' })

    // Return file
    return new NextResponse(buffer, {
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Content-Disposition': 'attachment; filename="lista_por_mesas.xlsx"'
      }
    })
  } catch (error) {
    console.error('Error generating Excel:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Error al generar Excel' },
      { status: 500 }
    )
  }
}

