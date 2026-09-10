import workshopImg from '../assets/img/workshop.jpg'

export default function Workshop() {
  return (
    <section className="relative overflow-hidden bg-ink">
      <img
        src={workshopImg}
        alt=""
        className="absolute inset-0 size-full object-cover"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/50 to-black/20" />
      <div className="relative mx-auto max-w-3xl px-8 py-16 text-white sm:px-12 sm:py-20 md:px-16">
        <h2 className="text-xl sm:text-2xl">
          <span className="font-display font-bold italic">Strategic workshop</span>{' '}
          for Myanmar SME OWNERS
        </h2>
        <p className="mt-5 text-sm font-light leading-relaxed sm:text-base">
          From doing marketing to thinking strategically about growth.
        </p>
        <p className="mt-4 text-sm font-light leading-relaxed sm:text-base">
          A practical workshop for Myanmar SME owners built around my{' '}
          <em className="font-display not-italic font-bold">
            LGS — Launch · Grow · Scale Framework
          </em>
          , connecting business fundamentals, customer understanding, branding, marketing, and growth
          into one structured journey.
        </p>
        <p className="mt-4 font-display text-sm font-bold italic sm:text-base">
          Framework Creator / Strategist / Workshop Instructor
        </p>
      </div>
    </section>
  )
}
