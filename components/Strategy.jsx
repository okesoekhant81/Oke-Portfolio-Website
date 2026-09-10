import Reveal from './Reveal'

export default function Strategy() {
  return (
    <section className="bg-brand px-6 py-12 text-white sm:px-12 sm:py-16 md:px-16">
      <Reveal className="mx-auto max-w-3xl">
        <h2 className="text-4xl leading-tight sm:text-5xl md:text-6xl">
          <span className="block">Strategy</span>
          <span className="block font-display font-bold italic">Before Tactics.</span>
        </h2>
        <p className="mt-6 text-sm font-light leading-relaxed sm:text-base">
          A new campaign, content format, platform, or tool is rarely the first answer.
        </p>
        <p className="mt-4 font-display text-sm font-bold italic leading-relaxed sm:text-base">
          &ldquo;Understanding the problem is.&rdquo;
        </p>
      </Reveal>
    </section>
  )
}
