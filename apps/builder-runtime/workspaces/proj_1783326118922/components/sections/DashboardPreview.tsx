import React from "react";
import Button from "../ui/Button";

const DashboardPreview: React.FC = () => {
  return (
    <section className="py-20">
      <div className="container-page text-center">
        <h2 className="text-display-small mb-6">Dashboard</h2>
        <p className="text-body-large text-on-surface-variant max-w-xl mx-auto mb-8">
          Your personalized control center for analytics and management.
        </p>
        <Button>Go to Dashboard</Button>
      </div>
    </section>
  );
};

export default DashboardPreview;
