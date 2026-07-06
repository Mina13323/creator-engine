import React from 'react';
import Button from '../components/Button';

export default function HomePage() {
  return (
    <div className="grid-container">
      {/* Hero Section */}
      <section className="col-span-full flex flex-col items-center justify-center text-center py-16">
        <h1 className="text-display-large text-on-background mb-4">
          Welcome to MyBusiness
        </h1>
        <p className="text-body-large text-gray-300 max-w-2xl mb-8">
          We provide cutting-edge solutions for modern businesses. Experience the future of technology with our minimalist, high-performance platform.
        </p>
        <div className="flex gap-4">
          <Button variant="filled" onClick={() => alert('Get Started clicked')}>
            Get Started
          </Button>
          <Button variant="outlined" onClick={() => alert('Learn More clicked')}>
            Learn More
          </Button>
        </div>
      </section>

      {/* Features Section */}
      <section className="col-span-full py-12">
        <h2 className="text-display-small text-on-background text-center mb-8">
          Features
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="bg-surface text-on-surface p-6 rounded-lg shadow-md border border-outline">
            <h3 className="text-headline-small mb-2">Authentication</h3>
            <p className="text-body-medium">
              Secure and seamless user authentication for your applications.
            </p>
          </div>
          <div className="bg-surface text-on-surface p-6 rounded-lg shadow-md border border-outline">
            <h3 className="text-headline-small mb-2">Dashboard</h3>
            <p className="text-body-medium">
              Real-time analytics and management dashboard for your business.
            </p>
          </div>
          <div className="bg-surface text-on-surface p-6 rounded-lg shadow-md border border-outline">
            <h3 className="text-headline-small mb-2">Scalability</h3>
            <p className="text-body-medium">
              Built to scale with your growing business needs.
            </p>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="col-span-full py-12 text-center">
        <h2 className="text-display-small text-on-background mb-4">
          Ready to Transform Your Business?
        </h2>
        <p className="text-body-large text-gray-300 mb-8">
          Join thousands of satisfied customers and elevate your business today.
        </p>
        <Button variant="filled" onClick={() => alert('Contact Us clicked')}>
          Contact Us
        </Button>
      </section>
    </div>
  );
}
