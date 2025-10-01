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

// Función para generar mensaje personalizado de comisión según el producto
function generarMensajeComision(productoTitulo: string): string {
  const mensajesComision: Record<string, string> = {
    '🐱 Alimentación y bienestar gatuno': '🙏 Perdón por esta comisión bancaria, pero preferimos que nuestros gatos se coman el salmón y no que el banco se lo lleve 😸',
    '🌴 Operación: sol, arena y descanso': '🙏 Perdón por esta comisión bancaria, pero no queremos que el banco se vaya de luna de miel con nosotros 😅',
    '🎶 Conciertos y festivales': '🙏 Perdón por esta comisión bancaria, pero preferimos que la música suene en nuestros oídos y no en los del banco 🎵',
    '⚽ Clásicos de amor: Pillos vs. Santuco': '🙏 Perdón por esta comisión bancaria, pero preferimos que los goles los celebremos nosotros y no el banco ⚽',
    '👓 Gafas vitalicias (porque somos gafufos)': '🙏 Perdón por esta comisión bancaria, pero queremos ver claro nuestro futuro, no el del banco 👓'
  }
  
  return mensajesComision[productoTitulo] || '🙏 Perdón por esta comisión bancaria, pero no queremos que el banco se vaya de luna de miel con nosotros 😅'
}

export default function ContribucionModal({ isOpen, onClose, producto }: ContribucionModalProps) {
  const [formData, setFormData] = useState({
    monto: '',
    quien_regala: '',
    email: '',
    mensaje: ''
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [displayMonto, setDisplayMonto] = useState('') // Para mostrar formato con separadores

  if (!producto) return null

  const resetForm = () => {
    setFormData({ monto: '', quien_regala: '', email: '', mensaje: '' })
    setDisplayMonto('')
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
    
    
    const monto = parseFloat(formData.monto)
    if (!formData.monto || isNaN(monto) || monto <= 0) {
      setError('Por favor ingresa un monto válido mayor a 0')
      return false
    }
    
    if (monto < 1000) {
      setError('El monto mínimo es de $1.000')
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
          email: formData.email.trim(),
          mensaje: formData.mensaje.trim() || null,
          monto: parseFloat(formData.monto),
          estado: 'pendiente'
        })
        .select()
        .single()

      if (error) throw error

      // Inmediatamente crear preferencia en MercadoPago y redirigir
      const montoOriginal = parseFloat(formData.monto)
      const montoTotal = calculateTotal(montoOriginal)
      
      const mpResponse = await fetch('/api/mercadopago/create-preference', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          pagoId: data.id,
          monto: montoTotal, // Enviar monto total con comisión
          titulo: producto.titulo,
          descripcion: producto.descripcion,
          contribuyente: formData.quien_regala.trim(),
          email: formData.email.trim()
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

  // Formatear número con separadores de miles
  const formatNumber = (value: string): string => {
    // Remover caracteres no numéricos excepto punto decimal
    const cleanValue = value.replace(/[^\d.]/g, '')
    if (!cleanValue) return ''
    
    const number = parseFloat(cleanValue)
    if (isNaN(number)) return ''
    
    return new Intl.NumberFormat('es-CO').format(number)
  }

  // Calcular comisión (4%)
  const calculateCommission = (amount: number): number => {
    return Math.round(amount * 0.04)
  }

  // Calcular total con comisión
  const calculateTotal = (amount: number): number => {
    return amount + calculateCommission(amount)
  }

  // Manejar cambio en el input de monto
  const handleMontoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    // Remover caracteres no numéricos
    const cleanValue = value.replace(/[^\d]/g, '')
    
    setFormData(prev => ({ ...prev, monto: cleanValue }))
    setDisplayMonto(formatNumber(cleanValue))
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title=""
      size="lg"
      showCloseButton={false}
    >
      <div className="p-4">
        {/* Header with Product Info - Más compacto */}
        <div className="text-center mb-6">
          <div className="w-16 h-16 mx-auto mb-3 relative rounded-lg overflow-hidden ring-2 ring-white shadow-md">
            <Image
              src={producto.imagen_url}
              alt={producto.titulo}
              fill
              className="object-cover"
            />
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-1">
            Contribuir a: {producto.titulo}
          </h2>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Amount Input */}
          <div>
            <label htmlFor="monto" className="block text-sm font-medium text-gray-900 mb-1">
              Monto a contribuir <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 font-medium">
                $
              </span>
              <input
                type="text"
                id="monto"
                value={displayMonto}
                onChange={handleMontoChange}
                className="w-full pl-8 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                placeholder="50.000"
                required
              />
            </div>
            {formData.monto && !isNaN(parseFloat(formData.monto)) && (
              <div className="mt-2 space-y-1">
                <p className="text-sm text-purple-600 font-medium">
                  Tu contribución: {formatCurrency(formData.monto)}
                </p>
                <p className="text-sm text-orange-600">
                  Comisión bancaria: {formatCurrency(calculateCommission(parseFloat(formData.monto)).toString())}
                </p>
                <p className="text-sm font-semibold text-gray-900 border-t pt-1">
                  Total a pagar: {formatCurrency(calculateTotal(parseFloat(formData.monto)).toString())}
                </p>
                <p className="text-xs text-gray-600 italic">
                  {generarMensajeComision(producto.titulo)}
                </p>
              </div>
            )}
          </div>

          {/* Name Input */}
          <div>
            <label htmlFor="quien_regala" className="block text-sm font-medium text-gray-900 mb-1">
              Tu nombre completo <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="quien_regala"
              value={formData.quien_regala}
              onChange={(e) => setFormData(prev => ({ ...prev, quien_regala: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              placeholder="Ej: María Fernanda González"
              required
            />
          </div>

          {/* Email Input */}
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-900 mb-1">
              Tu email <span className="text-red-500">*</span>
            </label>
            <input
              type="email"
              id="email"
              value={formData.email}
              onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              placeholder="Ej: maria@gmail.com"
              required
            />
          </div>


          {/* Message Input */}
          <div>
            <label htmlFor="mensaje" className="block text-sm font-medium text-gray-900 mb-1">
              Mensaje para los novios (opcional)
            </label>
            <textarea
              id="mensaje"
              value={formData.mensaje}
              onChange={(e) => setFormData(prev => ({ ...prev, mensaje: e.target.value }))}
              rows={2}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
              placeholder="¡Felicidades! Que disfruten mucho este regalo..."
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
          <div className="flex space-x-3 pt-3">
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
