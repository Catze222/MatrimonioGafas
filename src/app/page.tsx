/**
 * Wedding App - Alejandra & Jaime 2025
 * Inspirado en el elegante diseño de Zola
 */
'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'

export default function Home() {
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0
  })

  useEffect(() => {
    // Fecha: 13 de diciembre 2025, 3:30 PM hora Colombia (UTC-5)
    const weddingDate = new Date('2025-12-13T15:30:00-05:00').getTime()
    
    const timer = setInterval(() => {
      const now = new Date().getTime()
      const difference = weddingDate - now
      
      if (difference > 0) {
        setTimeLeft({
          days: Math.floor(difference / (1000 * 60 * 60 * 24)),
          hours: Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
          minutes: Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60)),
          seconds: Math.floor((difference % (1000 * 60)) / 1000)
        })
      }
    }, 1000)

    return () => clearInterval(timer)
  }, [])


  // No necesitamos esta función porque usaremos Link directo

  return (
    <div className="min-h-screen" style={{ fontFamily: '"EB Garamond", "Libre Baskerville", "Circular", "Helvetica", sans-serif', margin: 0, backgroundColor: '#f8f6f0', color: '#1e3a8a', boxSizing: 'border-box' }}>
      {/* Navigation Header - Responsive like Zola */}
      <header className="fixed top-0 left-0 right-0 z-50 shadow-sm" style={{ backgroundColor: '#f8f6f0' }}>
        <div className="max-w-6xl mx-auto px-2 md:px-4">
          {/* Top brand bar like Zola */}
          <div className="text-center py-2 text-xs md:text-sm border-b border-gray-100" style={{ color: '#1e3a8a' }}>
            Alejandra &amp; Jaime
          </div>
          
          {/* Main navigation */}
          <nav className="flex justify-center items-center py-2 md:py-4">
            <ul className="flex flex-wrap justify-center gap-2 md:gap-4 lg:gap-8 text-xs md:text-sm lg:text-base" style={{ fontFamily: '"Libre Baskerville", serif', fontWeight: 400, lineHeight: 1.6, letterSpacing: 'normal', color: '#1e3a8a' }}>
              <li><Link href="/" className="hover:opacity-70 transition-colors underline px-1 md:px-2 py-1" style={{ color: '#1e3a8a' }}>Inicio</Link></li>
              <li><Link href="/ceremonia" className="hover:opacity-70 transition-colors px-1 md:px-2 py-1" style={{ color: '#1e3a8a' }}>Día del evento</Link></li>
              <li><Link href="/regalos" className="hover:opacity-70 transition-colors px-1 md:px-2 py-1" style={{ color: '#1e3a8a' }}>Regalos</Link></li>
              <li><Link href="/vestimenta" className="hover:opacity-70 transition-colors px-1 md:px-2 py-1" style={{ color: '#1e3a8a' }}>Vestimenta</Link></li>
            </ul>
          </nav>
        </div>
      </header>

      {/* Hero Section - Exactly like Zola layout */}
      <section id="home" className="relative min-h-screen flex items-center justify-center overflow-hidden" style={{ backgroundColor: '#f8f6f0' }}>
        
        {/* Hero Content - Responsive like Zola */}
        <div className="relative z-10 text-center px-4 w-full max-w-4xl mx-auto">
          {/* Names - responsive like Zola structure */}
          <div className="mb-6 md:mb-8 pt-0 lg:pt-16 xl:pt-24">
            <h1 className="mb-2 md:mb-3" style={{ 
              fontFamily: '"EB Garamond", serif', 
              color: '#1e3a8a', 
              fontWeight: 400, 
              textTransform: 'uppercase', 
              lineHeight: 1.3, 
              letterSpacing: '3px', 
              fontSize: 'clamp(32px, 8vw, 72px)' 
            }}>
              Alejandra Vidaurre
            </h1>
            <div className="my-2 md:my-3 lg:my-4 flex justify-center">
              <img 
                src="https://elhwpjjmfjlkpibyxuje.supabase.co/storage/v1/object/public/productos/ChatGPT%20Image%2030%20sept%202025,%2009_31_09%20p.m..png"
                alt="Gafas de sol"
                className="w-24 h-24 md:w-32 md:h-32 lg:w-40 lg:h-40 xl:w-48 xl:h-48 object-contain"
                style={{ 
                  filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.1))'
                }}
              />
            </div>
            <h1 className="mt-2 md:mt-3" style={{ 
              fontFamily: '"EB Garamond", serif', 
              color: '#1e3a8a', 
              fontWeight: 400, 
              textTransform: 'uppercase', 
              lineHeight: 1.3, 
              letterSpacing: '3px', 
              fontSize: 'clamp(32px, 8vw, 72px)' 
            }}>
              Jaime Canal
            </h1>
          </div>
          
          {/* Date - responsive */}
          <div className="mb-6 md:mb-8">
            <h3 style={{ 
              fontFamily: '"EB Garamond", serif', 
              color: '#1e3a8a', 
              fontWeight: 400, 
              textTransform: 'uppercase', 
              lineHeight: 1.3, 
              letterSpacing: '2px', 
              fontSize: 'clamp(24px, 5vw, 40px)' 
            }}>
              13 DE DICIEMBRE DE 2025
            </h3>
          </div>
          
          {/* Countdown Timer - Solo días */}
          <div className="mb-8 md:mb-12" style={{ 
            fontFamily: '"Libre Baskerville", serif', 
            color: '#1e3a8a', 
            fontWeight: 400, 
            textTransform: 'none', 
            lineHeight: 1.6, 
            letterSpacing: 'normal', 
            fontSize: 'clamp(16px, 3vw, 18px)' 
          }}>
            Faltan <span className="font-semibold">{timeLeft.days}</span> días para el gran día
          </div>
        </div>
      </section>

    </div>
  )
}
