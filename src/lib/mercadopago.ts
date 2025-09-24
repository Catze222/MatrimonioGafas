/**
 * MercadoPago Client Configuration
 */
import { MercadoPagoConfig, Preference } from 'mercadopago'

// Validar que las credenciales estén presentes
const accessToken = process.env.MERCADOPAGO_ACCESS_TOKEN
if (!accessToken) {
  throw new Error('MERCADOPAGO_ACCESS_TOKEN is required')
}

const client = new MercadoPagoConfig({
  accessToken,
  options: {
    timeout: 5000,
  }
})

export const preference = new Preference(client)
export default client
