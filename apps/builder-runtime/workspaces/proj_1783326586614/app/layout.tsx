import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Your Business Name',
  description: 'Professional landing page for your business',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="bg-background text-on-background antialiased">
        {children}
      </body>
    </html>
  )
}
