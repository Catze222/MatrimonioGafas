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

// Función para generar mensaje personalizado según el producto
function generarMensajePersonalizado(productoTitulo: string): string {
  const mensajesPorProducto: Record<string, string> = {
    '🐱 Alimentación y bienestar gatuno': 'Nuestros gatos ya están planeando cómo ignorarnos con más estilo mientras devoran salmón gourmet en sus nuevos cojines de terciopelo.',
    '🌴 Operación: sol, arena y descanso': 'Gracias a ti evitamos terminar en Mesitas del Colegio con piscina inflable y nos acercamos más a las Maldivas (o al menos a una playa decente).',
    '🎶 Conciertos y festivales': 'Ya estamos practicando nuestros pasos de baile más vergonzosos para seguir acumulando recuerdos y fotos movidas en festivales por el mundo.',
    '⚽ Clásicos de amor: Pillos vs. Santuco': 'Ahora tenemos presupuesto asegurado para lechona y palitos de queso en el Campín, y para seguir demostrando que el amor puede sobrevivir incluso a los clásicos capitalinos.',
    '👓 Gafas vitalicias (porque somos gafufos)': 'Ahora podremos seguir viendo la vida con claridad y un poquito más de estilo, en lugar de andar por ahí con monturas que ya son patrimonio histórico.'
  }
  
  return mensajesPorProducto[productoTitulo] || 'lo valoramos mucho y prometemos darle un gran uso.'
}

export async function enviarCorreoAgradecimiento(data: EmailData): Promise<boolean> {
  try {
    const { quien_regala, email_contribuyente, producto_titulo } = data

    // Obtener mensaje personalizado según el producto
    const mensajePersonalizado = generarMensajePersonalizado(producto_titulo)

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
        
        <!-- Header con gradiente azul oscuro -->
        <div style="background: linear-gradient(135deg, #0c1e3f, #1e2a5a); padding: 15px 15px; text-align: center;">
          <h1 style="color: white; margin: 0; font-size: 20px; font-weight: bold; line-height: 1.2;">
            ${quien_regala}, ¡qué regalazo!
          </h1>
        </div>

        <!-- Contenido principal -->
        <div style="padding: 30px 25px;">
          <p style="font-size: 18px; color: #2c3e50; margin-bottom: 25px; line-height: 1.6;">
            Hola <strong style="color: #1e2a5a;">${quien_regala}</strong>.
          </p>

          <p style="font-size: 16px; color: #34495e; line-height: 1.8; margin-bottom: 25px;">
            ¡Gracias por el regalo! Nos encantó y ya estamos celebrando el hecho de tener gente como tú en este momento tan especial.
          </p>

          <p style="font-size: 16px; color: #34495e; line-height: 1.8; margin-bottom: 25px;">
            Lo bueno de todo esto no es solo lo que recibimos, sino poder compartirlo contigo. Tu presencia y tu energía hacen que la fiesta sea aún mejor (y eso ya es decir bastante).
          </p>

          <p style="font-size: 16px; color: #34495e; line-height: 1.8; margin-bottom: 25px;">
            Gracias por <strong>${producto_titulo}</strong>, lo valoramos mucho y prometemos darle un gran uso. ${mensajePersonalizado}
          </p>


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
        <div style="background-color: #0c1e3f; padding: 10px; text-align: center;">
        </div>
      </div>
    </body>
    </html>
    `

    // Versión en texto plano como respaldo
    const textContent = `
${quien_regala}, ¡qué regalazo!

Hola ${quien_regala}.

¡Gracias por el regalo! Nos encantó y ya estamos celebrando el hecho de tener gente como tú en este momento tan especial.

Lo bueno de todo esto no es solo lo que recibimos, sino poder compartirlo contigo. Tu presencia y tu energía hacen que la fiesta sea aún mejor (y eso ya es decir bastante).

Gracias por ${producto_titulo}, lo valoramos mucho y prometemos darle un gran uso. ${mensajePersonalizado}

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
      html: htmlContent
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
