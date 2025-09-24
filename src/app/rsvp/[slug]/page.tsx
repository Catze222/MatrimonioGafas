/**
 * RSVP Page - Personalized guest confirmation page
 * Accessible via unique slug (e.g., /rsvp/ana-carlos-2025)
 * Diseño elegante estilo Zola - consistente con el resto del sitio
 */
'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { Invitado, RSVPFormData } from '@/types'
import Button from '@/components/ui/Button'
import Image from 'next/image'
import Link from 'next/link'

export default function RSVPPage() {
  const params = useParams()
  const router = useRouter()
  const slug = params.slug as string

  const [invitado, setInvitado] = useState<Invitado | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [formData, setFormData] = useState<RSVPFormData>({
    asistencia_1: 'pendiente',
    asistencia_2: 'pendiente',
    restriccion_1: '',
    restriccion_2: ''
  })

  // Función para verificar si debe redirigir
  const shouldRedirect = (data: Invitado): boolean => {
    const { asistencia_1, asistencia_2, nombre_2 } = data
    
    // Si solo hay una persona
    if (!nombre_2) {
      return asistencia_1 !== 'pendiente' // Redirigir si ya confirmó (si/no)
    }
    
    // Si hay dos personas
    // Redirigir si ambas ya confirmaron (ninguna está pendiente)
    return asistencia_1 !== 'pendiente' && asistencia_2 !== 'pendiente'
  }

  useEffect(() => {
    const loadInvitado = async () => {
      try {
        const { data, error } = await supabase
          .from('invitados')
          .select('*')
          .eq('slug', slug)
          .single()

        if (error) {
          if (error.code === 'PGRST116') {
            setError('Invitación no encontrada. Verifica que el enlace sea correcto.')
          } else {
            throw error
          }
          return
        }

        // Verificar si debe redirigir
        if (shouldRedirect(data)) {
          router.push('/')
          return
        }

        setInvitado(data)
        setFormData({
          asistencia_1: data.asistencia_1,
          asistencia_2: data.asistencia_2,
          restriccion_1: data.restriccion_1 || '',
          restriccion_2: data.restriccion_2 || ''
        })
      } catch (error) {
        console.error('Error loading invitado:', error)
        setError('Error al cargar la invitación. Intenta de nuevo.')
      } finally {
        setLoading(false)
      }
    }

    if (slug) {
      loadInvitado()
    }
  }, [slug, router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!invitado) return

    setSaving(true)
    setError(null)

    try {
      const { error } = await supabase
        .from('invitados')
        .update({
          asistencia_1: formData.asistencia_1,
          asistencia_2: formData.asistencia_2,
          restriccion_1: formData.restriccion_1 || null,
          restriccion_2: formData.restriccion_2 || null,
          updated_at: new Date().toISOString()
        })
        .eq('id', invitado.id)

      if (error) throw error

      setSuccess(true)
      // Update local state
      setInvitado(prev => prev ? { ...prev, ...formData } : null)
    } catch (error) {
      console.error('Error saving RSVP:', error)
      setError('Error al guardar la confirmación. Intenta de nuevo.')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen" style={{ fontFamily: '"EB Garamond", "Libre Baskerville", "Circular", "Helvetica", sans-serif', backgroundColor: '#FFFFFF', color: '#000000' }}>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="animate-pulse">
              <div className="w-16 h-16 bg-gray-200 rounded-full mx-auto mb-4"></div>
              <div className="h-6 bg-gray-200 rounded w-48 mx-auto mb-2"></div>
              <div className="h-4 bg-gray-200 rounded w-32 mx-auto"></div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen" style={{ fontFamily: '"EB Garamond", "Libre Baskerville", "Circular", "Helvetica", sans-serif', backgroundColor: '#FFFFFF', color: '#000000' }}>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center max-w-md mx-auto px-4">
            <h1 className="text-3xl font-medium text-gray-900 mb-4" style={{ fontFamily: '"EB Garamond", serif', fontWeight: 400 }}>
              Oops...
            </h1>
            <p className="text-gray-600 mb-8 leading-relaxed" style={{ fontFamily: '"Libre Baskerville", serif' }}>
              {error}
            </p>
            <Button 
              onClick={() => router.push('/')}
              className="bg-black hover:bg-gray-800 text-white py-3 px-8"
              style={{ 
                fontFamily: '"Libre Baskerville", serif', 
                fontSize: '14px', 
                fontWeight: 400,
                borderRadius: '0',
                textTransform: 'uppercase',
                letterSpacing: '1px'
              }}
            >
              Ir al Inicio
            </Button>
          </div>
        </div>
      </div>
    )
  }

  if (!invitado) {
    return null
  }

  return (
    <div className="min-h-screen" style={{ fontFamily: '"EB Garamond", "Libre Baskerville", "Circular", "Helvetica", sans-serif', margin: 0, backgroundColor: '#FFFFFF', color: '#000000', boxSizing: 'border-box' }}>
      {/* Simple Header - Solo branding */}
      <header className="bg-white border-b border-gray-100 py-4">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <div className="text-gray-500 text-sm" style={{ fontFamily: '"Libre Baskerville", serif' }}>
            Alejandra &amp; Jaime
          </div>
        </div>
      </header>

      {/* Page Content */}
      <main className="py-8">
        <div className="max-w-4xl mx-auto px-4">
          {/* Page Header - Súper compacto */}
          <div className="text-center mb-6">
            <h1 style={{ 
              fontFamily: '"EB Garamond", serif', 
              color: '#000000', 
              fontWeight: 400, 
              textTransform: 'uppercase', 
              lineHeight: 1.3, 
              letterSpacing: '2px', 
              fontSize: 'clamp(24px, 4vw, 32px)',
              marginBottom: '8px'
            }}>
              Confirma tu Asistencia
            </h1>
            <p className="text-gray-600" style={{ fontFamily: '"Libre Baskerville", serif', fontSize: '14px' }}>
              Tu presencia hace que este día sea aún más especial
            </p>
          </div>

          {/* Guest Welcome Card - Compacto con foto grande */}
          <div className="bg-white border border-gray-100 p-6 mb-6 text-center">
            {invitado.foto_url && (
              <div className="relative w-40 h-40 mx-auto mb-4 ring-2 ring-gray-100 overflow-hidden">
                <Image
                  src={invitado.foto_url}
                  alt={`Foto de ${invitado.nombre_1}${invitado.nombre_2 ? ` y ${invitado.nombre_2}` : ''}`}
                  fill
                  className="object-cover"
                />
              </div>
            )}
            
            <h2 className="text-xl lg:text-2xl font-medium text-gray-900 mb-3" style={{ fontFamily: '"EB Garamond", serif', fontWeight: 400 }}>
              {invitado.nombre_1}
              {invitado.nombre_2 && (
                <span> & {invitado.nombre_2}</span>
              )}
            </h2>
            
            <p className="text-gray-600 text-sm" style={{ fontFamily: '"Libre Baskerville", serif' }}>
              Esperamos celebrar contigo este día tan especial
            </p>
          </div>

          {/* Success Message */}
          {success && (
            <div className="mb-6 p-6 bg-green-50 border border-green-200 text-center">
              <h3 className="text-xl font-medium text-green-800 mb-1" style={{ fontFamily: '"EB Garamond", serif', fontWeight: 400 }}>
                ¡Confirmación guardada!
              </h3>
              <p className="text-green-700 text-sm" style={{ fontFamily: '"Libre Baskerville", serif' }}>
                Gracias por confirmar. Nos vemos el 13 de diciembre.
              </p>
            </div>
          )}

          {/* RSVP Form */}
          <div className="bg-white border border-gray-100 p-6">
            <div className="text-center mb-6">
              <h3 className="font-medium text-gray-900 mb-2" style={{ fontFamily: '"EB Garamond", serif', fontWeight: 400 }}>
                Detalles de Asistencia
              </h3>
              <div className="w-8 h-px bg-gray-300 mx-auto"></div>
            </div>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Primera persona */}
              <div className={`p-4 border-l-4 ${
                invitado.asistencia_1 === 'pendiente' 
                  ? 'bg-gray-50 border-black' 
                  : invitado.asistencia_1 === 'si'
                    ? 'bg-green-50 border-green-500'
                    : 'bg-red-50 border-red-500'
              }`}>
                <label className="block text-center mb-4">
                  <span className="text-sm text-gray-600" style={{ fontFamily: '"Libre Baskerville", serif' }}>
                    Asistencia de
                  </span>
                  <div className="text-xl font-bold text-gray-900 mt-1" style={{ fontFamily: '"EB Garamond", serif', fontWeight: 600 }}>
                    {invitado.nombre_1}
                  </div>
                  {invitado.asistencia_1 !== 'pendiente' && (
                    <div className={`text-sm mt-2 ${
                      invitado.asistencia_1 === 'si' ? 'text-green-700' : 'text-red-700'
                    }`} style={{ fontFamily: '"Libre Baskerville", serif' }}>
                      {invitado.asistencia_1 === 'si' ? '✓ Confirmaste que sí asistirás' : '✗ Confirmaste que no podrás asistir'}
                    </div>
                  )}
                </label>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {(['si', 'no', 'pendiente'] as const).map((option) => (
                    <label key={option} className="relative">
                      <input
                        type="radio"
                        name="asistencia_1"
                        value={option}
                        checked={formData.asistencia_1 === option}
                        onChange={(e) => setFormData(prev => ({ ...prev, asistencia_1: e.target.value as 'pendiente' | 'si' | 'no' }))}
                        disabled={invitado.asistencia_1 !== 'pendiente'}
                        className="sr-only"
                      />
                      <div className={`p-4 text-center border transition-colors ${
                        invitado.asistencia_1 !== 'pendiente' 
                          ? 'opacity-60 cursor-not-allowed border-gray-200 bg-gray-100 text-gray-500'
                          : formData.asistencia_1 === option
                            ? 'border-black bg-black text-white cursor-pointer'
                            : 'border-gray-300 hover:border-gray-500 cursor-pointer'
                      }`} style={{ fontFamily: '"Libre Baskerville", serif' }}>
                        {option === 'si' && 'Sí, asistiré'}
                        {option === 'no' && 'No podré asistir'}
                        {option === 'pendiente' && 'Sin confirmar'}
                      </div>
                    </label>
                  ))}
                </div>
                
                {/* Restricciones primera persona */}
                {formData.asistencia_1 === 'si' && (
                  <div className="mt-4">
                    <label htmlFor="restriccion_1" className="block font-medium text-gray-900 mb-3" style={{ fontFamily: '"Libre Baskerville", serif' }}>
                      Restricciones alimentarias (opcional)
                    </label>
                    <input
                      type="text"
                      id="restriccion_1"
                      value={formData.restriccion_1}
                      onChange={(e) => setFormData(prev => ({ ...prev, restriccion_1: e.target.value }))}
                      disabled={invitado.asistencia_1 !== 'pendiente'}
                      placeholder="Ej: Vegetariano, sin gluten, alergias..."
                      className={`w-full px-4 py-3 border focus:ring-2 focus:ring-black focus:border-transparent ${
                        invitado.asistencia_1 !== 'pendiente' 
                          ? 'bg-gray-100 text-gray-500 cursor-not-allowed border-gray-200' 
                          : 'border-gray-300'
                      }`}
                      style={{ fontFamily: '"Libre Baskerville", serif', borderRadius: '0' }}
                    />
                  </div>
                )}
              </div>

              {/* Segunda persona (si existe) */}
              {invitado.nombre_2 && (
                <div className={`p-4 border-l-4 ${
                  invitado.asistencia_2 === 'pendiente' 
                    ? 'bg-gray-50 border-black' 
                    : invitado.asistencia_2 === 'si'
                      ? 'bg-green-50 border-green-500'
                      : 'bg-red-50 border-red-500'
                }`}>
                  <label className="block text-center mb-4">
                    <span className="text-sm text-gray-600" style={{ fontFamily: '"Libre Baskerville", serif' }}>
                      Asistencia de
                    </span>
                    <div className="text-xl font-bold text-gray-900 mt-1" style={{ fontFamily: '"EB Garamond", serif', fontWeight: 600 }}>
                      {invitado.nombre_2}
                    </div>
                    {invitado.asistencia_2 !== 'pendiente' && (
                      <div className={`text-sm mt-2 ${
                        invitado.asistencia_2 === 'si' ? 'text-green-700' : 'text-red-700'
                      }`} style={{ fontFamily: '"Libre Baskerville", serif' }}>
                        {invitado.asistencia_2 === 'si' ? '✓ Confirmaste que sí asistirás' : '✗ Confirmaste que no podrás asistir'}
                      </div>
                    )}
                  </label>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {(['si', 'no', 'pendiente'] as const).map((option) => (
                      <label key={option} className="relative">
                        <input
                          type="radio"
                          name="asistencia_2"
                          value={option}
                          checked={formData.asistencia_2 === option}
                          onChange={(e) => setFormData(prev => ({ ...prev, asistencia_2: e.target.value as 'pendiente' | 'si' | 'no' }))}
                          disabled={invitado.asistencia_2 !== 'pendiente'}
                          className="sr-only"
                        />
                        <div className={`p-4 text-center border transition-colors ${
                          invitado.asistencia_2 !== 'pendiente' 
                            ? 'opacity-60 cursor-not-allowed border-gray-200 bg-gray-100 text-gray-500'
                            : formData.asistencia_2 === option
                              ? 'border-black bg-black text-white cursor-pointer'
                              : 'border-gray-300 hover:border-gray-500 cursor-pointer'
                        }`} style={{ fontFamily: '"Libre Baskerville", serif' }}>
                          {option === 'si' && 'Sí, asistiré'}
                          {option === 'no' && 'No podré asistir'}
                          {option === 'pendiente' && 'Sin confirmar'}
                        </div>
                      </label>
                    ))}
                  </div>
                    
                    {/* Restricciones segunda persona */}
                    {formData.asistencia_2 === 'si' && (
                      <div className="mt-4">
                        <label htmlFor="restriccion_2" className="block font-medium text-gray-900 mb-3" style={{ fontFamily: '"Libre Baskerville", serif' }}>
                          Restricciones alimentarias (opcional)
                        </label>
                        <input
                          type="text"
                          id="restriccion_2"
                          value={formData.restriccion_2}
                          onChange={(e) => setFormData(prev => ({ ...prev, restriccion_2: e.target.value }))}
                          disabled={invitado.asistencia_2 !== 'pendiente'}
                          placeholder="Ej: Vegetariano, sin gluten, alergias..."
                          className={`w-full px-4 py-3 border focus:ring-2 focus:ring-black focus:border-transparent ${
                            invitado.asistencia_2 !== 'pendiente' 
                              ? 'bg-gray-100 text-gray-500 cursor-not-allowed border-gray-200' 
                              : 'border-gray-300'
                          }`}
                          style={{ fontFamily: '"Libre Baskerville", serif', borderRadius: '0' }}
                        />
                      </div>
                    )}
                </div>
              )}

              {/* Error message */}
              {error && (
                <div className="p-4 bg-red-50 border border-red-200 text-center">
                  <p className="text-red-600 text-sm" style={{ fontFamily: '"Libre Baskerville", serif' }}>{error}</p>
                </div>
              )}

              {/* Submit button - Solo si hay personas pendientes */}
              {(invitado.asistencia_1 === 'pendiente' || (invitado.nombre_2 && invitado.asistencia_2 === 'pendiente')) && (
                <div className="pt-4">
                  <Button
                    type="submit"
                    loading={saving}
                    className="w-full py-3 px-6 text-white transition-colors"
                    style={{ 
                      fontFamily: '"Libre Baskerville", serif', 
                      fontSize: '16px', 
                      fontWeight: 400,
                      backgroundColor: '#86EFAC', // Verde pastel suave
                      borderRadius: '4px',
                      border: 'none'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = '#6EE7B7' // Verde pastel más intenso en hover
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = '#86EFAC'
                    }}
                  >
                    {saving ? 'Guardando confirmación...' : 'Confirmar mi Asistencia'}
                  </Button>
                </div>
              )}
              
              {/* Mensaje cuando todas las personas ya confirmaron */}
              {(invitado.asistencia_1 !== 'pendiente' && (!invitado.nombre_2 || invitado.asistencia_2 !== 'pendiente')) && (
                <div className="pt-4">
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 text-center">
                    <div className="text-blue-800 text-lg font-medium mb-2" style={{ fontFamily: '"EB Garamond", serif' }}>
                      ¡Confirmación completa!
                    </div>
                    <div className="text-blue-700 text-sm mb-4" style={{ fontFamily: '"Libre Baskerville", serif' }}>
                      {(() => {
                        const asistiran = []
                        const noAsistiran = []
                        
                        if (invitado.asistencia_1 === 'si') asistiran.push(invitado.nombre_1)
                        if (invitado.asistencia_1 === 'no') noAsistiran.push(invitado.nombre_1)
                        
                        if (invitado.nombre_2) {
                          if (invitado.asistencia_2 === 'si') asistiran.push(invitado.nombre_2)
                          if (invitado.asistencia_2 === 'no') noAsistiran.push(invitado.nombre_2)
                        }
                        
                        let mensaje = ""
                        if (asistiran.length > 0) {
                          mensaje += `${asistiran.join(' y ')} confirmó${asistiran.length > 1 ? 'n' : ''} asistencia`
                        }
                        if (noAsistiran.length > 0) {
                          if (mensaje) mensaje += ". "
                          mensaje += `${noAsistiran.join(' y ')} no podrá${noAsistiran.length > 1 ? 'n' : ''} asistir`
                        }
                        if (asistiran.length > 0) {
                          mensaje += ". ¡Nos vemos el 13 de diciembre!"
                        }
                        
                        return mensaje
                      })()}
                    </div>
                    
                    {/* Navegación cuando ya confirmaron */}
                    <div className="flex flex-wrap justify-center gap-3 text-sm">
                      <Link href="/" className="text-gray-700 hover:text-black underline px-2 py-1" style={{ fontFamily: '"Libre Baskerville", serif' }}>
                        Inicio
                      </Link>
                      <Link href="/ceremonia" className="text-gray-700 hover:text-black underline px-2 py-1" style={{ fontFamily: '"Libre Baskerville", serif' }}>
                        Día del Evento
                      </Link>
                      <Link href="/regalos" className="text-gray-700 hover:text-black underline px-2 py-1" style={{ fontFamily: '"Libre Baskerville", serif' }}>
                        Regalos
                      </Link>
                    </div>
                  </div>
                </div>
              )}
              
              {/* Mostrar navegación solo después de confirmar */}
              {success && (
                <div className="mt-6 pt-6 border-t border-gray-200 text-center">
                  <p className="text-gray-600 mb-4 text-sm" style={{ fontFamily: '"Libre Baskerville", serif' }}>
                    ¡Confirmación completada! Ahora puedes explorar más información sobre la boda:
                  </p>
                  <div className="flex flex-wrap justify-center gap-3 text-sm">
                    <Link href="/" className="text-gray-700 hover:text-black underline px-2 py-1" style={{ fontFamily: '"Libre Baskerville", serif' }}>
                      Inicio
                    </Link>
                    <Link href="/ceremonia" className="text-gray-700 hover:text-black underline px-2 py-1" style={{ fontFamily: '"Libre Baskerville", serif' }}>
                      Día del Evento
                    </Link>
                    <Link href="/regalos" className="text-gray-700 hover:text-black underline px-2 py-1" style={{ fontFamily: '"Libre Baskerville", serif' }}>
                      Regalos
                    </Link>
                    <Link href="/vestimenta" className="text-gray-700 hover:text-black underline px-2 py-1" style={{ fontFamily: '"Libre Baskerville", serif' }}>
                      Vestimenta
                    </Link>
                  </div>
                </div>
              )}
            </form>
          </div>

          {/* Event Info Footer - Fecha corregida */}
          <div className="text-center mt-8 p-4 bg-gray-50">
            <h3 className="font-medium text-gray-900 mb-3" style={{ fontFamily: '"EB Garamond", serif', fontWeight: 400 }}>
              Información del Evento
            </h3>
            <div className="space-y-1 text-gray-600 text-sm" style={{ fontFamily: '"Libre Baskerville", serif' }}>
              <p><strong>Fecha:</strong> 13 de Diciembre, 2025 • <strong>Hora:</strong> 3:30 PM</p>
              <p><strong>Lugar:</strong> Hacienda San Rafael, Bogotá</p>
              <p><strong>Celebración:</strong> Hasta las 3:00 AM</p>
            </div>
          </div>
        </div>
      </main>

      {/* Footer - Súper compacto */}
      <footer className="bg-white py-8 text-center border-t border-gray-100" style={{ backgroundColor: '#FFFFFF' }}>
        <div className="max-w-4xl mx-auto px-4">
          <div className="mb-4">
            <div className="w-20 h-10 mx-auto mb-3 flex items-center justify-center">
              <svg viewBox="0 0 200 50" className="w-full h-full">
                <text x="100" y="30" textAnchor="middle" style={{ fontFamily: '"EB Garamond", serif', fontSize: '18px', fontWeight: 400, letterSpacing: '2px', fill: '#000000' }}>
                  A &amp; J
                </text>
              </svg>
            </div>
            <p className="text-gray-600 mb-3" style={{ fontFamily: '"Libre Baskerville", serif', fontSize: '11px', fontWeight: 400 }}>
              Para todos los días del camino
            </p>
          </div>
          
          <div className="text-xs text-gray-500">
            <p>© 2025 Alejandra &amp; Jaime • 13 de Diciembre, 2025 • Con amor desde Bogotá</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
