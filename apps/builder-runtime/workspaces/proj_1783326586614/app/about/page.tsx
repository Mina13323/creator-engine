import Header from '@/components/Header'
import Footer from '@/components/Footer'

export default function About() {
  return (
    <main className="min-h-screen">
      <Header />
      <section className="section-padding pt-32 md:pt-40">
        <div className="container-page">
          <div className="max-w-3xl mx-auto">
            <h1 className="text-display-small md:text-display-medium font-semibold mb-8">
              About Us
            </h1>
            <div className="space-y-6 text-body-large text-on-surface-variant">
              <p>
                We are a passionate team dedicated to building tools that make a difference.
                Our journey began with a simple idea: to create software that empowers businesses
                to reach their full potential.
              </p>
              <p>
                Today, we serve thousands of customers worldwide, providing them with the
                infrastructure and tools they need to succeed in an increasingly digital world.
              </p>
              <p>
                Our commitment to innovation, security, and customer satisfaction drives
                everything we do. We believe in building lasting relationships with our
                clients and helping them grow.
              </p>
            </div>

            {/* Values */}
            <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
                { title: 'Innovation', description: 'Constantly pushing boundaries to deliver cutting-edge solutions.' },
                { title: 'Reliability', description: 'Building robust systems that you can count on 24/7.' },
                { title: 'Community', description: 'Fostering a collaborative environment for growth.' },
              ].map((value, index) => (
                <div key={index} className="card p-8 text-center">
                  <h3 className="text-title-large font-semibold mb-3">{value.title}</h3>
                  <p className="text-body-large text-on-surface-variant">{value.description}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
      <Footer />
    </main>
  )
}
