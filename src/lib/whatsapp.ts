/**
 * WhatsApp message template utilities
 */

interface WhatsAppTemplateData {
  slug: string
  baseUrl?: string
}

/**
 * Generate WhatsApp invitation message template
 * @param data - Template data with slug and optional base URL
 * @returns Formatted message ready to copy
 */
export function generateWhatsAppMessage({ slug, baseUrl }: WhatsAppTemplateData): string {
  const domain = baseUrl || process.env.NEXT_PUBLIC_APP_URL || 'https://tu-dominio.com'
  
  const message = `Hola XXXXX, queremos invitarte a nuestro matrimonio el 13 de Diciembre, 2025.

🎉 Confirma tu asistencia: ${domain}/rsvp/${slug}
📍 Información del evento: ${domain}

Aquí podrás ver dónde es la ceremonia, el código de vestimenta y nuestra lista de regalos.

¡Esperamos verte ese día tan especial!
Alejandra & Jaime`

  return message
}

/**
 * Copy text to clipboard using modern Clipboard API with fallback
 * @param text - Text to copy
 * @returns Promise that resolves when copy is successful
 */
export async function copyToClipboard(text: string): Promise<void> {
  try {
    // Modern Clipboard API
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(text)
      return
    }
    
    // Fallback for older browsers
    const textArea = document.createElement('textarea')
    textArea.value = text
    textArea.style.position = 'fixed'
    textArea.style.left = '-999999px'
    textArea.style.top = '-999999px'
    document.body.appendChild(textArea)
    textArea.focus()
    textArea.select()
    
    return new Promise((resolve, reject) => {
      if (document.execCommand('copy')) {
        resolve()
      } else {
        reject(new Error('Copy failed'))
      }
      document.body.removeChild(textArea)
    })
  } catch (error) {
    throw new Error(`Failed to copy: ${error}`)
  }
}

/**
 * Generate full RSVP URL for an invitado
 * @param slug - Guest slug
 * @param baseUrl - Optional base URL (defaults to env variable)
 * @returns Complete RSVP URL
 */
export function generateRSVPUrl(slug: string, baseUrl?: string): string {
  const domain = baseUrl || process.env.NEXT_PUBLIC_APP_URL || 'https://tu-dominio.com'
  return `${domain}/rsvp/${slug}`
}
