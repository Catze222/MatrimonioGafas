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
    console.log('🔔 Webhook timestamp:', new Date().toISOString())

    // MercadoPago envía diferentes tipos de notificaciones
    if (body.type === 'payment') {
      const paymentId = body.data?.id
      
      console.log('💳 Payment notification for ID:', paymentId)

      if (paymentId) {
        // Consultar la API de MercadoPago para obtener el estado real del pago
        try {
          const mpResponse = await fetch(`https://api.mercadopago.com/v1/payments/${paymentId}`, {
            headers: {
              'Authorization': `Bearer ${process.env.MERCADOPAGO_ACCESS_TOKEN}`
            }
          })

          if (!mpResponse.ok) {
            console.error('❌ Error querying MP API:', mpResponse.status)
            return NextResponse.json({ error: 'MP API error' }, { status: 500 })
          }

          const paymentData = await mpResponse.json()
          console.log('💳 Payment data from MP:', {
            id: paymentData.id,
            status: paymentData.status,
            external_reference: paymentData.external_reference,
            transaction_amount: paymentData.transaction_amount
          })

          // Mapear estados de MercadoPago a nuestros estados
          let estado = 'pendiente'
          switch (paymentData.status) {
            case 'approved':
              estado = 'aprobado'
              break
            case 'rejected':
              estado = 'rechazado'
              break
            case 'cancelled':
              estado = 'cancelado'
              break
            case 'pending':
            case 'in_process':
              estado = 'pendiente'
              break
            default:
              estado = 'pendiente'
          }

          // Actualizar estado en nuestra base de datos usando external_reference
          if (paymentData.external_reference) {
            console.log('🔄 Attempting to update payment in DB:')
            console.log('- Payment ID:', paymentId)
            console.log('- External Reference:', paymentData.external_reference)
            console.log('- New Status:', estado)
            
            const { data, error } = await supabase
              .from('pagos')
              .update({ 
                estado,
                mercadopago_payment_id: paymentId.toString(),
                updated_at: new Date().toISOString()
              })
              .eq('id', paymentData.external_reference)
              .select()

            if (error) {
              console.error('❌ Error updating payment in DB:', error)
              console.error('❌ Supabase error details:', JSON.stringify(error, null, 2))
              // NO fallar el webhook - responder 200 para que MP no reintente
              console.log('⚠️ Responding 200 to MP despite DB error')
            } else {
              console.log('✅ Payment updated successfully:', data)
              console.log('✅ Updated rows:', data?.length || 0)
            }
          } else {
            console.warn('⚠️ No external_reference found in payment data')
          }

        } catch (mpError) {
          console.error('❌ Error querying MercadoPago API:', mpError)
          // NO fallar el webhook por error de MP API - responder 200 para que MP no reintente
          console.log('⚠️ Responding 200 to MP despite API error')
        }
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
