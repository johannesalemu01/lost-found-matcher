/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // The shared package is plain TypeScript source – let Next compile it.
  transpilePackages: ["@lf/shared"],
};

export default nextConfig;
