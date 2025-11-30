/**
 * MesaCard - Card view of table for mobile devices
 * Shows table info and list of assigned people
 */
'use client'

import { Mesa } from '@/types'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'

interface MesaCardProps {
  mesa: Mesa
  onAsignarPersona: (numeroMesa: number) => void
  onRemoverPersona: (asignacionId: string) => void
  onChangeCapacidad?: (numeroMesa: number, nuevaCapacidad: number) => void
}

export default function MesaCard({ mesa, onAsignarPersona, onRemoverPersona, onChangeCapacidad }: MesaCardProps) {
  // Determine card status styling
  const getStatusColor = () => {
    if (mesa.ocupadas === 0) return 'border-l-4 border-l-gray-400'
    if (mesa.ocupadas === mesa.capacidad) return 'border-l-4 border-l-green-500'
    return 'border-l-4 border-l-blue-500'
  }

  const getStatusBadge = () => {
    if (mesa.ocupadas === 0) {
      return <span className="px-2 py-1 text-xs font-medium bg-gray-100 text-gray-700 rounded-full">Vacía</span>
    }
    if (mesa.ocupadas === mesa.capacidad) {
      return <span className="px-2 py-1 text-xs font-medium bg-green-100 text-green-700 rounded-full">Completa ✓</span>
    }
    return <span className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-700 rounded-full">{mesa.ocupadas}/{mesa.capacidad}</span>
  }

  // Get capacity badge color
  const getCapacityColor = () => {
    if (mesa.capacidad === 10) return 'bg-emerald-100 text-emerald-700'
    if (mesa.capacidad === 9) return 'bg-amber-100 text-amber-700'
    return 'bg-gray-100 text-gray-700'
  }

  // Color mapping for couples
  const colorClasses = {
    blue: 'bg-blue-50 border-blue-300',
    green: 'bg-green-50 border-green-300',
    purple: 'bg-purple-50 border-purple-300',
    pink: 'bg-pink-50 border-pink-300',
  }

  const displayNumber = mesa.numeroDisplay || mesa.numero

  return (
    <Card className={`${getStatusColor()} hover:shadow-lg transition-shadow`}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between mb-2">
          <CardTitle className="text-base">Mesa {displayNumber}</CardTitle>
          {getStatusBadge()}
        </div>
        <div className="flex items-center justify-between">
          <span className={`text-xs px-2 py-1 rounded-full ${getCapacityColor()}`}>
            👥 {mesa.capacidad} personas
          </span>
          {onChangeCapacidad && (
            <select
              value={mesa.capacidad}
              onChange={(e) => onChangeCapacidad(mesa.numero, Number(e.target.value))}
              className="text-xs border border-gray-300 rounded px-2 py-1 bg-white"
            >
              <option value={8}>8</option>
              <option value={9}>9</option>
              <option value={10}>10</option>
            </select>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-2">
        {/* List of assigned people */}
        {mesa.asignaciones.length > 0 ? (
          <div className="space-y-2">
            {mesa.asignaciones.map((asignacion) => (
              <div
                key={asignacion.id}
                className={`flex items-center justify-between p-2 rounded-lg border ${
                  asignacion.color_pareja
                    ? colorClasses[asignacion.color_pareja]
                    : 'bg-gray-50 border-gray-200'
                }`}
              >
                <div className="flex items-center gap-2 flex-1 min-w-0">
                  {/* Person name */}
                  <span className="text-sm font-medium text-gray-900 truncate">
                    {asignacion.nombre_persona}
                  </span>

                  {/* Indicators */}
                  <div className="flex items-center gap-1">
                    {asignacion.restriccion_alimentaria && (
                      <span
                        className="text-xs px-1.5 py-0.5 bg-amber-100 border border-amber-300 rounded-full"
                        title={`Restricción: ${asignacion.restriccion_alimentaria}`}
                      >
                        🌾
                      </span>
                    )}
                  </div>
                </div>

                {/* Remove button */}
                <button
                  onClick={() => onRemoverPersona(asignacion.id)}
                  className="ml-2 w-6 h-6 rounded-full bg-red-500 text-white hover:bg-red-600 flex items-center justify-center text-xs font-bold flex-shrink-0"
                  title="Quitar de mesa"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-6 text-gray-400">
            <p className="text-sm">Mesa vacía</p>
          </div>
        )}

        {/* Add person button */}
        {mesa.disponibles > 0 && (
          <button
            onClick={() => onAsignarPersona(mesa.numero)}
            className="w-full mt-3 py-2 px-4 border-2 border-dashed border-gray-300 rounded-lg text-sm text-gray-600 hover:border-rose-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
          >
            + Asignar persona ({mesa.disponibles} {mesa.disponibles === 1 ? 'lugar' : 'lugares'})
          </button>
        )}

        {/* Dietary restrictions summary */}
        {mesa.asignaciones.some(a => a.restriccion_alimentaria) && (
          <div className="mt-3 pt-3 border-t border-gray-200">
            <p className="text-xs text-gray-600 font-medium mb-1">Restricciones en esta mesa:</p>
            <div className="flex flex-wrap gap-1">
              {mesa.asignaciones
                .filter(a => a.restriccion_alimentaria)
                .map(a => (
                  <span
                    key={a.id}
                    className="text-xs px-2 py-1 bg-amber-50 text-amber-800 rounded-full border border-amber-200"
                  >
                    {a.nombre_persona.split(' ')[0]}: {a.restriccion_alimentaria}
                  </span>
                ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

