import Header from '@/components/Header'
import Hero from '@/components/Hero'
import Features from '@/components/Features'
import AboutPreview from '@/components/AboutPreview'
import Footer from '@/components/Footer'

export default function Home() {
  return (
    <main className="min-h-screen">
      <Header />
      <Hero />
      <Features />
      <AboutPreview />
      <Footer />
    </main>
  )
}
