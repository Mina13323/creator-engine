import Link from 'next/link';
import Button from '@/components/ui/button';

export default function Header() {
  return (
    <header className="sticky top-0 z-50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b border-outline/20">
      <div className="container-custom flex items-center justify-between h-16">
        <Link href="/" className="text-title-large font-semibold text-on-surface">
          Logo
        </Link>
        <nav className="hidden md:flex items-center gap-6">
          <Link href="/" className="text-body-large text-on-surface hover:text-primary transition-colors">
            Home
          </Link>
          <Link href="/about" className="text-body-large text-on-surface hover:text-primary transition-colors">
            About
          </Link>
          <Button variant="filled">Get Started</Button>
        </nav>
        <button className="md:hidden p-2 text-on-surface" aria-label="Open menu">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
      </div>
    </header>
  );
}
