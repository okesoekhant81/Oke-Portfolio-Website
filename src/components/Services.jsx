import brandPositioning from '../assets/img/brand-positioning.jpg'
import growthMarketing from '../assets/img/growth-marketing.jpg'
import contentSystems from '../assets/img/content-systems.jpg'
import digitalExperiences from '../assets/img/digital-experiences.jpg'

const services = [
  {
    image: brandPositioning,
    title: 'Brand and Positioning',
    copy: 'Finding the clearest answer to why should people choose this brand? I work on positioning, messaging, audience understanding, offers, brand direction, and how the brand should show up in the market.',
  },
  {
    image: growthMarketing,
    title: 'Growth and Digital Marketing',
    copy: 'Marketing should solve a business problem not simply keep a social media page active. I build strategies around awareness, acquisition, conversion, customer journeys, and growth opportunities.',
  },
  {
    image: contentSystems,
    title: 'Content Systems',
    copy: 'I don’t think of content as individual posts. I think about the system behind them. From founder-led content to campaign calendars and repeatable content frameworks, I build content around business objectives.',
  },
  {
    image: digitalExperiences,
    title: 'Digital Experiences',
    copy: 'Sometimes the problem isn’t the campaign. It’s what happens after someone clicks. I work on websites, landing experiences, information architecture, digital journeys, and ideas that turn attention into action.',
  },
]

export default function Services() {
  return (
    <section className="bg-white">
      <div className="grid grid-cols-2">
        {services.map((service) => (
          <div key={service.title} className="relative min-h-72 overflow-hidden sm:min-h-80">
            <img
              src={service.image}
              alt=""
              className="absolute inset-0 size-full object-cover"
            />
            <div className="relative flex h-full flex-col justify-end p-5 text-white">
              <h3 className="font-display text-base font-bold leading-snug sm:text-lg">{service.title}</h3>
              <p className="mt-2 text-xs font-light leading-relaxed">{service.copy}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}
