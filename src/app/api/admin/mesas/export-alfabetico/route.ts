import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import * as XLSX from 'xlsx'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export async function GET() {
  try {
    // Fetch all assignments with table configuration
    const { data: asignaciones, error: asignacionesError } = await supabase
      .from('asignaciones_mesas')
      .select('*')
      .order('nombre_persona', { ascending: true })

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

    // Transform data for Excel (alphabetical by nombre_persona)
    const excelData = (asignaciones || []).map(a => ({
      'Nombre Completo': a.nombre_persona,
      'Mesa': mesaToDisplay.get(a.numero_mesa) || a.numero_mesa
    }))

    // Sort alphabetically by name
    excelData.sort((a, b) => a['Nombre Completo'].localeCompare(b['Nombre Completo']))

    // Create workbook and worksheet
    const worksheet = XLSX.utils.json_to_sheet(excelData)
    const workbook = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Lista Alfabética')

    // Set column widths
    worksheet['!cols'] = [
      { wch: 35 }, // Nombre Completo
      { wch: 8 }   // Mesa
    ]

    // Generate buffer
    const buffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' })

    // Return file
    return new NextResponse(buffer, {
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Content-Disposition': 'attachment; filename="lista_alfabetica_invitados.xlsx"'
      }
    })
  } catch (error: any) {
    console.error('Error generating Excel:', error)
    return NextResponse.json(
      { error: error.message || 'Error al generar Excel' },
      { status: 500 }
    )
  }
}

