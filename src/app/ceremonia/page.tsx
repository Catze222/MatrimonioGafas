/**
 * Página de Ceremonia - Alejandra & Jaime
 * Información detallada del evento en Hacienda San Rafael
 */
'use client'

import Link from 'next/link'

export default function CeremoniaPage() {
  return (
    <div className="min-h-screen" style={{ fontFamily: '"EB Garamond", "Libre Baskerville", "Circular", "Helvetica", sans-serif', margin: 0, backgroundColor: '#FFFFFF', color: '#000000', boxSizing: 'border-box' }}>
      {/* Navigation Header - Same as other pages */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-white shadow-sm">
        <div className="max-w-6xl mx-auto px-2 md:px-4">
          {/* Top brand bar like Zola */}
          <div className="text-center py-2 text-gray-500 text-xs md:text-sm border-b border-gray-100">
            <Link href="/" className="hover:text-gray-700">Alejandra &amp; Jaime</Link>
          </div>
          
          {/* Main navigation */}
          <nav className="flex justify-center items-center py-2 md:py-4">
            <ul className="flex flex-wrap justify-center gap-2 md:gap-4 lg:gap-8 text-xs md:text-sm lg:text-base" style={{ fontFamily: '"Libre Baskerville", serif', fontWeight: 400, lineHeight: 1.6, letterSpacing: 'normal' }}>
              <li><Link href="/" className="text-black hover:text-gray-600 transition-colors px-1 md:px-2 py-1">Inicio</Link></li>
              <li><Link href="/ceremonia" className="text-black hover:text-gray-600 transition-colors underline px-1 md:px-2 py-1">Día del Evento</Link></li>
              <li><Link href="/regalos" className="text-black hover:text-gray-600 transition-colors px-1 md:px-2 py-1">Regalos</Link></li>
              <li><Link href="/vestimenta" className="text-black hover:text-gray-600 transition-colors px-1 md:px-2 py-1">Vestimenta</Link></li>
            </ul>
          </nav>
        </div>
      </header>

      {/* Page Content */}
      <main className="pt-24 md:pt-28 pb-16">
        <div className="max-w-6xl mx-auto px-4">
          {/* Page Header */}
          <div className="text-center mb-16 md:mb-20">
            <h1 style={{ 
              fontFamily: '"EB Garamond", serif', 
              color: '#000000', 
              fontWeight: 400, 
              textTransform: 'uppercase', 
              lineHeight: 1.3, 
              letterSpacing: '3px', 
              fontSize: 'clamp(32px, 6vw, 48px)',
              marginBottom: '32px'
            }}>
              Día del Evento
            </h1>
            <div className="w-24 h-px bg-black mx-auto mb-8"></div>
            <p className="text-lg md:text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed" style={{ fontFamily: '"Libre Baskerville", serif', fontWeight: 400 }}>
              ¡Nos fugamos! Pero primero haremos una fiesta épica. 
              Acompáñanos en este día tan especial en uno de los lugares más hermosos de Bogotá.
            </p>
          </div>

          {/* Venue Image Section */}
          <div className="mb-16 md:mb-20">
            <div className="relative h-64 md:h-80 lg:h-96 bg-gray-100 rounded-lg overflow-hidden shadow-lg">
              <img
                src="https://elhwpjjmfjlkpibyxuje.supabase.co/storage/v1/object/public/productos/san%20rafael%201.png"
                alt="Hacienda San Rafael - Lugar de la ceremonia"
                className="w-full h-full object-cover"
              />
              
              {/* Overlay muy sutil */}
              <div className="absolute inset-0 bg-black/10"></div>
              
              <div className="absolute bottom-0 left-0 right-0 p-6 md:p-8 bg-gradient-to-t from-black/80 to-transparent">
                <h2 className="text-white text-2xl md:text-3xl font-medium" style={{ fontFamily: '"EB Garamond", serif', fontWeight: 400 }}>
                  Hacienda San Rafael
                </h2>
                <p className="text-white/90 mt-2" style={{ fontFamily: '"Libre Baskerville", serif' }}>
                  Patrimonio Cultural y Monumento Nacional - Bogotá
                </p>
              </div>
            </div>
          </div>

          {/* Event Details */}
          <div className="grid md:grid-cols-2 gap-12 lg:gap-16 mb-20">
            {/* Ceremony Info */}
            <div className="bg-white border border-gray-100 p-8 lg:p-10">
              <div className="text-center mb-8">
                <div className="w-16 h-16 mx-auto mb-4 bg-gray-50 rounded-full flex items-center justify-center">
                  <svg className="w-8 h-8 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="text-2xl font-medium text-gray-900 mb-6" style={{ fontFamily: '"EB Garamond", serif', fontWeight: 400 }}>
                  Horarios del Evento
                </h3>
              </div>
              
              <div className="space-y-6">
                <div className="flex items-start space-x-4">
                  <div className="w-2 h-2 bg-black rounded-full mt-3 flex-shrink-0"></div>
                  <div>
                    <p className="font-medium text-gray-900 mb-1" style={{ fontFamily: '"Libre Baskerville", serif' }}>
                      <strong>3:30 PM</strong> - Llegada de invitados
                    </p>
                    <p className="text-gray-600 text-sm">
                      Llega puntual, los gafufos empezamos temprano
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-4">
                  <div className="w-2 h-2 bg-black rounded-full mt-3 flex-shrink-0"></div>
                  <div>
                    <p className="font-medium text-gray-900 mb-1" style={{ fontFamily: '"Libre Baskerville", serif' }}>
                      <strong>4:00 PM</strong> - Ceremonia
                    </p>
                    <p className="text-gray-600 text-sm">
                      El momento más importante del día
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-4">
                  <div className="w-2 h-2 bg-black rounded-full mt-3 flex-shrink-0"></div>
                  <div>
                    <p className="font-medium text-gray-900 mb-1" style={{ fontFamily: '"Libre Baskerville", serif' }}>
                      <strong>5:00 PM</strong> - Cóctel y fotos
                    </p>
                    <p className="text-gray-600 text-sm">
                      Hora del brindis y las fotos obligatorias
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-4">
                  <div className="w-2 h-2 bg-black rounded-full mt-3 flex-shrink-0"></div>
                  <div>
                    <p className="font-medium text-gray-900 mb-1" style={{ fontFamily: '"Libre Baskerville", serif' }}>
                      <strong>7:00 PM</strong> - Cena y fiesta
                    </p>
                    <p className="text-gray-600 text-sm">
                      Que comience la rumba hasta las 3:00 AM
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Venue Info */}
            <div className="bg-white border border-gray-100 p-8 lg:p-10">
              <div className="text-center mb-8">
                <div className="w-16 h-16 mx-auto mb-4 bg-gray-50 rounded-full flex items-center justify-center">
                  <svg className="w-8 h-8 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </div>
                <h3 className="text-2xl font-medium text-gray-900 mb-6" style={{ fontFamily: '"EB Garamond", serif', fontWeight: 400 }}>
                  Hacienda San Rafael
                </h3>
              </div>
              
              <div className="space-y-6">
                <div>
                  <p className="font-medium text-gray-900 mb-2" style={{ fontFamily: '"Libre Baskerville", serif' }}>
                    Dirección
                  </p>
                  <p className="text-gray-600 leading-relaxed">
                    Carrera 57 # 133-00<br />
                    Bogotá, Colombia
                  </p>
                </div>
                
                <div>
                  <p className="font-medium text-gray-900 mb-2" style={{ fontFamily: '"Libre Baskerville", serif' }}>
                    Sobre el lugar
                  </p>
                  <p className="text-gray-600 leading-relaxed text-sm">
                    Patrimonio Cultural y Monumento Nacional con hermosas áreas verdes 
                    y espacios históricos. El lugar perfecto para nuestra celebración.
                  </p>
                </div>
                
                <div>
                  <p className="font-medium text-gray-900 mb-2" style={{ fontFamily: '"Libre Baskerville", serif' }}>
                    Parqueadero
                  </p>
                  <p className="text-gray-600 leading-relaxed text-sm">
                    Hay parqueadero disponible. No te preocupes por dónde dejar el carro.
                  </p>
                </div>
                
                <div>
                  <p className="font-medium text-gray-900 mb-2" style={{ fontFamily: '"Libre Baskerville", serif' }}>
                    Hasta que el cuerpo aguante
                  </p>
                  <p className="text-gray-600 leading-relaxed text-sm">
                    La fiesta va hasta las <strong>3:00 AM</strong>. 
                    Descansa bien el día anterior porque vamos a bailar toda la noche.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Fun Section */}
          <div className="text-center bg-gray-50 p-12 lg:p-16 rounded-lg mb-16">
            <h3 className="text-3xl font-medium text-gray-900 mb-8" style={{ fontFamily: '"EB Garamond", serif', fontWeight: 400 }}>
              Datos Curiosos de los Gafufos
            </h3>
            <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
              <div className="text-center">
                <p className="text-gray-700 leading-relaxed" style={{ fontFamily: '"Libre Baskerville", serif', fontSize: '16px' }}>
                  Nos conocimos siendo los más nerds de la universidad. 
                  El amor se encontró en la biblioteca.
                </p>
              </div>
              <div className="text-center">
                <p className="text-gray-700 leading-relaxed" style={{ fontFamily: '"Libre Baskerville", serif', fontSize: '16px' }}>
                  Nuestra primera cita fue jugando videojuegos. 
                  Alejandra ganó todo. Jaime se enamoró más.
                </p>
              </div>
              <div className="text-center">
                <p className="text-gray-700 leading-relaxed" style={{ fontFamily: '"Libre Baskerville", serif', fontSize: '16px' }}>
                  Prometemos que habrá música para todos los gustos. 
                  Desde reggaeton hasta música de los 80s.
                </p>
              </div>
            </div>
          </div>

        </div>
      </main>

    </div>
  )
}
