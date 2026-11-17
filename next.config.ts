import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  cacheComponents: true,
  partialPrefetching: true,
  allowedDevOrigins: ["127.0.0.1"],
  experimental: {
    instantInsights: {
      validationLevel: "manual-warning",
    },
  },
  async redirects() {
    return [
      { source: "/estoque", destination: "/admin/estoque", permanent: false },
      {
        source: "/movimentos",
        destination: "/admin/movimentos",
        permanent: false,
      },
      {
        source: "/mais-vendidos",
        destination: "/admin/mais-vendidos",
        permanent: false,
      },
      {
        source: "/reposicao",
        destination: "/admin/reposicao",
        permanent: false,
      },
      { source: "/insights", destination: "/admin/insights", permanent: false },
    ];
  },
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
