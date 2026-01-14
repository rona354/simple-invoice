import { ImageResponse } from 'next/og'

export const runtime = 'edge'
export const alt = 'Simple Invoice - Free Invoice Generator'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          background: 'linear-gradient(135deg, #18181b 0%, #27272a 100%)',
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          fontFamily: 'system-ui, sans-serif',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            marginBottom: 40,
          }}
        >
          <div
            style={{
              width: 80,
              height: 80,
              borderRadius: 16,
              background: '#3b82f6',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginRight: 24,
            }}
          >
            <span style={{ fontSize: 36, fontWeight: 700, color: 'white' }}>SI</span>
          </div>
          <span style={{ fontSize: 48, fontWeight: 700, color: 'white' }}>
            Simple Invoice
          </span>
        </div>
        <div
          style={{
            fontSize: 32,
            color: '#a1a1aa',
            marginBottom: 24,
          }}
        >
          Free Invoice Generator
        </div>
        <div
          style={{
            fontSize: 24,
            color: '#71717a',
            maxWidth: 800,
            textAlign: 'center',
          }}
        >
          Create professional PDF invoices in minutes. No signup required.
        </div>
      </div>
    ),
    { ...size }
  )
}
