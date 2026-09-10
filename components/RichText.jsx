import { PortableText } from '@portabletext/react'

const portableTextComponents = {
  marks: {
    em: ({ children }) => <em className="font-display not-italic">{children}</em>,
    strong: ({ children }) => <strong className="font-display font-bold italic">{children}</strong>,
  },
  block: {
    normal: ({ children }) => <p className="mt-4">{children}</p>,
  },
}

export default function RichText({ value, className }) {
  if (!value) return null
  return (
    <div className={className}>
      <PortableText value={value} components={portableTextComponents} />
    </div>
  )
}
