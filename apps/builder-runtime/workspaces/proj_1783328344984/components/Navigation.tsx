import Link from "next/link";

export default function Navigation() {
  return (
    <nav className="fixed top-0 left-0 w-full z-50 bg-white/80 backdrop-blur-md border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
        <Link href="/" className="text-xl font-semibold tracking-tight text-black">
          Local Brand
        </Link>
        <div className="flex gap-8">
          <Link href="/" className="text-sm text-gray-700 hover:text-black transition-colors">
            Home
          </Link>
          <Link href="/about" className="text-sm text-gray-700 hover:text-black transition-colors">
            About
          </Link>
          <Link href="/login" className="text-sm text-gray-700 hover:text-black transition-colors">
            Sign In
          </Link>
        </div>
      </div>
    </nav>
  );
}
