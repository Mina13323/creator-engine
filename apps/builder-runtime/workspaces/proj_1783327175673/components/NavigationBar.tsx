import React from 'react';
import Link from 'next/link';

const NavigationBar: React.FC = () => {
  return (
    <nav className="bg-background border-b border-outline">
      <div className="max-w-content mx-auto px-gutter py-4 flex items-center justify-between">
        <Link href="/" className="text-title-large text-on-background font-semibold no-underline">
          MyBusiness
        </Link>
        <div className="flex items-center gap-6">
          <Link href="/" className="text-body-large text-on-background hover:text-gray-400 transition-colors">
            Home
          </Link>
          <Link href="/about" className="text-body-large text-on-background hover:text-gray-400 transition-colors">
            About
          </Link>
        </div>
      </div>
    </nav>
  );
};

export default NavigationBar;
