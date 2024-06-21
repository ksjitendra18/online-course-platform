/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverComponentsExternalPackages: ["@node-rs/xxhash", "@node-rs/argon2"],
  },
  images: {
    remotePatterns: [
      {
        hostname: "course-img-jsx.b-cdn.net",
      },
    ],
  },
};

export default nextConfig;
