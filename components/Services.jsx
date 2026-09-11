import Reveal from './Reveal'

export default function Services({ services }) {
  return (
    <section id="services" className="bg-white">
      <div className="grid grid-cols-2">
        {services.map((service, i) => (
          <Reveal key={service.title} delay={i * 0.08} className="group relative min-h-72 overflow-hidden sm:min-h-80">
            <img
              src={service.image}
              alt={service.title}
              className="absolute inset-0 size-full object-cover transition-transform duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-110"
            />
            <div className="absolute inset-0 bg-black/0 transition-colors duration-500 ease-out group-hover:bg-black/25" />
            <div className="relative flex h-full flex-col justify-end p-5 text-white">
              <h3 className="font-display text-base font-bold leading-snug transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:-translate-y-1 sm:text-lg">
                {service.title}
              </h3>
              <p className="mt-2 text-xs font-light leading-relaxed opacity-90 transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:-translate-y-1 group-hover:opacity-100">
                {service.copy}
              </p>
            </div>
          </Reveal>
        ))}
      </div>
    </section>
  )
}
