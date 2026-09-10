import Hero from '../components/Hero'
import NotJustMarketing from '../components/NotJustMarketing'
import Services from '../components/Services'
import Strategy from '../components/Strategy'
import ThingsImBuilding from '../components/ThingsImBuilding'
import Workshop from '../components/Workshop'
import AboutMe from '../components/AboutMe'
import Contact from '../components/Contact'
import { getHomepage } from '../lib/getHomepage'

export default async function Home() {
  const content = await getHomepage()

  return (
    <main>
      <Hero
        name={content.heroName}
        body={content.heroBody}
        badgePrefix={content.heroBadgePrefix}
        badgeEmphasis={content.heroBadgeEmphasis}
        image={content.heroImage}
      />
      <NotJustMarketing line1={content.marketingLine1} line2={content.marketingLine2} body={content.marketingBody} />
      <Services services={content.services} />
      <Strategy
        line1={content.strategyLine1}
        line2={content.strategyLine2}
        paragraph={content.strategyParagraph}
        quote={content.strategyQuote}
      />
      <ThingsImBuilding
        line1={content.buildingLine1}
        line2={content.buildingLine2}
        intro={content.buildingIntro}
        emphasis={content.buildingEmphasis}
        projects={content.projects}
      />
      <Workshop
        image={content.workshopImage}
        line1={content.workshopLine1}
        line2={content.workshopLine2}
        body={content.workshopBody}
        role={content.workshopRole}
      />
      <AboutMe line1={content.aboutLine1} line2={content.aboutLine2} body={content.aboutBody} />
      <Contact
        line1={content.contactLine1}
        line2={content.contactLine2}
        body={content.contactBody}
        cta={content.contactCta}
        email={content.contactEmail}
        copyright={content.contactCopyright}
        tagline={content.contactTagline}
      />
    </main>
  )
}
