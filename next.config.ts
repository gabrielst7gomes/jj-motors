import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  typedRoutes: true,
  images: {
    // Domínio do Supabase Storage é resolvido em runtime pela env pública.
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**.supabase.co",
      },
      {
        protocol: "http",
        hostname: "127.0.0.1",
      },
      {
        // Fotos de placeholder usadas pelo seed de desenvolvimento.
        protocol: "https",
        hostname: "placehold.co",
      },
    ],
  },
};

export default nextConfig;
