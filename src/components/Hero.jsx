import heroOke from '../assets/img/hero-oke.png'

export default function Hero() {
  return (
    <section className="relative min-h-[520px] overflow-hidden bg-white pt-8 sm:min-h-[620px] sm:pt-12 md:min-h-[680px] md:pt-16">
      <div className="absolute inset-y-0 right-0 w-[48%] pt-6 sm:w-[46%] sm:pt-10 md:w-[42%] md:pt-14">
        <img
          src={heroOke}
          alt="Oke Soe Khant"
          className="h-full w-full object-cover object-top"
        />
      </div>

      <div className="relative z-10 max-w-[50%] px-6 pb-10 sm:max-w-[48%] sm:px-10 sm:pb-14 md:max-w-[44%] md:px-16">
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
    </section>
  )
}
