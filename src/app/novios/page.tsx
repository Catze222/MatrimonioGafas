/**
 * Página de Novios - Alejandra & Jaime
 */
'use client'

import Link from 'next/link'

export default function NoviosPage() {
  return (
    <div className="min-h-screen" style={{ margin: 0, backgroundColor: '#f8f6f0', color: '#1e3a8a', boxSizing: 'border-box' }}>
      {/* Navigation Header */}
      <header className="fixed top-0 left-0 right-0 z-50 shadow-sm" style={{ backgroundColor: '#f8f6f0' }}>
        <div className="max-w-6xl mx-auto px-2 md:px-4">
          {/* Top brand bar */}
          <div className="text-center py-2 text-xs md:text-sm border-b border-gray-100" style={{ color: '#1e3a8a' }}>
            <Link href="/" className="hover:text-gray-600">Alejandra &amp; Jaime</Link>
          </div>
          
          {/* Main navigation */}
          <nav className="flex justify-center items-center py-2 md:py-4">
            <ul className="flex flex-wrap justify-center gap-1 sm:gap-2 md:gap-4 lg:gap-8 text-xs sm:text-sm md:text-base lg:text-lg" style={{ fontFamily: 'var(--font-playfair)', fontWeight: 700, lineHeight: 1.4, letterSpacing: 'normal', color: '#1e3a8a' }}>
              <li><Link href="/" className="hover:opacity-70 transition-colors px-1 md:px-2 py-1" style={{ color: '#1e3a8a', fontWeight: 700 }}>Inicio</Link></li>
              <li><Link href="/novios" className="hover:opacity-70 transition-colors underline px-1 md:px-2 py-1" style={{ color: '#1e3a8a', fontWeight: 700 }}>Los novios</Link></li>
              <li><Link href="/ceremonia" className="hover:opacity-70 transition-colors px-1 md:px-2 py-1" style={{ color: '#1e3a8a', fontWeight: 700 }}>Día del evento</Link></li>
              <li><Link href="/regalos" className="hover:opacity-70 transition-colors px-1 md:px-2 py-1" style={{ color: '#1e3a8a', fontWeight: 700 }}>Regalos</Link></li>
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
              fontFamily: 'var(--font-playfair)', 
              color: '#1e3a8a', 
              fontWeight: 400, 
              textTransform: 'uppercase', 
              lineHeight: 1.3, 
              letterSpacing: '3px', 
              fontSize: 'clamp(32px, 6vw, 48px)',
              marginBottom: '32px'
            }}>
              Datos curiosos de los gafufos
            </h1>
            <div className="w-24 h-px bg-black mx-auto mb-8"></div>
            <p className="text-lg md:text-xl max-w-3xl mx-auto leading-relaxed" style={{ fontFamily: 'var(--font-montserrat)', fontWeight: 400, color: '#1e3a8a' }}>
              <strong>¡Los Fufis nos conocemos muy bien!</strong> Y queremos que ustedes también nos conozcan un poquito más.
            </p>
          </div>

          {/* Datos curiosos */}
          <div className="text-center p-12 lg:p-16 rounded-lg mb-16" style={{ backgroundColor: '#f8f6f0' }}>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
              <div className="text-center">
                <p className="leading-relaxed" style={{ fontFamily: 'var(--font-montserrat)', fontSize: '16px', color: '#1e3a8a' }}>
                  Nos conocimos gracias a unos amigos que casi arruinan la historia. Y aquí seguimos, porque somos igual de tercos que de inseparables.
                </p>
              </div>
              <div className="text-center">
                <p className="leading-relaxed" style={{ fontFamily: 'var(--font-montserrat)', fontSize: '16px', color: '#1e3a8a' }}>
                  Alejandra come como tres Jaimes juntos… pero cuando se trata de tecnología, sin su ingeniero de sistemas de cabecera no prende ni el televisor.
                </p>
              </div>
              <div className="text-center">
                <p className="leading-relaxed" style={{ fontFamily: 'var(--font-montserrat)', fontSize: '16px', color: '#1e3a8a' }}>
                  Jaime alguna vez, por culpa de Carolina (la mamá de Alejandra) se hizo pasar por merideño para cruzar la frontera a Venezuela. Desde entonces no se baja del veredicto: la arepa es más rica en Venezuela, pero la empanada colombiana rompe a la venezolana sin discusión.
                </p>
              </div>
              <div className="text-center">
                <p className="leading-relaxed" style={{ fontFamily: 'var(--font-montserrat)', fontSize: '16px', color: '#1e3a8a' }}>
                  En Venezuela absolutamente todo se toma con hielo; en Bogotá, en cambio, no tanto. Desde que Alicia (la mamá de Jaime) conoció a Alejandra, su nevera no ha tenido un día libre… hoy funciona como una pequeña planta de hielo artesanal.
                </p>
              </div>
              <div className="text-center">
                <p className="leading-relaxed" style={{ fontFamily: 'var(--font-montserrat)', fontSize: '16px', color: '#1e3a8a' }}>
                  Aunque Jaime dice que lo suyo es el punk, su canción más escuchada en Spotify fue nada menos que La Bachata de Manuel Turizo. Y aunque Alejandra asegura ser fan de la salsa, la verdad es que en esa casa lo que más suena (y se baila) es ¡Chayanne!
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}

