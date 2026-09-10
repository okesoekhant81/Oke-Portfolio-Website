import dubaiLogo from '../assets/img/dubai-directory-logo.png'
import thailandLogo from '../assets/img/thailand-directory-logo.png'

const projects = [
  {
    logo: dubaiLogo,
    name: 'Dubai Directory',
    location: 'Myanmar community in Dubai',
    role: 'Founder / Brand / Product / Growth',
  },
  {
    logo: thailandLogo,
    name: 'Thailand Directory',
    location: 'Myanmar community in Thailand',
    role: 'Founder / Brand / Product / Growth',
  },
]

export default function ThingsImBuilding() {
  return (
    <section className="bg-white px-6 py-12 sm:px-12 sm:py-16 md:px-16">
      <div className="mx-auto max-w-4xl">
        <h2 className="text-4xl text-ink sm:text-5xl md:text-6xl">
          Thing <span className="font-display font-bold italic text-brand">I&rsquo;m Building</span>
        </h2>
        <p className="mt-3 text-sm text-muted sm:text-base">
          I don&rsquo;t only work on brands.{' '}
          <span className="font-display font-bold italic text-ink">I like building things too.</span>
        </p>

        <div className="mt-10 grid grid-cols-2 gap-6 sm:gap-8">
          {projects.map((project) => (
            <div key={project.name}>
              <img
                src={project.logo}
                alt={`${project.name} logo`}
                className="h-24 w-auto object-contain sm:h-28"
              />
              <p className="mt-4 text-xs leading-relaxed text-ink">
                A digital discovery platform built for the{' '}
                <em className="font-display not-italic">{project.location}</em>. Bringing useful
                businesses, services, information, and local discoveries into one community-driven
                ecosystem.
              </p>
              <p className="mt-3 font-display text-xs font-bold italic text-ink">{project.role}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
