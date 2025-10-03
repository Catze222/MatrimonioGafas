/**
 * Payment Pending Page
 * Página mostrada cuando el pago está pendiente (ej: transferencia bancaria)
 * Ahora con sistema de reintentos para detectar aprobación automática
 */
'use client'

import { useEffect, useState, useCallback, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'

type Pago = {
  id: string
  quien_regala: string
  monto: number
  mensaje?: string
  estado: string
  producto?: {
    titulo: string
    imagen_url: string
  }
}

function PaymentPendingContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const pagoId = searchParams.get('payment_id') || 
                searchParams.get('pago_id') ||
                searchParams.get('external_reference') || 
                searchParams.get('preference_id')
  
  const [pago, setPago] = useState<Pago | null>(null)
  const [loading, setLoading] = useState(true)
  const [retryCount, setRetryCount] = useState(0)
  const MAX_RETRIES = 10 // 10 intentos × 3 segundos = ~30 segundos de espera

  const loadPagoDetails = useCallback(async () => {
    if (!pagoId) {
      setLoading(false)
      return
    }

    try {
      // Determinar si es un UUID (nuestro ID) o un payment_id de MercadoPago
      const isUUID = pagoId.includes('-')
      
      const { data, error } = await supabase
        .from('pagos')
        .select(`
          id,
          quien_regala,
          monto,
          mensaje,
          estado,
          mercadopago_payment_id,
          producto:productos(titulo, imagen_url)
        `)
        .eq(isUUID ? 'id' : 'mercadopago_payment_id', pagoId)
        .single()

      if (error) throw error
      
      const pagoData = data as unknown as Pago
      
      // Si el pago se aprobó, redirigir a la página de success
      if (pagoData.estado === 'aprobado') {
        setTimeout(() => {
          router.push(`/pago/success?pago_id=${pagoId}`)
        }, 1000)
        return
      }
      
      // Si el pago está pendiente y aún tenemos reintentos, volver a consultar
      if (pagoData.estado === 'pendiente' && retryCount < MAX_RETRIES) {
        setRetryCount(prev => prev + 1)
        setTimeout(() => {
          loadPagoDetails()
        }, 3000) // Esperar 3 segundos antes de reintentar
      } else {
        // Ya está aprobado o se acabaron los reintentos
        setPago(pagoData)
        setLoading(false)
      }
    } catch (error) {
      console.error('Error loading payment details:', error)
      setLoading(false)
    }
  }, [pagoId, retryCount, MAX_RETRIES, router])

  useEffect(() => {
    if (pagoId) {
      setTimeout(() => {
        loadPagoDetails()
      }, 3000)
    } else {
      setLoading(false)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pagoId, searchParams])

  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0
    }).format(amount)
  }


  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#f8f6f0' }}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 mx-auto mb-4" style={{ borderColor: '#1e3a8a' }}></div>
          <p style={{ fontFamily: 'var(--font-montserrat)', fontSize: '16px', color: '#1e3a8a' }}>Verificando el estado de tu pago...</p>
          <p style={{ fontFamily: 'var(--font-montserrat)', fontSize: '14px', color: '#1e3a8a', opacity: 0.7 }} className="mt-2">Esto puede tomar unos segundos</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4" style={{ backgroundColor: '#f8f6f0' }}>
      <div className="max-w-2xl mx-auto w-full">
        {/* Pending Card */}
        <div className="bg-white rounded-lg shadow-md p-8 md:p-12 text-center border" style={{ borderColor: '#1e3a8a20' }}>
          {/* Icon */}
          <div className="w-20 h-20 mx-auto mb-6 rounded-full flex items-center justify-center border-4 border-yellow-600 bg-yellow-50">
            <svg className="w-10 h-10" style={{ color: '#ca8a04' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>

          {/* Title */}
          <h1 
            className="mb-4" 
            style={{ 
              fontFamily: 'var(--font-playfair)', 
              fontSize: 'clamp(28px, 5vw, 40px)', 
              fontWeight: 400,
              color: '#1e3a8a',
              letterSpacing: '1px'
            }}
          >
            Pago en Proceso
          </h1>
          
          <p 
            className="mb-8 max-w-xl mx-auto leading-relaxed"
            style={{ 
              fontFamily: 'var(--font-montserrat)', 
              fontSize: '16px',
              color: '#1e3a8a',
              opacity: 0.9
            }}
          >
            Tu regalo está siendo procesado por MercadoPago. Esto puede tomar unos minutos 
            dependiendo del método de pago seleccionado.
          </p>

          {/* Decorative line */}
          <div className="w-24 h-px mx-auto mb-8" style={{ backgroundColor: '#1e3a8a' }}></div>

          {/* Payment Details (if available) */}
          {pago && (
            <div className="rounded-lg p-6 mb-8 border" style={{ backgroundColor: '#f8f6f0', borderColor: '#1e3a8a20' }}>
              <h3 
                className="mb-6"
                style={{ 
                  fontFamily: 'var(--font-playfair)', 
                  fontSize: '20px',
                  fontWeight: 400,
                  color: '#1e3a8a',
                  letterSpacing: '1px'
                }}
              >
                Resumen de tu regalo
              </h3>
              
              <div className="space-y-4">
                {pago.producto && (
                  <div className="flex justify-between items-center py-2 border-b" style={{ borderColor: '#1e3a8a20' }}>
                    <span style={{ fontFamily: 'var(--font-montserrat)', fontSize: '14px', color: '#1e3a8a', opacity: 0.7 }}>Regalo:</span>
                    <span style={{ fontFamily: 'var(--font-montserrat)', fontSize: '14px', fontWeight: 500, color: '#1e3a8a' }}>{pago.producto.titulo}</span>
                  </div>
                )}
                
                <div className="flex justify-between items-center py-2 border-b" style={{ borderColor: '#1e3a8a20' }}>
                  <span style={{ fontFamily: 'var(--font-montserrat)', fontSize: '14px', color: '#1e3a8a', opacity: 0.7 }}>Monto:</span>
                  <span style={{ fontFamily: 'var(--font-playfair)', fontSize: '20px', fontWeight: 600, color: '#ca8a04' }}>{formatCurrency(pago.monto)}</span>
                </div>
                
                <div className="flex justify-between items-center py-2 border-b" style={{ borderColor: '#1e3a8a20' }}>
                  <span style={{ fontFamily: 'var(--font-montserrat)', fontSize: '14px', color: '#1e3a8a', opacity: 0.7 }}>Estado:</span>
                  <span 
                    className="px-3 py-1 rounded-full text-xs font-medium"
                    style={{ 
                      backgroundColor: '#fef9c3',
                      color: '#854d0e'
                    }}
                  >
                    ⏳ Procesando
                  </span>
                </div>
                
                <div className="flex justify-between items-center py-2 border-b" style={{ borderColor: '#1e3a8a20' }}>
                  <span style={{ fontFamily: 'var(--font-montserrat)', fontSize: '14px', color: '#1e3a8a', opacity: 0.7 }}>De:</span>
                  <span style={{ fontFamily: 'var(--font-montserrat)', fontSize: '14px', fontWeight: 500, color: '#1e3a8a' }}>{pago.quien_regala}</span>
                </div>
                
                {pago.mensaje && (
                  <div className="pt-4">
                    <p className="text-left leading-relaxed" style={{ fontFamily: 'var(--font-montserrat)', fontSize: '14px', color: '#1e3a8a', fontStyle: 'italic' }}>
                      <span className="font-medium">Mensaje:</span> &quot;{pago.mensaje}&quot;
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Information */}
          <div className="rounded-lg p-6 mb-8 border text-left" style={{ backgroundColor: '#fef9c3', borderColor: '#fbbf24' }}>
            <h3 className="font-semibold mb-4" style={{ fontFamily: 'var(--font-playfair)', fontSize: '18px', color: '#854d0e' }}>
              ¿Qué significa esto?
            </h3>
            <div className="space-y-3 text-sm" style={{ fontFamily: 'var(--font-montserrat)', color: '#854d0e' }}>
              <div className="flex items-start">
                <span className="mr-2">💳</span>
                <div>
                  <strong>Tarjeta de crédito:</strong> El pago puede tardar hasta 5 minutos en confirmarse
                </div>
              </div>
              <div className="flex items-start">
                <span className="mr-2">🏦</span>
                <div>
                  <strong>Transferencia bancaria (PSE):</strong> Puede tardar hasta 1 día hábil
                </div>
              </div>
              <div className="flex items-start">
                <span className="mr-2">💵</span>
                <div>
                  <strong>Efectivo:</strong> Tienes 3 días para completar el pago en el punto autorizado
                </div>
              </div>
            </div>
          </div>

          {/* Next Steps */}
          <div className="rounded-lg p-6 mb-8 border text-left" style={{ backgroundColor: '#dbeafe', borderColor: '#60a5fa' }}>
            <h3 className="font-semibold mb-3" style={{ fontFamily: 'var(--font-playfair)', fontSize: '18px', color: '#1e40af' }}>
              Próximos pasos:
            </h3>
            <ol className="space-y-2 text-sm" style={{ fontFamily: 'var(--font-montserrat)', color: '#1e40af' }}>
              <li className="flex items-start">
                <span className="mr-2 font-bold">1.</span>
                <span>Recibirás una confirmación por email cuando el pago sea aprobado</span>
              </li>
              <li className="flex items-start">
                <span className="mr-2 font-bold">2.</span>
                <span>Los novios serán notificados automáticamente</span>
              </li>
              <li className="flex items-start">
                <span className="mr-2 font-bold">3.</span>
                <span>Tu regalo aparecerá como confirmado en nuestro sistema</span>
              </li>
            </ol>
          </div>

          {/* Action Buttons */}
          <div className="space-y-3">
            <Link 
              href="/"
              className="block w-full text-white px-6 py-3 rounded-lg transition-all font-medium hover:opacity-90"
              style={{ 
                backgroundColor: '#1e3a8a',
                fontFamily: 'var(--font-montserrat)',
                fontSize: '15px'
              }}
            >
              Volver al Inicio
            </Link>
            
            <Link 
              href="/regalos"
              className="block w-full px-6 py-3 rounded-lg transition-all font-medium hover:opacity-90 border"
              style={{ 
                borderColor: '#1e3a8a',
                color: '#1e3a8a',
                fontFamily: 'var(--font-montserrat)',
                fontSize: '15px'
              }}
            >
              Ver Otros Regalos
            </Link>
          </div>
        </div>

        {/* Additional Info */}
        <div className="mt-6 text-center">
          <p style={{ fontFamily: 'var(--font-montserrat)', fontSize: '13px', color: '#1e3a8a', opacity: 0.7 }}>
            No es necesario que hagas nada más. Te mantendremos informado sobre el estado de tu regalo.
          </p>
          {pagoId && (
            <div className="mt-4 bg-white rounded-lg p-4 shadow-sm">
              <p className="text-xs" style={{ fontFamily: 'var(--font-montserrat)', color: '#1e3a8a', opacity: 0.6 }}>
                <strong>Código de referencia:</strong> {pagoId}
              </p>
            </div>
          )}
        </div>

      </div>
    </div>
  )
}

export default function PaymentPending() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#f8f6f0' }}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 mx-auto mb-4" style={{ borderColor: '#1e3a8a' }}></div>
          <p style={{ fontFamily: 'var(--font-montserrat)', fontSize: '16px', color: '#1e3a8a' }}>Cargando información del pago...</p>
        </div>
      </div>
    }>
      <PaymentPendingContent />
    </Suspense>
  )
}
