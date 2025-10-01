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
  const [companionName, setCompanionName] = useState('')

  // Function to detect if nombre_2 is a generic companion term
  const isGenericCompanion = (nombre: string | null | undefined): boolean => {
    if (!nombre) return false
    const genericTerms = [
      'acompañante', 'novio', 'novia', 'esposo', 'esposa',
      'pareja', 'compañero', 'compañera'
    ]
    return genericTerms.some(term => 
      nombre.toLowerCase().includes(term.toLowerCase())
    )
  }

  // Check if we need to show companion name field
  const shouldShowCompanionNameField = invitado && 
    isGenericCompanion(invitado.nombre_2) && 
    formData.asistencia_2 === 'si'


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

        setInvitado(data)
        setFormData({
          asistencia_1: data.asistencia_1,
          asistencia_2: data.asistencia_2,
          restriccion_1: data.restriccion_1 || '',
          restriccion_2: data.restriccion_2 || ''
        })
        setCompanionName('') // Reset companion name on load
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

    // Validate companion name if required
    if (shouldShowCompanionNameField && !companionName.trim()) {
      setError('Por favor ingresa el nombre y apellido de tu acompañante.')
      return
    }

    setSaving(true)
    setError(null)

    try {
      // Prepare update data
      const updateData: Partial<Invitado> = {
        asistencia_1: formData.asistencia_1,
        asistencia_2: formData.asistencia_2,
        restriccion_1: formData.restriccion_1 || null,
        restriccion_2: formData.restriccion_2 || null,
        updated_at: new Date().toISOString()
      }

      // If companion name was provided, update nombre_2
      if (shouldShowCompanionNameField && companionName.trim()) {
        updateData.nombre_2 = companionName.trim()
      }

      const { error } = await supabase
        .from('invitados')
        .update(updateData)
        .eq('id', invitado.id)

      if (error) throw error

      setSuccess(true)
      // Update local state
      const updatedInvitado = { ...invitado, ...formData }
      if (shouldShowCompanionNameField && companionName.trim()) {
        updatedInvitado.nombre_2 = companionName.trim()
      }
      setInvitado(updatedInvitado)
    } catch (error) {
      console.error('Error saving RSVP:', error)
      setError('Error al guardar la confirmación. Intenta de nuevo.')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen" style={{ fontFamily: '"EB Garamond", "Libre Baskerville", "Circular", "Helvetica", sans-serif', backgroundColor: '#f8f6f0', color: '#1e3a8a' }}>
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
      <div className="min-h-screen" style={{ fontFamily: '"EB Garamond", "Libre Baskerville", "Circular", "Helvetica", sans-serif', backgroundColor: '#f8f6f0', color: '#1e3a8a' }}>
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
    <div className="min-h-screen overflow-x-hidden" style={{ fontFamily: '"EB Garamond", "Libre Baskerville", "Circular", "Helvetica", sans-serif', margin: 0, backgroundColor: '#f8f6f0', color: '#1e3a8a', boxSizing: 'border-box', width: '100%', maxWidth: '100vw' }}>
      {/* Simple Header - Solo branding */}
      <header className="border-b border-gray-100 py-4" style={{ backgroundColor: '#f8f6f0' }}>
        <div className="max-w-4xl mx-auto px-2 sm:px-4 text-center">
          <div className="text-sm" style={{ fontFamily: '"Libre Baskerville", serif', color: '#1e3a8a' }}>
            Alejandra &amp; Jaime
          </div>
        </div>
      </header>

      {/* Page Content */}
      <main className="py-4 sm:py-8">
        <div className="max-w-4xl mx-auto px-2 sm:px-4">
          {/* Page Header - Súper compacto */}
          <div className="text-center mb-6">
            <h1 style={{ 
              fontFamily: '"EB Garamond", serif', 
              color: '#1e3a8a', 
              fontWeight: 400, 
              textTransform: 'uppercase', 
              lineHeight: 1.3, 
              letterSpacing: '2px', 
              fontSize: 'clamp(20px, 4vw, 32px)',
              marginBottom: '8px'
            }}>
              Confirma tu asistencia
            </h1>
            <p style={{ fontFamily: '"Libre Baskerville", serif', fontSize: '14px', color: '#1e3a8a' }}>
              Tu presencia hace que este día sea aún más especial
            </p>
          </div>

          {/* Guest Welcome Card - Compacto con foto grande */}
          <div className="border border-gray-100 p-3 sm:p-6 mb-6 text-center" style={{ backgroundColor: '#f8f6f0' }}>
            {invitado.foto_url && (
              <div className="relative w-32 h-32 sm:w-40 sm:h-40 mx-auto mb-4 ring-2 ring-gray-100 overflow-hidden" style={{ backgroundColor: '#ffffff' }}>
                <Image
                  src={invitado.foto_url}
                  alt={`Foto de ${invitado.nombre_1}${invitado.nombre_2 ? ` y ${invitado.nombre_2}` : ''}`}
                  fill
                  className="object-cover"
                />
              </div>
            )}
            
            <h2 className="text-lg sm:text-xl lg:text-2xl font-medium mb-3 break-words" style={{ fontFamily: '"EB Garamond", serif', fontWeight: 400, color: '#1e3a8a' }}>
              {invitado.nombre_1}
              {invitado.nombre_2 && (
                <span> & {invitado.nombre_2}</span>
              )}
            </h2>
            
            <p className="text-sm break-words" style={{ fontFamily: '"Libre Baskerville", serif', color: '#1e3a8a' }}>
              Esperamos celebrar {invitado.nombre_2 ? 'con ustedes' : 'contigo'} este día tan especial
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
          <div className="border border-gray-100 p-3 sm:p-6" style={{ backgroundColor: '#f8f6f0' }}>
            <div className="text-center mb-6">
              <h3 className="font-medium mb-2" style={{ fontFamily: '"EB Garamond", serif', fontWeight: 400, color: '#1e3a8a' }}>
                Detalles de asistencia
              </h3>
              <div className="w-8 h-px bg-gray-300 mx-auto"></div>
            </div>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Primera persona */}
              <div className={`p-2 sm:p-4 border-l-4 ${
                invitado.asistencia_1 === 'pendiente' 
                  ? 'bg-gray-50 border-black' 
                  : invitado.asistencia_1 === 'si'
                    ? 'bg-green-50 border-green-500'
                    : 'bg-red-50 border-red-500'
              }`}>
                <label className="block text-center mb-4">
                  <span className="text-sm" style={{ fontFamily: '"Libre Baskerville", serif', color: '#1e3a8a' }}>
                    Asistencia de
                  </span>
                  <div className="text-lg sm:text-xl font-bold mt-1 break-words" style={{ fontFamily: '"EB Garamond", serif', fontWeight: 600, color: '#1e3a8a' }}>
                    {invitado.nombre_1}
                  </div>
                  {invitado.asistencia_1 !== 'pendiente' && (
                    <div className={`text-sm mt-2 ${
                      invitado.asistencia_1 === 'si' ? 'text-green-700' : 'text-red-700'
                    }`} style={{ fontFamily: '"Libre Baskerville", serif' }}>
                        {invitado.asistencia_1 === 'si' ? '✓ Confirmó que sí asistirá' : '✗ Confirmó que no podrá asistir'}
                    </div>
                  )}
                </label>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-4">
                  {(['si', 'no'] as const).map((option) => (
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
                      <div className={`p-2 sm:p-4 text-center border transition-colors text-sm sm:text-base ${
                        invitado.asistencia_1 !== 'pendiente' 
                          ? 'opacity-60 cursor-not-allowed border-gray-200 bg-gray-100 text-gray-500'
                          : formData.asistencia_1 === option
                            ? 'border-black bg-black text-white cursor-pointer'
                            : 'border-gray-300 hover:border-gray-500 cursor-pointer'
                      }`} style={{ fontFamily: '"Libre Baskerville", serif' }}>
                        {option === 'si' && (invitado.nombre_2 ? '✓ Sí, asistiremos' : '✓ Sí, asistiré')}
                        {option === 'no' && (invitado.nombre_2 ? '✗ No podremos asistir' : '✗ No podré asistir')}
                      </div>
                    </label>
                  ))}
                </div>
                
                {/* Restricciones primera persona */}
                {formData.asistencia_1 === 'si' && (
                  <div className="mt-4 p-2 sm:p-4 bg-green-50 border-l-4 border-green-400 rounded-r-lg">
                    <div className="flex items-center mb-3">
                      <span className="text-green-600 mr-2">🍽️</span>
                      <label htmlFor="restriccion_1" className="block font-semibold text-green-800" style={{ fontFamily: '"Libre Baskerville", serif' }}>
                        Restricciones alimentarias (opcional)
                      </label>
                    </div>
                    <input
                      type="text"
                      id="restriccion_1"
                      value={formData.restriccion_1}
                      onChange={(e) => setFormData(prev => ({ ...prev, restriccion_1: e.target.value }))}
                      disabled={invitado.asistencia_1 !== 'pendiente'}
                      placeholder="Ej: Vegetariano, sin gluten, alergias..."
                      className={`w-full px-2 sm:px-4 py-2 sm:py-3 border-2 focus:ring-2 focus:ring-green-300 focus:border-green-400 rounded-lg text-sm sm:text-base ${
                        invitado.asistencia_1 !== 'pendiente' 
                          ? 'bg-gray-100 text-gray-500 cursor-not-allowed border-gray-200' 
                          : 'border-green-300 bg-white'
                      }`}
                      style={{ fontFamily: '"Libre Baskerville", serif' }}
                    />
                  </div>
                )}
              </div>

              {/* Segunda persona (si existe) */}
              {invitado.nombre_2 && (
                <div className={`p-2 sm:p-4 border-l-4 ${
                  invitado.asistencia_2 === 'pendiente' 
                    ? 'bg-gray-50 border-black' 
                    : invitado.asistencia_2 === 'si'
                      ? 'bg-green-50 border-green-500'
                      : 'bg-red-50 border-red-500'
                }`}>
                  <label className="block text-center mb-4">
                    <span className="text-sm" style={{ fontFamily: '"Libre Baskerville", serif', color: '#1e3a8a' }}>
                      Asistencia de
                    </span>
                    <div className="text-lg sm:text-xl font-bold mt-1 break-words" style={{ fontFamily: '"EB Garamond", serif', fontWeight: 600, color: '#1e3a8a' }}>
                      {invitado.nombre_2}
                    </div>
                    {invitado.asistencia_2 !== 'pendiente' && (
                      <div className={`text-sm mt-2 ${
                        invitado.asistencia_2 === 'si' ? 'text-green-700' : 'text-red-700'
                      }`} style={{ fontFamily: '"Libre Baskerville", serif' }}>
                        {invitado.asistencia_2 === 'si' ? '✓ Confirmó que sí asistirá' : '✗ Confirmó que no podrá asistir'}
                      </div>
                    )}
                  </label>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-4">
                    {(['si', 'no'] as const).map((option) => (
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
                        <div className={`p-2 sm:p-4 text-center border transition-colors text-sm sm:text-base ${
                          invitado.asistencia_2 !== 'pendiente' 
                            ? 'opacity-60 cursor-not-allowed border-gray-200 bg-gray-100 text-gray-500'
                            : formData.asistencia_2 === option
                              ? 'border-black bg-black text-white cursor-pointer'
                              : 'border-gray-300 hover:border-gray-500 cursor-pointer'
                        }`} style={{ fontFamily: '"Libre Baskerville", serif' }}>
                          {option === 'si' && '✓ Sí, asistiré'}
                          {option === 'no' && '✗ No podré asistir'}
                        </div>
                      </label>
                    ))}
                  </div>
                    
                    {/* Companion Name Field (for generic companions) */}
                    {shouldShowCompanionNameField && (
                      <div className="mt-4 p-2 sm:p-4 bg-blue-50 border-l-4 border-blue-400 rounded-r-lg">
                        <div className="flex items-center mb-3">
                          <span className="text-blue-600 mr-2">👤</span>
                          <label htmlFor="companion_name" className="block font-semibold text-blue-800" style={{ fontFamily: '"Libre Baskerville", serif' }}>
                            Nombre y Apellido *
                          </label>
                        </div>
                        <input
                          type="text"
                          id="companion_name"
                          value={companionName}
                          onChange={(e) => setCompanionName(e.target.value)}
                          placeholder="Ej: María González"
                          className="w-full px-2 sm:px-4 py-2 sm:py-3 border-2 focus:ring-2 focus:ring-blue-300 focus:border-blue-400 rounded-lg border-blue-300 bg-white text-sm sm:text-base"
                          style={{ fontFamily: '"Libre Baskerville", serif' }}
                          required
                        />
                        <p className="text-xs text-blue-700 mt-2 break-words" style={{ fontFamily: '"Libre Baskerville", serif' }}>
                          * Campo obligatorio - Ingresa el nombre completo de tu acompañante
                        </p>
                      </div>
                    )}
                    
                    {/* Restricciones segunda persona */}
                    {formData.asistencia_2 === 'si' && (
                      <div className="mt-4 p-2 sm:p-4 bg-green-50 border-l-4 border-green-400 rounded-r-lg">
                        <div className="flex items-center mb-3">
                          <span className="text-green-600 mr-2">🍽️</span>
                          <label htmlFor="restriccion_2" className="block font-semibold text-green-800" style={{ fontFamily: '"Libre Baskerville", serif' }}>
                            Restricciones alimentarias (opcional)
                          </label>
                        </div>
                        <input
                          type="text"
                          id="restriccion_2"
                          value={formData.restriccion_2}
                          onChange={(e) => setFormData(prev => ({ ...prev, restriccion_2: e.target.value }))}
                          disabled={invitado.asistencia_2 !== 'pendiente'}
                          placeholder="Ej: Vegetariano, sin gluten, alergias..."
                          className={`w-full px-2 sm:px-4 py-2 sm:py-3 border-2 focus:ring-2 focus:ring-green-300 focus:border-green-400 rounded-lg text-sm sm:text-base ${
                            invitado.asistencia_2 !== 'pendiente' 
                              ? 'bg-gray-100 text-gray-500 cursor-not-allowed border-gray-200' 
                              : 'border-green-300 bg-white'
                          }`}
                          style={{ fontFamily: '"Libre Baskerville", serif' }}
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
                            className="w-full py-2 sm:py-3 px-4 sm:px-6 text-white transition-colors text-sm sm:text-base"
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
                    {saving ? 'Guardando confirmación...' : (invitado.nombre_2 ? 'Confirmar nuestra asistencia' : 'Confirmar mi asistencia')}
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
                          mensaje += `${asistiran.join(' y ')} ${asistiran.length > 1 ? 'confirmaron' : 'confirmó'} asistencia`
                        }
                        if (noAsistiran.length > 0) {
                          if (mensaje) mensaje += ". "
                          mensaje += `${noAsistiran.join(' y ')} no ${noAsistiran.length > 1 ? 'podrán' : 'podrá'} asistir`
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
                        Día del evento
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
                      Día del evento
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
          <div className="text-center mt-8 p-2 sm:p-4" style={{ backgroundColor: '#f8f6f0' }}>
            <h3 className="font-medium mb-3" style={{ fontFamily: '"EB Garamond", serif', fontWeight: 400, color: '#1e3a8a' }}>
              Información del evento
            </h3>
            <div className="space-y-1 text-sm" style={{ fontFamily: '"Libre Baskerville", serif', color: '#1e3a8a' }}>
              <p><strong>Fecha:</strong> 13 de diciembre de 2025 • <strong>Hora:</strong> 3:30 PM</p>
              <p><strong>Lugar:</strong> Hacienda San Rafael, Bogotá</p>
              <p><strong>Celebración:</strong> Hasta las 3:00 AM</p>
            </div>
          </div>
        </div>
      </main>

    </div>
  )
}
