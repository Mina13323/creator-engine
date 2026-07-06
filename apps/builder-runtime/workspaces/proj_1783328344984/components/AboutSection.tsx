export default function AboutSection() {
  return (
    <section className="py-24 px-6 bg-gray-50" id="about">
      <div className="max-w-4xl mx-auto">
        <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-black">
          About Local Brand
        </h2>
        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-12">
          <div>
            <p className="text-gray-700 leading-relaxed">
              We are a team of designers, engineers, and entrepreneurs dedicated to helping local businesses thrive in the digital age. Our platform combines powerful tools with a clean, intuitive interface.
            </p>
            <p className="mt-4 text-gray-700 leading-relaxed">
              Founded in 2024, we believe that every business deserves access to modern technology without complexity.
            </p>
          </div>
          <div className="bg-white p-8 rounded-lg shadow-sm border border-gray-100">
            <h3 className="text-xl font-semibold text-black">Our Mission</h3>
            <p className="mt-4 text-gray-600 leading-relaxed">
              To empower local businesses with minimalist, powerful tools that make brand building accessible to everyone.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
