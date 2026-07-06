import Button from './Button'
import { ArrowRight, Shield, BarChart3 } from 'lucide-react'

export default function Hero() {
  return (
    <section id="home" className="bg-background py-64dp md:py-96dp">
      <div className="max-w-content mx-auto px-16dp md:px-24dp grid md:grid-cols-2 gap-48dp items-center">
        <div className="space-y-24dp">
          <span className="inline-block text-label-large font-medium text-on-surface-variant uppercase tracking-wider">
            Next-Gen Business Platform
          </span>
          <h1 className="text-display-small md:text-display-medium text-on-background">
            Clarity and precision for modern teams
          </h1>
          <p className="text-body-large text-on-surface-variant max-w-lg">
            A minimalist, tech-focused platform designed to streamline authentication,
            centralize dashboards, and empower your organization with professional tools.
          </p>
          <div className="flex flex-col sm:flex-row gap-16dp">
            <Button size="large">
              Start Free Trial
              <ArrowRight size={18} className="ml-8dp" />
            </Button>
            <Button variant="outlined" size="large">
              View Dashboard
            </Button>
          </div>
        </div>

        <div className="bg-surface-variant rounded-2xl p-32dp md:p-48dp border border-surface-variant">
          <div className="grid grid-cols-2 gap-16dp">
            <div className="bg-surface p-24dp rounded-xl shadow-sm">
              <Shield className="mb-16dp text-on-surface" size={32} />
              <p className="text-title-medium text-on-surface">Secure Auth</p>
              <p className="text-body-medium text-on-surface-variant mt-8dp">
                Enterprise-grade identity verification.
              </p>
            </div>
            <div className="bg-surface p-24dp rounded-xl shadow-sm">
              <BarChart3 className="mb-16dp text-on-surface" size={32} />
              <p className="text-title-medium text-on-surface">Live Dashboard</p>
              <p className="text-body-medium text-on-surface-variant mt-8dp">
                Real-time insights at a glance.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}