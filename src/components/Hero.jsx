import heroOke from '../assets/img/hero-oke.jpg'

export default function Hero() {
  return (
    <section className="relative overflow-hidden bg-white px-8 pb-10 pt-14 sm:px-12 sm:pt-20 md:px-16">
      <div className="mx-auto flex max-w-5xl flex-col-reverse items-center gap-8 md:flex-row md:items-center md:gap-16">
        <div className="w-full md:flex-1">
          <h1 className="text-center text-4xl text-ink sm:text-5xl md:text-left md:text-6xl">
            I&rsquo;m{' '}
            <span className="font-display font-bold italic text-brand">Oke</span>
          </h1>

          <p className="mt-6 text-center text-sm leading-relaxed text-muted sm:text-base md:text-left">
            work at the <em className="font-display not-italic font-medium text-ink">intersection</em> of
            brand, content, digital experiences, and business growth. I help turn{' '}
            <em className="font-display not-italic font-medium text-ink">ideas</em> into{' '}
            <em className="font-display not-italic font-medium text-ink">brands</em>, brands into
            systems, and systems into businesses that can grow.
          </p>
          <p className="mt-4 text-center text-sm leading-relaxed text-muted sm:text-base md:text-left">
            I turn standard businesses into powerful brands. By aligning brand strategy with advanced
            digital marketing, custom website/app development, and automated digital solutions, I build
            the system for your market expansion.
          </p>

          <div className="mt-6 flex justify-center md:justify-start">
            <span className="rounded-full bg-brand px-5 py-2 text-xs font-light text-white">
              It&rsquo;s <span className="font-display font-bold italic">Heart Work!</span>
            </span>
          </div>
        </div>

        <div className="w-48 shrink-0 sm:w-56 md:w-72">
          <img
            src={heroOke}
            alt="Oke Soe Khant"
            className="aspect-[194/327] w-full rounded-3xl object-cover"
          />
        </div>
      </div>
    </section>
  )
}
