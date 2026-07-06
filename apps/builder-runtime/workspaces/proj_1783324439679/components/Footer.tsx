const footerLinks = [
  { label: 'Home', href: '#home' },
  { label: 'About', href: '#about' },
  { label: 'Features', href: '#features' },
  { label: 'Dashboard', href: '#dashboard' },
  { label: 'Privacy', href: '#' },
  { label: 'Terms', href: '#' },
]

export default function Footer() {
  return (
    <footer className="bg-surface border-t border-surface-variant py-32dp md:py-48dp">
      <div className="max-w-content mx-auto px-16dp md:px-24dp flex flex-col md:flex-row justify-between items-center gap-24dp">
        <a href="#home" className="text-title-large font-medium text-on-surface">
          TechVenture
        </a>

        <nav className="flex flex-wrap justify-center gap-24dp">
          {footerLinks.map((link) => (
            <a
              key={link.label}
              href={link.href}
              className="text-body-medium text-on-surface-variant hover:text-on-surface transition-colors"
            >
              {link.label}
            </a>
          ))}
        </nav>

        <p className="text-body-small text-on-surface-variant">
          © {new Date().getFullYear()} TechVenture. All rights reserved.
        </p>
      </div>
    </footer>
  )
}