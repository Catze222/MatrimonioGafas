import { ImageResponse } from 'next/og'

// Tamaño Open Graph estándar
export const size = {
  width: 1200,
  height: 630,
}

export const contentType = 'image/png'

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          fontSize: 128,
          background: '#f8f6f0',
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          fontFamily: 'serif',
        }}
      >
        <div style={{ fontSize: 180, marginBottom: 30 }}>🕶️</div>
        <div style={{ color: '#1e3a8a', fontSize: 72, fontWeight: 400, textTransform: 'uppercase', letterSpacing: 4, marginBottom: 20 }}>
          Alejandra & Jaime
        </div>
        <div style={{ color: '#1e3a8a', fontSize: 48, fontWeight: 300 }}>
          13 de Diciembre, 2025
        </div>
        <div style={{ color: '#1e3a8a', fontSize: 36, marginTop: 30, fontStyle: 'italic' }}>
          ¡Nos casamos!
        </div>
      </div>
    ),
    {
      ...size,
    }
  )
}

