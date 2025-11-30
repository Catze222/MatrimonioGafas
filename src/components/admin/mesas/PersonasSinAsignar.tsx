/**
 * PersonasSinAsignar - Sidebar showing unassigned people
 * Allows filtering and searching for people to assign to tables
 */
'use client'

import { useState } from 'react'
import { PersonaSinAsignar } from '@/types'

interface PersonasSinAsignarProps {
  personas: PersonaSinAsignar[]
  isCollapsed: boolean
  onToggleCollapse: () => void
  onAsignarPersona: (persona: PersonaSinAsignar) => void
}

export default function PersonasSinAsignar({
  personas,
  isCollapsed,
  onToggleCollapse,
  onAsignarPersona,
}: PersonasSinAsignarProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<'all' | 'confirmados' | 'pendientes'>('all')
  const [deQuienFilter, setDeQuienFilter] = useState<'all' | 'jaime' | 'alejandra'>('all')

  // Filter personas
  const filteredPersonas = personas.filter((persona) => {
    // Search filter
    const matchesSearch = persona.nombre.toLowerCase().includes(searchTerm.toLowerCase())
    if (!matchesSearch) return false

    // Status filter (only confirmados and pendientes)
    if (statusFilter === 'confirmados' && persona.asistencia !== 'si') return false
    if (statusFilter === 'pendientes' && persona.asistencia !== 'pendiente') return false

    // De quien filter (case-insensitive)
    if (deQuienFilter !== 'all' && persona.de_quien?.toLowerCase() !== deQuienFilter.toLowerCase()) return false

    return true
  })

  // Count by status (only showing confirmados and pendientes)
  const confirmados = personas.filter(p => p.asistencia === 'si').length
  const pendientes = personas.filter(p => p.asistencia === 'pendiente').length

  // Status icon and color
  const getStatusIcon = (asistencia: string) => {
    if (asistencia === 'si') return '✅'
    if (asistencia === 'pendiente') return '⏳'
    return '❌'
  }

  const getStatusColor = (asistencia: string) => {
    if (asistencia === 'si') return 'text-green-600'
    if (asistencia === 'pendiente') return 'text-gray-500'
    return 'text-red-600'
  }

  if (isCollapsed) {
    return (
      <div className="fixed right-0 top-32 z-20">
        <button
          onClick={onToggleCollapse}
          className="bg-rose-600 text-white px-3 py-6 rounded-l-lg shadow-lg hover:bg-rose-700 transition-colors flex flex-col items-center gap-2"
          title="Mostrar personas sin asignar"
        >
          <span className="text-sm font-bold">{personas.length}</span>
          <span className="text-xs writing-mode-vertical">Sin asignar</span>
          <span>←</span>
        </button>
      </div>
    )
  }

  return (
    <div className="fixed right-0 top-0 h-screen w-80 bg-white border-l border-gray-200 shadow-xl z-20 flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-gray-200 bg-gradient-to-r from-rose-50 to-pink-50">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-lg font-bold text-gray-900">Sin Asignar</h3>
          <button
            onClick={onToggleCollapse}
            className="text-gray-600 hover:text-gray-900 p-1"
            title="Ocultar panel"
          >
            →
          </button>
        </div>
        <div className="text-2xl font-bold text-rose-600">{personas.length}</div>
        <div className="text-xs text-gray-600">personas sin mesa</div>
      </div>

      {/* Search */}
      <div className="p-4 border-b border-gray-200">
        <input
          type="text"
          placeholder="🔍 Buscar persona..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent text-sm"
        />
      </div>

      {/* De quien filter */}
      <div className="p-4 border-b border-gray-200">
        <div className="text-xs font-semibold text-gray-600 mb-2 uppercase">Invitado de:</div>
        <div className="grid grid-cols-3 gap-2">
          <button
            onClick={() => setDeQuienFilter('all')}
            className={`px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
              deQuienFilter === 'all'
                ? 'bg-rose-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Todos
          </button>
          <button
            onClick={() => setDeQuienFilter('jaime')}
            className={`px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
              deQuienFilter === 'jaime'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Jaime
          </button>
          <button
            onClick={() => setDeQuienFilter('alejandra')}
            className={`px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
              deQuienFilter === 'alejandra'
                ? 'bg-pink-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Alejandra
          </button>
        </div>
      </div>

      {/* Status filters - Only confirmados and pendientes */}
      <div className="p-4 border-b border-gray-200 space-y-2">
        <div className="text-xs font-semibold text-gray-600 mb-2 uppercase">Estado:</div>
        <button
          onClick={() => setStatusFilter('all')}
          className={`w-full text-left px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
            statusFilter === 'all'
              ? 'bg-rose-100 text-rose-700'
              : 'bg-gray-50 text-gray-700 hover:bg-gray-100'
          }`}
        >
          Todos ({personas.length})
        </button>
        <button
          onClick={() => setStatusFilter('confirmados')}
          className={`w-full text-left px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
            statusFilter === 'confirmados'
              ? 'bg-green-100 text-green-700'
              : 'bg-gray-50 text-gray-700 hover:bg-gray-100'
          }`}
        >
          ✅ Confirmados ({confirmados})
        </button>
        <button
          onClick={() => setStatusFilter('pendientes')}
          className={`w-full text-left px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
            statusFilter === 'pendientes'
              ? 'bg-amber-100 text-amber-700'
              : 'bg-gray-50 text-gray-700 hover:bg-gray-100'
          }`}
        >
          ⏳ Pendientes ({pendientes})
        </button>
      </div>

      {/* List of people */}
      <div className="flex-1 overflow-y-auto p-4 space-y-2">
        {filteredPersonas.length === 0 ? (
          <div className="text-center py-8 text-gray-400">
            <p className="text-sm">
              {searchTerm ? 'No se encontraron personas' : 'No hay personas sin asignar'}
            </p>
          </div>
        ) : (
          filteredPersonas.map((persona) => (
            <div
              key={persona.id}
              draggable
              onDragStart={(e) => {
                e.dataTransfer.setData('persona', JSON.stringify(persona))
                e.dataTransfer.effectAllowed = 'move'
              }}
              onClick={() => onAsignarPersona(persona)}
              className="w-full text-left p-3 rounded-lg border border-gray-200 hover:border-rose-400 hover:bg-rose-50 transition-all group cursor-move"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  {/* Name and status */}
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`text-xs ${getStatusColor(persona.asistencia)}`}>
                      {getStatusIcon(persona.asistencia)}
                    </span>
                    <span className="text-sm font-medium text-gray-900 truncate">
                      {persona.nombre}
                    </span>
                  </div>

                  {/* Indicators */}
                  <div className="flex flex-wrap items-center gap-2 text-xs">
                    {persona.es_pareja && (
                      <span className="px-2 py-0.5 bg-rose-100 text-rose-700 rounded-full font-medium">
                        Pareja
                      </span>
                    )}
                    {persona.restriccion_alimentaria && (
                      <span
                        className="px-2 py-0.5 bg-amber-100 text-amber-700 rounded-full"
                        title={persona.restriccion_alimentaria}
                      >
                        🌾
                      </span>
                    )}
                    <span className={`px-2 py-0.5 rounded-full ${
                      persona.de_quien?.toLowerCase() === 'jaime'
                        ? 'bg-blue-100 text-blue-700'
                        : 'bg-pink-100 text-pink-700'
                    }`}>
                      {persona.de_quien?.toLowerCase() === 'jaime' ? 'Jaime' : 'Alejandra'}
                    </span>
                  </div>
                </div>

                {/* Add icon */}
                <div className="flex-shrink-0 w-6 h-6 rounded-full bg-gray-200 group-hover:bg-rose-500 flex items-center justify-center transition-colors">
                  <span className="text-gray-600 group-hover:text-white text-sm">+</span>
                </div>
              </div>

              {/* Dietary restriction tooltip */}
              {persona.restriccion_alimentaria && (
                <div className="mt-2 text-xs text-amber-700 bg-amber-50 px-2 py-1 rounded">
                  🌾 {persona.restriccion_alimentaria}
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  )
}

