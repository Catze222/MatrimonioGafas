/**
 * Modern Invitado Form - Shared component for create and edit
 * Beautiful, consistent design for both operations
 */
'use client'

import { useState } from 'react'
import { uploadImage, generateFilePath } from '@/lib/storage'
import { generateSlug } from '@/lib/utils'
import { Invitado } from '@/types'
import Image from 'next/image'

export interface InvitadoFormData {
  nombre_1: string
  nombre_2: string
  slug: string
  foto_url: string
  asistencia_1: 'pendiente' | 'si' | 'no'
  asistencia_2: 'pendiente' | 'si' | 'no'
  restriccion_1: string
  restriccion_2: string
  mensaje: string
}

interface InvitadoFormProps {
  initialData?: Partial<Invitado>
  onSubmit: (data: InvitadoFormData) => Promise<{ success: boolean; error?: string }>
  loading: boolean
  submitLabel: string
}

export default function InvitadoForm({ initialData, onSubmit, loading, submitLabel }: InvitadoFormProps) {
  const [formData, setFormData] = useState<InvitadoFormData>({
    nombre_1: initialData?.nombre_1 || '',
    nombre_2: initialData?.nombre_2 || '',
    slug: initialData?.slug || '',
    foto_url: initialData?.foto_url || '',
    asistencia_1: initialData?.asistencia_1 || 'pendiente',
    asistencia_2: initialData?.asistencia_2 || 'pendiente',
    restriccion_1: initialData?.restriccion_1 || '',
    restriccion_2: initialData?.restriccion_2 || '',
    mensaje: initialData?.mensaje || ''
  })
  
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string>(initialData?.foto_url || '')
  const [uploadingImage, setUploadingImage] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [slugManuallyEdited, setSlugManuallyEdited] = useState(false)

  // Auto-generate slug when names change
  const handleNombre1Change = (value: string) => {
    setFormData(prev => {
      const newData = { ...prev, nombre_1: value }
      if (!slugManuallyEdited) {
        const baseSlug = prev.nombre_2 
          ? generateSlug(`${value} ${prev.nombre_2}`)
          : generateSlug(value)
        newData.slug = baseSlug
      }
      return newData
    })
  }

  const handleNombre2Change = (value: string) => {
    setFormData(prev => {
      const newData = { ...prev, nombre_2: value }
      if (!slugManuallyEdited) {
        const baseSlug = value 
          ? generateSlug(`${prev.nombre_1} ${value}`)
          : generateSlug(prev.nombre_1)
        newData.slug = baseSlug
      }
      return newData
    })
  }

  const handleSlugChange = (value: string) => {
    setSlugManuallyEdited(true)
    setFormData(prev => ({ ...prev, slug: generateSlug(value) }))
  }

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (!file.type.startsWith('image/')) {
      setError('Por favor selecciona un archivo de imagen válido')
      return
    }

    if (file.size > 5 * 1024 * 1024) {
      setError('La imagen debe ser menor a 5MB')
      return
    }

    setImageFile(file)
    setError(null)

    const reader = new FileReader()
    reader.onload = (e) => {
      setImagePreview(e.target?.result as string)
    }
    reader.readAsDataURL(file)
  }

  const uploadImageToStorage = async (): Promise<string | null> => {
    if (!imageFile) return formData.foto_url

    setUploadingImage(true)
    try {
      const filePath = generateFilePath(imageFile.name, 'invitados')
      const result = await uploadImage(imageFile, 'AVATARS', filePath)
      
      if (result.error) {
        setError(`Error subiendo imagen: ${result.error}`)
        return null
      }
      
      return result.url || null
    } catch {
      setError('Error al procesar la imagen')
      return null
    } finally {
      setUploadingImage(false)
    }
  }

  const validateForm = (): boolean => {
    if (!formData.nombre_1.trim()) {
      setError('El nombre es requerido')
      return false
    }

    if (!formData.slug.trim()) {
      setError('El slug es requerido')
      return false
    }

    if (!/^[a-z0-9-]+$/.test(formData.slug)) {
      setError('El slug solo puede contener letras minúsculas, números y guiones')
      return false
    }

    return true
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (!validateForm()) return

    try {
      const fotoUrl = await uploadImageToStorage()
      if (imageFile && !fotoUrl) return // Error already set

      const result = await onSubmit({
        ...formData,
        foto_url: fotoUrl || ''
      })

      if (!result.success) {
        setError(result.error || 'Error al procesar')
      }
    } catch {
      console.error('Error in handleSubmit:', error)
      setError('Error inesperado. Intenta de nuevo.')
    }
  }

  const statusOptions = [
    {
      value: 'si' as const,
      label: 'Confirmado',
      icon: '✅',
      bgColor: 'bg-green-50',
      borderColor: 'border-green-200',
      selectedBg: 'bg-green-100',
      selectedBorder: 'border-green-400',
      textColor: 'text-green-700'
    },
    {
      value: 'no' as const,
      label: 'No asiste',
      icon: '❌',
      bgColor: 'bg-red-50',
      borderColor: 'border-red-200',
      selectedBg: 'bg-red-100',
      selectedBorder: 'border-red-400',
      textColor: 'text-red-700'
    },
    {
      value: 'pendiente' as const,
      label: 'Pendiente',
      icon: '🟡',
      bgColor: 'bg-yellow-50',
      borderColor: 'border-yellow-200',
      selectedBg: 'bg-yellow-100',
      selectedBorder: 'border-yellow-400',
      textColor: 'text-yellow-700'
    }
  ]

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Photo Upload Section - Compacto */}
      <div className="bg-gray-50 rounded-lg p-3">
        <h3 className="text-sm font-medium text-gray-700 mb-2">
          📸 Foto (opcional)
        </h3>
        
        {imagePreview ? (
          <div className="flex items-center space-x-3">
            <div className="relative w-12 h-12 rounded-lg overflow-hidden bg-gray-100">
              <Image
                src={imagePreview}
                alt="Preview"
                fill
                className="object-cover"
              />
            </div>
            <div className="flex-1">
              <div className="flex space-x-2">
                <label className="inline-flex items-center px-2 py-1 bg-white border border-gray-300 rounded text-xs font-medium text-gray-700 hover:bg-gray-50 cursor-pointer">
                  Cambiar
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="sr-only"
                  />
                </label>
                {imageFile && (
                  <button
                    type="button"
                    onClick={() => {
                      setImageFile(null)
                      setImagePreview(formData.foto_url)
                    }}
                    className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs font-medium hover:bg-gray-200"
                  >
                    ✕
                  </button>
                )}
              </div>
            </div>
          </div>
        ) : (
          <label className="block border-2 border-dashed border-gray-300 rounded-lg p-3 text-center hover:border-gray-400 cursor-pointer transition-colors">
            <div className="text-gray-400 mb-1">📁</div>
            <span className="text-xs text-gray-600">Subir foto</span>
            <input
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              className="sr-only"
            />
          </label>
        )}
      </div>

      {/* Guest Information - Más compacto */}
      <div className="space-y-3">
        {/* Primera Persona */}
        <div className="border border-gray-200 rounded-lg p-3">
          <div className="flex items-center mb-3">
            <div className="w-5 h-5 bg-blue-100 rounded flex items-center justify-center mr-2 text-xs font-bold text-blue-600">
              1
            </div>
            <h3 className="text-sm font-medium text-gray-900">Primer Invitado</h3>
          </div>
          
          <div className="space-y-3">
            <div>
              <label htmlFor="nombre_1" className="block text-xs font-medium text-gray-700 mb-1">
                Nombre completo <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="nombre_1"
                value={formData.nombre_1}
                onChange={(e) => handleNombre1Change(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:ring-1 focus:ring-rose-500 focus:border-transparent"
                placeholder="Ej: Ana María González"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-700 mb-2">
                Estado
              </label>
              <div className="grid grid-cols-3 gap-1">
                {statusOptions.map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, asistencia_1: option.value }))}
                    className={`p-2 rounded border text-xs transition-all ${
                      formData.asistencia_1 === option.value
                        ? 'border-gray-800 bg-gray-900 text-white'
                        : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    <div className="text-center">
                      <div className="text-sm mb-0.5">{option.icon}</div>
                      <div className="font-medium">
                        {option.label}
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {formData.asistencia_1 === 'si' && (
              <div>
                <label htmlFor="restriccion_1" className="block text-xs font-medium text-gray-700 mb-1">
                  Restricciones alimentarias
                </label>
                <input
                  type="text"
                  id="restriccion_1"
                  value={formData.restriccion_1}
                  onChange={(e) => setFormData(prev => ({ ...prev, restriccion_1: e.target.value }))}
                  placeholder="Ej: Vegetariano, sin gluten..."
                  className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:ring-1 focus:ring-green-500 focus:border-transparent"
                />
              </div>
            )}
          </div>
        </div>

        {/* Segunda Persona */}
        <div className="border border-gray-200 rounded-lg p-3">
          <div className="flex items-center mb-3">
            <div className="w-5 h-5 bg-purple-100 rounded flex items-center justify-center mr-2 text-xs font-bold text-purple-600">
              2
            </div>
            <h3 className="text-sm font-medium text-gray-900">Segundo Invitado (opcional)</h3>
          </div>
          
          <div className="space-y-3">
            <div>
              <label htmlFor="nombre_2" className="block text-sm font-semibold text-gray-700 mb-2">
                Nombre completo de la pareja/acompañante
              </label>
              <input
                type="text"
                id="nombre_2"
                value={formData.nombre_2}
                onChange={(e) => handleNombre2Change(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent transition-all"
                placeholder="Ej: Carlos Andrés López (opcional)"
              />
            </div>

            {formData.nombre_2 && (
              <>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-2">
                    Estado
                  </label>
                  <div className="grid grid-cols-3 gap-1">
                    {statusOptions.map((option) => (
                      <button
                        key={option.value}
                        type="button"
                        onClick={() => setFormData(prev => ({ ...prev, asistencia_2: option.value }))}
                        className={`p-2 rounded border text-xs transition-all ${
                          formData.asistencia_2 === option.value
                            ? 'border-gray-800 bg-gray-900 text-white'
                            : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300'
                        }`}
                      >
                        <div className="text-center">
                          <div className="text-sm mb-0.5">{option.icon}</div>
                          <div className="font-medium">
                            {option.label}
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                {formData.asistencia_2 === 'si' && (
                  <div>
                    <label htmlFor="restriccion_2" className="block text-xs font-medium text-gray-700 mb-1">
                      Restricciones alimentarias
                    </label>
                    <input
                      type="text"
                      id="restriccion_2"
                      value={formData.restriccion_2}
                      onChange={(e) => setFormData(prev => ({ ...prev, restriccion_2: e.target.value }))}
                      placeholder="Ej: Vegetariano, sin gluten..."
                      className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:ring-1 focus:ring-green-500 focus:border-transparent"
                    />
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      {/* Slug - Compacto */}
      <div className="border border-gray-200 rounded-lg p-3">
        <div className="flex items-center mb-2">
          <span className="mr-2">🔗</span>
          <h3 className="text-sm font-medium text-gray-900">Enlace único</h3>
        </div>
        
        <div>
          <label htmlFor="slug" className="block text-xs font-medium text-gray-700 mb-1">
            Identificador <span className="text-red-500">*</span>
          </label>
          <div className="flex">
            <span className="inline-flex items-center px-2 rounded-l border border-r-0 border-gray-300 bg-gray-100 text-gray-600 text-xs">
              /rsvp/
            </span>
            <input
              type="text"
              id="slug"
              value={formData.slug}
              onChange={(e) => handleSlugChange(e.target.value)}
              className="flex-1 px-3 py-2 border border-gray-300 rounded-r text-sm focus:ring-1 focus:ring-rose-500 focus:border-transparent"
              placeholder="ana-carlos-2025"
              required
            />
          </div>
        </div>
      </div>

      {/* Observaciones internas */}
      <div className="border border-gray-200 rounded-lg p-3">
        <div className="flex items-center mb-2">
          <span className="mr-2">📝</span>
          <h3 className="text-sm font-medium text-gray-900">Observaciones internas</h3>
        </div>
        
        <div>
          <label htmlFor="mensaje" className="block text-xs font-medium text-gray-700 mb-1">
            Notas y observaciones (opcional)
          </label>
          <textarea
            id="mensaje"
            value={formData.mensaje || ''}
            onChange={(e) => setFormData(prev => ({ ...prev, mensaje: e.target.value }))}
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:ring-1 focus:ring-gray-500 focus:border-transparent resize-none"
            placeholder="Ej: Tiene alergia al maní, necesita mesa cerca del baño, etc..."
          />
          <p className="text-xs text-gray-500 mt-1">
            Estas observaciones son solo para uso interno del admin
          </p>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="p-4 bg-red-50 border-l-4 border-red-400 rounded-lg">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-red-700 font-medium">{error}</p>
            </div>
          </div>
        </div>
      )}

      {/* Submit Button - Compacto */}
      <div className="pt-3">
        <button
          type="submit"
          disabled={loading || uploadingImage}
          className="w-full bg-gray-900 text-white py-2.5 px-4 rounded text-sm font-medium hover:bg-gray-800 focus:ring-2 focus:ring-gray-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {uploadingImage ? (
            <div className="flex items-center justify-center">
              <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Subiendo...
            </div>
          ) : loading ? (
            <div className="flex items-center justify-center">
              <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Procesando...
            </div>
          ) : (
            submitLabel
          )}
        </button>
      </div>
    </form>
  )
}
