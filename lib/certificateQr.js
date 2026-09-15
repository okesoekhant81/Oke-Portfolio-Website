import QRCode from 'qrcode'

// Generated server-side, not fetched from a third-party QR API — a printed
// certificate shouldn't depend on some external service staying up years
// later, and a live API call would also mean that service sees who's
// looking up whose certificate on every scan.
export async function generateVerifyQrDataUrl(url) {
  try {
    return await QRCode.toDataURL(url, { margin: 1, width: 200, color: { dark: '#171717', light: '#ffffff' } })
  } catch (err) {
    console.error('generateVerifyQrDataUrl failed:', err)
    return null
  }
}
