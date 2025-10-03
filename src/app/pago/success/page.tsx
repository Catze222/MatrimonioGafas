/**
 * Payment Success Page
 * Página mostrada cuando el pago es exitoso
 */
'use client'

import { useEffect, useState, useCallback, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
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

function PaymentSuccessContent() {
  const searchParams = useSearchParams()
  // MercadoPago puede enviar el pago_id de diferentes maneras
  const pagoId = searchParams.get('pago_id') || 
                searchParams.get('external_reference') || 
                searchParams.get('preference_id')
  const [pago, setPago] = useState<Pago | null>(null)
  const [loading, setLoading] = useState(true)
  const [retryCount, setRetryCount] = useState(0)
  const [debugLogs, setDebugLogs] = useState<string[]>([])
  const MAX_RETRIES = 10 // 10 intentos × 3 segundos = ~30 segundos de espera

  const addDebugLog = (message: string) => {
    const timestamp = new Date().toLocaleTimeString()
    const logMessage = `[${timestamp}] ${message}`
    console.log(logMessage)
    setDebugLogs(prev => [...prev, logMessage])
  }

  const loadPagoDetails = useCallback(async () => {
    try {
      addDebugLog(`🔍 Consultando pago... (intento ${retryCount + 1}/${MAX_RETRIES + 1})`)
      addDebugLog(`🔑 Buscando pago con ID: ${pagoId}`)
      
      // Determinar si es un UUID (nuestro ID) o un payment_id de MercadoPago
      const isUUID = pagoId?.includes('-') || false
      addDebugLog(`🔍 Tipo de ID detectado: ${isUUID ? 'UUID (nuestro)' : 'Payment ID de MercadoPago'}`)
      
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

      if (error) {
        addDebugLog(`❌ Error consultando pago: ${error.message}`)
        throw error
      }
      
      const pagoData = data as unknown as Pago
      addDebugLog(`✅ Pago cargado, estado: ${pagoData.estado}`)
      
      // Si el pago está pendiente y aún tenemos reintentos, volver a consultar
      if (pagoData.estado === 'pendiente' && retryCount < MAX_RETRIES) {
        addDebugLog(`⏳ Pago aún pendiente, reintentando en 3 segundos...`)
        setRetryCount(prev => prev + 1)
        setTimeout(() => {
          loadPagoDetails()
        }, 3000) // Esperar 3 segundos antes de reintentar
      } else {
        // Ya está aprobado o se acabaron los reintentos
        if (pagoData.estado === 'aprobado') {
          addDebugLog(`🎉 ¡Pago aprobado detectado!`)
        } else {
          addDebugLog(`⚠️ Se acabaron los reintentos. Estado final: ${pagoData.estado}`)
        }
        setPago(pagoData)
        setLoading(false)
      }
    } catch (error) {
      addDebugLog(`❌ Error cargando pago: ${error}`)
      console.error('Error loading payment details:', error)
      setLoading(false)
    }
  }, [pagoId, retryCount, MAX_RETRIES])

  useEffect(() => {
    // Debug: mostrar todos los parámetros que envía MP
    console.log('🔍 MP Success URL params:', Object.fromEntries(searchParams.entries()))
    addDebugLog(`📥 Parámetros recibidos - pago_id: ${pagoId}`)
    
    if (pagoId) {
      // Esperar 3 segundos antes de la primera consulta
      // para dar tiempo al webhook de MercadoPago
      addDebugLog('⏳ Esperando 3 segundos para que el webhook procese el pago...')
      setTimeout(() => {
        loadPagoDetails()
      }, 3000)
    } else {
      addDebugLog('❌ No se encontró pago_id en los parámetros de URL')
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pagoId, searchParams]) // Removido loadPagoDetails de dependencias para evitar loops

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

  // Determinar el estado visual del pago
  const pagoAprobado = pago?.estado === 'aprobado'
  
  // Modo debug (activar con ?debug=true en la URL)
  const debugMode = searchParams.get('debug') === 'true'

  return (
    <div className="min-h-screen flex items-center justify-center p-4" style={{ backgroundColor: '#f8f6f0' }}>
      <div className="max-w-2xl mx-auto w-full">
        {/* Success/Pending Card */}
        <div className="bg-white rounded-lg shadow-md p-8 md:p-12 text-center border" style={{ borderColor: '#1e3a8a20' }}>
          {/* Icon */}
          <div className={`w-20 h-20 mx-auto mb-6 rounded-full flex items-center justify-center border-4 ${pagoAprobado ? 'border-green-600 bg-green-50' : 'border-yellow-600 bg-yellow-50'}`}>
            {pagoAprobado ? (
              <svg className="w-10 h-10" style={{ color: '#16a34a' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
              </svg>
            ) : (
              <svg className="w-10 h-10" style={{ color: '#ca8a04' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            )}
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
            {pagoAprobado ? '¡Pago Exitoso!' : 'Pago en Proceso'}
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
            {pagoAprobado 
              ? 'Tu contribución ha sido procesada exitosamente. ¡Gracias por ser parte de este momento especial!'
              : 'Tu pago está siendo procesado por MercadoPago. Esto puede tomar unos minutos. Te enviaremos un correo de confirmación cuando sea aprobado.'
            }
          </p>

          {/* Decorative line */}
          <div className="w-24 h-px mx-auto mb-8" style={{ backgroundColor: '#1e3a8a' }}></div>

          {/* Payment Details */}
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
                Resumen de tu contribución
              </h3>
              
              <div className="space-y-4">
                <div className="flex justify-between items-center py-2 border-b" style={{ borderColor: '#1e3a8a20' }}>
                  <span style={{ fontFamily: 'var(--font-montserrat)', fontSize: '14px', color: '#1e3a8a', opacity: 0.7 }}>Regalo:</span>
                  <span style={{ fontFamily: 'var(--font-montserrat)', fontSize: '14px', fontWeight: 500, color: '#1e3a8a' }}>{pago.producto?.titulo}</span>
                </div>
                
                <div className="flex justify-between items-center py-2 border-b" style={{ borderColor: '#1e3a8a20' }}>
                  <span style={{ fontFamily: 'var(--font-montserrat)', fontSize: '14px', color: '#1e3a8a', opacity: 0.7 }}>Contribución:</span>
                  <span style={{ fontFamily: 'var(--font-playfair)', fontSize: '20px', fontWeight: 600, color: pagoAprobado ? '#16a34a' : '#ca8a04' }}>{formatCurrency(pago.monto)}</span>
                </div>
                
                <div className="flex justify-between items-center py-2 border-b" style={{ borderColor: '#1e3a8a20' }}>
                  <span style={{ fontFamily: 'var(--font-montserrat)', fontSize: '14px', color: '#1e3a8a', opacity: 0.7 }}>Estado:</span>
                  <span 
                    className="px-3 py-1 rounded-full text-xs font-medium"
                    style={{ 
                      backgroundColor: pagoAprobado ? '#dcfce7' : '#fef9c3',
                      color: pagoAprobado ? '#166534' : '#854d0e'
                    }}
                  >
                    {pagoAprobado ? '✓ Aprobado' : '⏳ Procesando'}
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
            {pagoAprobado 
              ? 'Recibirás una confirmación por email de MercadoPago. Los novios han sido notificados de tu generosa contribución.'
              : 'Te enviaremos un correo de confirmación cuando MercadoPago apruebe el pago. Esto puede tomar unos minutos dependiendo del método de pago.'
            }
          </p>
        </div>

        {/* Debug Panel - Solo visible con ?debug=true */}
        {debugMode && (
          <div className="mt-8 bg-gray-900 text-green-400 rounded-lg p-4 font-mono text-xs max-h-96 overflow-y-auto">
            <div className="flex justify-between items-center mb-3 pb-2 border-b border-gray-700">
              <span className="font-bold text-white">🐛 DEBUG LOGS (Solo visible con ?debug=true)</span>
              <span className="text-gray-500">Total: {debugLogs.length}</span>
            </div>
            {debugLogs.length === 0 ? (
              <p className="text-gray-500">No hay logs todavía...</p>
            ) : (
              <div className="space-y-1">
                {debugLogs.map((log, index) => (
                  <div key={index} className="leading-relaxed">
                    {log}
                  </div>
                ))}
              </div>
            )}
            {pago && (
              <div className="mt-4 pt-3 border-t border-gray-700">
                <p className="text-white font-bold mb-2">📊 Estado del Pago:</p>
                <p>ID: {pago.id}</p>
                <p>Estado: <span className={pagoAprobado ? 'text-green-400' : 'text-yellow-400'}>{pago.estado}</span></p>
                <p>Reintentos realizados: {retryCount}</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

export default function PaymentSuccess() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#f8f6f0' }}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 mx-auto mb-4" style={{ borderColor: '#1e3a8a' }}></div>
          <p style={{ fontFamily: 'var(--font-montserrat)', fontSize: '16px', color: '#1e3a8a' }}>Cargando información del pago...</p>
        </div>
      </div>
    }>
      <PaymentSuccessContent />
    </Suspense>
  )
}
