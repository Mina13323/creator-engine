import Header from '../components/layout/header';
import Footer from '../components/layout/footer';

export default function AboutPage() {
  return (
    <>
      <Header />
      <main className="container-custom py-16 md:py-24">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-display-small md:text-display-medium text-on-surface mb-6">
            About Us
          </h1>
          <div className="space-y-6 text-body-large text-on-surface-variant">
            <p>
              We are a passionate team dedicated to building tools that empower businesses to grow. 
              Our mission is to provide simple, elegant solutions that make a real impact.
            </p>
            <p>
              Founded in 2024, we believe in the power of clean design and robust engineering. 
              Every decision we make is driven by our commitment to our users.
            </p>
            <p>
              Our platform is built with the latest technologies to ensure speed, security, and 
              reliability. We are constantly iterating to bring you the best experience possible.
            </p>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
