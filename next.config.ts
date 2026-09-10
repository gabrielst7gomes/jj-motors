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
      {
        // Fotos ILUSTRATIVAS do seed (até a JJ Motors subir as fotos reais
        // dos veículos via Storage). Ver supabase/seed.sql.
        protocol: "https",
        hostname: "images.unsplash.com",
      },
    ],
  },
};

export default nextConfig;
