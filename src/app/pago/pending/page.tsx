/**
 * Payment Pending Page
 * Página mostrada cuando el pago está pendiente (ej: transferencia bancaria)
 */
'use client'

import { useSearchParams } from 'next/navigation'
import Link from 'next/link'

export default function PaymentPending() {
  const searchParams = useSearchParams()
  const pagoId = searchParams.get('pago_id')

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-50 to-amber-50 flex items-center justify-center p-4">
      <div className="max-w-lg mx-auto">
        {/* Pending Card */}
        <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
          {/* Pending Icon */}
          <div className="w-24 h-24 mx-auto mb-6 bg-gradient-to-br from-yellow-400 to-amber-500 rounded-full flex items-center justify-center shadow-lg">
            <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>

          {/* Title */}
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Pago Pendiente ⏳
          </h1>
          
          <p className="text-lg text-gray-600 mb-8">
            Tu pago está siendo procesado. Esto puede tomar unos minutos 
            dependiendo del método de pago seleccionado.
          </p>

          {/* Information */}
          <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-6 mb-8 text-left">
            <h3 className="text-lg font-semibold text-yellow-900 mb-4">¿Qué significa esto?</h3>
            <div className="space-y-3 text-sm text-yellow-800">
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
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-6 mb-8 text-left">
            <h3 className="text-lg font-semibold text-blue-900 mb-3">Próximos pasos:</h3>
            <ol className="space-y-2 text-sm text-blue-800">
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
                <span>Tu contribución aparecerá como confirmada en nuestro sistema</span>
              </li>
            </ol>
          </div>

          {/* Action Buttons */}
          <div className="space-y-3">
            <Link 
              href="/"
              className="block w-full bg-gradient-to-r from-yellow-600 to-amber-600 text-white px-6 py-3 rounded-lg hover:from-yellow-700 hover:to-amber-700 transition-all font-medium shadow-lg hover:shadow-xl transform hover:scale-105"
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
          <p className="text-sm text-gray-600 mb-4">
            No es necesario que hagas nada más. Te mantendremos informado 
            sobre el estado de tu contribución.
          </p>
          
          <div className="bg-white rounded-lg p-4 shadow-sm">
            <p className="text-xs text-gray-500">
              <strong>Código de referencia:</strong> {pagoId || 'N/A'}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
