/**
 * MesasGrid - Responsive grid layout for tables
 * Desktop: Circular tables | Mobile: Card view
 */
'use client'

import { Mesa, AsignacionMesa } from '@/types'
import MesaCircular from './MesaCircular'
import MesaCard from './MesaCard'
import { useState, useEffect } from 'react'

interface MesasGridProps {
  mesas: Mesa[]
  onAsignarPersona: (numeroMesa: number, posicionSilla?: number) => void
  onRemoverPersona: (asignacionId: string) => void
  onDropPersona?: (numeroMesa: number, posicionSilla: number, data: Record<string, unknown>) => void
  onSwapPersonas?: (asignacion1: AsignacionMesa, asignacion2: AsignacionMesa) => void
  onChangeCapacidad?: (numeroMesa: number, nuevaCapacidad: number) => void
  onReordenarMesas?: (draggedMesa: number, targetMesa: number, insertBefore: boolean) => void
}

export default function MesasGrid({ mesas, onAsignarPersona, onRemoverPersona, onDropPersona, onSwapPersonas, onChangeCapacidad, onReordenarMesas }: MesasGridProps) {
  const [isMobile, setIsMobile] = useState(false)

  // Detect screen size
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1024) // lg breakpoint
    }

    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  if (isMobile) {
    // Mobile: Card view
    return (
      <div className="grid grid-cols-1 gap-4">
        {mesas.map((mesa) => (
          <MesaCard
            key={mesa.numero}
            mesa={mesa}
            onAsignarPersona={(numeroMesa) => onAsignarPersona(numeroMesa)}
            onRemoverPersona={onRemoverPersona}
            onChangeCapacidad={onChangeCapacidad}
          />
        ))}
      </div>
    )
  }

  // Desktop: Circular tables with drop zones
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-8">
      {mesas.map((mesa, index) => (
        <div key={mesa.numero} className="flex justify-center relative">
          {/* Drop zone BEFORE this mesa */}
          {onReordenarMesas && (
            <div
              className="absolute -left-4 top-0 bottom-0 w-8 z-10"
              onDragOver={(e) => {
                if (e.dataTransfer.types.includes('mesa-reorder')) {
                  e.preventDefault()
                  e.currentTarget.classList.add('bg-rose-200', 'border-l-4', 'border-rose-500')
                }
              }}
              onDragLeave={(e) => {
                e.currentTarget.classList.remove('bg-rose-200', 'border-l-4', 'border-rose-500')
              }}
              onDrop={(e) => {
                if (e.dataTransfer.types.includes('mesa-reorder')) {
                  e.preventDefault()
                  e.currentTarget.classList.remove('bg-rose-200', 'border-l-4', 'border-rose-500')
                  const draggedMesa = parseInt(e.dataTransfer.getData('mesa-reorder'))
                  if (draggedMesa !== mesa.numero) {
                    onReordenarMesas(draggedMesa, mesa.numero, true) // Insert BEFORE
                  }
                }
              }}
            />
          )}
          
          <MesaCircular
            mesa={mesa}
            onAsignarPersona={onAsignarPersona}
            onRemoverPersona={onRemoverPersona}
            onDropPersona={onDropPersona}
            onSwapPersonas={onSwapPersonas}
            onChangeCapacidad={onChangeCapacidad}
            onReordenarMesa={onReordenarMesas}
          />

          {/* Drop zone AFTER this mesa (only for last item) */}
          {onReordenarMesas && index === mesas.length - 1 && (
            <div
              className="absolute -right-4 top-0 bottom-0 w-8 z-10"
              onDragOver={(e) => {
                if (e.dataTransfer.types.includes('mesa-reorder')) {
                  e.preventDefault()
                  e.currentTarget.classList.add('bg-rose-200', 'border-r-4', 'border-rose-500')
                }
              }}
              onDragLeave={(e) => {
                e.currentTarget.classList.remove('bg-rose-200', 'border-r-4', 'border-rose-500')
              }}
              onDrop={(e) => {
                if (e.dataTransfer.types.includes('mesa-reorder')) {
                  e.preventDefault()
                  e.currentTarget.classList.remove('bg-rose-200', 'border-r-4', 'border-rose-500')
                  const draggedMesa = parseInt(e.dataTransfer.getData('mesa-reorder'))
                  if (draggedMesa !== mesa.numero) {
                    onReordenarMesas(draggedMesa, mesa.numero, false) // Insert AFTER
                  }
                }
              }}
            />
          )}
        </div>
      ))}
    </div>
  )
}

