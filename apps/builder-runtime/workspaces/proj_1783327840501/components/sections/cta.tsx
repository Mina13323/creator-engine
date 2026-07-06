import Button from '@/components/ui/button';

export default function Cta() {
  return (
    <section className="bg-primary py-16 md:py-24">
      <div className="container-custom text-center">
        <h2 className="text-headline-small md:text-headline-medium text-on-primary mb-4">
          Ready to get started?
        </h2>
        <p className="text-body-large text-on-primary/80 max-w-lg mx-auto mb-8">
          Join thousands of satisfied customers and take your business to the next level.
        </p>
        <Button variant="filled" className="bg-secondary text-on-secondary hover:bg-secondary/90">
          Start Free Trial
        </Button>
      </div>
    </section>
  );
}
