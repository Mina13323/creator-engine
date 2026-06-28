import './globals.css';
import type { Metadata } from 'next';
import { ToastContainer } from '@/components/ui/Toast';
import { SystemStatusBanner } from '@/components/SystemStatusBanner';

export const metadata: Metadata = {
  title: 'Creator Engine',
  description: 'Go from simple business idea to a validated, branded, launch-ready startup powered by multi-agent AI workflows.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="antialiased text-slate-100 bg-[#040814]">
        <SystemStatusBanner />
        {children}
        <ToastContainer />
      </body>
    </html>
  );
}
