import Reveal from './Reveal'
import RichText from './RichText'

export default function Contact({ line1, line2, body, cta, email, copyright, tagline }) {
  return (
    <footer className="bg-white px-6 py-14 text-ink sm:px-12 sm:py-16 md:px-16">
      <Reveal className="mx-auto max-w-3xl">
        <h2 className="text-3xl leading-tight sm:text-4xl md:text-5xl">
          <span className="block">{line1}</span>
          <span className="block font-display font-bold italic">{line2}</span>
        </h2>

        <RichText value={body} className="text-sm leading-relaxed text-muted sm:text-base" />

        <p className="mt-6 text-sm sm:text-base">{cta}</p>
        <a
          href={`mailto:${email}`}
          className="mt-1 inline-block text-sm text-brand underline decoration-brand/40 underline-offset-4 transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] hover:text-ink hover:decoration-ink/50 hover:underline-offset-[6px] sm:text-base"
        >
          {email}
        </a>

        <p className="mt-8 text-xs text-muted">{copyright}</p>
        <p className="mt-1 font-display text-xs font-bold italic text-muted">{tagline}</p>
      </Reveal>
    </footer>
  )
}
