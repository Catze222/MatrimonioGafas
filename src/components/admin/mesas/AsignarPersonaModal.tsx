/**
 * AsignarPersonaModal - Modal to assign person(s) to a table
 * Handles single person or couple assignment
 */
'use client'

import { useState, useEffect } from 'react'
import Modal from '@/components/ui/Modal'
import Button from '@/components/ui/Button'
import { PersonaSinAsignar } from '@/types'

interface AsignarPersonaModalProps {
  isOpen: boolean
  onClose: () => void
  numeroMesa: number
  posicionSilla?: number
  personasSinAsignar: PersonaSinAsignar[]
  onAsignar: (data: {
    invitado_id: string
    numero_mesa: number
    persona_index: number
    nombre_persona: string
    restriccion_alimentaria?: string | null
    acompanante_data?: {
      invitado_id: string
      persona_index: number
      nombre_persona: string
      restriccion_alimentaria?: string | null
    }
  }) => Promise<void>
}

export default function AsignarPersonaModal({
  isOpen,
  onClose,
  numeroMesa,
  posicionSilla,
  personasSinAsignar,
  onAsignar,
}: AsignarPersonaModalProps) {
  const [selectedPersonaId, setSelectedPersonaId] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [searchTerm, setSearchTerm] = useState('')
  const [deQuienFilter, setDeQuienFilter] = useState<'all' | 'jaime' | 'alejandra'>('all')

  // Reset on open
  useEffect(() => {
    if (isOpen) {
      setSelectedPersonaId('')
      setError('')
      setSearchTerm('')
      setDeQuienFilter('all')
    }
  }, [isOpen])

  const selectedPersona = personasSinAsignar.find(p => p.id === selectedPersonaId)

  // Filter personas by search and de_quien (case-insensitive)
  const filteredPersonas = personasSinAsignar.filter(p => {
    const matchesSearch = p.nombre.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesDeQuien = deQuienFilter === 'all' || p.de_quien?.toLowerCase() === deQuienFilter.toLowerCase()
    
    return matchesSearch && matchesDeQuien
  })

  const handleAsignar = async () => {
    if (!selectedPersona) {
      setError('Por favor selecciona una persona')
      return
    }

    setLoading(true)
    setError('')

    try {
      let data: Record<string, unknown>

      // If it's a couple (es_pareja = true) - ALWAYS assign both
      if (selectedPersona.es_pareja) {
        const [nombre1, nombre2] = selectedPersona.nombre.split(' & ')
        
        data = {
          invitado_id: selectedPersona.invitado_id,
          numero_mesa: numeroMesa,
          persona_index: 1,
          nombre_persona: nombre1,
          restriccion_alimentaria: selectedPersona.restriccion_alimentaria,
          acompanante_data: {
            invitado_id: selectedPersona.invitado_id,
            persona_index: 2,
            nombre_persona: nombre2,
            restriccion_alimentaria: selectedPersona.restriccion_alimentaria,
          }
        }

        if (posicionSilla) {
          data.posicion_silla = posicionSilla
        }

        console.log('📝 Asignando pareja completa:', { nombre1, nombre2, mesa: numeroMesa, posicion: posicionSilla })
      } 
      // Single person
      else {
        data = {
          invitado_id: selectedPersona.invitado_id,
          numero_mesa: numeroMesa,
          persona_index: selectedPersona.persona_index,
          nombre_persona: selectedPersona.nombre,
          restriccion_alimentaria: selectedPersona.restriccion_alimentaria,
        }

        if (posicionSilla) {
          data.posicion_silla = posicionSilla
        }

        console.log('📝 Asignando persona individual:', { nombre: selectedPersona.nombre, mesa: numeroMesa, posicion: posicionSilla })
      }

      await onAsignar(data)
      onClose()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al asignar persona')
    } finally {
      setLoading(false)
    }
  }

  const getStatusIcon = (asistencia: string) => {
    if (asistencia === 'si') return '✅'
    if (asistencia === 'pendiente') return '⏳'
    return '❌'
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`Asignar a Mesa ${numeroMesa}`} size="lg">
      <div className="space-y-4">
        {/* Search */}
        <div>
          <input
            type="text"
            placeholder="🔍 Buscar persona..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent"
          />
        </div>

        {/* De quien filter */}
        <div className="flex gap-2">
          <button
            onClick={() => setDeQuienFilter('all')}
            className={`flex-1 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              deQuienFilter === 'all'
                ? 'bg-rose-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Todos
          </button>
          <button
            onClick={() => setDeQuienFilter('jaime')}
            className={`flex-1 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              deQuienFilter === 'jaime'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Jaime
          </button>
          <button
            onClick={() => setDeQuienFilter('alejandra')}
            className={`flex-1 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              deQuienFilter === 'alejandra'
                ? 'bg-pink-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Alejandra
          </button>
        </div>

        {/* Person selector */}
        <div className="max-h-96 overflow-y-auto space-y-2 border border-gray-200 rounded-lg p-3">
          {filteredPersonas.length === 0 ? (
            <p className="text-center text-gray-500 py-4">No hay personas disponibles</p>
          ) : (
            filteredPersonas.map((persona) => (
              <button
                key={persona.id}
                onClick={() => setSelectedPersonaId(persona.id)}
                className={`w-full text-left p-3 rounded-lg border-2 transition-all ${
                  selectedPersonaId === persona.id
                    ? 'border-rose-500 bg-rose-50'
                    : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs">{getStatusIcon(persona.asistencia)}</span>
                      <span className="font-medium text-gray-900">{persona.nombre}</span>
                      {persona.es_pareja && (
                        <span className="px-2 py-0.5 bg-rose-100 text-rose-700 rounded-full text-xs font-medium">
                          Pareja
                        </span>
                      )}
                    </div>
                    <div className="flex flex-wrap items-center gap-2 text-xs">
                      {persona.restriccion_alimentaria && (
                        <span className="px-2 py-0.5 bg-amber-100 text-amber-700 rounded-full">
                          🌾 {persona.restriccion_alimentaria}
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
                  {selectedPersonaId === persona.id && (
                    <div className="flex-shrink-0 w-6 h-6 rounded-full bg-rose-500 flex items-center justify-center">
                      <span className="text-white text-sm">✓</span>
                    </div>
                  )}
                </div>
              </button>
            ))
          )}
        </div>

        {/* Info message for couples */}
        {selectedPersona?.es_pareja && (
          <div className="p-4 bg-pink-50 border border-pink-200 rounded-lg">
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 text-2xl">💑</div>
              <div className="flex-1">
                <div className="font-medium text-gray-900">
                  Pareja seleccionada
                </div>
                <div className="text-sm text-gray-600 mt-1">
                  Se asignarán <strong>ambas personas</strong> a la Mesa {numeroMesa} en sillas consecutivas
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Error message */}
        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-600 text-sm">{error}</p>
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-3 pt-4">
          <Button variant="outline" onClick={onClose} className="flex-1" disabled={loading}>
            Cancelar
          </Button>
          <Button
            variant="primary"
            onClick={handleAsignar}
            className="flex-1"
            loading={loading}
            disabled={!selectedPersonaId}
          >
            Asignar a Mesa {numeroMesa}
          </Button>
        </div>
      </div>
    </Modal>
  )
}

