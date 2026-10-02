import type { NextConfig } from "next";

// When set (e.g. https://taskflow-api.onrender.com), the frontend proxies
// /api/* to the backend so auth cookies are first-party on the frontend's
// domain. Needed when frontend and API live on different sites. Read at
// build time, so it must be available during `next build`.
const apiProxyTarget = process.env.API_PROXY_TARGET?.replace(/\/+$/, "");

const nextConfig: NextConfig = {
  output: "standalone",
  async rewrites() {
    if (!apiProxyTarget) return [];
    return [
      {
        source: "/api/:path*",
        destination: `${apiProxyTarget}/api/:path*`,
      },
    ];
  },
};

export default nextConfig;
