/**
 * Form component for adding items to lista_espera
 */
'use client'

import { useState } from 'react'
import Button from '@/components/ui/Button'

interface AddListaEsperaFormProps {
  onSuccess: () => void
  onCancel: () => void
}

interface FormData {
  nombre_1: string
  nombre_2: string
  de_quien: 'jaime' | 'alejandra' | ''
  notas: string
  prioridad: 'alta' | 'media' | 'baja'
}

export default function AddListaEsperaForm({ onSuccess, onCancel }: AddListaEsperaFormProps) {
  const [formData, setFormData] = useState<FormData>({
    nombre_1: '',
    nombre_2: '',
    de_quien: '',
    notas: '',
    prioridad: 'media'
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    // Validation
    if (!formData.nombre_1.trim()) {
      setError('El primer nombre es obligatorio')
      return
    }

    if (!formData.de_quien) {
      setError('Debe seleccionar de quién es el invitado')
      return
    }

    setLoading(true)

    try {
      const adminPassword = process.env.NEXT_PUBLIC_ADMIN_PASSWORD || 'admin123'
      
      const response = await fetch('/api/admin/lista-espera', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-admin-password': adminPassword
        },
        body: JSON.stringify({
          nombre_1: formData.nombre_1.trim(),
          nombre_2: formData.nombre_2.trim() || null,
          de_quien: formData.de_quien,
          notas: formData.notas.trim() || null,
          prioridad: formData.prioridad
        })
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Error al agregar a lista de espera')
      }

      onSuccess()
    } catch (err) {
      console.error('Error adding to lista espera:', err)
      setError(err instanceof Error ? err.message : 'Error desconocido')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Primer Nombre */}
      <div>
        <label htmlFor="nombre_1" className="block text-sm font-medium text-gray-700 mb-1">
          Primer nombre <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          id="nombre_1"
          value={formData.nombre_1}
          onChange={(e) => setFormData(prev => ({ ...prev, nombre_1: e.target.value }))}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
          placeholder="Ej: Ana"
          required
        />
      </div>

      {/* Segundo Nombre */}
      <div>
        <label htmlFor="nombre_2" className="block text-sm font-medium text-gray-700 mb-1">
          Pareja (opcional)
        </label>
        <input
          type="text"
          id="nombre_2"
          value={formData.nombre_2}
          onChange={(e) => setFormData(prev => ({ ...prev, nombre_2: e.target.value }))}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
          placeholder="Ej: Carlos"
        />
      </div>

      {/* De Quién */}
      <div>
        <label htmlFor="de_quien" className="block text-sm font-medium text-gray-700 mb-1">
          Invitado de <span className="text-red-500">*</span>
        </label>
        <select
          id="de_quien"
          value={formData.de_quien}
          onChange={(e) => setFormData(prev => ({ ...prev, de_quien: e.target.value as 'jaime' | 'alejandra' | '' }))}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
          required
        >
          <option value="">Seleccionar...</option>
          <option value="jaime">Jaime</option>
          <option value="alejandra">Alejandra</option>
        </select>
      </div>

      {/* Prioridad */}
      <div>
        <label htmlFor="prioridad" className="block text-sm font-medium text-gray-700 mb-1">
          Prioridad
        </label>
        <select
          id="prioridad"
          value={formData.prioridad}
          onChange={(e) => setFormData(prev => ({ ...prev, prioridad: e.target.value as 'alta' | 'media' | 'baja' }))}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
        >
          <option value="baja">Baja</option>
          <option value="media">Media</option>
          <option value="alta">Alta</option>
        </select>
      </div>

      {/* Notas */}
      <div>
        <label htmlFor="notas" className="block text-sm font-medium text-gray-700 mb-1">
          Notas (opcional)
        </label>
        <textarea
          id="notas"
          value={formData.notas}
          onChange={(e) => setFormData(prev => ({ ...prev, notas: e.target.value }))}
          rows={3}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent resize-none"
          placeholder="Ej: Primos de Jaime, trabajo de Alejandra..."
        />
        <p className="text-xs text-gray-500 mt-1">
          Estas notas se convertirán en observaciones cuando se conviertan a invitados
        </p>
      </div>

      {/* Error Message */}
      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-600 text-sm">{error}</p>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex space-x-3 pt-4">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          className="flex-1"
          disabled={loading}
        >
          Cancelar
        </Button>
        <Button
          type="submit"
          loading={loading}
          className="flex-1 bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700"
        >
          {loading ? 'Agregando...' : 'Agregar a Lista'}
        </Button>
      </div>
    </form>
  )
}
