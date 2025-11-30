/**
 * MesaCircular - Circular table component for desktop view
 * Displays chairs (8, 9, or 10) around a circular table with dynamic sizing
 */
'use client'

import { Mesa, AsignacionMesa } from '@/types'
import SillaPersona from './SillaPersona'

interface MesaCircularProps {
  mesa: Mesa
  onAsignarPersona: (numeroMesa: number, posicionSilla: number) => void
  onRemoverPersona: (asignacionId: string) => void
  onDropPersona?: (numeroMesa: number, posicionSilla: number, data: Record<string, unknown>) => void
  onSwapPersonas?: (asignacion1: AsignacionMesa, asignacion2: AsignacionMesa) => void
  onChangeCapacidad?: (numeroMesa: number, nuevaCapacidad: number) => void
  onReordenarMesa?: (draggedMesa: number, targetMesa: number, insertBefore: boolean) => void
}

export default function MesaCircular({ mesa, onAsignarPersona, onRemoverPersona, onDropPersona, onSwapPersonas, onChangeCapacidad, onReordenarMesa }: MesaCircularProps) {
  // Create array of positions with their assignments (dynamic based on capacidad)
  const posiciones = Array.from({ length: mesa.capacidad }, (_, i) => {
    const posicion = i + 1
    const asignacion = mesa.asignaciones.find(a => a.posicion_silla === posicion)
    return { posicion, asignacion }
  })

  // Get table size based on capacity
  const getTableSize = () => {
    if (mesa.capacidad === 10) return { container: 'w-96 h-96', radius: 150, center: 'w-36 h-36' }
    if (mesa.capacidad === 9) return { container: 'w-88 h-88', radius: 135, center: 'w-34 h-34' }
    return { container: 'w-80 h-80', radius: 120, center: 'w-32 h-32' } // default 8
  }

  // Get color based on capacity
  const getCapacityBgColor = () => {
    if (mesa.capacidad === 10) return 'from-emerald-50 to-teal-50'
    if (mesa.capacidad === 9) return 'from-amber-50 to-yellow-50'
    return 'from-gray-50 to-slate-50' // default 8
  }

  // Determine table status color
  const getStatusColor = () => {
    if (mesa.ocupadas === 0) return 'border-gray-300 bg-gray-50'
    if (mesa.ocupadas === mesa.capacidad) return 'border-green-400 bg-green-50'
    return 'border-blue-400 bg-blue-50'
  }

  const getStatusText = () => {
    if (mesa.ocupadas === 0) return 'Vacía'
    if (mesa.ocupadas === mesa.capacidad) return 'Completa'
    return `${mesa.ocupadas}/${mesa.capacidad}`
  }

  const tableSize = getTableSize()

  const displayNumber = mesa.numeroDisplay || mesa.numero

  return (
    <div className="flex flex-col items-center">
      {/* Table number header with capacity selector */}
      <div className="mb-4 text-center space-y-2">
        <div className="flex items-center justify-center gap-3">
          <h3 className="text-lg font-bold text-gray-900">Mesa {displayNumber}</h3>
          {onChangeCapacidad && (
            <select
              value={mesa.capacidad}
              onChange={(e) => onChangeCapacidad(mesa.numero, Number(e.target.value))}
              className="text-xs border border-gray-300 rounded px-2 py-1 bg-white hover:border-rose-400 focus:outline-none focus:ring-2 focus:ring-rose-500 cursor-pointer"
              title="Cambiar capacidad"
            >
              <option value={8}>👥 8</option>
              <option value={9}>👥 9</option>
              <option value={10}>👥 10</option>
            </select>
          )}
        </div>
        <span className={`text-sm font-medium ${
          mesa.ocupadas === mesa.capacidad ? 'text-green-600' : 
          mesa.ocupadas === 0 ? 'text-gray-500' : 
          'text-blue-600'
        }`}>
          {getStatusText()}
        </span>
      </div>

      {/* Circular table with chairs - DYNAMIC SIZE */}
      <div className={`relative ${tableSize.container} bg-gradient-to-br ${getCapacityBgColor()} rounded-lg p-4`}>
        {/* Center circle (table) - DRAGGABLE for reordering */}
        <div 
          draggable={!!onReordenarMesa}
          onDragStart={(e) => {
            if (onReordenarMesa) {
              e.dataTransfer.setData('mesa-reorder', mesa.numero.toString())
              e.dataTransfer.effectAllowed = 'move'
              e.currentTarget.classList.add('opacity-50', 'scale-95')
            }
          }}
          onDragEnd={(e) => {
            e.currentTarget.classList.remove('opacity-50', 'scale-95')
          }}
          className={`absolute inset-0 m-auto ${tableSize.center} rounded-full border-4 ${getStatusColor()} shadow-lg flex items-center justify-center transition-all z-0 ${onReordenarMesa ? 'cursor-move hover:ring-4 hover:ring-rose-300 hover:scale-105' : ''}`}
          title={onReordenarMesa ? 'Arrastra para reordenar mesas' : undefined}
        >
          <div className="text-center pointer-events-none">
            <div className="text-3xl font-bold text-gray-700">{displayNumber}</div>
            <div className="text-xs text-gray-500 mt-1">{mesa.ocupadas}/{mesa.capacidad}</div>
            {mesa.numeroDisplay && (
              <div className="text-[8px] text-gray-400 mt-0.5">ID: {mesa.numero}</div>
            )}
          </div>
        </div>

        {/* Chairs positioned around the circle - DYNAMIC POSITIONING */}
        {posiciones.map(({ posicion, asignacion }) => (
          <SillaPersona
            key={posicion}
            asignacion={asignacion}
            posicion={posicion}
            capacidad={mesa.capacidad}
            radius={tableSize.radius}
            numeroMesa={mesa.numero}
            onRemove={onRemoverPersona}
            onClick={() => {
              if (!asignacion) {
                onAsignarPersona(mesa.numero, posicion)
              }
            }}
            onDrop={onDropPersona}
            onSwap={onSwapPersonas}
          />
        ))}
      </div>

      {/* Available slots indicator */}
      {mesa.disponibles > 0 && mesa.disponibles < mesa.capacidad && (
        <div className="mt-4 text-xs text-gray-600">
          {mesa.disponibles} {mesa.disponibles === 1 ? 'lugar disponible' : 'lugares disponibles'}
        </div>
      )}
    </div>
  )
}

