import Button from '@/components/ui/button';

export default function Hero() {
  return (
    <section className="container-custom py-16 md:py-24">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
        <div className="space-y-6">
          <h1 className="text-display-small md:text-display-medium font-normal text-on-surface leading-tight">
            Build something amazing
          </h1>
          <p className="text-body-large text-on-surface-variant max-w-lg">
            A minimalist platform designed to help you focus on what matters most. Clean, fast, and reliable.
          </p>
          <div className="flex flex-wrap gap-4">
            <Button variant="filled" size="lg">Get Started</Button>
            <Button variant="outlined" size="lg">Learn More</Button>
          </div>
        </div>
        <div className="bg-surface-variant rounded-xl h-80 flex items-center justify-center text-on-surface-variant">
          <span className="text-title-large">Hero Image Placeholder</span>
        </div>
      </div>
    </section>
  );
}
