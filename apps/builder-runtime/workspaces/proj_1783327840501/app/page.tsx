import Header from './components/layout/header';
import Footer from './components/layout/footer';
import Hero from './components/sections/hero';
import Features from './components/sections/features';
import Cta from './components/sections/cta';

export default function HomePage() {
  return (
    <>
      <Header />
      <main>
        <Hero />
        <Features />
        <Cta />
      </main>
      <Footer />
    </>
  );
}
