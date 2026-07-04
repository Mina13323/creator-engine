import type { NextConfig } from "next";
import { withSentryConfig } from "@sentry/nextjs";

const nextConfig: NextConfig = {
  transpilePackages: ["@creator/types"],
  serverExternalPackages: ["@creator/database", "@creator/rag-core"],
  webpack(config) {
    config.resolve.alias = {
      ...config.resolve.alias,
      aws4: false
    };
    return config;
  }
};

export default withSentryConfig(nextConfig, {
  silent: true,
  org: "creator-engine",
  project: "frontend",
  widenClientFileUpload: true,
});
