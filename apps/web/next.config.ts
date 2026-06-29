import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  images: {
    domains: ["localhost", "api.namthang.com"],
  },
};

export default nextConfig;
