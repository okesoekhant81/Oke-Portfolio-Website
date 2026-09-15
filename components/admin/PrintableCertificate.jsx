function formatDate(dateStr) {
  const d = new Date(`${dateStr}T00:00:00`)
  if (Number.isNaN(d.getTime())) return dateStr
  return d.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
}

// Landscape-ish card, centered on the printed page — the border and inset
// padding read as a certificate frame without needing an actual image
// asset. Visible on screen too (unlike PrintableRoster, which is print-only)
// since an admin generating one wants to preview it before printing.
export default function PrintableCertificate({
  studentName,
  courseName,
  classDate,
  issuerName,
  logoUrl,
  signatureUrl,
  verifyUrl,
  qrCodeUrl,
}) {
  return (
    <div className="mx-auto max-w-2xl border-8 border-double border-brand/30 bg-white p-10 text-center print:border-black/60">
      {logoUrl && (
        // A plain <img>, not next/image — this only ever renders on-screen in
        // the admin panel or on a printed page, neither of which benefits
        // from next/image's lazy-loading/responsive-srcset machinery, and
        // print stylesheets generally want the real image tag anyway.
        <img src={logoUrl} alt="" className="mx-auto mb-4 h-16 w-auto object-contain" />
      )}
      <p className="text-xs tracking-[0.3em] text-neutral-400 uppercase">Certificate of Completion</p>
      <p className="mt-6 text-sm text-neutral-500">This certifies that</p>
      <p className="mt-3 font-display text-3xl font-bold italic text-brand">{studentName}</p>
      <p className="mt-4 text-sm text-neutral-500">has successfully completed</p>
      <p className="mt-2 font-display text-xl font-bold text-ink">{courseName}</p>
      {classDate && <p className="mt-1 text-sm text-neutral-500">{formatDate(classDate)}</p>}
      <div className="mx-auto mt-12 flex max-w-sm justify-between">
        <div className="w-40">
          {/* Both columns reserve the same h-12 slot above their line,
              signature or not — without a matching empty slot on the date
              side, the two columns end up different heights and the date's
              line/text visibly shift down to compensate. */}
          <div className="flex h-12 items-end justify-center">
            {signatureUrl && <img src={signatureUrl} alt="" className="h-12 w-auto object-contain" />}
          </div>
          <div className="border-t border-neutral-300 pt-2 text-xs text-neutral-500">{issuerName}</div>
        </div>
        <div className="w-40">
          {/* Same reserved slot as the signature column — a scannable QR
              straight to /verify/[id] when there's one to show, matching
              the signature image's height so the two lines stay level. */}
          <div className="flex h-12 items-end justify-center">
            {qrCodeUrl && <img src={qrCodeUrl} alt="Scan to verify this certificate" className="h-12 w-12" />}
          </div>
          <div className="border-t border-neutral-300 pt-2 text-xs text-neutral-500">
            {/* The class's own completion date, not a blank line for
                someone to hand-write — this already is the date being
                certified. */}
            {classDate ? formatDate(classDate) : 'Date'}
          </div>
        </div>
      </div>
      {verifyUrl && (
        // The only way anyone holding a printed/screenshotted certificate
        // would ever find /verify/[id] — without this line on the
        // certificate itself, that page has no real path to being used.
        <p className="mt-8 text-[10px] text-neutral-400">
          Verify this certificate at {verifyUrl.replace(/^https?:\/\//, '')}
        </p>
      )}
    </div>
  )
}
