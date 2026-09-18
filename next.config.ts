import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  experimental: {
    // Externaliser les packages lourds pour les RSC
  },
  serverExternalPackages: ['shiki', '@shikijs/core'],
};

export default nextConfig;
