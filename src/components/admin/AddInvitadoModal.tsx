/**
 * Modern Modal for adding new wedding guests (invitados)
 */
'use client'

import { useState } from 'react'
import Modal from '@/components/ui/Modal'
import Button from '@/components/ui/Button'
import InvitadoForm, { InvitadoFormData } from './InvitadoForm'

interface AddInvitadoModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
}

export default function AddInvitadoModal({ isOpen, onClose, onSuccess }: AddInvitadoModalProps) {
  const [loading, setLoading] = useState(false)

  const createInvitado = async (formData: InvitadoFormData): Promise<{ success: boolean; error?: string }> => {
    setLoading(true)
    try {
      const adminPassword = process.env.NEXT_PUBLIC_ADMIN_PASSWORD || 'admin123'
      
      const response = await fetch('/api/admin/invitados', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-admin-password': adminPassword
        },
        body: JSON.stringify({
          nombre_1: formData.nombre_1.trim(),
          nombre_2: formData.nombre_2?.trim() || null,
          slug: formData.slug.trim(),
          foto_url: formData.foto_url || null,
          asistencia_1: formData.asistencia_1,
          asistencia_2: formData.asistencia_2,
          restriccion_1: formData.restriccion_1?.trim() || null,
          restriccion_2: formData.restriccion_2?.trim() || null,
          mensaje: formData.mensaje?.trim() || null
        })
      })

      if (!response.ok) {
        const errorData = await response.json()
        return { success: false, error: errorData.error || 'Error creating invitado' }
      }

      onSuccess()
      onClose()
      return { success: true }
    } catch {
      return { success: false, error: 'Network error' }
    } finally {
      setLoading(false)
    }
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title=""
      size="lg"
      showCloseButton={false}
    >
      <div className="p-4">
        {/* Header - Mini */}
        <div className="text-center mb-4">
          <h2 className="text-lg font-bold text-gray-900">
            Nuevo Invitado
          </h2>
        </div>

        {/* Form */}
        <InvitadoForm
          onSubmit={createInvitado}
          loading={loading}
          submitLabel="Crear Invitado"
        />

        {/* Cancel Button */}
        <div className="mt-3 pt-3 border-t border-gray-100">
          <Button
            onClick={onClose}
            variant="ghost"
            className="w-full text-xs py-1"
            disabled={loading}
          >
            Cancelar
          </Button>
        </div>
      </div>
    </Modal>
  )
}