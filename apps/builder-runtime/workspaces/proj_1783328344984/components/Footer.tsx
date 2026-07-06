import Link from "next/link";

export default function Footer() {
  return (
    <footer className="py-12 px-6 border-t border-gray-200">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
        <p className="text-sm text-gray-500">
          &copy; {new Date().getFullYear()} Local Brand. All rights reserved.
        </p>
        <div className="flex gap-6">
          <Link href="/" className="text-sm text-gray-500 hover:text-black transition-colors">
            Home
          </Link>
          <Link href="/about" className="text-sm text-gray-500 hover:text-black transition-colors">
            About
          </Link>
          <Link href="/privacy" className="text-sm text-gray-500 hover:text-black transition-colors">
            Privacy
          </Link>
        </div>
      </div>
    </footer>
  );
}
