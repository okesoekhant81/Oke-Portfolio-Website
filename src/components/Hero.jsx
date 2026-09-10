import heroOke from '../assets/img/hero-oke.png'

export default function Hero() {
  return (
    <section className="relative overflow-hidden bg-white px-6 pb-8 pt-10 sm:px-10 sm:pt-14 md:px-16">
      <div className="mx-auto flex max-w-5xl flex-row items-start gap-4 sm:gap-10 md:items-center md:gap-16">
        <div className="flex-1">
          <h1 className="text-3xl text-ink sm:text-5xl md:text-6xl">
            I&rsquo;m{' '}
            <span className="font-display font-bold italic text-brand">Oke</span>
          </h1>

          <p className="mt-4 text-xs leading-relaxed text-muted sm:text-base">
            work at the <em className="font-display not-italic font-medium text-ink">intersection</em> of
            brand, content, digital experiences, and business growth. I help turn{' '}
            <em className="font-display not-italic font-medium text-ink">ideas</em> into{' '}
            <em className="font-display not-italic font-medium text-ink">brands</em>, brands into
            systems, and systems into businesses that can grow.
          </p>
          <p className="mt-3 text-xs leading-relaxed text-muted sm:text-base">
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

        <div className="w-2/5 shrink-0 sm:w-64 md:w-80">
          <img
            src={heroOke}
            alt="Oke Soe Khant"
            className="aspect-[194/327] w-full rounded-xl object-cover sm:rounded-2xl"
          />
        </div>
      </div>
    </section>
  )
}
