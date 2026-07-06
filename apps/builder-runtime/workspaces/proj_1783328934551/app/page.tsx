"use client";

import { Button, Card, Input, Badge } from "@/components/ui/index";
import { useEffect } from "react";

export default function HomePage() {
  useEffect(() => {
    // Optional: analytics or animation triggers
  }, []);

  return (
    <main style={{ backgroundColor: "var(--color-background)", color: "var(--color-on-background)", minHeight: "100vh", padding: "24px" }}>
      <section style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "32px", padding: "64px 0" }}>
        <h1 style={{ fontFamily: "var(--font-family)", fontSize: "var(--type-scale-display-large-font-size)", lineHeight: "var(--type-scale-display-large-line-height)", fontWeight: "400", textAlign: "center", maxWidth: "720px" }}>
          Your Professional Tech Solution
        </h1>
        <p style={{ fontFamily: "var(--font-family)", fontSize: "var(--type-scale-body-large-font-size)", lineHeight: "var(--type-scale-body-large-line-height)", color: "var(--color-on-surface-variant)", textAlign: "center", maxWidth: "560px" }}>
          Streamline your workflow with our minimalist, powerful platform.
        </p>
        <div style={{ display: "flex", gap: "16px", flexWrap: "wrap", justifyContent: "center" }}>
          <Button variant="filled" size="large">Get Started</Button>
          <Button variant="outlined" size="large">Learn More</Button>
        </div>
      </section>

      <section style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "48px", padding: "48px 0" }}>
        <h2 style={{ fontFamily: "var(--font-family)", fontSize: "var(--type-scale-headline-large-font-size)", lineHeight: "var(--type-scale-headline-large-line-height)", fontWeight: "400" }}>
          Features
        </h2>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "24px", width: "100%", maxWidth: "960px" }}>
          <Card style={{ padding: "24px", display: "flex", flexDirection: "column", gap: "16px", backgroundColor: "var(--color-surface)", border: "1px solid var(--color-outline-variant)", borderRadius: "8px" }}>
            <h3 style={{ fontFamily: "var(--font-family)", fontSize: "var(--type-scale-title-large-font-size)", lineHeight: "var(--type-scale-title-large-line-height)", fontWeight: "500" }}>
              Authentication
            </h3>
            <p style={{ fontFamily: "var(--font-family)", fontSize: "var(--type-scale-body-medium-font-size)", lineHeight: "var(--type-scale-body-medium-line-height)", color: "var(--color-on-surface-variant)" }}>
              Secure, seamless login for your team.
            </p>
            <Badge variant="filled" color="primary">New</Badge>
          </Card>
          <Card style={{ padding: "24px", display: "flex", flexDirection: "column", gap: "16px", backgroundColor: "var(--color-surface)", border: "1px solid var(--color-outline-variant)", borderRadius: "8px" }}>
            <h3 style={{ fontFamily: "var(--font-family)", fontSize: "var(--type-scale-title-large-font-size)", lineHeight: "var(--type-scale-title-large-line-height)", fontWeight: "500" }}>
              Dashboard
            </h3>
            <p style={{ fontFamily: "var(--font-family)", fontSize: "var(--type-scale-body-medium-font-size)", lineHeight: "var(--type-scale-body-medium-line-height)", color: "var(--color-on-surface-variant)" }}>
              Real-time insights at a glance.
            </p>
            <Badge variant="outlined" color="primary">Coming Soon</Badge>
          </Card>
        </div>
      </section>

      <section style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "24px", padding: "48px 0", backgroundColor: "var(--color-surface-variant)", borderRadius: "8px", marginTop: "48px" }}>
        <h2 style={{ fontFamily: "var(--font-family)", fontSize: "var(--type-scale-headline-medium-font-size)", lineHeight: "var(--type-scale-headline-medium-line-height)", fontWeight: "400" }}>
          Stay Updated
        </h2>
        <p style={{ fontFamily: "var(--font-family)", fontSize: "var(--type-scale-body-large-font-size)", lineHeight: "var(--type-scale-body-large-line-height)", color: "var(--color-on-surface-variant)" }}>
          Subscribe to our newsletter.
        </p>
        <div style={{ display: "flex", gap: "16px", flexWrap: "wrap", justifyContent: "center" }}>
          <Input placeholder="Your email" type="email" style={{ minWidth: "280px" }} />
          <Button variant="filled">Subscribe</Button>
        </div>
      </section>

      <footer style={{ display: "flex", justifyContent: "center", padding: "32px 0", borderTop: "1px solid var(--color-outline-variant)", marginTop: "48px" }}>
        <p style={{ fontFamily: "var(--font-family)", fontSize: "var(--type-scale-body-small-font-size)", color: "var(--color-on-surface-variant)" }}>
          &copy; {new Date().getFullYear()} Your Company. All rights reserved.
        </p>
      </footer>
    </main>
  );
}
