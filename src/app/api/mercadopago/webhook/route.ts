/**
 * MercadoPago Webhook Handler
 * Recibe notificaciones cuando cambia el estado de un pago
 */
import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    console.log('🔔 MP Webhook received:', JSON.stringify(body, null, 2))

    // MercadoPago envía diferentes tipos de notificaciones
    if (body.type === 'payment') {
      const paymentId = body.data?.id
      const externalReference = body.external_reference

      console.log('💳 Payment notification:', { paymentId, externalReference })

      if (externalReference) {
        // En un entorno real, consultarías la API de MP para obtener el estado exacto del pago
        // Por ahora, asumimos que si llegó el webhook, el pago fue procesado
        
        // Simular diferentes estados para testing
        const estado = 'aprobado' // En producción esto vendría de MP API
        
        // Actualizar estado en nuestra base de datos
        const { data, error } = await supabase
          .from('pagos')
          .update({ 
            estado,
            mercadopago_payment_id: paymentId?.toString(),
            updated_at: new Date().toISOString()
          })
          .eq('id', externalReference)
          .select()

        if (error) {
          console.error('❌ Error updating payment in DB:', error)
          return NextResponse.json({ error: 'Database error' }, { status: 500 })
        }

        console.log('✅ Payment updated successfully:', data)
      }
    }

    // Responder OK para que MP no reintente
    return NextResponse.json({ received: true }, { status: 200 })
    
  } catch (error) {
    console.error('❌ Webhook error:', error)
    return NextResponse.json({ error: 'Webhook error' }, { status: 500 })
  }
}

// También manejar GET para testing
export async function GET() {
  return NextResponse.json({ 
    message: 'MercadoPago Webhook endpoint is working',
    timestamp: new Date().toISOString()
  })
}
