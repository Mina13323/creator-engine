import Button from './Button'

export default function CTA() {
  return (
    <section className="bg-primary py-64dp md:py-96dp">
      <div className="max-w-content mx-auto px-16dp md:px-24dp text-center">
        <h2 className="text-headline-medium md:text-headline-large text-on-primary mb-16dp">
          Ready to simplify your workflow?
        </h2>
        <p className="text-body-large text-on-primary opacity-90 max-w-2xl mx-auto mb-32dp">
          Join teams that rely on TechVenture for secure authentication and powerful dashboards.
        </p>
        <div className="flex flex-col sm:flex-row justify-center gap-16dp">
          <Button variant="secondary" size="large">
            Get Started Free
          </Button>
          <Button variant="secondaryOutlined" size="large">
            Talk to Sales
          </Button>
        </div>
      </div>
    </section>
  )
}