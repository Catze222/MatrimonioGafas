/**
 * Add Producto Modal Component
 */
'use client'

import { useState } from 'react'
import Modal from '@/components/ui/Modal'
import Button from '@/components/ui/Button'
import ProductoForm, { ProductoFormData } from './ProductoForm'

interface AddProductoModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
}

export default function AddProductoModal({ isOpen, onClose, onSuccess }: AddProductoModalProps) {
  const [loading, setLoading] = useState(false)

  const createProducto = async (formData: ProductoFormData): Promise<{ success: boolean; error?: string }> => {
    setLoading(true)

    try {
      const adminPassword = process.env.NEXT_PUBLIC_ADMIN_PASSWORD || 'admin123'
      
      const response = await fetch('/api/admin/productos', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-admin-password': adminPassword
        },
        body: JSON.stringify(formData)
      })

      if (!response.ok) {
        const errorData = await response.json()
        return { success: false, error: errorData.error || 'Error creating producto' }
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
      size="xl"
      showCloseButton={false}
    >
      <div className="p-6">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center shadow-lg">
            <span className="text-white text-2xl">🎁</span>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Crear Nuevo Regalo
          </h2>
          <p className="text-gray-600">
            Agrega un nuevo regalo para que los invitados puedan contribuir
          </p>
        </div>

        {/* Form */}
        <ProductoForm
          onSubmit={createProducto}
          loading={loading}
          submitLabel="Crear Regalo"
        />

        {/* Cancel Button */}
        <div className="mt-6 pt-4 border-t border-gray-100">
          <Button
            onClick={onClose}
            variant="ghost"
            className="w-full"
            disabled={loading}
          >
            Cancelar
          </Button>
        </div>
      </div>
    </Modal>
  )
}
