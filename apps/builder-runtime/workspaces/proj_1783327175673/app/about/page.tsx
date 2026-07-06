import React from 'react';

export default function AboutPage() {
  return (
    <div className="grid-container">
      <section className="col-span-full py-12">
        <h1 className="text-display-medium text-on-background mb-6">
          About Us
        </h1>
        <p className="text-body-large text-gray-300 max-w-3xl mb-6">
          MyBusiness is a technology-forward company dedicated to providing minimalist and efficient solutions for modern enterprises. Our team is passionate about clean design, robust performance, and user-centric innovation.
        </p>
        <p className="text-body-large text-gray-300 max-w-3xl mb-6">
          Founded in 2024, we have grown to serve thousands of customers worldwide. Our mission is to simplify complex technology and make it accessible to everyone.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
          <div className="bg-surface text-on-surface p-6 rounded-lg border border-outline">
            <h2 className="text-headline-small mb-2">Our Vision</h2>
            <p className="text-body-medium">
              To be the leading provider of minimalist, high-performance business solutions.
            </p>
          </div>
          <div className="bg-surface text-on-surface p-6 rounded-lg border border-outline">
            <h2 className="text-headline-small mb-2">Our Values</h2>
            <p className="text-body-medium">
              Innovation, integrity, and customer satisfaction are at the core of everything we do.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
