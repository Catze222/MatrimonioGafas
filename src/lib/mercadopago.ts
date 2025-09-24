/**
 * MercadoPago Client Configuration
 */
import { MercadoPagoConfig, Preference } from 'mercadopago'

// Validar que las credenciales estén presentes
const accessToken = process.env.MERCADOPAGO_ACCESS_TOKEN
const clientId = process.env.MERCADOPAGO_CLIENT_ID
const clientSecret = process.env.MERCADOPAGO_CLIENT_SECRET

if (!accessToken) {
  throw new Error('MERCADOPAGO_ACCESS_TOKEN is required')
}

const client = new MercadoPagoConfig({
  accessToken,
  options: {
    timeout: 5000,
    // Agregar configuración adicional si está disponible
    ...(clientId && { clientId }),
    ...(clientSecret && { clientSecret })
  }
})

export const preference = new Preference(client)
export default client
