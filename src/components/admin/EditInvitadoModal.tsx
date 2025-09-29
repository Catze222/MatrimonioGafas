/**
 * Modern Modal for editing existing wedding guests (invitados)
 */
'use client'

import { useState } from 'react'
import Modal from '@/components/ui/Modal'
import Button from '@/components/ui/Button'
import InvitadoForm, { InvitadoFormData } from './InvitadoForm'
import { Invitado } from '@/types'

interface EditInvitadoModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
  invitado: Invitado | null
}

export default function EditInvitadoModal({ isOpen, onClose, onSuccess, invitado }: EditInvitadoModalProps) {
  const [loading, setLoading] = useState(false)

  const updateInvitado = async (formData: InvitadoFormData): Promise<{ success: boolean; error?: string }> => {
    if (!invitado) return { success: false, error: 'No invitado selected' }
    
    setLoading(true)
    try {
      const adminPassword = process.env.NEXT_PUBLIC_ADMIN_PASSWORD || 'admin123'
      
      const response = await fetch(`/api/admin/invitados/${invitado.id}`, {
        method: 'PATCH',
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
          mensaje: formData.mensaje?.trim() || null,
          de_quien: formData.de_quien,
          invitacion_enviada: formData.invitacion_enviada
        })
      })

      if (!response.ok) {
        const errorData = await response.json()
        return { success: false, error: errorData.error || 'Error updating invitado' }
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

  if (!invitado) {
    return null
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
            Editar: {invitado.nombre_1}
            {invitado.nombre_2 && <span> & {invitado.nombre_2}</span>}
          </h2>
        </div>

        {/* Form */}
        <InvitadoForm
          initialData={invitado}
          onSubmit={updateInvitado}
          loading={loading}
          submitLabel="Actualizar Invitado"
          isEditing={true}
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