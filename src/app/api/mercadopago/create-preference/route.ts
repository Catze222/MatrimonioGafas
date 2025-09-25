/**
 * API Route to create MercadoPago payment preference
 */
import { NextRequest, NextResponse } from 'next/server'
import { preference } from '@/lib/mercadopago'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { pagoId, monto, titulo, contribuyente, email, telefono } = body

    // Validar datos requeridos
    if (!pagoId || !monto || !titulo || !contribuyente || !email) {
      return NextResponse.json(
        { error: 'Missing required fields: pagoId, monto, titulo, contribuyente, email' },
        { status: 400 }
      )
    }

    // Validar que el monto sea un número válido
    const amount = Number(monto)
    if (isNaN(amount) || amount <= 0) {
      return NextResponse.json(
        { error: 'Invalid amount' },
        { status: 400 }
      )
    }

    console.log('Creating MP preference for:', { pagoId, amount, titulo, contribuyente })

    // Crear preferencia con datos del usuario
    const preferenceData = {
      items: [
        {
          id: `regalo-${pagoId}`,
          title: titulo,
          quantity: 1,
          unit_price: amount,
          currency_id: 'COP'
        }
      ],
      payer: {
        name: contribuyente.split(' ')[0] || contribuyente,
        surname: contribuyente.split(' ').slice(1).join(' ') || '',
        email: email,
        ...(telefono && telefono.trim() && {
          phone: {
            area_code: '57', // Código de Colombia
            number: telefono
          }
        })
      },
      back_urls: {
        success: `${process.env.NEXT_PUBLIC_APP_URL}/pago/success`,
        failure: `${process.env.NEXT_PUBLIC_APP_URL}/pago/failure`,
        pending: `${process.env.NEXT_PUBLIC_APP_URL}/pago/pending`
      },
      external_reference: pagoId,
      auto_return: 'approved'
    }

    console.log('📤 Sending to MP:', JSON.stringify(preferenceData, null, 2))

    const response = await preference.create({ body: preferenceData })

    console.log('✅ MP preference created successfully:')
    console.log('- ID:', response.id)
    console.log('- Init Point (PROD):', response.init_point)
    console.log('- Sandbox Point (TEST):', response.sandbox_init_point)
    console.log('- Collector ID:', response.collector_id)
    console.log('- Client ID:', response.client_id)

    return NextResponse.json({
      preferenceId: response.id,
      initPoint: response.init_point, // URL para producción
      sandboxInitPoint: response.sandbox_init_point, // URL para pruebas
      checkoutUrl: response.init_point || response.sandbox_init_point // Usar producción por defecto
    })

  } catch (error: unknown) {
    console.error('❌ Error creating MP preference:', error)
    
    // Log detallado del error para debug
    if (error && typeof error === 'object' && 'response' in error) {
      const errorWithResponse = error as { response: { status: number; data: unknown } }
      console.error('❌ MP API Error Response:', errorWithResponse.response.status)
      console.error('❌ MP API Error Data:', JSON.stringify(errorWithResponse.response.data, null, 2))
    }
    
    if (error instanceof Error) {
      console.error('❌ Error Message:', error.message)
    }

    // Verificar variables de entorno
    console.log('🔍 Environment check:')
    console.log('- ACCESS_TOKEN exists:', !!process.env.MERCADOPAGO_ACCESS_TOKEN)
    console.log('- ACCESS_TOKEN starts with APP_USR:', process.env.MERCADOPAGO_ACCESS_TOKEN?.startsWith('APP_USR'))
    console.log('- APP_URL:', process.env.NEXT_PUBLIC_APP_URL)
    
    return NextResponse.json(
      { 
        error: 'Error creating payment preference',
        details: process.env.NODE_ENV === 'development' ? (error instanceof Error ? error.message : 'Unknown error') : undefined,
        debugInfo: process.env.NODE_ENV === 'development' ? {
          hasAccessToken: !!process.env.MERCADOPAGO_ACCESS_TOKEN,
          tokenPrefix: process.env.MERCADOPAGO_ACCESS_TOKEN?.substring(0, 10),
          appUrl: process.env.NEXT_PUBLIC_APP_URL
        } : undefined
      },
      { status: 500 }
    )
  }
}
