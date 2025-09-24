/**
 * Payment Failure Page
 * Página mostrada cuando el pago falla o es rechazado
 */
'use client'

import { useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'

export default function PaymentFailure() {
  const searchParams = useSearchParams()
  const pagoId = searchParams.get('pago_id')

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-rose-50 flex items-center justify-center p-4">
      <div className="max-w-lg mx-auto">
        {/* Failure Card */}
        <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
          {/* Failure Icon */}
          <div className="w-24 h-24 mx-auto mb-6 bg-gradient-to-br from-red-400 to-rose-500 rounded-full flex items-center justify-center shadow-lg">
            <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>

          {/* Title */}
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Pago No Procesado
          </h1>
          
          <p className="text-lg text-gray-600 mb-8">
            Tu pago no pudo ser procesado en este momento. 
            Esto puede deberse a varios motivos como fondos insuficientes, 
            problemas con la tarjeta o conexión.
          </p>

          {/* Common Reasons */}
          <div className="bg-red-50 border border-red-200 rounded-xl p-6 mb-8 text-left">
            <h3 className="text-lg font-semibold text-red-900 mb-4">Posibles causas:</h3>
            <ul className="space-y-2 text-sm text-red-800">
              <li className="flex items-start">
                <span className="mr-2">•</span>
                <span>Fondos insuficientes en tu cuenta</span>
              </li>
              <li className="flex items-start">
                <span className="mr-2">•</span>
                <span>Datos de la tarjeta incorrectos</span>
              </li>
              <li className="flex items-start">
                <span className="mr-2">•</span>
                <span>Tarjeta vencida o bloqueada</span>
              </li>
              <li className="flex items-start">
                <span className="mr-2">•</span>
                <span>Problemas temporales de conexión</span>
              </li>
              <li className="flex items-start">
                <span className="mr-2">•</span>
                <span>Límites de compra excedidos</span>
              </li>
            </ul>
          </div>

          {/* Action Buttons */}
          <div className="space-y-3">
            <button 
              onClick={() => window.history.back()}
              className="block w-full bg-gradient-to-r from-red-600 to-rose-600 text-white px-6 py-3 rounded-lg hover:from-red-700 hover:to-rose-700 transition-all font-medium shadow-lg hover:shadow-xl transform hover:scale-105"
            >
              <span className="mr-2">🔄</span>
              Intentar Nuevamente
            </button>
            
            <Link 
              href="/"
              className="block w-full border border-gray-300 text-gray-700 px-6 py-3 rounded-lg hover:bg-gray-50 transition-colors font-medium"
            >
              <span className="mr-2">🏠</span>
              Volver al Inicio
            </Link>
          </div>
        </div>

        {/* Additional Help */}
        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600 mb-4">
            Si el problema persiste, puedes contactar directamente a los novios 
            o intentar con otro método de pago.
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
