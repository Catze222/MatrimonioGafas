/**
 * Página de Ceremonia - Alejandra & Jaime
 * Información detallada del evento en Hacienda San Rafael
 */
'use client'

import Link from 'next/link'
import Image from 'next/image'

export default function CeremoniaPage() {
  return (
    <div className="min-h-screen" style={{ margin: 0, backgroundColor: '#f8f6f0', color: '#1e3a8a', boxSizing: 'border-box' }}>
      {/* Navigation Header - Same as other pages */}
      <header className="fixed top-0 left-0 right-0 z-50 shadow-sm" style={{ backgroundColor: '#f8f6f0' }}>
        <div className="max-w-6xl mx-auto px-2 md:px-4">
          {/* Top brand bar like Zola */}
          <div className="text-center py-2 text-xs md:text-sm border-b border-gray-100" style={{ color: '#1e3a8a' }}>
            <Link href="/" className="hover:text-gray-600">Alejandra &amp; Jaime</Link>
          </div>
          
          {/* Main navigation */}
          <nav className="flex justify-center items-center py-2 md:py-4">
            <ul className="flex flex-wrap justify-center gap-1 sm:gap-2 md:gap-4 lg:gap-8 text-xs sm:text-sm md:text-base lg:text-lg" style={{ fontFamily: 'var(--font-playfair)', fontWeight: 700, lineHeight: 1.4, letterSpacing: 'normal', color: '#1e3a8a' }}>
              <li><Link href="/" className="hover:opacity-70 transition-colors px-1 md:px-2 py-1" style={{ color: '#1e3a8a', fontWeight: 700 }}>Inicio</Link></li>
              <li><Link href="/novios" className="hover:opacity-70 transition-colors px-1 md:px-2 py-1" style={{ color: '#1e3a8a', fontWeight: 700 }}>Los novios</Link></li>
              <li><Link href="/ceremonia" className="hover:opacity-70 transition-colors underline px-1 md:px-2 py-1" style={{ color: '#1e3a8a', fontWeight: 700 }}>Día del evento</Link></li>
              <li><Link href="/regalos" className="hover:opacity-70 transition-colors px-1 md:px-2 py-1" style={{ color: '#1e3a8a', fontWeight: 700 }}>Regalos</Link></li>
            </ul>
          </nav>
        </div>
      </header>

      {/* Page Content */}
      <main className="pt-24 md:pt-28 pb-12">
        <div className="max-w-6xl mx-auto px-4">
          {/* Page Header */}
          <div className="text-center mb-8">
            <h1 style={{ 
              fontFamily: 'var(--font-playfair)', 
              color: '#1e3a8a', 
              fontWeight: 400, 
              textTransform: 'uppercase', 
              lineHeight: 1.3, 
              letterSpacing: '3px', 
              fontSize: 'clamp(32px, 6vw, 48px)',
              marginBottom: '24px'
            }}>
              Día del evento
            </h1>
            <div className="w-24 h-px bg-black mx-auto mb-6"></div>
            <p className="text-lg md:text-xl max-w-3xl mx-auto leading-relaxed" style={{ fontFamily: 'var(--font-montserrat)', fontWeight: 400, color: '#1e3a8a' }}>
              <strong>¡Nos casamos!</strong> Y lo queremos celebrar con una fiesta épica junto a nuestras personas más cercanas, en uno de los lugares más lindos de Bogotá. Porque nada sería igual sin ustedes en este día tan especial.
            </p>
          </div>

          {/* Venue Image Section */}
          <div className="mb-8">
            <div className="relative h-64 md:h-80 lg:h-96 rounded-lg overflow-hidden shadow-lg" style={{ backgroundColor: '#ffffff' }}>
              <Image
                src="https://elhwpjjmfjlkpibyxuje.supabase.co/storage/v1/object/public/productos/hacienda%204.png"
                alt="Hacienda San Rafael - Lugar de la ceremonia"
                fill
                className="object-cover"
              />
              
              {/* Overlay muy sutil */}
              <div className="absolute inset-0 bg-black/10"></div>
              
              <div className="absolute bottom-0 left-0 right-0 p-6 md:p-8 bg-gradient-to-t from-black/80 to-transparent">
                <h2 className="text-white text-2xl md:text-3xl" style={{ fontFamily: 'var(--font-playfair)', fontWeight: 400 }}>
                  Hacienda San Rafael
                </h2>
                <p className="text-white/90 mt-2 font-medium" style={{ fontFamily: 'var(--font-montserrat)' }}>
                  Patrimonio Cultural y Monumento Nacional - Bogotá
                </p>
              </div>
            </div>
          </div>

          {/* Event Details */}
          <div className="grid md:grid-cols-2 gap-6 mb-8">
            {/* Ceremony Info */}
            <div className="border border-gray-100 p-6 md:p-8" style={{ backgroundColor: '#f8f6f0' }}>
              <div className="text-center mb-6">
                <div className="w-16 h-16 mx-auto mb-3 rounded-full flex items-center justify-center" style={{ backgroundColor: '#f8f6f0' }}>
                  <svg className="w-8 h-8" fill="none" stroke="#1e3a8a" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="text-2xl" style={{ fontFamily: 'var(--font-playfair)', fontWeight: 400, color: '#1e3a8a' }}>
                  Horario del evento
                </h3>
              </div>
              
              <div className="text-center">
                <p className="font-medium" style={{ fontFamily: 'var(--font-montserrat)', color: '#1e3a8a' }}>
                  <strong>4:00 PM</strong> - Ceremonia
                </p>
              </div>
            </div>

            {/* Venue Info */}
            <div className="border border-gray-100 p-6 md:p-8" style={{ backgroundColor: '#f8f6f0' }}>
              <div className="text-center mb-6">
                <a 
                  href="https://maps.app.goo.gl/fieXhnasMKacjAJJ6"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-block"
                >
                  <div className="w-16 h-16 mx-auto mb-3 rounded-full flex items-center justify-center hover:opacity-70 transition-opacity cursor-pointer" style={{ backgroundColor: '#f8f6f0' }}>
                    <svg className="w-8 h-8" fill="none" stroke="#1e3a8a" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  </div>
                </a>
                <h3 className="text-2xl" style={{ fontFamily: 'var(--font-playfair)', fontWeight: 400, color: '#1e3a8a' }}>
                  Hacienda San Rafael
                </h3>
              </div>
              
              <div className="space-y-4">
                <div>
                  <p className="font-bold mb-1" style={{ fontFamily: 'var(--font-montserrat)', color: '#1e3a8a' }}>
                    Dirección
                  </p>
                  <a 
                    href="https://maps.app.goo.gl/fieXhnasMKacjAJJ6"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="leading-relaxed font-medium hover:underline inline-flex items-center gap-2"
                    style={{ fontFamily: 'var(--font-montserrat)', color: '#1e3a8a' }}
                  >
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                    </svg>
                    <span>
                      Carrera 57 No. 133-00<br />
                      Bogotá, Colombia
                    </span>
                  </a>
                </div>
                
                <div>
                  <p className="font-bold mb-1" style={{ fontFamily: 'var(--font-montserrat)', color: '#1e3a8a' }}>
                    Sobre el lugar
                  </p>
                  <p className="leading-relaxed font-medium" style={{ fontFamily: 'var(--font-montserrat)', color: '#1e3a8a' }}>
                    Patrimonio Cultural y Monumento Nacional con hermosas áreas verdes 
                    y espacios históricos. El lugar perfecto para nuestra celebración.
                  </p>
                </div>
                
                <div>
                  <p className="font-bold mb-1" style={{ fontFamily: 'var(--font-montserrat)', color: '#1e3a8a' }}>
                    Parqueadero y conductor elegido
                  </p>
                  <p className="leading-relaxed font-medium" style={{ fontFamily: 'var(--font-montserrat)', color: '#1e3a8a' }}>
                    En la Hacienda San Rafael encontrarás parqueaderos disponibles. Además, ese día tendrás la opción de contratar servicio de conductor elegido directamente en la hacienda, para que puedas disfrutar con total tranquilidad.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Dress Code Section */}
          <div>
            <div className="text-center mb-6">
              <h2 style={{ 
                fontFamily: 'var(--font-playfair)', 
                color: '#1e3a8a', 
                fontWeight: 400, 
                textTransform: 'uppercase', 
                lineHeight: 1.3, 
                letterSpacing: '3px', 
                fontSize: 'clamp(28px, 5vw, 40px)'
              }}>
                Código de Vestimenta
              </h2>
            </div>

            <div className="max-w-2xl mx-auto">
              <div className="border border-gray-100 p-6 md:p-8 text-center" style={{ backgroundColor: '#f8f6f0' }}>
                <p className="font-bold mb-1" style={{ fontFamily: 'var(--font-montserrat)', color: '#1e3a8a' }}>
                  Traje formal
                </p>
                <p className="leading-relaxed font-medium" style={{ fontFamily: 'var(--font-montserrat)', color: '#1e3a8a' }}>
                  Queremos que disfruten la noche sin preocuparse por el protocolo: todos los colores y estilos son bienvenidos. Si te sientes mejor sin corbata o con tenis, adelante, lo importante es que bailes cómodo.
                </p>
              </div>
            </div>
          </div>

        </div>
      </main>

    </div>
  )
}
