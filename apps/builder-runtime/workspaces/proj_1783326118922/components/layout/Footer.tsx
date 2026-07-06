import React from "react";

const Footer: React.FC = () => {
  return (
    <footer className="bg-surface-variant border-t border-outline py-12">
      <div className="container-page grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Company Info */}
        <div>
          <h3 className="text-title-large mb-4">My Business</h3>
          <p className="text-body-medium text-on-surface-variant">
            Building the future with innovative solutions.
          </p>
        </div>

        {/* Quick Links */}
        <div>
          <h4 className="text-title-medium mb-4">Links</h4>
          <ul className="space-y-2">
            <li>
              <a href="#" className="text-body-medium text-on-surface-variant hover:text-primary">
                Privacy Policy
              </a>
            </li>
            <li>
              <a href="#" className="text-body-medium text-on-surface-variant hover:text-primary">
                Terms of Service
              </a>
            </li>
            <li>
              <a href="#" className="text-body-medium text-on-surface-variant hover:text-primary">
                Contact
              </a>
            </li>
          </ul>
        </div>

        {/* Social / CTA */}
        <div className="flex flex-col gap-4">
          <h4 className="text-title-medium">Stay connected</h4>
          <p className="text-body-medium text-on-surface-variant">
            Subscribe to our newsletter.
          </p>
          {/* Simplified placeholder */}
          <div className="flex gap-2">
            <input
              type="email"
              placeholder="Enter email"
              className="flex-1 px-4 py-2 border border-outline rounded-md bg-background text-body-medium"
            />
            <button className="px-6 py-2 bg-primary text-on-primary rounded-md text-label-large">
              Subscribe
            </button>
          </div>
        </div>
      </div>
      <div className="container-page mt-8 pt-4 border-t border-outline text-center text-body-small text-on-surface-variant">
        &copy; {new Date().getFullYear()} My Business. All rights reserved.
      </div>
    </footer>
  );
};

export default Footer;
