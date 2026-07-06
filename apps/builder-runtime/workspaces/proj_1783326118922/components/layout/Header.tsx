import React from "react";
import Button from "../ui/Button";

const Header: React.FC = () => {
  return (
    <header className="sticky top-0 z-50 bg-background border-b border-outline">
      <div className="container-page flex items-center justify-between h-16">
        {/* Logo */}
        <div className="text-title-large font-semibold">My Business</div>

        {/* Navigation */}
        <nav className="hidden md:flex gap-8">
          <a
            href="#"
            className="text-body-large text-on-surface hover:text-primary transition-colors"
          >
            Home
          </a>
          <a
            href="#"
            className="text-body-large text-on-surface hover:text-primary transition-colors"
          >
            About
          </a>
          <a
            href="#"
            className="text-body-large text-on-surface hover:text-primary transition-colors"
          >
            Dashboard
          </a>
        </nav>

        {/* Auth Buttons */}
        <div className="flex gap-4">
          <Button variant="outlined">Log In</Button>
          <Button>Sign Up</Button>
        </div>
      </div>
    </header>
  );
};

export default Header;
