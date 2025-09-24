/**
 * Wedding App - Main landing page
 * Features: Hero section, gift catalog, wedding info, dress code
 */
'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { Producto } from '@/types'
import Button from '@/components/ui/Button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import ContribucionModal from '@/components/ContribucionModal'
import Image from 'next/image'

export default function Home() {
  const [productos, setProductos] = useState<Producto[]>([])
  const [loading, setLoading] = useState(true)
  const [showContribucionModal, setShowContribucionModal] = useState(false)
  const [selectedProducto, setSelectedProducto] = useState<Producto | null>(null)

  useEffect(() => {
    const loadProductos = async () => {
      try {
        const { data, error } = await supabase
          .from('productos')
          .select('*')
          .order('created_at', { ascending: true })

        if (error) throw error
        setProductos(data || [])
      } catch (error) {
        console.error('Error loading productos:', error)
      } finally {
        setLoading(false)
      }
    }

    loadProductos()
  }, [])

  const handleContribuir = (producto: Producto) => {
    setSelectedProducto(producto)
    setShowContribucionModal(true)
  }

  const handleCloseModal = () => {
    setShowContribucionModal(false)
    setSelectedProducto(null)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50 to-pink-50">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-r from-rose-600 to-pink-600 text-white">
        <div className="container mx-auto px-4 py-24 text-center">
          <h1 className="text-4xl md:text-6xl font-bold mb-6">
            ¡Nos Casamos!
          </h1>
          <p className="text-xl md:text-2xl mb-8 opacity-90">
            Celebra con nosotros este día tan especial
          </p>
          <div className="space-y-4 md:space-y-0 md:space-x-4 md:flex md:justify-center">
            <Button size="lg" variant="secondary">
              Ver Regalos
            </Button>
            <Button size="lg" variant="outline">
              Información del Evento
            </Button>
          </div>
        </div>
      </section>

      {/* Wedding Info Preview */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-center text-rose-600">📅 Fecha</CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <p className="text-lg font-semibold">15 de Febrero, 2025</p>
                <p className="text-gray-600">4:00 PM</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-center text-rose-600">⛪ Ceremonia</CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <p className="font-semibold">Iglesia San José</p>
                <p className="text-gray-600">Carrera 15 #123-45</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-center text-rose-600">🎉 Recepción</CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <p className="font-semibold">Club Campestre</p>
                <p className="text-gray-600">6:00 PM</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-center text-rose-600">👔 Vestimenta</CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <p className="font-semibold">Formal</p>
                <p className="text-gray-600">Traje/Vestido</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Gifts Section */}
      <section className="py-20 bg-white relative overflow-hidden">
        {/* Background decoration */}
        <div className="absolute inset-0">
          <div className="absolute -top-24 -right-24 w-96 h-96 bg-gradient-to-br from-rose-100 to-pink-100 rounded-full opacity-60 blur-3xl"></div>
          <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-gradient-to-br from-purple-100 to-rose-100 rounded-full opacity-60 blur-3xl"></div>
        </div>

        <div className="container mx-auto px-4 relative">
          <div className="text-center mb-16">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full mb-6 shadow-lg">
              <span className="text-white text-2xl">🎁</span>
            </div>
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              Lista de Regalos
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              Tu presencia es nuestro mejor regalo, pero si deseas contribuir a nuestro futuro juntos, 
              aquí puedes aportar a estos proyectos especiales que tenemos en mente.
            </p>
          </div>

          {loading ? (
            <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-8">
              {[1, 2, 3].map((i) => (
                <Card key={i} className="animate-pulse overflow-hidden">
                  <div className="aspect-[4/3] bg-gray-200"></div>
                  <CardContent className="p-6">
                    <div className="space-y-3">
                      <div className="h-6 bg-gray-200 rounded w-3/4"></div>
                      <div className="h-4 bg-gray-200 rounded"></div>
                      <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                      <div className="h-10 bg-gray-200 rounded mt-4"></div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : productos.length > 0 ? (
            <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-8">
              {productos.map((producto) => (
                <Card key={producto.id} className="overflow-hidden hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 group bg-white border-0 shadow-lg">
                  <div className="aspect-[4/3] relative overflow-hidden bg-gray-100">
                    <Image
                      src={producto.imagen_url}
                      alt={producto.titulo}
                      fill
                      className="object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    <div className="absolute top-4 right-4 w-12 h-12 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-lg opacity-0 group-hover:opacity-100 transition-all duration-300 transform scale-0 group-hover:scale-100">
                      <span className="text-lg">💝</span>
                    </div>
                  </div>
                  <CardContent className="p-6">
                    <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-purple-600 transition-colors">
                      {producto.titulo}
                    </h3>
                    <p className="text-gray-600 mb-6 leading-relaxed line-clamp-3">
                      {producto.descripcion}
                    </p>
                    <Button 
                      onClick={() => handleContribuir(producto)}
                      className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
                    >
                      <span className="mr-2">✨</span>
                      Contribuir Ahora
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-20">
              <div className="w-32 h-32 mx-auto mb-8 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center shadow-lg">
                <span className="text-5xl">🎁</span>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Próximamente</h3>
              <p className="text-gray-600 text-lg max-w-md mx-auto mb-8">
                Estamos preparando nuestra lista de regalos especial. 
                ¡Vuelve pronto para ver las opciones disponibles!
              </p>
              <div className="inline-flex items-center px-6 py-3 bg-purple-50 text-purple-700 rounded-full">
                <span className="mr-2">⏳</span>
                <span className="font-medium">En construcción...</span>
              </div>
            </div>
          )}

          {productos.length > 0 && (
            <div className="text-center mt-16">
              <div className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-200 rounded-full">
                <span className="mr-2">💡</span>
                <span className="text-purple-700 font-medium">
                  Puedes contribuir con el monto que desees. ¡Tu generosidad nos emociona!
                </span>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* RSVP Section */}
      <section className="py-16 bg-gradient-to-r from-rose-600 to-pink-600 text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            Confirma tu Asistencia
          </h2>
          <p className="text-xl mb-8 opacity-90">
            Por favor, confirma si podrás acompañarnos en este día tan especial
          </p>
          <div className="max-w-md mx-auto">
            <p className="text-lg mb-4">
              Si recibiste una invitación, usa el enlace personalizado que te enviamos.
            </p>
            <p className="text-sm opacity-75">
              ¿No tienes el enlace? Contáctanos directamente.
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-8">
        <div className="container mx-auto px-4 text-center">
          <p className="text-lg font-semibold mb-2">Con amor,</p>
          <p className="text-2xl font-bold text-rose-400">Ana & Carlos</p>
          <p className="text-gray-400 mt-4">15 de Febrero, 2025</p>
        </div>
      </footer>

      {/* Contribucion Modal */}
      <ContribucionModal
        isOpen={showContribucionModal}
        onClose={handleCloseModal}
        producto={selectedProducto}
      />
    </div>
  )
}
