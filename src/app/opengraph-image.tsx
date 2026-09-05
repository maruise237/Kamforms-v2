import { ImageResponse } from 'next/og'

export const runtime = 'nodejs'
export const alt = 'Kamforms — Formulaires intelligents avec notifications WhatsApp'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

export default function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          background: '#09090b',
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          fontFamily: 'ui-sans-serif, system-ui, sans-serif',
          padding: '80px',
          position: 'relative',
        }}
      >
        {/* Background grid */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            backgroundImage:
              'linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)',
            backgroundSize: '60px 60px',
          }}
        />

        {/* Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '48px' }}>
          {/* Kamforms logo: barre + bras sup + pill diagonal */}
          <svg width="56" height="56" viewBox="0 0 510 510" fill="none">
            <rect x="28" y="33" width="130" height="447" rx="22" fill="white"/>
            <path d="M 240,48 L 390,48 Q 415,48 411,73 L 395,160 Q 390,185 365,185 L 215,185 Q 190,185 195,160 L 211,73 Q 215,48 240,48 Z" fill="white"/>
            <g transform="translate(302, 342) rotate(28)">
              <rect x="-140" y="-82" width="280" height="164" rx="80" fill="white"/>
            </g>
          </svg>
          <span style={{ fontSize: '36px', fontWeight: '700', color: '#ffffff', letterSpacing: '-0.5px' }}>
            Kamforms
          </span>
        </div>

        {/* Headline */}
        <h1
          style={{
            fontSize: '58px',
            fontWeight: '700',
            color: '#ffffff',
            textAlign: 'center',
            lineHeight: 1.1,
            margin: '0 0 24px 0',
            letterSpacing: '-1px',
          }}
        >
          Formulaires intelligents,
          <br />
          <span style={{ color: '#71717a' }}>notifications WhatsApp.</span>
        </h1>

        {/* Subtitle */}
        <p
          style={{
            fontSize: '22px',
            color: '#52525b',
            textAlign: 'center',
            margin: '0 0 48px 0',
          }}
        >
          Décrivez · L&apos;IA génère · WhatsApp vous notifie
        </p>

        {/* Badge */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            border: '1px solid #27272a',
            borderRadius: '999px',
            padding: '10px 20px',
          }}
        >
          <span style={{ fontSize: '14px', color: '#a1a1aa' }}>Développé par</span>
          <span style={{ fontSize: '14px', fontWeight: '600', color: '#ffffff' }}>Kamtech</span>
        </div>
      </div>
    ),
    { ...size }
  )
}
