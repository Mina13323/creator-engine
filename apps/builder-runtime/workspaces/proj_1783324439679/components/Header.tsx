'use client'

import { useState } from 'react'
import { Menu, X } from 'lucide-react'
import Button from './Button'

const navLinks = [
  { label: 'Home', href: '#home' },
  { label: 'About', href: '#about' },
  { label: 'Features', href: '#features' },
  { label: 'Dashboard', href: '#dashboard' },
]

export default function Header() {
  const [mobileOpen, setMobileOpen] = useState(false)

  return (
    <header className="sticky top-0 z-50 bg-surface border-b border-surface-variant">
      <div className="max-w-content mx-auto px-16dp md:px-24dp h-16 flex items-center justify-between">
        <a href="#home" className="text-title-large font-medium text-on-surface">
          TechVenture
        </a>

        <nav className="hidden md:flex items-center gap-32dp">
          {navLinks.map((link) => (
            <a
              key={link.label}
              href={link.href}
              className="text-body-medium text-on-surface-variant hover:text-on-surface transition-colors"
            >
              {link.label}
            </a>
          ))}
        </nav>

        <div className="hidden md:flex items-center gap-16dp">
          <Button variant="text">Sign In</Button>
          <Button>Get Started</Button>
        </div>

        <button
          className="md:hidden p-8dp text-on-surface"
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label="Toggle menu"
        >
          {mobileOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {mobileOpen && (
        <div className="md:hidden bg-surface border-t border-surface-variant">
          <nav className="flex flex-col px-16dp py-16dp gap-16dp">
            {navLinks.map((link) => (
              <a
                key={link.label}
                href={link.href}
                className="text-body-large text-on-surface-variant hover:text-on-surface"
                onClick={() => setMobileOpen(false)}
              >
                {link.label}
              </a>
            ))}
            <div className="flex flex-col gap-8dp pt-8dp">
              <Button variant="text" fullWidth>
                Sign In
              </Button>
              <Button fullWidth>Get Started</Button>
            </div>
          </nav>
        </div>
      )}
    </header>
  )
}