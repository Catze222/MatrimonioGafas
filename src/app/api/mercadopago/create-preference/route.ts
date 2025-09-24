/**
 * API Route to create MercadoPago payment preference
 */
import { NextRequest, NextResponse } from 'next/server'
import { preference } from '@/lib/mercadopago'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { pagoId, monto, titulo, descripcion, contribuyente } = body

    // Validar datos requeridos
    if (!pagoId || !monto || !titulo || !contribuyente) {
      return NextResponse.json(
        { error: 'Missing required fields: pagoId, monto, titulo, contribuyente' },
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

    // Crear preferencia en MercadoPago
    const preferenceData = {
      items: [
        {
          id: `regalo-${pagoId}`,
          title: titulo,
          description: descripcion || `Contribución para ${titulo}`,
          picture_url: undefined, // Podríamos agregar la imagen del producto aquí
          category_id: 'others',
          quantity: 1,
          unit_price: amount,
          currency_id: 'COP'
        }
      ],
      payer: {
        name: contribuyente,
        surname: '',
        email: 'test@test.com'
      },
      back_urls: {
        success: `${process.env.NEXT_PUBLIC_APP_URL}/pago/success`,
        failure: `${process.env.NEXT_PUBLIC_APP_URL}/pago/failure`,
        pending: `${process.env.NEXT_PUBLIC_APP_URL}/pago/pending`
      },
      external_reference: pagoId,
      expires: false,
      payment_methods: {
        installments: 12
      }
    }

    console.log('📤 Sending to MP:', JSON.stringify(preferenceData, null, 2))

    const response = await preference.create({ body: preferenceData })

    console.log('MP preference created:', response.id)

    return NextResponse.json({
      preferenceId: response.id,
      initPoint: response.init_point, // URL para producción
      sandboxInitPoint: response.sandbox_init_point, // URL para pruebas
      checkoutUrl: response.sandbox_init_point || response.init_point // Usar sandbox para pruebas
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
