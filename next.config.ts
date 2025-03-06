import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  env: {
    NEXTAUTH_SECRET:"YOUR_KEY_HERE",
  },
};

export default nextConfig;
