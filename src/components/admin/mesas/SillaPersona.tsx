/**
 * SillaPersona - Individual chair component for circular table
 * Shows person name, dietary restrictions, and couple indicator
 */
'use client'

import { AsignacionMesa } from '@/types'

interface SillaPersonaProps {
  asignacion?: AsignacionMesa | null
  posicion: number
  capacidad?: number // Dynamic capacity (8, 9, or 10)
  radius?: number // Dynamic radius
  numeroMesa: number
  onRemove?: (id: string) => void
  onClick?: () => void
  onDrop?: (numeroMesa: number, posicionSilla: number, data: Record<string, unknown>) => void
  onSwap?: (asignacion1: AsignacionMesa, asignacion2: AsignacionMesa) => void
}

export default function SillaPersona({ asignacion, posicion, capacidad = 8, radius = 120, numeroMesa, onRemove, onClick, onDrop, onSwap }: SillaPersonaProps) {
  // Calculate position on circle (dynamic based on capacity)
  const angle = (posicion - 1) * (360 / capacidad) - 90 // Distribute evenly, start at top (270°)
  const x = Math.cos((angle * Math.PI) / 180) * radius
  const y = Math.sin((angle * Math.PI) / 180) * radius

  const isEmpty = !asignacion

  // Color mapping for couples
  const colorClasses = {
    blue: 'border-blue-400 bg-blue-50',
    green: 'border-green-400 bg-green-50',
    purple: 'border-purple-400 bg-purple-50',
    pink: 'border-pink-400 bg-pink-50',
  }

  const borderColor = asignacion?.color_pareja
    ? colorClasses[asignacion.color_pareja]
    : 'border-gray-300 bg-white'

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    const personaData = e.dataTransfer.getData('persona')
    const asignacionData = e.dataTransfer.getData('asignacion')
    
    if (!personaData && !asignacionData) return

    try {
      // If dropping on empty chair
      if (isEmpty && onDrop) {
        const parsedData = JSON.parse(personaData || asignacionData)
        onDrop(numeroMesa, posicion, parsedData)
      }
      // If dropping on occupied chair
      else if (!isEmpty && asignacion) {
        // Check if it's from sidebar (persona) or from another table (asignacion)
        if (personaData) {
          // From sidebar: replace the person
          const parsedData = JSON.parse(personaData)
          if (onDrop) {
            onDrop(numeroMesa, posicion, { ...parsedData, replace_existing: asignacion.id })
          }
        } else if (asignacionData) {
          // From another table: swap
          const parsedData = JSON.parse(asignacionData)
          if (onSwap && parsedData.id) {
            onSwap(asignacion, parsedData)
          }
        }
      }
    } catch (err) {
      console.error('Error parsing drop data:', err)
    }
  }

  return (
    <div
      className="absolute"
      style={{
        left: `calc(50% + ${x}px)`,
        top: `calc(50% + ${y}px)`,
        transform: 'translate(-50%, -50%)',
      }}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
    >
      {isEmpty ? (
        // Empty chair - drop zone
        <div
          onClick={onClick}
          className="w-20 h-20 rounded-full border-2 border-dashed border-gray-300 bg-gray-50 hover:bg-gray-100 hover:border-gray-400 transition-all flex items-center justify-center group cursor-pointer"
          title="Asignar persona (click o arrastra aquí)"
        >
          <span className="text-2xl text-gray-400 group-hover:text-gray-600">+</span>
        </div>
      ) : (
        // Occupied chair - draggable and drop zone
        <div 
          className="relative group hover:z-[9999] z-10"
          draggable
          onDragStart={(e) => {
            e.dataTransfer.setData('asignacion', JSON.stringify(asignacion))
            e.dataTransfer.effectAllowed = 'move'
          }}
        >
          <div
            className={`w-20 h-20 rounded-full border-2 ${borderColor} shadow-sm hover:shadow-md transition-all flex flex-col items-center justify-center p-1 cursor-move`}
            onClick={onClick}
            title="Arrastra para mover o intercambiar"
          >
            {/* Person name - full name */}
            <span className="text-xs font-medium text-gray-800 text-center leading-tight line-clamp-2 px-1">
              {asignacion.nombre_persona}
            </span>

            {/* Dietary restriction badge */}
            {asignacion.restriccion_alimentaria && (
              <span
                className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-amber-100 border-2 border-amber-300 flex items-center justify-center text-xs"
                title={`Restricción: ${asignacion.restriccion_alimentaria}`}
              >
                🌾
              </span>
            )}
          </div>

          {/* Tooltip on hover - Always on top */}
          <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-900 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap shadow-lg" style={{ zIndex: 9999 }}>
            <div className="font-semibold">{asignacion.nombre_persona}</div>
            {asignacion.restriccion_alimentaria && (
              <div className="text-amber-300">🌾 {asignacion.restriccion_alimentaria}</div>
            )}
            {asignacion.acompanante_id && (
              <div className="text-gray-300">Tiene acompañante</div>
            )}
            {/* Arrow */}
            <div className="absolute top-full left-1/2 transform -translate-x-1/2 -mt-1">
              <div className="border-4 border-transparent border-t-gray-900"></div>
            </div>
          </div>

          {/* Remove button on hover - Large and easy to click */}
          {onRemove && (
            <button
              onClick={(e) => {
                e.stopPropagation()
                onRemove(asignacion.id)
              }}
              className="absolute -top-3 -right-3 w-7 h-7 rounded-full bg-red-500 text-white opacity-0 group-hover:opacity-100 transition-all hover:bg-red-600 hover:scale-110 flex items-center justify-center text-lg font-bold shadow-lg border-2 border-white"
              style={{ zIndex: 9999 }}
              title="Quitar de mesa"
            >
              ×
            </button>
          )}
        </div>
      )}
    </div>
  )
}

