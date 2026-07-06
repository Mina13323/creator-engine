import React from 'react';
import './globals.css';
import NavigationBar from '../components/NavigationBar';

export const metadata = {
  title: 'MyBusiness - Landing Page',
  description: 'Welcome to MyBusiness. Minimalist black-and-white design with clean typography.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-background text-on-background min-h-screen">
        <NavigationBar />
        <main className="max-w-content mx-auto px-gutter py-8">
          {children}
        </main>
      </body>
    </html>
  );
}
