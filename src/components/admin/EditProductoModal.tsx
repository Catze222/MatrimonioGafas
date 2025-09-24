/**
 * Edit Producto Modal Component
 */
'use client'

import { useState } from 'react'
import Modal from '@/components/ui/Modal'
import Button from '@/components/ui/Button'
import ProductoForm, { ProductoFormData } from './ProductoForm'
import { Producto } from '@/types'

interface EditProductoModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
  producto: Producto | null
}

export default function EditProductoModal({ isOpen, onClose, onSuccess, producto }: EditProductoModalProps) {
  const [loading, setLoading] = useState(false)

  if (!producto) return null

  const updateProducto = async (formData: ProductoFormData, imageFile: File | null): Promise<{ success: boolean; error?: string }> => {
    setLoading(true)

    try {
      const adminPassword = process.env.NEXT_PUBLIC_ADMIN_PASSWORD || 'admin123'
      
      const response = await fetch(`/api/admin/productos/${producto.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'x-admin-password': adminPassword
        },
        body: JSON.stringify(formData)
      })

      if (!response.ok) {
        const errorData = await response.json()
        return { success: false, error: errorData.error || 'Error updating producto' }
      }

      onSuccess()
      onClose()
      return { success: true }
    } catch (error) {
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
          <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center shadow-lg">
            <span className="text-white text-2xl">✏️</span>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Editar Regalo
          </h2>
          <p className="text-gray-600">
            <span className="font-medium text-gray-900">{producto.titulo}</span>
          </p>
        </div>

        {/* Form */}
        <ProductoForm
          initialData={producto}
          onSubmit={updateProducto}
          loading={loading}
          submitLabel="Actualizar Regalo"
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
