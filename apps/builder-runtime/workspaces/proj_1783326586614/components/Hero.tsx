export default function Hero() {
  return (
    <section className="section-padding pt-32 md:pt-40">
      <div className="container-page">
        <div className="max-w-3xl mx-auto text-center">
          <h1 className="text-display-small md:text-display-medium font-semibold tracking-tight mb-6">
            Build Something
            <span className="block text-primary">Extraordinary Today</span>
          </h1>
          <p className="text-body-large md:text-title-large text-on-surface-variant mb-10 max-w-2xl mx-auto">
            Empower your business with cutting-edge solutions. Streamline workflows,
            boost productivity, and achieve more with our platform.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a href="/signup" className="btn-filled text-center text-title-medium">
              Start Free Trial
            </a>
            <a href="/about" className="btn-outlined text-center text-title-medium">
              Learn More
            </a>
          </div>
        </div>

        {/* Feature highlight badge */}
        <div className="mt-16 flex justify-center">
          <div className="inline-flex items-center gap-2 bg-surface-variant rounded-full px-4 py-2 text-body-medium text-on-surface-variant">
            <svg className="w-4 h-4 text-primary" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            Trusted by 10,000+ businesses worldwide
          </div>
        </div>
      </div>
    </section>
  )
}
