import { Lock, LayoutDashboard, Users, Zap, Globe, Bell } from 'lucide-react'

const features = [
  {
    icon: Lock,
    title: 'Authentication',
    description: 'Secure sign-in, role-based access, and session management built for scale.',
  },
  {
    icon: LayoutDashboard,
    title: 'Dashboard',
    description: 'A unified command center with real-time metrics and customizable widgets.',
  },
  {
    icon: Users,
    title: 'Team Management',
    description: 'Invite, organize, and manage your team with intuitive controls.',
  },
  {
    icon: Zap,
    title: 'Fast Performance',
    description: 'Optimized architecture delivering speed and reliability across devices.',
  },
  {
    icon: Globe,
    title: 'Global Reach',
    description: 'Deploy anywhere with a platform designed for international teams.',
  },
  {
    icon: Bell,
    title: 'Smart Notifications',
    description: 'Stay informed with intelligent alerts that cut through the noise.',
  },
]

export default function Features() {
  return (
    <section id="features" className="bg-surface py-64dp md:py-96dp">
      <div className="max-w-content mx-auto px-16dp md:px-24dp">
        <div className="text-center max-w-2xl mx-auto mb-48dp">
          <h2 className="text-headline-medium text-on-surface mb-16dp">
            Everything you need to move faster
          </h2>
          <p className="text-body-large text-on-surface-variant">
            Built with a focus on clarity, our core features keep your team aligned and productive.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-24dp">
          {features.map((feature) => (
            <div
              key={feature.title}
              className="bg-background p-24dp rounded-xl border border-surface-variant hover:border-on-surface-variant transition-colors"
            >
              <feature.icon className="text-on-surface mb-16dp" size={28} />
              <h3 className="text-title-medium text-on-surface mb-8dp">{feature.title}</h3>
              <p className="text-body-medium text-on-surface-variant">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}