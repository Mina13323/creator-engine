export default function FeaturesSection() {
  const features = [
    {
      title: "Authentication",
      description: "Secure and seamless login for you and your team. Manage access with ease.",
    },
    {
      title: "Dashboard",
      description: "Real-time insights and controls at a glance. Make data-driven decisions.",
    },
    {
      title: "Minimalist Design",
      description: "Clean, distraction-free interface that puts your work front and center.",
    },
  ];

  return (
    <section className="py-24 px-6" id="features">
      <div className="max-w-5xl mx-auto">
        <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-black text-center">
          Everything you need
        </h2>
        <p className="mt-4 text-gray-600 text-center max-w-xl mx-auto">
          Powerful features wrapped in a clean, modern interface.
        </p>
        <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8">
          {features.map((feature) => (
            <div
              key={feature.title}
              className="bg-white border border-gray-200 rounded-lg p-8 hover:shadow-md transition-shadow"
            >
              <h3 className="text-xl font-semibold text-black">{feature.title}</h3>
              <p className="mt-4 text-gray-600 leading-relaxed">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
