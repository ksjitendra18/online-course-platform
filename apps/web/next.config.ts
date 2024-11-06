import { NextConfig } from "next";

import BundleAnalyzer from "@next/bundle-analyzer";

const withBundleAnalyzer = BundleAnalyzer({
  // eslint-disable-next-line n/no-process-env
  enabled: process.env.ANALYZE === "true",
});

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

export default withBundleAnalyzer(nextConfig);
