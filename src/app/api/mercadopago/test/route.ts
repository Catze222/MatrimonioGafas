/**
 * Test route for MercadoPago configuration
 */
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    // Verificar variables de entorno
    const hasAccessToken = !!process.env.MERCADOPAGO_ACCESS_TOKEN
    const hasPublicKey = !!process.env.NEXT_PUBLIC_MERCADOPAGO_PUBLIC_KEY
    const hasAppUrl = !!process.env.NEXT_PUBLIC_APP_URL
    
    const accessTokenPrefix = process.env.MERCADOPAGO_ACCESS_TOKEN?.substring(0, 10)
    const publicKeyPrefix = process.env.NEXT_PUBLIC_MERCADOPAGO_PUBLIC_KEY?.substring(0, 10)
    
    return NextResponse.json({
      status: 'MercadoPago Configuration Check',
      environment: {
        hasAccessToken,
        hasPublicKey,
        hasAppUrl,
        accessTokenPrefix,
        publicKeyPrefix,
        appUrl: process.env.NEXT_PUBLIC_APP_URL,
        nodeEnv: process.env.NODE_ENV
      },
      checks: {
        accessTokenValid: hasAccessToken && process.env.MERCADOPAGO_ACCESS_TOKEN?.startsWith('APP_USR'),
        publicKeyValid: hasPublicKey && process.env.NEXT_PUBLIC_MERCADOPAGO_PUBLIC_KEY?.startsWith('APP_USR'),
        appUrlValid: hasAppUrl && (process.env.NEXT_PUBLIC_APP_URL?.startsWith('http'))
      }
    })
  } catch (error: unknown) {
    return NextResponse.json({
      error: 'Configuration error',
      message: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
