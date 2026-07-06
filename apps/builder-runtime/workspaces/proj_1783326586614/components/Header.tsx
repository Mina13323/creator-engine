'use client'

import { useState } from 'react'
import Link from 'next/link'

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  return (
    <header className="fixed top-0 left-0 right-0 bg-surface/90 backdrop-blur-sm border-b border-outline/10 z-50">
      <div className="container-page flex items-center justify-between h-16">
        {/* Logo */}
        <Link href="/" className="text-title-large font-semibold tracking-tight">
          YourBrand
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-8">
          <Link href="/" className="text-body-large text-on-surface-variant hover:text-on-surface transition-colors">
            Home
          </Link>
          <Link href="/about" className="text-body-large text-on-surface-variant hover:text-on-surface transition-colors">
            About
          </Link>
          <Link href="/login" className="btn-text">
            Sign In
          </Link>
          <Link href="/signup" className="btn-filled">
            Get Started
          </Link>
        </nav>

        {/* Mobile Menu Button */}
        <button
          className="md:hidden p-2 rounded-lg hover:bg-surface-variant transition-colors"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          aria-label="Toggle menu"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            {isMenuOpen ? (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            )}
          </svg>
        </button>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="md:hidden border-t border-outline/10 bg-surface">
          <nav className="container-page py-4 flex flex-col gap-4">
            <Link
              href="/"
              className="text-body-large px-4 py-2 rounded-lg hover:bg-surface-variant transition-colors"
              onClick={() => setIsMenuOpen(false)}
            >
              Home
            </Link>
            <Link
              href="/about"
              className="text-body-large px-4 py-2 rounded-lg hover:bg-surface-variant transition-colors"
              onClick={() => setIsMenuOpen(false)}
            >
              About
            </Link>
            <div className="flex flex-col gap-2 pt-2">
              <Link
                href="/login"
                className="btn-text text-center"
                onClick={() => setIsMenuOpen(false)}
              >
                Sign In
              </Link>
              <Link
                href="/signup"
                className="btn-filled text-center"
                onClick={() => setIsMenuOpen(false)}
              >
                Get Started
              </Link>
            </div>
          </nav>
        </div>
      )}
    </header>
  )
}
