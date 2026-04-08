import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: ["@quickconvert/shared"],
  experimental: {
    typedRoutes: true
  }
};

export default nextConfig;
