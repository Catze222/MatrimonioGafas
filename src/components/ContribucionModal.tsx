/**
 * Contribucion Modal Component - For guest contributions to wedding gifts
 */
'use client'

import { useState } from 'react'
import Image from 'next/image'
import Modal from '@/components/ui/Modal'
import Button from '@/components/ui/Button'
// import { Card, CardContent } from '@/components/ui/Card'
import { supabase } from '@/lib/supabase'
import { Producto } from '@/types'

interface ContribucionModalProps {
  isOpen: boolean
  onClose: () => void
  producto: Producto | null
}

export default function ContribucionModal({ isOpen, onClose, producto }: ContribucionModalProps) {
  const [formData, setFormData] = useState({
    monto: '',
    quien_regala: '',
    email: '',
    telefono: '',
    mensaje: ''
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  if (!producto) return null

  const resetForm = () => {
    setFormData({ monto: '', quien_regala: '', email: '', telefono: '', mensaje: '' })
    setError(null)
  }

  const handleClose = () => {
    resetForm()
    onClose()
  }

  const validateForm = (): boolean => {
    if (!formData.quien_regala.trim()) {
      setError('Por favor ingresa tu nombre')
      return false
    }
    
    if (!formData.email.trim()) {
      setError('Por favor ingresa tu email')
      return false
    }
    
    // Validar formato de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(formData.email)) {
      setError('Por favor ingresa un email válido')
      return false
    }
    
    // Validar teléfono solo si se proporciona (opcional)
    if (formData.telefono.trim()) {
      const phoneRegex = /^[0-9]{10}$/
      if (!phoneRegex.test(formData.telefono.replace(/\s/g, ''))) {
        setError('Por favor ingresa un teléfono válido (10 dígitos)')
        return false
      }
    }
    
    const monto = parseFloat(formData.monto)
    if (!formData.monto || isNaN(monto) || monto <= 0) {
      setError('Por favor ingresa un monto válido mayor a 0')
      return false
    }

    return true
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (!validateForm()) return

    setLoading(true)
    try {
      // Crear el pago en estado pendiente
      const { data, error } = await supabase
        .from('pagos')
        .insert({
          producto_id: producto.id,
          quien_regala: formData.quien_regala.trim(),
          mensaje: formData.mensaje.trim() || null,
          monto: parseFloat(formData.monto),
          estado: 'pendiente'
        })
        .select()
        .single()

      if (error) throw error

      // Inmediatamente crear preferencia en MercadoPago y redirigir
      const mpResponse = await fetch('/api/mercadopago/create-preference', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          pagoId: data.id,
          monto: formData.monto,
          titulo: producto.titulo,
          descripcion: producto.descripcion,
          contribuyente: formData.quien_regala.trim(),
          email: formData.email.trim(),
          telefono: formData.telefono.trim()
        })
      })

      if (!mpResponse.ok) {
        const errorData = await mpResponse.json()
        console.error('❌ MP Preference Error:', errorData)
        throw new Error(errorData.error || 'Error creating payment preference')
      }

      const { checkoutUrl } = await mpResponse.json()
      
      // Redirigir directamente a MercadoPago
      window.location.href = checkoutUrl
      
    } catch (error: unknown) {
      console.error('Error creating pago:', error)
      setError('Error al procesar tu contribución. Intenta de nuevo.')
    } finally {
      setLoading(false)
    }
  }


  const formatCurrency = (amount: string): string => {
    const num = parseFloat(amount)
    if (isNaN(num)) return ''
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0
    }).format(num)
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title=""
      size="lg"
      showCloseButton={false}
    >
      <div className="p-6">
        {/* Header with Product Info */}
        <div className="text-center mb-8">
          <div className="w-20 h-20 mx-auto mb-4 relative rounded-xl overflow-hidden ring-4 ring-white shadow-lg">
            <Image
              src={producto.imagen_url}
              alt={producto.titulo}
              fill
              className="object-cover"
            />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Contribuir a: {producto.titulo}
          </h2>
          <p className="text-gray-600">
            {producto.descripcion}
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Amount Input */}
          <div>
            <label htmlFor="monto" className="block text-sm font-semibold text-gray-900 mb-2">
              ¿Cuánto te gustaría aportar? <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 font-medium">
                $
              </span>
              <input
                type="number"
                id="monto"
                value={formData.monto}
                onChange={(e) => setFormData(prev => ({ ...prev, monto: e.target.value }))}
                className="w-full pl-8 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-lg"
                placeholder="50000"
                min="1000"
                step="1000"
                required
              />
            </div>
            {formData.monto && !isNaN(parseFloat(formData.monto)) && (
              <p className="mt-2 text-sm text-purple-600 font-medium">
                {formatCurrency(formData.monto)}
              </p>
            )}
            <p className="mt-2 text-xs text-gray-500">
              Puedes aportar cualquier cantidad que desees. Tu contribución nos ayudará muchísimo.
            </p>
          </div>

              {/* Name Input */}
              <div>
                <label htmlFor="quien_regala" className="block text-sm font-semibold text-gray-900 mb-2">
                  Tu nombre completo <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="quien_regala"
                  value={formData.quien_regala}
                  onChange={(e) => setFormData(prev => ({ ...prev, quien_regala: e.target.value }))}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="Ej: María Fernanda González"
                  required
                />
              </div>

              {/* Email Input */}
              <div>
                <label htmlFor="email" className="block text-sm font-semibold text-gray-900 mb-2">
                  Tu email <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  id="email"
                  value={formData.email}
                  onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="Ej: maria@gmail.com"
                  required
                />
                <p className="mt-2 text-xs text-gray-500">
                  Necesario para enviarte la confirmación del regalo
                </p>
              </div>

              {/* Phone Input */}
              <div>
                <label htmlFor="telefono" className="block text-sm font-semibold text-gray-900 mb-2">
                  Tu teléfono (opcional)
                </label>
                <input
                  type="tel"
                  id="telefono"
                  value={formData.telefono}
                  onChange={(e) => {
                    // Solo permitir números y formatear
                    const value = e.target.value.replace(/\D/g, '').slice(0, 10)
                    setFormData(prev => ({ ...prev, telefono: value }))
                  }}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="Ej: 3001234567"
                />
                <p className="mt-2 text-xs text-gray-500">
                  10 dígitos sin espacios (ej: 3001234567)
                </p>
              </div>

          {/* Message Input */}
          <div>
            <label htmlFor="mensaje" className="block text-sm font-semibold text-gray-900 mb-2">
              Mensaje para los novios (opcional)
            </label>
            <textarea
              id="mensaje"
              value={formData.mensaje}
              onChange={(e) => setFormData(prev => ({ ...prev, mensaje: e.target.value }))}
              rows={3}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
              placeholder="Ej: ¡Felicidades! Que disfruten mucho este regalo..."
            />
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

          {/* Action Buttons */}
          <div className="flex space-x-4 pt-4">
            <Button
              type="button"
              variant="ghost"
              onClick={handleClose}
              className="flex-1"
              disabled={loading}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              loading={loading}
              className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
            >
              {loading ? (
                <>
                  <span className="mr-2">⏳</span>
                  Redirigiendo a MercadoPago...
                </>
              ) : (
                <>
                  <span className="mr-2">💳</span>
                  Ir a Pagar
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </Modal>
  )
}
