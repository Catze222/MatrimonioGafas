/**
 * Test route for MercadoPago configuration
 */
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const { preference } = await import('@/lib/mercadopago')
    
    // Verificar variables de entorno
    const hasAccessToken = !!process.env.MERCADOPAGO_ACCESS_TOKEN
    const hasPublicKey = !!process.env.NEXT_PUBLIC_MERCADOPAGO_PUBLIC_KEY
    const hasAppUrl = !!process.env.NEXT_PUBLIC_APP_URL
    const hasClientId = !!process.env.MERCADOPAGO_CLIENT_ID
    const hasClientSecret = !!process.env.MERCADOPAGO_CLIENT_SECRET
    
    const accessTokenPrefix = process.env.MERCADOPAGO_ACCESS_TOKEN?.substring(0, 10)
    const publicKeyPrefix = process.env.NEXT_PUBLIC_MERCADOPAGO_PUBLIC_KEY?.substring(0, 10)
    
    // PRUEBA REAL: Crear una preferencia de prueba
    let testPreferenceResult = null
    try {
      const testPreference = await preference.create({
        body: {
          items: [{
            id: 'test-item',
            title: 'Test Gift',
            quantity: 1,
            unit_price: 1000,
            currency_id: 'COP'
          }],
          back_urls: {
            success: `${process.env.NEXT_PUBLIC_APP_URL}/pago/success`,
            failure: `${process.env.NEXT_PUBLIC_APP_URL}/pago/failure`,
            pending: `${process.env.NEXT_PUBLIC_APP_URL}/pago/pending`
          },
          auto_return: 'approved'
        }
      })
      
      testPreferenceResult = {
        success: true,
        preferenceId: testPreference.id,
        hasInitPoint: !!testPreference.init_point,
        hasSandboxPoint: !!testPreference.sandbox_init_point,
        collectorId: testPreference.collector_id
      }
    } catch (prefError) {
      testPreferenceResult = {
        success: false,
        error: prefError instanceof Error ? prefError.message : 'Unknown preference error'
      }
    }
    
    return NextResponse.json({
      status: 'MercadoPago Advanced Configuration Check',
      environment: {
        hasAccessToken,
        hasPublicKey,
        hasAppUrl,
        hasClientId,
        hasClientSecret,
        accessTokenPrefix,
        publicKeyPrefix,
        appUrl: process.env.NEXT_PUBLIC_APP_URL,
        nodeEnv: process.env.NODE_ENV
      },
      checks: {
        accessTokenValid: hasAccessToken && process.env.MERCADOPAGO_ACCESS_TOKEN?.startsWith('APP_USR'),
        publicKeyValid: hasPublicKey && process.env.NEXT_PUBLIC_MERCADOPAGO_PUBLIC_KEY?.startsWith('APP_USR'),
        appUrlValid: hasAppUrl && (process.env.NEXT_PUBLIC_APP_URL?.startsWith('http')),
        credentialsComplete: hasAccessToken && hasClientId && hasClientSecret
      },
      testPreference: testPreferenceResult
    })
  } catch (error: unknown) {
    return NextResponse.json({
      error: 'Configuration error',
      message: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
