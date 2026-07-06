import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Local Brand",
  description: "Modern solutions for your business.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
