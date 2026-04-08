import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: ["@quickconvert/shared"],
  typedRoutes: true
};

export default nextConfig;
