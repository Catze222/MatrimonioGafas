/**
 * Test Email API Route
 * Endpoint para probar el envío de correos de agradecimiento
 */
import { NextRequest, NextResponse } from 'next/server'
import { enviarCorreoAgradecimiento } from '@/lib/email'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { quien_regala, email_contribuyente, producto_titulo, monto, mensaje } = body

    // Validar datos requeridos
    if (!quien_regala || !producto_titulo || !monto) {
      return NextResponse.json(
        { error: 'Missing required fields: quien_regala, producto_titulo, monto' },
        { status: 400 }
      )
    }

    console.log('🧪 Testing email with data:', {
      quien_regala,
      email_contribuyente,
      producto_titulo,
      monto,
      mensaje
    })

    // Enviar correo de prueba
    const emailEnviado = await enviarCorreoAgradecimiento({
      quien_regala,
      email_contribuyente,
      producto_titulo,
      monto: Number(monto),
      mensaje
    })

    if (emailEnviado) {
      return NextResponse.json({
        success: true,
        message: 'Correo de agradecimiento enviado exitosamente'
      })
    } else {
      return NextResponse.json({
        success: false,
        message: 'No se pudo enviar el correo de agradecimiento'
      }, { status: 500 })
    }

  } catch (error) {
    console.error('❌ Error in test email endpoint:', error)
    return NextResponse.json({
      success: false,
      error: 'Error interno del servidor',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

export async function GET() {
  return NextResponse.json({
    message: 'Test Email endpoint is working',
    usage: 'POST with { quien_regala, email_contribuyente?, producto_titulo, monto, mensaje? }',
    timestamp: new Date().toISOString()
  })
}
