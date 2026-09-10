import Reveal from './Reveal'

export default function Strategy({ line1, line2, paragraph, quote }) {
  return (
    <section className="bg-brand px-6 py-12 text-white sm:px-12 sm:py-16 md:px-16">
      <Reveal className="mx-auto max-w-3xl">
        <h2 className="text-4xl leading-tight sm:text-5xl md:text-6xl">
          <span className="block">{line1}</span>
          <span className="block font-display font-bold italic">{line2}</span>
        </h2>
        <p className="mt-6 text-sm font-light leading-relaxed sm:text-base">{paragraph}</p>
        <p className="mt-4 font-display text-sm font-bold italic leading-relaxed sm:text-base">
          &ldquo;{quote}&rdquo;
        </p>
      </Reveal>
    </section>
  )
}
