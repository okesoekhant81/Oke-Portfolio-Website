// Renders the site's tiny markdown-lite body text: **bold** becomes bold
// italic serif, *emphasis* becomes non-italic serif, blank lines split
// paragraphs. Kept dependency-free since this is the only formatting the
// admin panel needs to produce.

function renderInline(text) {
  const nodes = []
  const pattern = /\*\*(.+?)\*\*|\*(.+?)\*/g
  let lastIndex = 0
  let match
  let key = 0

  while ((match = pattern.exec(text))) {
    if (match.index > lastIndex) nodes.push(text.slice(lastIndex, match.index))
    if (match[1] !== undefined) {
      nodes.push(
        <strong key={key++} className="font-display font-bold italic">
          {match[1]}
        </strong>
      )
    } else {
      nodes.push(
        <em key={key++} className="font-display not-italic">
          {match[2]}
        </em>
      )
    }
    lastIndex = pattern.lastIndex
  }
  if (lastIndex < text.length) nodes.push(text.slice(lastIndex))
  return nodes
}

export default function RichText({ value, className }) {
  if (!value) return null
  const paragraphs = value.split(/\n\s*\n/).filter((p) => p.trim())

  return (
    <div className={className}>
      {paragraphs.map((p, i) => (
        <p key={i} className="mt-4">
          {renderInline(p)}
        </p>
      ))}
    </div>
  )
}
