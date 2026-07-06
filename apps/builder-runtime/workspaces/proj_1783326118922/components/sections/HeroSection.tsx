import React from "react";
import Button from "../ui/Button";

const HeroSection: React.FC = () => {
  return (
    <section className="py-20 md:py-28">
      <div className="container-page flex flex-col items-center text-center gap-8">
        <h1 className="text-display-large md:text-display-large font-normal tracking-tight max-w-3xl">
          Welcome to My Business
        </h1>
        <p className="text-body-large text-on-surface-variant max-w-xl">
          Empowering your journey with cutting-edge tools and insights.
        </p>
        <div className="flex flex-wrap gap-4 justify-center">
          <Button>Get Started</Button>
          <Button variant="outlined">
            Learn More
          </Button>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
