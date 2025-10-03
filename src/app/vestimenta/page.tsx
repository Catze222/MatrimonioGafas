/**
 * Vestimenta Page - Dress Code Reference
 * Displays elegant masonry grid of dress code examples
 */
'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { getVestimentaImages } from '@/lib/storage'

interface VestimentaSection {
  title: string
  subtitle: string
  category: 'hombres' | 'mujeres'
  images: string[]
  description: string
}

export default function VestimentaPage() {
  const [sections, setSections] = useState<VestimentaSection[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const loadImages = async () => {
      try {
        // Load images for both categories
        const [hombresResult, mujeresResult] = await Promise.all([
          getVestimentaImages('hombres'),
          getVestimentaImages('mujeres')
        ])

        if (hombresResult.error || mujeresResult.error) {
          throw new Error(hombresResult.error || mujeresResult.error)
        }

        const sectionsData: VestimentaSection[] = [
          {
            title: 'Mujeres',
            subtitle: 'Vestido largo',
            category: 'mujeres',
            images: mujeresResult.images,
            description: 'Cualquier tipo de vestido largo es bienvenido. Pueden ser elegantes, con estampados o del color que más te guste, ¡lo importante es que te sientas cómoda! Si prefieres usar tenis, ¡también son bienvenidos!'
          },
          {
            title: 'Hombres',
            subtitle: 'Traje formal',
            category: 'hombres',
            images: hombresResult.images,
            description: 'Traje sin corbata, pero si prefieres llevar corbata también es bienvenido. Y si te sientes más cómodo con tenis, ¡adelante! Lo importante es que disfrutes la celebración con tu estilo.'
          }
        ]

        setSections(sectionsData)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error loading images')
      } finally {
        setLoading(false)
      }
    }

    loadImages()
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen" style={{ fontFamily: 'var(--font-montserrat)' }}>
        {/* Navigation Header */}
        <header className="fixed top-0 left-0 right-0 z-50 bg-white shadow-sm">
          <div className="max-w-6xl mx-auto px-2 md:px-4">
            <div className="text-center py-2 text-gray-500 text-xs md:text-sm border-b border-gray-100">
              Alejandra &amp; Jaime
            </div>
            <nav className="flex justify-center items-center py-2 md:py-4">
              <ul className="flex flex-wrap justify-center gap-2 md:gap-4 lg:gap-8 text-xs md:text-sm lg:text-base" style={{ fontFamily: 'var(--font-montserrat)' }}>
                <li><Link href="/" className="text-black hover:text-gray-600 transition-colors px-1 md:px-2 py-1">Inicio</Link></li>
                <li><Link href="/ceremonia" className="text-black hover:text-gray-600 transition-colors px-1 md:px-2 py-1">Día del evento</Link></li>
                <li><Link href="/regalos" className="text-black hover:text-gray-600 transition-colors px-1 md:px-2 py-1">Regalos</Link></li>
                <li><Link href="/vestimenta" className="text-black hover:text-gray-600 transition-colors underline px-1 md:px-2 py-1">Vestimenta</Link></li>
              </ul>
            </nav>
          </div>
        </header>

        {/* Loading Content */}
        <div className="pt-24 md:pt-28 px-4 min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto mb-4"></div>
            <p className="text-gray-600">Cargando sugerencias de vestimenta...</p>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen" style={{ fontFamily: 'var(--font-montserrat)' }}>
        {/* Navigation Header */}
        <header className="fixed top-0 left-0 right-0 z-50 bg-white shadow-sm">
          <div className="max-w-6xl mx-auto px-2 md:px-4">
            <div className="text-center py-2 text-gray-500 text-xs md:text-sm border-b border-gray-100">
              Alejandra &amp; Jaime
            </div>
            <nav className="flex justify-center items-center py-2 md:py-4">
              <ul className="flex flex-wrap justify-center gap-2 md:gap-4 lg:gap-8 text-xs md:text-sm lg:text-base" style={{ fontFamily: 'var(--font-montserrat)' }}>
                <li><Link href="/" className="text-black hover:text-gray-600 transition-colors px-1 md:px-2 py-1">Inicio</Link></li>
                <li><Link href="/ceremonia" className="text-black hover:text-gray-600 transition-colors px-1 md:px-2 py-1">Día del evento</Link></li>
                <li><Link href="/regalos" className="text-black hover:text-gray-600 transition-colors px-1 md:px-2 py-1">Regalos</Link></li>
                <li><Link href="/vestimenta" className="text-black hover:text-gray-600 transition-colors underline px-1 md:px-2 py-1">Vestimenta</Link></li>
              </ul>
            </nav>
          </div>
        </header>

        {/* Error Content */}
        <div className="pt-24 md:pt-28 px-4 min-h-screen flex items-center justify-center">
          <div className="text-center">
            <p className="text-red-600 mb-4">Error: {error}</p>
            <button 
              onClick={() => window.location.reload()} 
              className="px-4 py-2 bg-black text-white rounded hover:bg-gray-800 transition-colors"
            >
              Reintentar
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen" style={{ fontFamily: 'var(--font-montserrat)', backgroundColor: '#f8f6f0', color: '#1e3a8a' }}>
      {/* Navigation Header */}
      <header className="fixed top-0 left-0 right-0 z-50 shadow-sm" style={{ backgroundColor: '#f8f6f0' }}>
        <div className="max-w-6xl mx-auto px-2 md:px-4">
          <div className="text-center py-2 text-xs md:text-sm border-b border-gray-100" style={{ color: '#1e3a8a' }}>
            Alejandra &amp; Jaime
          </div>
          <nav className="flex justify-center items-center py-2 md:py-4">
            <ul className="flex flex-wrap justify-center gap-1 sm:gap-2 md:gap-4 lg:gap-8 text-xs sm:text-sm md:text-base lg:text-lg" style={{ fontFamily: 'var(--font-playfair)', fontWeight: 700, lineHeight: 1.4, letterSpacing: 'normal', color: '#1e3a8a' }}>
              <li><Link href="/" className="hover:opacity-70 transition-colors px-1 md:px-2 py-1" style={{ color: '#1e3a8a', fontWeight: 700 }}>Inicio</Link></li>
              <li><Link href="/ceremonia" className="hover:opacity-70 transition-colors px-1 md:px-2 py-1" style={{ color: '#1e3a8a', fontWeight: 700 }}>Día del evento</Link></li>
              <li><Link href="/vestimenta" className="hover:opacity-70 transition-colors underline px-1 md:px-2 py-1" style={{ color: '#1e3a8a', fontWeight: 700 }}>Vestimenta</Link></li>
              <li><Link href="/regalos" className="hover:opacity-70 transition-colors px-1 md:px-2 py-1" style={{ color: '#1e3a8a', fontWeight: 700 }}>Regalos</Link></li>
            </ul>
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <main className="pt-24 md:pt-28 px-4 pb-16">
        <div className="max-w-6xl mx-auto">
          {/* Page Header */}
          <div className="text-center mb-12 md:mb-16">
            <h1 
              className="mb-4"
              style={{ 
                fontFamily: 'var(--font-playfair)', 
                fontWeight: 400, 
                textTransform: 'uppercase', 
                letterSpacing: '3px',
                color: '#1e3a8a',
                fontSize: 'clamp(32px, 6vw, 48px)',
                lineHeight: 1.3
              }}
            >
              Código de Vestimenta
            </h1>
            <p 
              className="text-lg md:text-xl max-w-2xl mx-auto"
              style={{ 
                fontFamily: 'var(--font-montserrat)', 
                lineHeight: 1.6 
              }}
            >
              <strong>Te sugerimos estos estilos</strong> para acompañarnos en nuestro día especial
            </p>
          </div>

          {/* Vestimenta Sections */}
          <div className="space-y-16 md:space-y-20">
            {sections.map((section) => (
              <section key={section.category} className="w-full">
                {/* Section Header */}
                <div className="text-center mb-8 md:mb-12">
                  <h2 
                    className="text-3xl md:text-4xl lg:text-5xl mb-2"
                    style={{ 
                      fontFamily: 'var(--font-playfair)', 
                      fontWeight: 400, 
                      textTransform: 'none', 
                      letterSpacing: '2px',
                      color: '#1e3a8a' 
                    }}
                  >
                    {section.title}
                  </h2>
                  <h3 
                    className="text-xl md:text-2xl mb-4"
                    style={{ 
                      fontFamily: 'var(--font-montserrat)', 
                      fontWeight: 400,
                      fontStyle: 'italic',
                      color: '#1e3a8a'
                    }}
                  >
                    {section.subtitle}
                  </h3>
                  <p 
                    className="text-base md:text-lg max-w-xl mx-auto"
                    style={{ 
                      fontFamily: 'var(--font-montserrat)', 
                      lineHeight: 1.6,
                      color: '#1e3a8a'
                    }}
                  >
                    {section.description}
                  </p>
                </div>

                {/* Masonry Grid - COMENTADO: Descomentar si se desean mostrar fotos de referencia */}
                {/* {section.images.length > 0 ? (
                  <div className="masonry-grid">
                    <style jsx>{`
                      .masonry-grid {
                        column-count: 2;
                        column-gap: 1rem;
                      }
                      
                      @media (min-width: 768px) {
                        .masonry-grid {
                          column-count: 3;
                        }
                      }
                      
                      @media (min-width: 1024px) {
                        .masonry-grid {
                          column-count: 4;
                        }
                      }
                      
                      .masonry-item {
                        break-inside: avoid;
                        margin-bottom: 1rem;
                        transition: transform 0.3s ease, box-shadow 0.3s ease;
                      }
                      
                      .masonry-item:hover {
                        transform: translateY(-2px);
                        box-shadow: 0 8px 25px rgba(0,0,0,0.15);
                      }
                      
                      .masonry-item img {
                        width: 100%;
                        height: auto;
                        border-radius: 0.5rem;
                        filter: saturate(0.9) brightness(1.05);
                        transition: filter 0.3s ease;
                      }
                      
                      .masonry-item:hover img {
                        filter: saturate(1) brightness(1);
                      }
                    `}</style>
                    
                    {section.images.map((imageUrl, imageIndex) => (
                      <div key={imageIndex} className="masonry-item">
                        <Image
                          src={imageUrl}
                          alt={`${section.title} - Referencia ${imageIndex + 1}`}
                          width={400}
                          height={600}
                          className="shadow-md w-full h-auto"
                        />
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <p style={{ fontFamily: 'var(--font-montserrat)', color: '#1e3a8a' }}>
                      No hay imágenes disponibles para esta categoría
                    </p>
                  </div>
                )} */}
              </section>
            ))}
          </div>

          {/* Footer Note */}
        </div>
      </main>
    </div>
  )
}
