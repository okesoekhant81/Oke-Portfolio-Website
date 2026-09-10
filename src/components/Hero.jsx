import heroOke from '../assets/img/hero-oke.png'

export default function Hero() {
  return (
    <section className="bg-white pt-10 sm:pt-14 md:pt-16">
      <div className="mx-auto flex max-w-5xl flex-col sm:flex-row sm:items-center sm:gap-10 sm:px-10 md:gap-16 md:px-16">
        <div className="px-6 pb-8 sm:flex-1 sm:px-0 sm:pb-14">
          <h1 className="text-3xl text-ink sm:text-5xl md:text-6xl">
            I&rsquo;m{' '}
            <span className="font-display font-bold italic text-brand">Oke</span>
          </h1>

          <p className="mt-4 text-sm leading-relaxed text-muted sm:text-base">
            work at the <em className="font-display not-italic font-medium text-ink">intersection</em> of
            brand, content, digital experiences, and business growth. I help turn{' '}
            <em className="font-display not-italic font-medium text-ink">ideas</em> into{' '}
            <em className="font-display not-italic font-medium text-ink">brands</em>, brands into
            systems, and systems into businesses that can grow.
          </p>
          <p className="mt-3 text-sm leading-relaxed text-muted sm:text-base">
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
          className="h-[30rem] w-full object-cover object-top sm:h-auto sm:w-56 sm:shrink-0 sm:aspect-[3/4] md:w-64 lg:w-72"
        />
      </div>
    </section>
  )
}
