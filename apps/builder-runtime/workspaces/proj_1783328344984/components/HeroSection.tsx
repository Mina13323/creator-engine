import Link from "next/link";

export default function HeroSection() {
  return (
    <section className="min-h-screen flex items-center justify-center px-6 pt-24 pb-16">
      <div className="max-w-4xl mx-auto text-center">
        <h1 className="text-5xl sm:text-7xl font-bold tracking-tight text-black leading-tight">
          Build your brand.
          <br />
          Own your future.
        </h1>
        <p className="mt-6 text-lg text-gray-600 max-w-2xl mx-auto leading-relaxed">
          Local Brand gives you the tools to create, manage, and grow your business with modern technology and minimalist design.
        </p>
        <div className="mt-10 flex flex-wrap justify-center gap-4">
          <Link
            href="/signup"
            className="inline-block bg-black text-white px-8 py-3 rounded-md text-sm font-medium hover:bg-gray-800 transition-colors"
          >
            Get Started
          </Link>
          <Link
            href="/about"
            className="inline-block border border-black text-black px-8 py-3 rounded-md text-sm font-medium hover:bg-gray-100 transition-colors"
          >
            Learn More
          </Link>
        </div>
      </div>
    </section>
  );
}
