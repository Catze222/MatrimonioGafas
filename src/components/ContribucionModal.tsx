/**
 * Contribucion Modal Component - For guest contributions to wedding gifts
 */
'use client'

import { useState } from 'react'
import Image from 'next/image'
import Modal from '@/components/ui/Modal'
import Button from '@/components/ui/Button'
import { Card, CardContent } from '@/components/ui/Card'
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
    mensaje: ''
  })
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [createdPagoId, setCreatedPagoId] = useState<string | null>(null)

  if (!producto) return null

  const resetForm = () => {
    setFormData({ monto: '', quien_regala: '', mensaje: '' })
    setError(null)
    setSuccess(false)
    setCreatedPagoId(null)
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

      // Guardar el ID del pago creado
      setCreatedPagoId(data.id)
      setSuccess(true)
    } catch (error: any) {
      console.error('Error creating pago:', error)
      setError('Error al procesar tu contribución. Intenta de nuevo.')
    } finally {
      setLoading(false)
    }
  }

  const handleProceedToPayment = async () => {
    if (!createdPagoId) {
      setError('Error: No se pudo obtener el ID del pago')
      return
    }

    setLoading(true)
    try {
      // Crear preferencia en MercadoPago
      const response = await fetch('/api/mercadopago/create-preference', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          pagoId: createdPagoId,
          monto: formData.monto,
          titulo: producto.titulo,
          descripcion: producto.descripcion,
          contribuyente: formData.quien_regala
        })
      })

      if (!response.ok) {
        const errorData = await response.json()
        console.error('❌ MP Preference Error:', errorData)
        throw new Error(errorData.error || 'Error creating payment preference')
      }

      const { checkoutUrl } = await response.json()
      
      // Redirigir a MercadoPago
      window.location.href = checkoutUrl
      
    } catch (error: any) {
      console.error('Error creating MP preference:', error)
      setError('Error al procesar el pago con MercadoPago. Intenta de nuevo.')
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
        {!success ? (
          <>
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
                  className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                >
                  {loading ? (
                    <>
                      <span className="mr-2">⏳</span>
                      Procesando...
                    </>
                  ) : (
                    <>
                      <span className="mr-2">💝</span>
                      Confirmar Regalo
                    </>
                  )}
                </Button>
              </div>
            </form>
          </>
        ) : (
          /* Success State */
          <div className="text-center py-8">
            <div className="w-24 h-24 mx-auto mb-6 bg-gradient-to-br from-green-400 to-emerald-500 rounded-full flex items-center justify-center shadow-lg">
              <span className="text-white text-4xl">🎉</span>
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-4">
              ¡Gracias por tu Regalo!
            </h3>
            <div className="bg-green-50 border border-green-200 rounded-lg p-6 mb-6">
              <div className="space-y-2 text-sm">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Regalo:</span>
                  <span className="font-medium text-gray-900">{producto.titulo}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Contribución:</span>
                  <span className="font-bold text-green-600 text-lg">{formatCurrency(formData.monto)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">De:</span>
                  <span className="font-medium text-gray-900">{formData.quien_regala}</span>
                </div>
                {formData.mensaje && (
                  <div className="pt-3 border-t border-green-200">
                    <p className="text-gray-700 italic">"{formData.mensaje}"</p>
                  </div>
                )}
              </div>
            </div>
            <p className="text-gray-600 mb-6">
              Tu contribución está <span className="font-semibold text-yellow-600">pendiente de confirmación</span>. 
              Nos pondremos en contacto contigo pronto con los detalles de pago.
            </p>
            <div className="space-y-3">
              <Button
                onClick={handleProceedToPayment}
                loading={loading}
                className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-lg hover:shadow-xl transform hover:scale-105"
              >
                {loading ? (
                  <>
                    <span className="mr-2">⏳</span>
                    Redirigiendo a MercadoPago...
                  </>
                ) : (
                  <>
                    <span className="mr-2">💳</span>
                    Pagar con MercadoPago
                  </>
                )}
              </Button>
              
              <Button
                onClick={handleClose}
                variant="ghost"
                className="w-full text-gray-600 hover:text-gray-800"
                disabled={loading}
              >
                Pagar más tarde
              </Button>
            </div>
          </div>
        )}
      </div>
    </Modal>
  )
}
