import { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ["@node-rs/xxhash", "@node-rs/argon2"],
  devIndicators: {
    appIsrStatus: true,
  },

  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    remotePatterns: [
      {
        hostname: "course-img-jsx.b-cdn.net",
      },
      {
        hostname: "cdn.learningapp.link",
        protocol: "https",
      },
    ],
  },
  compress: false,
};

export default nextConfig;
