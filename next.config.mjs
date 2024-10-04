/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverComponentsExternalPackages: ["@node-rs/xxhash", "@node-rs/argon2"],
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
};

export default nextConfig;
