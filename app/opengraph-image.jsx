import { ImageResponse } from 'next/og'
import { SITE_NAME } from '../lib/site'

export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

export default async function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          padding: '80px',
          background: '#e83606',
          color: '#ffffff',
          fontFamily: 'sans-serif',
        }}
      >
        <div style={{ fontSize: 72, fontWeight: 700, display: 'flex' }}>{SITE_NAME}</div>
        <div style={{ fontSize: 32, fontWeight: 400, marginTop: 24, maxWidth: 900, display: 'flex' }}>
          Brand strategy, marketing, content, and digital experience.
        </div>
      </div>
    ),
    { ...size }
  )
}
