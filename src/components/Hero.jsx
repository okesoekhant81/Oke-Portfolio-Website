import heroOke from '../assets/img/hero-oke.png'

export default function Hero() {
  return (
    <section className="bg-white pt-10 sm:pt-14 md:pt-16">
      <div className="px-6 pb-8 sm:px-10 sm:pb-10 md:px-16">
        <h1 className="text-3xl text-ink sm:text-5xl md:text-6xl">
          I&rsquo;m{' '}
          <span className="font-display font-bold italic text-brand">Oke</span>
        </h1>

        <p className="mt-4 max-w-2xl text-sm leading-relaxed text-muted sm:text-base">
          work at the <em className="font-display not-italic font-medium text-ink">intersection</em> of
          brand, content, digital experiences, and business growth. I help turn{' '}
          <em className="font-display not-italic font-medium text-ink">ideas</em> into{' '}
          <em className="font-display not-italic font-medium text-ink">brands</em>, brands into
          systems, and systems into businesses that can grow.
        </p>
        <p className="mt-3 max-w-2xl text-sm leading-relaxed text-muted sm:text-base">
          I turn standard businesses into powerful brands. By aligning brand strategy with advanced
          digital marketing, custom website/app development, and automated digital solutions, I build
          the system for your market expansion.
        </p>

        <div className="mt-5">
          <span className="inline-block rounded-full bg-brand px-5 py-2 text-xs font-light text-white">
            It&rsquo;s <span className="font-display font-bold italic">Heart Work!</span>
          </span>
        </div>
      </div>

      <img
        src={heroOke}
        alt="Oke Soe Khant"
        className="h-72 w-full object-cover object-top sm:mx-auto sm:aspect-[3/4] sm:h-auto sm:max-w-sm md:max-w-md"
      />
    </section>
  )
}
