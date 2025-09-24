/**
 * Producto Form Component - Shared form for Add/Edit Product modals
 */
'use client'

import { useState, useRef } from 'react'
import Image from 'next/image'
import Button from '@/components/ui/Button'
// import { Card, CardContent } from '@/components/ui/Card'
import { uploadImage } from '@/lib/storage'
import { Producto } from '@/types'

export interface ProductoFormData {
  titulo: string
  descripcion: string
  imagen_url: string
}

interface ProductoFormProps {
  initialData?: Producto
  onSubmit: (formData: ProductoFormData, imageFile: File | null) => Promise<{ success: boolean; error?: string }>
  loading: boolean
  submitLabel: string
}

export default function ProductoForm({ initialData, onSubmit, loading, submitLabel }: ProductoFormProps) {
  const [formData, setFormData] = useState<ProductoFormData>({
    titulo: initialData?.titulo || '',
    descripcion: initialData?.descripcion || '',
    imagen_url: initialData?.imagen_url || ''
  })
  
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string>(initialData?.imagen_url || '')
  const [uploadingImage, setUploadingImage] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        setError('Por favor selecciona una imagen válida')
        return
      }
      
      // Validate file size (5MB max)
      if (file.size > 5 * 1024 * 1024) {
        setError('La imagen debe ser menor a 5MB')
        return
      }

      setImageFile(file)
      const reader = new FileReader()
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string)
      }
      reader.readAsDataURL(file)
      setError(null)
    }
  }

  const validateForm = (): boolean => {
    if (!formData.titulo.trim()) {
      setError('El título es requerido')
      return false
    }
    if (!formData.descripcion.trim()) {
      setError('La descripción es requerida')
      return false
    }
    if (!imagePreview) {
      setError('La imagen es requerida')
      return false
    }
    return true
  }

  const uploadImageToStorage = async (): Promise<string | null> => {
    if (!imageFile) return formData.imagen_url || null
    
    setUploadingImage(true)
    try {
      const timestamp = Date.now()
      const fileName = `producto-${timestamp}-${Math.random().toString(36).substr(2, 6)}`
      
      const result = await uploadImage(imageFile, 'PRODUCTOS', fileName)
      if (result.error) {
        setError(`Error subiendo imagen: ${result.error}`)
        return null
      }
      return result.url || null
    } catch {
      setError('Error inesperado al subir la imagen')
      return null
    } finally {
      setUploadingImage(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (!validateForm()) return

    try {
      const imagenUrl = await uploadImageToStorage()
      if (imageFile && !imagenUrl) return // Error already set

      const result = await onSubmit({
        ...formData,
        imagen_url: imagenUrl || ''
      }, imageFile)

      if (!result.success) {
        setError(result.error || 'Error al procesar')
      }
    } catch {
      console.error('Error in handleSubmit:', error)
      setError('Error inesperado. Intenta de nuevo.')
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Image Upload Section */}
      <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center mr-3">
            <span className="text-white text-lg">🎁</span>
          </div>
          Imagen del Regalo
        </h3>
        
        {imagePreview ? (
          <div className="space-y-4">
            <div className="relative w-full max-w-sm mx-auto">
              <div className="aspect-[4/3] rounded-xl overflow-hidden ring-4 ring-white shadow-lg">
                <Image
                  src={imagePreview}
                  alt="Preview del producto"
                  fill
                  className="object-cover"
                />
              </div>
            </div>
            <div className="text-center space-y-3">
              <p className="text-sm font-medium text-gray-700">
                {imageFile ? 'Nueva imagen seleccionada' : 'Imagen actual'}
              </p>
              <div className="flex justify-center space-x-3">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => fileInputRef.current?.click()}
                  className="bg-white hover:bg-gray-50 border border-gray-200"
                >
                  <span className="mr-2">📸</span>
                  Cambiar imagen
                </Button>
                {imageFile && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setImageFile(null)
                      setImagePreview(formData.imagen_url)
                      if (fileInputRef.current) fileInputRef.current.value = ''
                    }}
                    className="text-gray-600 hover:text-gray-800"
                  >
                    Cancelar
                  </Button>
                )}
              </div>
            </div>
          </div>
        ) : (
          <div 
            onClick={() => fileInputRef.current?.click()}
            className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center hover:border-purple-400 hover:bg-purple-50/50 transition-all cursor-pointer group"
          >
            <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-purple-100 to-pink-100 rounded-full flex items-center justify-center group-hover:scale-105 transition-transform">
              <span className="text-2xl">🎁</span>
            </div>
            <p className="text-lg font-medium text-gray-900 mb-2">Sube una imagen del regalo</p>
            <p className="text-sm text-gray-500 mb-4">Haz click para seleccionar o arrastra una imagen</p>
            <Button
              type="button"
              className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
            >
              <span className="mr-2">📸</span>
              Seleccionar imagen
            </Button>
            <p className="mt-3 text-xs text-gray-400">PNG, JPG, WEBP hasta 5MB</p>
          </div>
        )}
        
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleImageChange}
          className="sr-only"
        />
      </div>

      {/* Product Details */}
      <div className="space-y-6">
        {/* Title */}
        <div>
          <label htmlFor="titulo" className="block text-sm font-semibold text-gray-900 mb-2">
            Título del regalo <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            id="titulo"
            value={formData.titulo}
            onChange={(e) => setFormData(prev => ({ ...prev, titulo: e.target.value }))}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
            placeholder="Ej: Luna de miel en París"
            required
          />
        </div>

        {/* Description */}
        <div>
          <label htmlFor="descripcion" className="block text-sm font-semibold text-gray-900 mb-2">
            Descripción <span className="text-red-500">*</span>
          </label>
          <textarea
            id="descripcion"
            value={formData.descripcion}
            onChange={(e) => setFormData(prev => ({ ...prev, descripcion: e.target.value }))}
            rows={4}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all resize-none"
            placeholder="Describe el regalo, su propósito o cómo ayudará a los novios..."
            required
          />
          <p className="mt-2 text-xs text-gray-500">
            Esta descripción aparecerá en la página principal para que los invitados sepan en qué están contribuyendo.
          </p>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-600 text-sm flex items-center">
            <span className="mr-2">⚠️</span>
            {error}
          </p>
        </div>
      )}

      {/* Submit Button */}
      <div className="pt-4">
        <Button
          type="submit"
          loading={loading || uploadingImage}
          className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-lg py-3"
        >
          {uploadingImage ? (
            <>
              <span className="mr-2">📸</span>
              Subiendo imagen...
            </>
          ) : loading ? (
            <>
              <span className="mr-2">💾</span>
              Guardando...
            </>
          ) : (
            <>
              <span className="mr-2">✨</span>
              {submitLabel}
            </>
          )}
        </Button>
      </div>
    </form>
  )
}
