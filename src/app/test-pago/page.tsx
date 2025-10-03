/**
 * TEST PAGE - Payment Flow Simulator
 * Simula el flujo completo de pago sin MercadoPago
 */
'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import Link from 'next/link'

export default function TestPagoPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [testConfig, setTestConfig] = useState({
    delaySeconds: 10, // Cuántos segundos esperar antes de aprobar
    quienRegala: 'Test Usuario',
    monto: 50000,
    mensaje: 'Este es un pago de prueba',
    producto_id: '' // Lo obtendremos de la BD
  })

  const handleTestPayment = async () => {
    try {
      setLoading(true)
      console.log('🧪 Iniciando prueba de pago...')

      // 1. Obtener un producto de prueba
      const { data: productos, error: prodError } = await supabase
        .from('productos')
        .select('id, titulo')
        .limit(1)
        .single()

      if (prodError || !productos) {
        alert('Error: No hay productos en la base de datos. Crea uno primero.')
        setLoading(false)
        return
      }

      console.log('✅ Producto seleccionado:', productos.titulo)

      // 2. Crear el pago con estado "pendiente"
      const { data: pago, error: pagoError } = await supabase
        .from('pagos')
        .insert({
          producto_id: productos.id,
          quien_regala: testConfig.quienRegala,
          email: 'test@example.com',
          monto: testConfig.monto,
          mensaje: testConfig.mensaje,
          estado: 'pendiente', // Comienza como pendiente
          mercadopago_payment_id: null
        })
        .select('id')
        .single()

      if (pagoError || !pago) {
        console.error('❌ Error creando pago:', pagoError)
        alert('Error creando pago de prueba')
        setLoading(false)
        return
      }

      console.log('✅ Pago creado con ID:', pago.id)
      console.log(`⏳ Esperando ${testConfig.delaySeconds} segundos antes de aprobar...`)

      // 3. Simular el webhook de MercadoPago que aprueba el pago después de X segundos
      setTimeout(async () => {
        console.log('🔄 Simulando webhook de MercadoPago...')
        
        const { error: updateError } = await supabase
          .from('pagos')
          .update({ 
            estado: 'aprobado',
            mercadopago_payment_id: 'TEST-' + Date.now()
          })
          .eq('id', pago.id)

        if (updateError) {
          console.error('❌ Error actualizando pago:', updateError)
        } else {
          console.log('✅ Pago aprobado en la base de datos')
        }
      }, testConfig.delaySeconds * 1000)

      // 4. Redirigir inmediatamente a la página de success (como lo hace MercadoPago)
      console.log('🔀 Redirigiendo a página de confirmación...')
      router.push(`/pago/success?pago_id=${pago.id}`)

    } catch (error) {
      console.error('❌ Error en prueba:', error)
      alert('Error durante la prueba')
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen p-8" style={{ backgroundColor: '#f8f6f0' }}>
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-lg shadow-md p-8 border" style={{ borderColor: '#1e3a8a20' }}>
          <h1 
            className="mb-6 text-center"
            style={{ 
              fontFamily: 'var(--font-playfair)', 
              fontSize: '32px',
              color: '#1e3a8a',
              fontWeight: 400
            }}
          >
            🧪 Simulador de Pago
          </h1>

          <div className="w-24 h-px mx-auto mb-8" style={{ backgroundColor: '#1e3a8a' }}></div>

          <div className="space-y-6 mb-8">
            <div>
              <label className="block mb-2" style={{ fontFamily: 'var(--font-montserrat)', fontSize: '14px', color: '#1e3a8a', fontWeight: 500 }}>
                Delay de aprobación (segundos):
              </label>
              <input
                type="number"
                min="1"
                max="60"
                value={testConfig.delaySeconds}
                onChange={(e) => setTestConfig({ ...testConfig, delaySeconds: parseInt(e.target.value) })}
                className="w-full px-4 py-2 border rounded-lg"
                style={{ borderColor: '#1e3a8a40', fontFamily: 'var(--font-montserrat)' }}
              />
              <p className="mt-1 text-xs" style={{ color: '#1e3a8a', opacity: 0.6 }}>
                Tiempo que tardará el &quot;webhook&quot; en aprobar el pago
              </p>
            </div>

            <div>
              <label className="block mb-2" style={{ fontFamily: 'var(--font-montserrat)', fontSize: '14px', color: '#1e3a8a', fontWeight: 500 }}>
                Nombre:
              </label>
              <input
                type="text"
                value={testConfig.quienRegala}
                onChange={(e) => setTestConfig({ ...testConfig, quienRegala: e.target.value })}
                className="w-full px-4 py-2 border rounded-lg"
                style={{ borderColor: '#1e3a8a40', fontFamily: 'var(--font-montserrat)' }}
              />
            </div>

            <div>
              <label className="block mb-2" style={{ fontFamily: 'var(--font-montserrat)', fontSize: '14px', color: '#1e3a8a', fontWeight: 500 }}>
                Monto (COP):
              </label>
              <input
                type="number"
                min="1000"
                step="1000"
                value={testConfig.monto}
                onChange={(e) => setTestConfig({ ...testConfig, monto: parseInt(e.target.value) })}
                className="w-full px-4 py-2 border rounded-lg"
                style={{ borderColor: '#1e3a8a40', fontFamily: 'var(--font-montserrat)' }}
              />
            </div>

            <div>
              <label className="block mb-2" style={{ fontFamily: 'var(--font-montserrat)', fontSize: '14px', color: '#1e3a8a', fontWeight: 500 }}>
                Mensaje (opcional):
              </label>
              <textarea
                value={testConfig.mensaje}
                onChange={(e) => setTestConfig({ ...testConfig, mensaje: e.target.value })}
                className="w-full px-4 py-2 border rounded-lg"
                rows={3}
                style={{ borderColor: '#1e3a8a40', fontFamily: 'var(--font-montserrat)' }}
              />
            </div>
          </div>

          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
            <h3 className="font-semibold mb-2" style={{ fontFamily: 'var(--font-montserrat)', fontSize: '14px', color: '#854d0e' }}>
              📋 Cómo funciona esta prueba:
            </h3>
            <ol className="text-sm space-y-1 ml-4 list-decimal" style={{ fontFamily: 'var(--font-montserrat)', color: '#854d0e' }}>
              <li>Crea un pago con estado &quot;pendiente&quot;</li>
              <li>Te redirige inmediatamente a /pago/success (como MercadoPago)</li>
              <li>Después de {testConfig.delaySeconds} segundos, actualiza el estado a &quot;aprobado&quot;</li>
              <li>La página de success debería detectar el cambio y mostrar &quot;Pago Exitoso&quot;</li>
            </ol>
          </div>

          <button
            onClick={handleTestPayment}
            disabled={loading}
            className="w-full text-white px-6 py-3 rounded-lg transition-all font-medium disabled:opacity-50"
            style={{ 
              backgroundColor: '#1e3a8a',
              fontFamily: 'var(--font-montserrat)',
              fontSize: '16px'
            }}
          >
            {loading ? 'Procesando...' : '🚀 Iniciar Prueba de Pago'}
          </button>

          <div className="mt-6 text-center">
            <Link 
              href="/"
              className="text-sm hover:underline"
              style={{ fontFamily: 'var(--font-montserrat)', color: '#1e3a8a' }}
            >
              ← Volver al inicio
            </Link>
          </div>
        </div>

        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="font-semibold mb-3" style={{ fontFamily: 'var(--font-playfair)', fontSize: '18px', color: '#1e3a8a' }}>
            🔍 Qué revisar en la consola del navegador:
          </h3>
          <ul className="text-sm space-y-2 ml-4 list-disc" style={{ fontFamily: 'var(--font-montserrat)', color: '#1e3a8a' }}>
            <li>Verás logs de cuándo consulta la base de datos</li>
            <li>Verás el estado del pago en cada intento</li>
            <li>Deberías ver el cambio de &quot;pendiente&quot; a &quot;aprobado&quot;</li>
            <li>La UI debería cambiar de amarillo (procesando) a verde (exitoso)</li>
          </ul>
        </div>

        <div className="mt-4 bg-red-50 border border-red-200 rounded-lg p-6">
          <h3 className="font-semibold mb-3" style={{ fontFamily: 'var(--font-playfair)', fontSize: '18px', color: '#991b1b' }}>
            ⚠️ Importante - Limpieza:
          </h3>
          <p className="text-sm" style={{ fontFamily: 'var(--font-montserrat)', color: '#991b1b' }}>
            Esta prueba crea pagos reales en tu base de datos. Después de probar, ve al panel de admin 
            y elimina los pagos de prueba si quieres mantener tu BD limpia.
          </p>
        </div>
      </div>
    </div>
  )
}

