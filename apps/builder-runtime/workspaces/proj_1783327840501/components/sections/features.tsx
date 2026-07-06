const features = [
  {
    title: 'Authentication',
    description: 'Secure and seamless authentication for your users. Supports multiple providers out of the box.',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
      </svg>
    ),
  },
  {
    title: 'Dashboard',
    description: 'A powerful dashboard to manage your data and insights. Customizable and intuitive.',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 6a2 2 0 012-2h12a2 2 0 012 2v12a2 2 0 01-2 2H6a2 2 0 01-2-2V6z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 10v4m-4-4v4m-4-4v4" />
      </svg>
    ),
  },
];

export default function Features() {
  return (
    <section className="container-custom py-16 md:py-24">
      <div className="text-center mb-12">
        <h2 className="text-headline-small md:text-headline-medium text-on-surface mb-4">
          Everything you need
        </h2>
        <p className="text-body-large text-on-surface-variant max-w-lg mx-auto">
          Focus on building your product while we handle the rest.
        </p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {features.map((feature) => (
          <div
            key={feature.title}
            className="bg-surface border border-outline/20 rounded-xl p-6 hover:shadow-md transition-shadow"
          >
            <div className="text-primary mb-4">{feature.icon}</div>
            <h3 className="text-title-large text-on-surface mb-2">{feature.title}</h3>
            <p className="text-body-medium text-on-surface-variant">{feature.description}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
