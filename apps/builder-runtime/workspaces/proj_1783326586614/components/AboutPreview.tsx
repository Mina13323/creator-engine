export default function AboutPreview() {
  return (
    <section className="section-padding">
      <div className="container-page">
        <div className="flex flex-col lg:flex-row items-center gap-12">
          {/* Image placeholder */}
          <div className="w-full lg:w-1/2">
            <div className="aspect-[4/3] bg-surface-variant rounded-2xl flex items-center justify-center">
              <svg className="w-24 h-24 text-on-surface-variant/30" fill="currentColor" viewBox="0 0 24 24">
                <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-7 3c1.93 0 3.5 1.57 3.5 3.5S13.93 13 12 13s-3.5-1.57-3.5-3.5S10.07 6 12 6zm7 13H5v-.23c0-.62.28-1.2.76-1.58C7.47 15.82 9.64 15 12 15s4.53.82 6.24 2.19c.48.38.76.97.76 1.58V19z" />
              </svg>
            </div>
          </div>

          {/* Content */}
          <div className="w-full lg:w-1/2">
            <h2 className="text-headline-medium md:text-headline-large font-semibold mb-6">
              Our Mission
            </h2>
            <p className="text-body-large text-on-surface-variant mb-6">
              We are dedicated to providing innovative solutions that empower businesses
              to achieve their full potential. Our team of experts works tirelessly to
              deliver products that make a real difference.
            </p>
            <ul className="space-y-4 mb-8">
              {[
                'Industry-leading security and compliance',
                '24/7 customer support and dedicated account managers',
                'Continuous updates and new feature releases',
              ].map((item, index) => (
                <li key={index} className="flex items-start gap-3">
                  <svg className="w-6 h-6 text-primary flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="text-body-large">{item}</span>
                </li>
              ))}
            </ul>
            <a href="/about" className="btn-filled inline-block text-title-medium">
              Learn More About Us
            </a>
          </div>
        </div>
      </div>
    </section>
  )
}
