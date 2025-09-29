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
    <div className="min-h-screen" style={{ fontFamily: '"EB Garamond", "Libre Baskerville", "Circular", "Helvetica", sans-serif', margin: 0, backgroundColor: '#FFFFFF', color: '#000000', boxSizing: 'border-box' }}>
      {/* Navigation Header - Responsive like Zola */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-white shadow-sm">
        <div className="max-w-6xl mx-auto px-2 md:px-4">
          {/* Top brand bar like Zola */}
          <div className="text-center py-2 text-gray-500 text-xs md:text-sm border-b border-gray-100">
            Alejandra &amp; Jaime
          </div>
          
          {/* Main navigation */}
          <nav className="flex justify-center items-center py-2 md:py-4">
            <ul className="flex flex-wrap justify-center gap-2 md:gap-4 lg:gap-8 text-xs md:text-sm lg:text-base" style={{ fontFamily: '"Libre Baskerville", serif', fontWeight: 400, lineHeight: 1.6, letterSpacing: 'normal' }}>
              <li><Link href="/" className="text-black hover:text-gray-600 transition-colors underline px-1 md:px-2 py-1">Inicio</Link></li>
              <li><Link href="/ceremonia" className="text-black hover:text-gray-600 transition-colors px-1 md:px-2 py-1">Día del evento</Link></li>
              <li><Link href="/regalos" className="text-black hover:text-gray-600 transition-colors px-1 md:px-2 py-1">Regalos</Link></li>
              <li><Link href="/vestimenta" className="text-black hover:text-gray-600 transition-colors px-1 md:px-2 py-1">Vestimenta</Link></li>
            </ul>
          </nav>
        </div>
      </header>

      {/* Hero Section - Exactly like Zola layout */}
      <section id="home" className="relative min-h-screen flex items-center justify-center overflow-hidden" style={{ backgroundColor: '#FFFFFF' }}>
        {/* Decorative floral elements - positioned like Zola */}
        <div className="absolute top-0 right-0 w-80 h-80 opacity-20">
          <svg viewBox="0 0 200 200" className="w-full h-full">
            <path d="M50,100 Q100,50 150,100 Q100,150 50,100" fill="none" stroke="#000" strokeWidth="1" opacity="0.3"/>
            <path d="M70,80 Q100,60 130,80 Q100,100 70,80" fill="none" stroke="#000" strokeWidth="0.8" opacity="0.3"/>
            <path d="M70,120 Q100,140 130,120 Q100,100 70,120" fill="none" stroke="#000" strokeWidth="0.8" opacity="0.3"/>
          </svg>
        </div>
        
        <div className="absolute bottom-0 left-0 w-64 h-64 opacity-20">
          <svg viewBox="0 0 200 200" className="w-full h-full">
            <path d="M50,100 Q100,50 150,100 Q100,150 50,100" fill="none" stroke="#000" strokeWidth="1" opacity="0.3"/>
            <path d="M30,120 Q60,90 90,120 Q60,150 30,120" fill="none" stroke="#000" strokeWidth="0.8" opacity="0.3"/>
          </svg>
        </div>
        
        {/* Hero Content - Responsive like Zola */}
        <div className="relative z-10 text-center px-4 w-full max-w-4xl mx-auto">
          {/* Names - responsive like Zola structure */}
          <div className="mb-6 md:mb-8">
            <h1 className="mb-3 md:mb-4" style={{ 
              fontFamily: '"EB Garamond", serif', 
              color: '#000000', 
              fontWeight: 400, 
              textTransform: 'uppercase', 
              lineHeight: 1.3, 
              letterSpacing: '3px', 
              fontSize: 'clamp(32px, 8vw, 72px)' 
            }}>
              Alejandra Vidaurre
            </h1>
            <div className="my-4 md:my-6" style={{ 
              fontFamily: '"EB Garamond", serif', 
              color: '#000000', 
              fontWeight: 400, 
              textTransform: 'none', 
              lineHeight: 1.6, 
              letterSpacing: 'normal', 
              fontSize: 'clamp(24px, 6vw, 48px)' 
            }}>
              &
            </div>
            <h1 style={{ 
              fontFamily: '"EB Garamond", serif', 
              color: '#000000', 
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
              color: '#000000', 
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
            color: '#000000', 
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
