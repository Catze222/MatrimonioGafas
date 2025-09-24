/**
 * Modern Quick confirmation modal with beautiful UX
 * Shows confirmation options clearly with modern design
 */
'use client'

import { useState } from 'react'
import Modal from '@/components/ui/Modal'
import { Invitado } from '@/types'

interface QuickConfirmationModalProps {
  isOpen: boolean
  onClose: () => void
  invitado: Invitado | null
  person: 'persona1' | 'persona2'
  onConfirm: (status: 'pendiente' | 'si' | 'no') => Promise<void>
}

export default function QuickConfirmationModal({
  isOpen,
  onClose,
  invitado,
  person,
  onConfirm
}: QuickConfirmationModalProps) {
  const [updating, setUpdating] = useState(false)
  const [selectedStatus, setSelectedStatus] = useState<'pendiente' | 'si' | 'no' | null>(null)

  if (!invitado) return null

  const personName = person === 'persona1' ? invitado.nombre_1 : invitado.nombre_2
  const currentStatus = person === 'persona1' ? invitado.asistencia_1 : invitado.asistencia_2

  const handleConfirm = async () => {
    if (!selectedStatus || selectedStatus === currentStatus) {
      onClose()
      return
    }

    setUpdating(true)
    try {
      await onConfirm(selectedStatus)
      onClose()
    } catch (error) {
      console.error('Error updating status:', error)
    } finally {
      setUpdating(false)
      setSelectedStatus(null)
    }
  }

  const options = [
    {
      value: 'si' as const,
      label: 'Confirmado',
      description: 'Sí asistirá al evento',
      icon: '✅',
      color: 'green',
      bgColor: 'bg-green-50',
      borderColor: 'border-green-200',
      selectedBg: 'bg-green-100',
      selectedBorder: 'border-green-500',
      textColor: 'text-green-700'
    },
    {
      value: 'no' as const,
      label: 'No asistirá',
      description: 'No podrá asistir al evento',
      icon: '❌',
      color: 'red',
      bgColor: 'bg-red-50',
      borderColor: 'border-red-200',
      selectedBg: 'bg-red-100',
      selectedBorder: 'border-red-500',
      textColor: 'text-red-700'
    },
    {
      value: 'pendiente' as const,
      label: 'Pendiente',
      description: 'Aún no ha confirmado',
      icon: '🟡',
      color: 'yellow',
      bgColor: 'bg-yellow-50',
      borderColor: 'border-yellow-200',
      selectedBg: 'bg-yellow-100',
      selectedBorder: 'border-yellow-500',
      textColor: 'text-yellow-700'
    }
  ]

  const statusToUpdate = selectedStatus || currentStatus

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title=""
      size="sm"
      showCloseButton={false}
    >
      <div className="p-4 space-y-4">
        {/* Header - Más compacto */}
        <div className="text-center">
          <div className="w-12 h-12 mx-auto mb-3 bg-gradient-to-br from-rose-500 to-pink-500 rounded-full flex items-center justify-center">
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          </div>
          <h3 className="text-lg font-bold text-gray-900 mb-1">
            Confirmar Asistencia
          </h3>
          <p className="text-base text-gray-700 font-medium">
            {personName}
          </p>
          <p className="text-xs text-gray-500 mt-1">
            Actual: <span className={`font-medium ${
              currentStatus === 'si' ? 'text-green-600' :
              currentStatus === 'no' ? 'text-red-600' :
              'text-yellow-600'
            }`}>
              {currentStatus === 'si' ? 'Confirmado' :
               currentStatus === 'no' ? 'No asiste' :
               'Pendiente'}
            </span>
          </p>
        </div>

        {/* Options - Minimalistas y claras */}
        <div className="space-y-2">
          {options.map((option) => {
            const isSelected = selectedStatus === option.value
            const isCurrent = currentStatus === option.value

            return (
              <button
                key={option.value}
                onClick={() => setSelectedStatus(option.value)}
                disabled={updating}
                className={`w-full p-3 rounded-lg border transition-all duration-200 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed ${
                  isSelected 
                    ? 'border-gray-800 bg-gray-900 text-white shadow-sm' 
                    : isCurrent
                      ? 'border-gray-400 bg-white text-gray-900 ring-1 ring-gray-300'
                      : 'border-gray-200 bg-white text-gray-900 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <span className="text-base">{option.icon}</span>
                    <span className={`font-medium text-sm ${isSelected ? 'text-white' : 'text-gray-900'}`}>
                      {option.label}
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    {isCurrent && !isSelected && (
                      <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full font-medium">
                        Actual
                      </span>
                    )}
                    {isSelected && (
                      <div className="w-5 h-5 bg-white rounded-full flex items-center justify-center">
                        <svg className="w-3 h-3 text-gray-900" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      </div>
                    )}
                  </div>
                </div>
              </button>
            )
          })}
        </div>

        {/* Actions - Más compactos */}
        <div className="flex space-x-3 pt-3 border-t border-gray-100">
          <button
            onClick={onClose}
            disabled={updating}
            className="flex-1 px-4 py-2 text-sm text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg font-medium transition-colors disabled:opacity-50"
          >
            Cancelar
          </button>
          <button
            onClick={handleConfirm}
            disabled={updating || (!selectedStatus && currentStatus)}
            className={`flex-1 px-4 py-2 text-sm rounded-lg font-medium transition-all disabled:opacity-50 ${
              selectedStatus && selectedStatus !== currentStatus
                ? 'bg-gradient-to-r from-rose-500 to-pink-500 text-white hover:from-rose-600 hover:to-pink-600 shadow-md'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
          >
            {updating ? (
              <div className="flex items-center justify-center">
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Actualizando...
              </div>
            ) : selectedStatus && selectedStatus !== currentStatus ? (
              'Confirmar'
            ) : (
              'Sin Cambios'
            )}
          </button>
        </div>
      </div>
    </Modal>
  )
}
