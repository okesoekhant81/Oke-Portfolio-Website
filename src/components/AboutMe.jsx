export default function AboutMe() {
  return (
    <section className="bg-brand px-6 py-12 text-white sm:px-12 sm:py-16 md:px-16">
      <div className="mx-auto max-w-3xl">
        <h2 className="text-4xl leading-tight sm:text-5xl md:text-6xl">
          <span className="block">About me</span>
          <span className="block font-display font-bold italic">You Need To Know</span>
        </h2>

        <div className="mt-6 space-y-4 text-sm font-light leading-relaxed sm:text-base">
          <p>
            I like figuring out why things work. My work started around marketing and digital
            execution, but over time I became more interested in the questions behind the execution.
          </p>
          <p className="font-display italic">Why do people choose one brand over another?</p>
          <p className="font-display italic">Why does one message spread while another gets ignored?</p>
          <p>
            Those questions pulled me deeper into strategy, branding, content, digital products, and
            business growth. Today, I work at the intersection of brand, content, digital experiences,
            and business growth.
          </p>
          <p>
            The goal is to{' '}
            <span className="font-display font-bold italic">
              &ldquo;Understand the problem. Build the right system. Make it work&rdquo;
            </span>
          </p>
        </div>
      </div>
    </section>
  )
}
