import Link from "next/link";

export default function CTASection() {
  return (
    <section className="py-24 px-6 bg-black text-white">
      <div className="max-w-3xl mx-auto text-center">
        <h2 className="text-3xl sm:text-4xl font-bold tracking-tight">
          Ready to elevate your brand?
        </h2>
        <p className="mt-4 text-gray-300 max-w-xl mx-auto">
          Join hundreds of local businesses already using Local Brand.
        </p>
        <div className="mt-10">
          <Link
            href="/signup"
            className="inline-block bg-white text-black px-10 py-4 rounded-md text-sm font-medium hover:bg-gray-100 transition-colors"
          >
            Start Free Trial
          </Link>
        </div>
      </div>
    </section>
  );
}
