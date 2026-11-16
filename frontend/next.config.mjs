/** @type {import('next').NextConfig} */
const API_URL = (process.env.API_URL ?? "http://localhost:4000").replace(/\/$/, "");

const nextConfig = {
  reactStrictMode: true,
  // The shared package is plain TypeScript source – let Next compile it.
  transpilePackages: ["@lf/shared"],
  // The browser only ever talks to this site; /api/* is forwarded to the Express API.
  // That keeps the staff session cookie first-party (SameSite=Lax) even when the API
  // runs on a different domain, e.g. two Render services.
  async rewrites() {
    return [{ source: "/api/:path*", destination: `${API_URL}/api/:path*` }];
  },
};

export default nextConfig;
