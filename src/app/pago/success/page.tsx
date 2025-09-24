/**
 * Payment Success Page
 * Página mostrada cuando el pago es exitoso
 */
'use client'

import { useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'

type Pago = {
  id: string
  quien_regala: string
  monto: number
  mensaje?: string
  producto?: {
    titulo: string
    imagen_url: string
  }
}

export default function PaymentSuccess() {
  const searchParams = useSearchParams()
  // MercadoPago puede enviar el pago_id de diferentes maneras
  const pagoId = searchParams.get('pago_id') || 
                searchParams.get('external_reference') || 
                searchParams.get('preference_id')
  const [pago, setPago] = useState<Pago | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Debug: mostrar todos los parámetros que envía MP
    console.log('🔍 MP Success URL params:', Object.fromEntries(searchParams.entries()))
    
    if (pagoId) {
      loadPagoDetails()
    }
  }, [pagoId])

  const loadPagoDetails = async () => {
    try {
      const { data, error } = await supabase
        .from('pagos')
        .select(`
          id,
          quien_regala,
          monto,
          mensaje,
          producto:productos(titulo, imagen_url)
        `)
        .eq('id', pagoId)
        .single()

      if (error) throw error
      setPago(data)
    } catch (error) {
      console.error('Error loading payment details:', error)
    } finally {
      setLoading(false)
    }
  }

  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0
    }).format(amount)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando detalles del pago...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-50 flex items-center justify-center p-4">
      <div className="max-w-lg mx-auto">
        {/* Success Card */}
        <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
          {/* Success Icon */}
          <div className="w-24 h-24 mx-auto mb-6 bg-gradient-to-br from-green-400 to-emerald-500 rounded-full flex items-center justify-center shadow-lg">
            <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>

          {/* Title */}
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            ¡Pago Exitoso! 🎉
          </h1>
          
          <p className="text-lg text-gray-600 mb-8">
            Tu contribución ha sido procesada exitosamente. 
            ¡Gracias por ser parte de este momento especial!
          </p>

          {/* Payment Details */}
          {pago && (
            <div className="bg-green-50 border border-green-200 rounded-xl p-6 mb-8">
              <h3 className="text-lg font-semibold text-green-900 mb-4">Resumen de tu contribución</h3>
              
              <div className="space-y-3 text-sm">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Regalo:</span>
                  <span className="font-medium text-gray-900">{pago.producto?.titulo}</span>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Contribución:</span>
                  <span className="font-bold text-green-600 text-lg">{formatCurrency(pago.monto)}</span>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">De:</span>
                  <span className="font-medium text-gray-900">{pago.quien_regala}</span>
                </div>
                
                {pago.mensaje && (
                  <div className="pt-3 border-t border-green-200">
                    <p className="text-gray-700 italic text-left">
                      <span className="font-medium">Mensaje:</span> "{pago.mensaje}"
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="space-y-3">
            <Link 
              href="/"
              className="block w-full bg-gradient-to-r from-green-600 to-emerald-600 text-white px-6 py-3 rounded-lg hover:from-green-700 hover:to-emerald-700 transition-all font-medium shadow-lg hover:shadow-xl transform hover:scale-105"
            >
              <span className="mr-2">🏠</span>
              Volver al Inicio
            </Link>
            
            <Link 
              href="/#regalos"
              className="block w-full border border-gray-300 text-gray-700 px-6 py-3 rounded-lg hover:bg-gray-50 transition-colors font-medium"
            >
              <span className="mr-2">🎁</span>
              Ver Otros Regalos
            </Link>
          </div>
        </div>

        {/* Additional Info */}
        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600">
            Recibirás una confirmación por email de MercadoPago. 
            Los novios han sido notificados de tu generosa contribución.
          </p>
        </div>
      </div>
    </div>
  )
}
