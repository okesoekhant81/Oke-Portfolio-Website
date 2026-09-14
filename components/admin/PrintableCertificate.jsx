function formatDate(dateStr) {
  const d = new Date(`${dateStr}T00:00:00`)
  if (Number.isNaN(d.getTime())) return dateStr
  return d.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
}

// Landscape-ish card, centered on the printed page — the border and inset
// padding read as a certificate frame without needing an actual image
// asset. Visible on screen too (unlike PrintableRoster, which is print-only)
// since an admin generating one wants to preview it before printing.
export default function PrintableCertificate({ studentName, courseName, classDate, issuerName }) {
  return (
    <div className="mx-auto max-w-2xl border-8 border-double border-brand/30 bg-white p-10 text-center print:border-black/60">
      <p className="text-xs tracking-[0.3em] text-neutral-400 uppercase">Certificate of Completion</p>
      <p className="mt-6 text-sm text-neutral-500">This certifies that</p>
      <p className="mt-3 font-display text-3xl font-bold italic text-brand">{studentName}</p>
      <p className="mt-4 text-sm text-neutral-500">has successfully completed</p>
      <p className="mt-2 font-display text-xl font-bold text-ink">{courseName}</p>
      {classDate && <p className="mt-1 text-sm text-neutral-500">{formatDate(classDate)}</p>}
      <div className="mx-auto mt-12 flex max-w-sm items-center justify-between">
        <div className="w-40 border-t border-neutral-300 pt-2 text-xs text-neutral-500">{issuerName}</div>
        <div className="w-40 border-t border-neutral-300 pt-2 text-xs text-neutral-500">Date</div>
      </div>
    </div>
  )
}
