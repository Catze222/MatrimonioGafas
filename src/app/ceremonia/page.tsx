/**
 * Página de Ceremonia - Alejandra & Jaime
 * Información detallada del evento en Hacienda San Rafael
 */
'use client'

import Link from 'next/link'
import Image from 'next/image'

export default function CeremoniaPage() {
  return (
    <div className="min-h-screen" style={{ fontFamily: '"EB Garamond", "Libre Baskerville", "Circular", "Helvetica", sans-serif', margin: 0, backgroundColor: '#f8f6f0', color: '#1e3a8a', boxSizing: 'border-box' }}>
      {/* Navigation Header - Same as other pages */}
      <header className="fixed top-0 left-0 right-0 z-50 shadow-sm" style={{ backgroundColor: '#f8f6f0' }}>
        <div className="max-w-6xl mx-auto px-2 md:px-4">
          {/* Top brand bar like Zola */}
          <div className="text-center py-2 text-xs md:text-sm border-b border-gray-100" style={{ color: '#1e3a8a' }}>
            <Link href="/" className="hover:text-gray-600">Alejandra &amp; Jaime</Link>
          </div>
          
          {/* Main navigation */}
          <nav className="flex justify-center items-center py-2 md:py-4">
            <ul className="flex flex-wrap justify-center gap-2 md:gap-4 lg:gap-8 text-xs md:text-sm lg:text-base" style={{ fontFamily: '"Libre Baskerville", serif', fontWeight: 400, lineHeight: 1.6, letterSpacing: 'normal', color: '#1e3a8a' }}>
              <li><Link href="/" className="hover:opacity-70 transition-colors px-1 md:px-2 py-1" style={{ color: '#1e3a8a' }}>Inicio</Link></li>
              <li><Link href="/ceremonia" className="hover:opacity-70 transition-colors underline px-1 md:px-2 py-1" style={{ color: '#1e3a8a' }}>Día del evento</Link></li>
              <li><Link href="/regalos" className="hover:opacity-70 transition-colors px-1 md:px-2 py-1" style={{ color: '#1e3a8a' }}>Regalos</Link></li>
              <li><Link href="/vestimenta" className="hover:opacity-70 transition-colors px-1 md:px-2 py-1" style={{ color: '#1e3a8a' }}>Vestimenta</Link></li>
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
              color: '#1e3a8a', 
              fontWeight: 400, 
              textTransform: 'uppercase', 
              lineHeight: 1.3, 
              letterSpacing: '3px', 
              fontSize: 'clamp(32px, 6vw, 48px)',
              marginBottom: '32px'
            }}>
              Día del evento
            </h1>
            <div className="w-24 h-px bg-black mx-auto mb-8"></div>
            <p className="text-lg md:text-xl max-w-3xl mx-auto leading-relaxed" style={{ fontFamily: '"Libre Baskerville", serif', fontWeight: 400, color: '#1e3a8a' }}>
              <strong>¡Nos casamos!</strong> Y lo queremos celebrar con una fiesta épica junto a nuestras personas más cercanas, en uno de los lugares más lindos de Bogotá. Porque nada sería igual sin ustedes en este día tan especial.
            </p>
          </div>

          {/* Venue Image Section */}
          <div className="mb-16 md:mb-20">
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
            <div className="border border-gray-100 p-8 lg:p-10" style={{ backgroundColor: '#f8f6f0' }}>
              <div className="text-center mb-8">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center" style={{ backgroundColor: '#f8f6f0' }}>
                  <svg className="w-8 h-8" fill="none" stroke="#1e3a8a" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="text-2xl font-medium mb-6" style={{ fontFamily: '"EB Garamond", serif', fontWeight: 400, color: '#1e3a8a' }}>
                  Horarios del evento
                </h3>
              </div>
              
              <div className="space-y-6">
                <div className="flex items-start space-x-4">
                  <div className="w-2 h-2 bg-black rounded-full mt-3 flex-shrink-0"></div>
                  <div>
                    <p className="font-medium mb-1" style={{ fontFamily: '"Libre Baskerville", serif', color: '#1e3a8a' }}>
                      <strong>3:30 PM</strong> - Llegada de invitados
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-4">
                  <div className="w-2 h-2 bg-black rounded-full mt-3 flex-shrink-0"></div>
                  <div>
                    <p className="font-medium mb-1" style={{ fontFamily: '"Libre Baskerville", serif', color: '#1e3a8a' }}>
                      <strong>4:00 PM</strong> - Ceremonia
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-4">
                  <div className="w-2 h-2 bg-black rounded-full mt-3 flex-shrink-0"></div>
                  <div>
                    <p className="font-medium mb-1" style={{ fontFamily: '"Libre Baskerville", serif', color: '#1e3a8a' }}>
                      <strong>5:00 PM</strong> - Recepción
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-4">
                  <div className="w-2 h-2 bg-black rounded-full mt-3 flex-shrink-0"></div>
                  <div>
                    <p className="font-medium mb-1" style={{ fontFamily: '"Libre Baskerville", serif', color: '#1e3a8a' }}>
                      <strong>7:00 PM</strong> - Cena y fiesta
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Venue Info */}
            <div className="border border-gray-100 p-8 lg:p-10" style={{ backgroundColor: '#f8f6f0' }}>
              <div className="text-center mb-8">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center" style={{ backgroundColor: '#f8f6f0' }}>
                  <svg className="w-8 h-8" fill="none" stroke="#1e3a8a" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </div>
                <h3 className="text-2xl font-medium mb-6" style={{ fontFamily: '"EB Garamond", serif', fontWeight: 400, color: '#1e3a8a' }}>
                  Hacienda San Rafael
                </h3>
              </div>
              
              <div className="space-y-6">
                <div>
                  <p className="font-medium mb-2 text-sm" style={{ fontFamily: '"Libre Baskerville", serif', color: '#1e3a8a' }}>
                    Dirección
                  </p>
                  <p className="leading-relaxed text-sm" style={{ color: '#1e3a8a' }}>
                    Carrera 57 No. 133-00<br />
                    Bogotá, Colombia
                  </p>
                </div>
                
                <div>
                  <p className="font-medium mb-2 text-sm" style={{ fontFamily: '"Libre Baskerville", serif', color: '#1e3a8a' }}>
                    Sobre el lugar
                  </p>
                  <p className="leading-relaxed text-sm" style={{ color: '#1e3a8a' }}>
                    Patrimonio Cultural y Monumento Nacional con hermosas áreas verdes 
                    y espacios históricos. El lugar perfecto para nuestra celebración.
                  </p>
                </div>
                
                <div>
                  <p className="font-medium mb-2 text-sm" style={{ fontFamily: '"Libre Baskerville", serif', color: '#1e3a8a' }}>
                    Parqueadero
                  </p>
                  <p className="leading-relaxed text-sm" style={{ color: '#1e3a8a' }}>
                    Hay parqueadero disponible. No te preocupes por dónde dejar el carro.
                  </p>
                </div>
                
                <div>
                  <p className="font-medium mb-2 text-sm" style={{ fontFamily: '"Libre Baskerville", serif', color: '#1e3a8a' }}>
                    Hasta que el cuerpo aguante
                  </p>
                  <p className="leading-relaxed text-sm" style={{ color: '#1e3a8a' }}>
                    La fiesta va hasta las <strong>3:00 AM</strong>. 
                    Descansa bien el día anterior porque vamos a bailar toda la noche.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Fun Section */}
          <div className="text-center p-12 lg:p-16 rounded-lg mb-16" style={{ backgroundColor: '#f8f6f0' }}>
            <h3 className="text-3xl font-medium mb-8" style={{ fontFamily: '"EB Garamond", serif', fontWeight: 400, color: '#1e3a8a' }}>
              Datos curiosos de los Gafufos
            </h3>
            <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
              <div className="text-center">
                <p className="leading-relaxed" style={{ fontFamily: '"Libre Baskerville", serif', fontSize: '16px', color: '#1e3a8a' }}>
                  Alejandra come como tres Jaimes juntos… pero cuando se trata de tecnología, sin su ingeniero personal no prende ni el televisor.
                </p>
              </div>
              <div className="text-center">
                <p className="leading-relaxed" style={{ fontFamily: '"Libre Baskerville", serif', fontSize: '16px', color: '#1e3a8a' }}>
                  Jaime alguna vez se hizo pasar por merideño para cruzar la frontera a Venezuela. Desde entonces no se baja del veredicto: la arepa es más rica en Venezuela, pero la empanada colombiana rompe a la venezolana sin discusión.
                </p>
              </div>
              <div className="text-center">
                <p className="leading-relaxed" style={{ fontFamily: '"Libre Baskerville", serif', fontSize: '16px', color: '#1e3a8a' }}>
                  Nos conocimos gracias a unos amigos que casi arruinan la historia. Y aquí seguimos, porque somos igual de tercos que de inseparables.
                </p>
              </div>
            </div>
          </div>

        </div>
      </main>

    </div>
  )
}
