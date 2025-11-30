/**
 * MesasTab - Main component for table assignments management
 * Handles all the logic for assigning guests to tables
 */
'use client'

import { useState, useEffect } from 'react'
import { AsignacionMesa, Mesa, PersonaSinAsignar } from '@/types'
import MesasGrid from './MesasGrid'
import PersonasSinAsignar from './PersonasSinAsignar'
import AsignarPersonaModal from './AsignarPersonaModal'
import Button from '@/components/ui/Button'

export default function MesasTab() {
  const [asignaciones, setAsignaciones] = useState<AsignacionMesa[]>([])
  const [personasSinAsignar, setPersonasSinAsignar] = useState<PersonaSinAsignar[]>([])
  const [configuraciones, setConfiguraciones] = useState<Array<{ numero_mesa: number, capacidad: number, orden_display: number }>>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [showAsignarModal, setShowAsignarModal] = useState(false)
  const [selectedMesa, setSelectedMesa] = useState<{ numero: number; posicion?: number } | null>(null)
  const [deQuienFilter, setDeQuienFilter] = useState<'all' | 'jaime' | 'alejandra'>('all')
  const [capacidadFilter, setCapacidadFilter] = useState<'all' | 8 | 9 | 10>('all')

  // Load data on mount
  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    setLoading(true)
    setError(null)

    try {
      // Load table configurations (capacities and orden_display)
      const configRes = await fetch('/api/admin/mesas/configuracion')
      const configData = await configRes.json()
      if (!configData.success) throw new Error(configData.error)
      setConfiguraciones(configData.data || [])

      // Load assignments
      const assignmentsRes = await fetch('/api/admin/mesas')
      const assignmentsData = await assignmentsRes.json()
      if (!assignmentsData.success) throw new Error(assignmentsData.error)
      setAsignaciones(assignmentsData.data || [])

      // Load unassigned people
      const unassignedRes = await fetch('/api/admin/mesas/sincronizar', { method: 'POST' })
      const unassignedData = await unassignedRes.json()
      if (!unassignedData.success) throw new Error(unassignedData.error)
      setPersonasSinAsignar(unassignedData.data || [])
    } catch (err) {
      console.error('Error loading data:', err)
      setError(err instanceof Error ? err.message : 'Error al cargar datos')
    } finally {
      setLoading(false)
    }
  }

  // Build mesas array from configuraciones (ordered by orden_display)
  const mesas: Mesa[] = configuraciones
    .sort((a, b) => a.orden_display - b.orden_display) // Always sorted by orden_display
    .map(config => {
      const numero = config.numero_mesa
      const mesaAsignaciones = asignaciones.filter(a => a.numero_mesa === numero)
      
      // Apply filter
      if (deQuienFilter !== 'all') {
        mesaAsignaciones = mesaAsignaciones.filter(a => {
          // Find the invitado to check de_quien
          const persona = personasSinAsignar.find(p => p.invitado_id === a.invitado_id)
          return persona?.de_quien === deQuienFilter
        })
      }

      const capacidad = config.capacidad

      return {
        numero, // Keep original numero_mesa for internal reference
        numeroDisplay: config.orden_display, // This is what we show to the user
        asignaciones: mesaAsignaciones, // Always show all for the table
        capacidad,
        ocupadas: mesaAsignaciones.length,
        disponibles: capacidad - mesaAsignaciones.length,
      }
    })

  // Apply filters
  let filteredMesas = mesas

  // Filter by capacity
  if (capacidadFilter !== 'all') {
    filteredMesas = filteredMesas.filter(m => m.capacidad === capacidadFilter)
  }

  // Filter by de_quien (only show tables with assignments when filtering)
  if (deQuienFilter !== 'all') {
    filteredMesas = filteredMesas.filter(m => m.asignaciones.length > 0)
  }

  // Statistics
  const totalAsignadas = asignaciones.length
  const totalSinAsignar = personasSinAsignar.length
  const mesasCompletas = mesas.filter(m => m.ocupadas === m.capacidad).length
  const mesasVacias = mesas.filter(m => m.ocupadas === 0).length
  const mesasParciales = mesas.filter(m => m.ocupadas > 0 && m.ocupadas < m.capacidad).length
  
  // Capacity statistics
  const mesas8 = mesas.filter(m => m.capacidad === 8).length
  const mesas9 = mesas.filter(m => m.capacidad === 9).length
  const mesas10 = mesas.filter(m => m.capacidad === 10).length

  // Handle assign person
  const handleAsignarPersona = (numeroMesa: number, posicionSilla?: number) => {
    setSelectedMesa({ numero: numeroMesa, posicion: posicionSilla })
    setShowAsignarModal(true)
  }

  // Handle assign from modal
  const handleAsignarFromModal = async (data: Record<string, unknown>) => {
    try {
      const res = await fetch('/api/admin/mesas', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })

      const result = await res.json()
      if (!result.success) throw new Error(result.error)

      // Reload data
      await loadData()
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : 'Error al asignar persona')
    }
  }

  // Handle assign from sidebar
  const handleAsignarFromSidebar = async (persona: PersonaSinAsignar) => {
    // Find first available table
    const availableTable = mesas.find(m => m.disponibles >= (persona.tiene_acompanante ? 2 : 1))
    
    if (!availableTable) {
      alert('No hay mesas disponibles con suficiente espacio')
      return
    }

    setSelectedMesa({ numero: availableTable.numero })
    setShowAsignarModal(true)
  }

  // Handle remove person
  const handleRemoverPersona = async (asignacionId: string) => {
    if (!confirm('¿Estás seguro de quitar esta persona de la mesa?')) return

    try {
      const res = await fetch(`/api/admin/mesas/${asignacionId}`, {
        method: 'DELETE',
      })

      const result = await res.json()
      if (!result.success) {
        alert(`❌ Error al quitar persona:\n\n${result.error || 'Error desconocido'}`)
        return
      }

      // Reload data
      await loadData()
    } catch (err) {
      console.error('Error removing person:', err)
      alert(`❌ Error al quitar persona:\n\n${err instanceof Error ? err.message : 'Por favor intenta de nuevo'}`)
    }
  }

  // Handle drop from sidebar or move from another table
  const handleDropPersona = async (numeroMesa: number, posicionSilla: number, data: Record<string, unknown>) => {
    try {
      // Check if it's replacing an existing person (from sidebar over occupied chair)
      if (data.replace_existing) {
        // Delete the existing assignment first
        const deleteRes = await fetch(`/api/admin/mesas/${data.replace_existing}`, {
          method: 'DELETE',
        })
        const deleteResult = await deleteRes.json()
        if (!deleteResult.success) {
          alert(`❌ Error al remover persona actual:\n\n${deleteResult.error || 'Error desconocido'}`)
          return
        }
        
        // Now assign the new person (remove replace_existing flag)
        delete data.replace_existing
        return handleDropPersona(numeroMesa, posicionSilla, data)
      }

      // Check if it's an existing asignacion (moving between tables)
      if (data.id && data.numero_mesa !== undefined && data.posicion_silla !== undefined) {
        // Moving existing assignment to empty chair
        const res = await fetch(`/api/admin/mesas/${data.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ numero_mesa: numeroMesa, posicion_silla: posicionSilla }),
        })

        const result = await res.json()
        if (!result.success) {
          alert(`❌ Error al mover persona:\n\n${result.error || 'Error desconocido'}`)
          return
        }

        await loadData()
        return
      }

      // Check if it's a PersonaSinAsignar (from sidebar)
      if (data.invitado_id && data.persona_index !== undefined && data.nombre) {
        const assignData: Record<string, unknown> = {
          invitado_id: data.invitado_id,
          numero_mesa: numeroMesa,
          posicion_silla: posicionSilla, // Send specific position
          persona_index: data.persona_index,
          nombre_persona: data.nombre.includes(' & ') ? data.nombre.split(' & ')[0] : data.nombre,
          restriccion_alimentaria: data.restriccion_alimentaria,
        }

        // If it's a couple (es_pareja = true), assign both
        if (data.es_pareja && data.nombre_acompanante) {
          const [nombre1, nombre2] = data.nombre.split(' & ')
          assignData.nombre_persona = nombre1
          
          // Find companion data
          const companionIndex = data.persona_index === 1 ? 2 : 1
          assignData.acompanante_data = {
            invitado_id: data.invitado_id,
            persona_index: companionIndex,
            nombre_persona: nombre2,
            restriccion_alimentaria: data.restriccion_alimentaria,
          }
        }

        const res = await fetch('/api/admin/mesas', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(assignData),
        })

        const result = await res.json()
        if (!result.success) {
          alert(`❌ ${result.error || 'Error al asignar persona'}`)
          return
        }

        await loadData()
      }
    } catch (err) {
      console.error('Error in handleDropPersona:', err)
      alert(`❌ Error inesperado:\n\n${err instanceof Error ? err.message : 'Por favor intenta de nuevo'}`)
    }
  }

  // Handle swap between chairs - OPTIMIZED with single API call
  const handleSwapPersonas = async (asignacion1: AsignacionMesa, asignacion2: AsignacionMesa) => {
    try {
      // Validate: both must be couples or both must be singles
      const persona1TienePareja = !!asignacion1.acompanante_id
      const persona2TienePareja = !!asignacion2.acompanante_id

      if (persona1TienePareja !== persona2TienePareja) {
        alert('⚠️ No puedes intercambiar una pareja con una persona sola.\n\nDeben ser ambas parejas o ambas personas solas.')
        return
      }

      // Call optimized swap endpoint (single request, handles everything)
      const res = await fetch('/api/admin/mesas/swap', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          persona1_id: asignacion1.id,
          persona2_id: asignacion2.id
        }),
      })

      const result = await res.json()

      if (!result.success) {
        throw new Error(result.error || 'Error al intercambiar')
      }

      // Reload data once
      await loadData()
      
    } catch (err) {
      console.error('❌ ERROR EN SWAP:', err)
      alert(`❌ Error al intercambiar personas:\n\n${err instanceof Error ? err.message : 'Error desconocido'}`)
    }
  }

  // Handle change table capacity
  const handleChangeCapacidad = async (numeroMesa: number, nuevaCapacidad: number) => {
    try {
      const res = await fetch('/api/admin/mesas/configuracion', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          numero_mesa: numeroMesa,
          capacidad: nuevaCapacidad
        }),
      })

      const result = await res.json()

      if (!result.success) {
        alert(`❌ ${result.error}`)
        return
      }

      // Reload data to ensure consistency
      await loadData()
      
    } catch (err) {
      console.error('Error changing capacity:', err)
      alert(`❌ Error al cambiar capacidad:\n\n${err instanceof Error ? err.message : 'Error desconocido'}`)
    }
  }

  // Handle reorder tables (drag & drop)
  const handleReordenarMesas = async (draggedMesa: number, targetMesa: number, insertBefore: boolean) => {
    try {
      const res = await fetch('/api/admin/mesas/reordenar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          draggedMesa,
          targetMesa,
          insertBefore
        }),
      })

      const result = await res.json()

      if (!result.success) {
        alert(`❌ ${result.error}`)
        return
      }

      // Reload data to reflect new order
      await loadData()
      
    } catch (err) {
      console.error('Error reordering tables:', err)
      alert(`❌ Error al reordenar mesas:\n\n${err instanceof Error ? err.message : 'Error desconocido'}`)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-rose-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando distribución de mesas...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-6 bg-red-50 border border-red-200 rounded-lg">
        <p className="text-red-600">Error: {error}</p>
        <Button onClick={loadData} className="mt-4">
          Reintentar
        </Button>
      </div>
    )
  }

  return (
    <div className="relative">
      {/* Header with stats and filters */}
      <div className="mb-6 space-y-4">
        {/* Statistics */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-4 rounded-lg border border-blue-200">
            <div className="text-2xl font-bold text-blue-700">{totalAsignadas}</div>
            <div className="text-sm text-blue-600">Asignadas</div>
          </div>
          <div className="bg-gradient-to-br from-rose-50 to-rose-100 p-4 rounded-lg border border-rose-200">
            <div className="text-2xl font-bold text-rose-700">{totalSinAsignar}</div>
            <div className="text-sm text-rose-600">Sin asignar</div>
          </div>
          <div className="bg-gradient-to-br from-green-50 to-green-100 p-4 rounded-lg border border-green-200">
            <div className="text-2xl font-bold text-green-700">{mesasCompletas}</div>
            <div className="text-sm text-green-600">Mesas completas</div>
          </div>
          <div className="bg-gradient-to-br from-amber-50 to-amber-100 p-4 rounded-lg border border-amber-200">
            <div className="text-2xl font-bold text-amber-700">{mesasParciales}</div>
            <div className="text-sm text-amber-600">Mesas parciales</div>
          </div>
          <div className="bg-gradient-to-br from-gray-50 to-gray-100 p-4 rounded-lg border border-gray-200">
            <div className="text-2xl font-bold text-gray-700">{mesasVacias}</div>
            <div className="text-sm text-gray-600">Mesas vacías</div>
          </div>
        </div>

        {/* Filters */}
        <div className="space-y-3">
          {/* Capacity filter */}
          <div className="flex items-center gap-4 flex-wrap">
            <span className="text-sm font-medium text-gray-700">Capacidad:</span>
            <div className="flex gap-2">
              <button
                onClick={() => setCapacidadFilter('all')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  capacidadFilter === 'all'
                    ? 'bg-rose-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Todas ({mesas.length})
              </button>
              <button
                onClick={() => setCapacidadFilter(8)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  capacidadFilter === 8
                    ? 'bg-slate-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                👥 8 ({mesas8})
              </button>
              <button
                onClick={() => setCapacidadFilter(9)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  capacidadFilter === 9
                    ? 'bg-amber-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                👥 9 ({mesas9})
              </button>
              <button
                onClick={() => setCapacidadFilter(10)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  capacidadFilter === 10
                    ? 'bg-emerald-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                👥 10 ({mesas10})
              </button>
            </div>
          </div>

          {/* De quien filter */}
          <div className="flex items-center gap-4 flex-wrap">
            <span className="text-sm font-medium text-gray-700">Invitado de:</span>
            <div className="flex gap-2">
              <button
                onClick={() => setDeQuienFilter('all')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  deQuienFilter === 'all'
                    ? 'bg-rose-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Todos
              </button>
              <button
                onClick={() => setDeQuienFilter('jaime')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  deQuienFilter === 'jaime'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Jaime
              </button>
              <button
                onClick={() => setDeQuienFilter('alejandra')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  deQuienFilter === 'alejandra'
                    ? 'bg-pink-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Alejandra
              </button>
            </div>
            <Button onClick={loadData} variant="outline" size="sm" className="ml-auto">
              🔄 Actualizar
            </Button>
          </div>

          {/* Export buttons */}
          <div className="flex items-center gap-3 flex-wrap">
            <span className="text-sm font-medium text-gray-700">Exportar:</span>
            <a
              href="/api/admin/mesas/export-alfabetico"
              download
              className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors inline-flex items-center gap-2"
            >
              📥 Lista Alfabética (Meseros)
            </a>
            <a
              href="/api/admin/mesas/export-por-mesa"
              download
              className="px-4 py-2 bg-purple-600 text-white rounded-lg text-sm font-medium hover:bg-purple-700 transition-colors inline-flex items-center gap-2"
            >
              📥 Lista por Mesas (Wedding Planner)
            </a>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className={`transition-all duration-300 ${sidebarCollapsed ? 'mr-0' : 'mr-0 lg:mr-80'}`}>
        <MesasGrid
          mesas={filteredMesas}
          onAsignarPersona={handleAsignarPersona}
          onRemoverPersona={handleRemoverPersona}
          onDropPersona={handleDropPersona}
          onSwapPersonas={handleSwapPersonas}
          onChangeCapacidad={handleChangeCapacidad}
          onReordenarMesas={handleReordenarMesas}
        />
      </div>

      {/* Sidebar - personas sin asignar */}
      <PersonasSinAsignar
        personas={personasSinAsignar}
        isCollapsed={sidebarCollapsed}
        onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
        onAsignarPersona={handleAsignarFromSidebar}
      />

      {/* Assign modal */}
      {showAsignarModal && selectedMesa && (
        <AsignarPersonaModal
          isOpen={showAsignarModal}
          onClose={() => {
            setShowAsignarModal(false)
            setSelectedMesa(null)
          }}
          numeroMesa={selectedMesa.numero}
          posicionSilla={selectedMesa.posicion}
          personasSinAsignar={personasSinAsignar}
          onAsignar={handleAsignarFromModal}
        />
      )}
    </div>
  )
}

