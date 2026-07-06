import { CheckCircle } from 'lucide-react'

const values = [
  'Minimalist design philosophy',
  'Security-first engineering',
  'Transparent, scalable pricing',
  'Dedicated customer success',
]

export default function About() {
  return (
    <section id="about" className="bg-background py-64dp md:py-96dp">
      <div className="max-w-content mx-auto px-16dp md:px-24dp grid md:grid-cols-2 gap-48dp items-center">
        <div className="order-2 md:order-1 bg-surface-variant rounded-2xl p-32dp md:p-48dp">
          <div className="space-y-16dp">
            {values.map((value, index) => (
              <div key={index} className="flex items-start gap-16dp">
                <CheckCircle className="text-on-surface flex-shrink-0 mt-2" size={22} />
                <p className="text-body-large text-on-surface-variant">{value}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="order-1 md:order-2 space-y-24dp">
          <h2 className="text-headline-medium text-on-background">
            About TechVenture
          </h2>
          <p className="text-body-large text-on-surface-variant">
            We believe great software should be invisible—working so smoothly that your team
            can focus on what matters most. Our platform combines enterprise-grade security
            with a clean, professional interface.
          </p>
          <p className="text-body-large text-on-surface-variant">
            From authentication to analytics, every feature is crafted to deliver clarity,
            speed, and confidence for modern businesses.
          </p>
        </div>
      </div>
    </section>
  )
}