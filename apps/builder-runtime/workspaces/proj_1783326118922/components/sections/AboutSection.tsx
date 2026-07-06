import React from "react";
import Card from "../ui/Card";

const AboutSection: React.FC = () => {
  return (
    <section className="py-20 bg-surface-variant">
      <div className="container-page">
        <h2 className="text-display-small text-center mb-16">About Us</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <Card className="p-8">
            <h3 className="text-headline-small mb-4">Our Mission</h3>
            <p className="text-body-large text-on-surface-variant">
              To deliver innovative solutions that drive success.
            </p>
          </Card>
          <Card className="p-8">
            <h3 className="text-headline-small mb-4">Our Vision</h3>
            <p className="text-body-large text-on-surface-variant">
              To be the leading platform for modern businesses.
            </p>
          </Card>
        </div>
      </div>
    </section>
  );
};

export default AboutSection;
