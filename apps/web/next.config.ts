import type { NextConfig } from "next";
import { withSentryConfig } from "@sentry/nextjs";

const nextConfig: NextConfig = {
  transpilePackages: ["@creator/types"],
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  }
};

export default withSentryConfig(nextConfig, {
  silent: true,
  org: "creator-engine",
  project: "frontend",
  widenClientFileUpload: true,
});
