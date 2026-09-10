import Reveal from './Reveal'
import RichText from './RichText'

export default function NotJustMarketing({ line1, line2, body }) {
  return (
    <section className="bg-brand px-6 py-12 text-white sm:px-12 sm:py-16 md:px-16">
      <Reveal className="mx-auto max-w-3xl">
        <h2 className="text-4xl leading-tight sm:text-5xl md:text-6xl">
          <span className="block">{line1}</span>
          <span className="block font-display font-bold italic">{line2}</span>
        </h2>

        <RichText value={body} className="text-sm font-light leading-relaxed sm:text-base" />
      </Reveal>
    </section>
  )
}
