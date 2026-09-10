const EMAIL = 'okesoekhant81@gmail.com'

export default function Contact() {
  return (
    <footer className="bg-white px-6 py-14 text-ink sm:px-12 sm:py-16 md:px-16">
      <div className="mx-auto max-w-3xl">
        <h2 className="text-3xl leading-tight sm:text-4xl md:text-5xl">
          <span className="block">Let&rsquo;s Build</span>
          <span className="block font-display font-bold italic">Something Useful</span>
        </h2>

        <p className="mt-6 text-sm leading-relaxed text-muted sm:text-base">
          <span className="font-display font-bold italic text-ink">
            Have a business problem, project, collaboration, or idea worth exploring?
          </span>{' '}
          I&rsquo;d like to hear about it.
        </p>

        <p className="mt-6 text-sm sm:text-base">Let&rsquo;s Start a Conversation</p>
        <a
          href={`mailto:${EMAIL}`}
          className="mt-1 inline-block text-sm text-brand underline decoration-brand/40 underline-offset-4 sm:text-base"
        >
          {EMAIL}
        </a>

        <p className="mt-8 text-xs text-muted">&copy; Oke Soe Khant</p>
        <p className="mt-1 font-display text-xs font-bold italic text-muted">
          Strategy / Brands / Marketing / Building
        </p>
      </div>
    </footer>
  )
}
