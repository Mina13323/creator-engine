import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: ["@creator/types"],
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  }
};

export default nextConfig;
