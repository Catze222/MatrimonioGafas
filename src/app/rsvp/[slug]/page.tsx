/**
 * RSVP Page - Personalized guest confirmation page
 * Accessible via unique slug (e.g., /rsvp/ana-carlos-2025)
 */
'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { Invitado, RSVPFormData } from '@/types'
import Button from '@/components/ui/Button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import Image from 'next/image'

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
  }, [slug])

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
      <div className="min-h-screen bg-gradient-to-br from-rose-50 to-pink-50 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="p-8">
            <div className="animate-pulse space-y-4">
              <div className="h-24 w-24 bg-gray-200 rounded-full mx-auto"></div>
              <div className="h-6 bg-gray-200 rounded"></div>
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-rose-50 to-pink-50 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="p-8 text-center">
            <div className="text-red-500 text-6xl mb-4">❌</div>
            <h1 className="text-2xl font-bold text-gray-900 mb-4">
              Oops...
            </h1>
            <p className="text-gray-600 mb-6">{error}</p>
            <Button onClick={() => router.push('/')}>
              Ir al Inicio
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!invitado) {
    return null
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50 to-pink-50">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Confirma tu Asistencia
            </h1>
            <p className="text-gray-600">
              Por favor, ayúdanos a planificar mejor confirmando tu asistencia
            </p>
          </div>

          {/* Guest Card */}
          <Card className="mb-8">
            <CardContent className="p-8">
              <div className="flex items-center space-x-6">
                {invitado.foto_url && (
                  <div className="relative w-24 h-24 rounded-full overflow-hidden flex-shrink-0">
                    <Image
                      src={invitado.foto_url}
                      alt={`Foto de ${invitado.nombre_1}`}
                      fill
                      className="object-cover"
                    />
                  </div>
                )}
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">
                    {invitado.nombre_1}
                    {invitado.nombre_2 && (
                      <span className="text-rose-600"> & {invitado.nombre_2}</span>
                    )}
                  </h2>
                  <p className="text-gray-600 mt-1">
                    ¡Esperamos celebrar contigo este día tan especial!
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Success Message */}
          {success && (
            <Card className="mb-6 border-green-200 bg-green-50">
              <CardContent className="p-6">
                <div className="flex items-center">
                  <div className="text-green-500 text-2xl mr-3">✅</div>
                  <div>
                    <h3 className="font-semibold text-green-800">¡Confirmación guardada!</h3>
                    <p className="text-green-600">Gracias por confirmar tu asistencia.</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* RSVP Form */}
          <Card>
            <CardHeader>
              <CardTitle>Detalles de Asistencia</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Primera persona */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Asistencia de {invitado.nombre_1}
                  </label>
                  <div className="grid grid-cols-3 gap-3">
                    {(['si', 'no', 'pendiente'] as const).map((option) => (
                      <label key={option} className="relative">
                        <input
                          type="radio"
                          name="asistencia_1"
                          value={option}
                          checked={formData.asistencia_1 === option}
                          onChange={(e) => setFormData(prev => ({ ...prev, asistencia_1: e.target.value as any }))}
                          className="sr-only"
                        />
                        <div className={`p-3 text-center rounded-lg border-2 cursor-pointer transition-colors ${
                          formData.asistencia_1 === option
                            ? 'border-rose-500 bg-rose-50 text-rose-700'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}>
                          {option === 'si' && '✅ Sí, asistiré'}
                          {option === 'no' && '❌ No podré asistir'}
                          {option === 'pendiente' && '❓ Sin confirmar'}
                        </div>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Restricciones primera persona */}
                {formData.asistencia_1 === 'si' && (
                  <div>
                    <label htmlFor="restriccion_1" className="block text-sm font-medium text-gray-700 mb-2">
                      Restricciones alimentarias de {invitado.nombre_1} (opcional)
                    </label>
                    <input
                      type="text"
                      id="restriccion_1"
                      value={formData.restriccion_1}
                      onChange={(e) => setFormData(prev => ({ ...prev, restriccion_1: e.target.value }))}
                      placeholder="Ej: Vegetariano, sin gluten, alergias..."
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent"
                    />
                  </div>
                )}

                {/* Segunda persona (si existe) */}
                {invitado.nombre_2 && (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-3">
                        Asistencia de {invitado.nombre_2}
                      </label>
                      <div className="grid grid-cols-3 gap-3">
                        {(['si', 'no', 'pendiente'] as const).map((option) => (
                          <label key={option} className="relative">
                            <input
                              type="radio"
                              name="asistencia_2"
                              value={option}
                              checked={formData.asistencia_2 === option}
                              onChange={(e) => setFormData(prev => ({ ...prev, asistencia_2: e.target.value as any }))}
                              className="sr-only"
                            />
                            <div className={`p-3 text-center rounded-lg border-2 cursor-pointer transition-colors ${
                              formData.asistencia_2 === option
                                ? 'border-rose-500 bg-rose-50 text-rose-700'
                                : 'border-gray-200 hover:border-gray-300'
                            }`}>
                              {option === 'si' && '✅ Sí, asistiré'}
                              {option === 'no' && '❌ No podré asistir'}
                              {option === 'pendiente' && '❓ Sin confirmar'}
                            </div>
                          </label>
                        ))}
                      </div>
                    </div>

                    {/* Restricciones segunda persona */}
                    {formData.asistencia_2 === 'si' && (
                      <div>
                        <label htmlFor="restriccion_2" className="block text-sm font-medium text-gray-700 mb-2">
                          Restricciones alimentarias de {invitado.nombre_2} (opcional)
                        </label>
                        <input
                          type="text"
                          id="restriccion_2"
                          value={formData.restriccion_2}
                          onChange={(e) => setFormData(prev => ({ ...prev, restriccion_2: e.target.value }))}
                          placeholder="Ej: Vegetariano, sin gluten, alergias..."
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent"
                        />
                      </div>
                    )}
                  </>
                )}


                {/* Error message */}
                {error && (
                  <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                    <p className="text-red-600">{error}</p>
                  </div>
                )}

                {/* Submit button */}
                <div className="flex space-x-4">
                  <Button
                    type="submit"
                    loading={saving}
                    className="flex-1"
                  >
                    {saving ? 'Guardando...' : 'Confirmar Asistencia'}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => router.push('/')}
                  >
                    Ver Página Principal
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>

          {/* Info Footer */}
          <div className="text-center mt-8 p-6 bg-white/50 backdrop-blur rounded-lg">
            <h3 className="font-semibold text-gray-900 mb-2">Información del Evento</h3>
            <p className="text-gray-600 text-sm">
              📅 15 de Febrero, 2025 • 4:00 PM<br />
              ⛪ Ceremonia: Iglesia San José<br />
              🎉 Recepción: Club Campestre (6:00 PM)
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
