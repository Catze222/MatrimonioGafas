/**
 * Página de Regalos - Alejandra & Jaime
 * Estilo Zola - Cards elegantes de productos
 */
'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { Producto } from '@/types'
import Button from '@/components/ui/Button'
import ContribucionModal from '@/components/ContribucionModal'
import Image from 'next/image'
import Link from 'next/link'

export default function RegalosPage() {
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
    <div className="min-h-screen" style={{ margin: 0, backgroundColor: '#f8f6f0', color: '#1e3a8a', boxSizing: 'border-box' }}>
      {/* Navigation Header - Same as home */}
      <header className="fixed top-0 left-0 right-0 z-50 shadow-sm" style={{ backgroundColor: '#f8f6f0' }}>
        <div className="max-w-6xl mx-auto px-2 md:px-4">
          {/* Top brand bar like Zola */}
          <div className="text-center py-2 text-xs md:text-sm border-b border-gray-100" style={{ color: '#1e3a8a' }}>
            <Link href="/" className="hover:text-gray-700">Alejandra &amp; Jaime</Link>
          </div>
          
          {/* Main navigation */}
          <nav className="flex justify-center items-center py-2 md:py-4">
            <ul className="flex flex-wrap justify-center gap-1 sm:gap-2 md:gap-4 lg:gap-8 text-xs sm:text-sm md:text-base lg:text-lg" style={{ fontFamily: 'var(--font-playfair)', fontWeight: 700, lineHeight: 1.4, letterSpacing: 'normal', color: '#1e3a8a' }}>
              <li><Link href="/" className="hover:opacity-70 transition-colors px-1 md:px-2 py-1" style={{ color: '#1e3a8a', fontWeight: 700 }}>Inicio</Link></li>
              <li><Link href="/ceremonia" className="hover:opacity-70 transition-colors px-1 md:px-2 py-1" style={{ color: '#1e3a8a', fontWeight: 700 }}>Día del evento</Link></li>
              <li><Link href="/regalos" className="hover:opacity-70 transition-colors underline px-1 md:px-2 py-1" style={{ color: '#1e3a8a', fontWeight: 700 }}>Regalos</Link></li>
              <li><Link href="/vestimenta" className="hover:opacity-70 transition-colors px-1 md:px-2 py-1" style={{ color: '#1e3a8a', fontWeight: 700 }}>Vestimenta</Link></li>
            </ul>
          </nav>
        </div>
      </header>

      {/* Page Content */}
      <main className="pt-24 md:pt-28 pb-16">
        <div className="max-w-6xl mx-auto px-4">
          {/* Page Header - Zola Style */}
          <div className="text-center mb-16 md:mb-20">
            <h1 style={{ 
              fontFamily: 'var(--font-playfair)', 
              color: '#1e3a8a', 
              fontWeight: 400, 
              textTransform: 'uppercase', 
              lineHeight: 1.3, 
              letterSpacing: '3px', 
              fontSize: 'clamp(32px, 6vw, 48px)',
              marginBottom: '32px'
            }}>
              Lista de Regalos
            </h1>
            <div className="w-24 h-px bg-black mx-auto mb-8"></div>
            <p className="text-lg md:text-xl max-w-3xl mx-auto leading-relaxed" style={{ fontFamily: 'var(--font-montserrat)', fontWeight: 400, color: '#1e3a8a' }}>
              <strong>Tu presencia es nuestro mejor regalo</strong>, pero si deseas regalarnos algo para nuestro futuro juntos, 
              aquí encontrarás algunos proyectos especiales que tenemos en mente.
            </p>
          </div>

          {/* Products Grid */}
          {loading ? (
            <div className="space-y-8">
              {[1, 2, 3].map((i) => (
                <div key={i} className="animate-pulse">
                  <div className="border border-gray-100 overflow-hidden" style={{ backgroundColor: '#f8f6f0' }}>
                    <div className="md:flex">
                      {/* Image skeleton */}
                      <div className="md:w-80 lg:w-96 aspect-[4/3] md:aspect-square bg-gray-100"></div>
                      {/* Content skeleton */}
                      <div className="flex-1 p-6 lg:p-8 space-y-4">
                        <div className="h-8 bg-gray-200 rounded w-3/4"></div>
                        <div className="space-y-3">
                          <div className="h-4 bg-gray-200 rounded"></div>
                          <div className="h-4 bg-gray-200 rounded"></div>
                          <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                        </div>
                        <div className="h-12 bg-gray-200 rounded w-40 mt-8"></div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : productos.length > 0 ? (
            <div className="space-y-8">
              {productos.map((producto) => (
                <div key={producto.id} className="group">
                  <div className="border border-gray-100 hover:shadow-lg transition-all duration-300 overflow-hidden" style={{ backgroundColor: '#f8f6f0' }}>
                    <div className="md:flex">
                      {/* Product Image - Fixed width on larger screens */}
                      <div className="md:w-80 lg:w-96 aspect-[4/3] md:aspect-square relative overflow-hidden md:flex-shrink-0" style={{ backgroundColor: '#ffffff' }}>
                        <Image
                          src={producto.imagen_url}
                          alt={producto.titulo}
                          fill
                          className="object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                      </div>
                      
                      {/* Product Info - Takes remaining space */}
                      <div className="flex-1 p-6 lg:p-8 flex flex-col justify-between">
                        <div>
                          <h3 className="text-2xl lg:text-3xl font-medium mb-4" style={{ fontFamily: 'var(--font-playfair)', fontWeight: 400, color: '#1e3a8a' }}>
                            {producto.titulo}
                          </h3>
                          <p className="mb-8 leading-relaxed text-lg" style={{ fontFamily: 'var(--font-montserrat)', fontSize: '18px', lineHeight: 1.6, color: '#1e3a8a' }}>
                            {producto.descripcion}
                          </p>
                        </div>
                        
                        <div className="flex justify-start">
                          <Button 
                            onClick={() => handleContribuir(producto)}
                            className="bg-black hover:bg-gray-800 text-white py-3 px-8 transition-colors duration-200"
                            style={{ 
                              fontFamily: 'var(--font-montserrat)', 
                              fontSize: '14px', 
                              fontWeight: 400,
                              borderRadius: '0',
                              textTransform: 'uppercase',
                              letterSpacing: '1px'
                            }}
                          >
                            Regalar
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-20">
              <div className="w-32 h-32 mx-auto mb-12 rounded-lg flex items-center justify-center" style={{ backgroundColor: '#f8f6f0' }}>
                <svg className="w-16 h-16" fill="none" stroke="#1e3a8a" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7" />
                </svg>
              </div>
              <h3 className="text-2xl font-light mb-6" style={{ fontFamily: 'var(--font-playfair)', color: '#1e3a8a' }}>
                Próximamente
              </h3>
              <p className="text-lg max-w-lg mx-auto mb-12 leading-relaxed" style={{ fontFamily: 'var(--font-montserrat)', color: '#1e3a8a' }}>
                Estamos preparando con mucho amor nuestra lista de regalos especial. 
                ¡Vuelve pronto para descubrir las opciones disponibles!
              </p>
            </div>
          )}

        </div>
      </main>


      {/* Contribucion Modal */}
      <ContribucionModal
        isOpen={showContribucionModal}
        onClose={handleCloseModal}
        producto={selectedProducto}
      />
    </div>
  )
}
