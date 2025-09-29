/**
 * Email Service Configuration
 * Servicio para enviar correos de agradecimiento por contribuciones
 */
import nodemailer from 'nodemailer'

// Configurar el transportador de Gmail
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: false, // true para 465, false para otros puertos
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
})

// Verificar configuración al inicializar
if (process.env.NODE_ENV !== 'production') {
  transporter.verify(function (error: Error | null) {
    if (error) {
      console.log('❌ Error en configuración SMTP:', error)
    } else {
      console.log('✅ Servidor SMTP listo para enviar correos')
    }
  })
}

export interface EmailData {
  quien_regala: string
  email_contribuyente?: string
  producto_titulo: string
  monto: number
  mensaje?: string
}

export async function enviarCorreoAgradecimiento(data: EmailData): Promise<boolean> {
  try {
    const { quien_regala, email_contribuyente, producto_titulo, monto, mensaje } = data

    // Formatear el monto en pesos colombianos
    const montoFormateado = new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0
    }).format(monto)

    // Plantilla HTML del correo
    const htmlContent = `
    <!DOCTYPE html>
    <html lang="es">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>${quien_regala}, ¡qué regalazo!</title>
    </head>
    <body style="margin: 0; padding: 0; font-family: 'Arial', sans-serif; background-color: #f8f9fa;">
      <div style="max-width: 600px; margin: 0 auto; background-color: white; border-radius: 10px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
        
        <!-- Header con gradiente romántico -->
        <div style="background: linear-gradient(135deg, #ff6b9d, #c44569); padding: 40px 20px; text-align: center;">
          <h1 style="color: white; margin: 0; font-size: 28px; font-weight: bold;">
            ${quien_regala}, ¡qué regalazo!
          </h1>
          <p style="color: rgba(255,255,255,0.9); margin: 10px 0 0 0; font-size: 16px;">
            Jaime y Alejandra (Los Gafufos)
          </p>
        </div>

        <!-- Contenido principal -->
        <div style="padding: 40px 30px;">
          <p style="font-size: 18px; color: #2c3e50; margin-bottom: 25px; line-height: 1.6;">
            Hola, <strong style="color: #c44569;">${quien_regala}</strong>.
          </p>

          <p style="font-size: 16px; color: #34495e; line-height: 1.8; margin-bottom: 25px;">
            ¡Gracias por el regalo! Nos encantó y ya estamos celebrando el hecho de tener gente como tú en este momento tan especial.
          </p>

          <p style="font-size: 16px; color: #34495e; line-height: 1.8; margin-bottom: 25px;">
            Lo bueno de todo esto no es solo lo que recibimos, sino poder compartirlo contigo. Tu presencia y tu energía hacen que la fiesta sea aún mejor (y eso ya es decir bastante).
          </p>

          <p style="font-size: 16px; color: #34495e; line-height: 1.8; margin-bottom: 25px;">
            Prometemos sacarle provecho al regalo, pero sobre todo a seguir acumulando recuerdos divertidos a tu lado.
          </p>

          <!-- Detalles de la contribución -->
          <div style="background-color: #f8f9fa; border-left: 4px solid #c44569; padding: 20px; margin: 25px 0; border-radius: 0 8px 8px 0;">
            <h3 style="color: #c44569; margin: 0 0 15px 0; font-size: 18px;">
              Detalles de tu contribución:
            </h3>
            <p style="margin: 8px 0; color: #2c3e50;">
              <strong>Regalo:</strong> ${producto_titulo}
            </p>
            <p style="margin: 8px 0; color: #2c3e50;">
              <strong>Contribución:</strong> <span style="color: #27ae60; font-weight: bold; font-size: 18px;">${montoFormateado}</span>
            </p>
            ${mensaje ? `
            <p style="margin: 15px 0 8px 0; color: #2c3e50;">
              <strong>Tu mensaje:</strong>
            </p>
            <p style="font-style: italic; color: #7f8c8d; background-color: white; padding: 15px; border-radius: 6px; margin: 8px 0;">
              "${mensaje}"
            </p>
            ` : ''}
          </div>

          <!-- Firma -->
          <div style="text-align: center; padding: 20px 0; border-top: 2px solid #ecf0f1;">
            <p style="font-size: 16px; color: #34495e; margin: 0 0 20px 0; line-height: 1.6;">
              Con todo nuestro agradecimiento (y muchas ganas de seguir celebrando),
            </p>
            <p style="font-size: 20px; color: #2c3e50; margin: 0; font-weight: bold;">
              Alejandra & Jaime (Los Gafufos)
            </p>
          </div>
        </div>

        <!-- Footer -->
        <div style="background-color: #2c3e50; padding: 20px; text-align: center;">
          <p style="color: #bdc3c7; margin: 0; font-size: 14px;">
            Este correo fue enviado automáticamente con mucho amor 💌
          </p>
        </div>
      </div>
    </body>
    </html>
    `

    // Versión en texto plano como respaldo
    const textContent = `
${quien_regala}, ¡qué regalazo!

Hola, ${quien_regala}.

¡Gracias por el regalo! Nos encantó y ya estamos celebrando el hecho de tener gente como tú en este momento tan especial.

Lo bueno de todo esto no es solo lo que recibimos, sino poder compartirlo contigo. Tu presencia y tu energía hacen que la fiesta sea aún mejor (y eso ya es decir bastante).

Prometemos sacarle provecho al regalo, pero sobre todo a seguir acumulando recuerdos divertidos a tu lado.

Detalles de tu contribución:

Regalo: ${producto_titulo}

Contribución: ${montoFormateado}

${mensaje ? `Tu mensaje: "${mensaje}"` : ''}

Con todo nuestro agradecimiento (y muchas ganas de seguir celebrando),

Alejandra & Jaime (Los Gafufos)
    `

    // Configurar el correo
    const mailOptions = {
      from: {
        name: process.env.SMTP_FROM_NAME || 'Jaime y Alejandra (Los Gafufos)',
        address: process.env.SMTP_FROM_EMAIL || process.env.SMTP_USER || ''
      },
      to: email_contribuyente || process.env.SMTP_FROM_EMAIL, // Si no hay email del contribuyente, enviarlo a nosotros
      subject: `${quien_regala}, ¡qué regalazo!`,
      text: textContent,
      html: htmlContent,
      // Copia oculta para los novios
      bcc: process.env.SMTP_FROM_EMAIL
    }

    // Enviar el correo
    const info = await transporter.sendMail(mailOptions)
    console.log('✅ Correo de agradecimiento enviado:', info.messageId)
    
    return true
  } catch (error) {
    console.error('❌ Error enviando correo de agradecimiento:', error)
    return false
  }
}

export default transporter
