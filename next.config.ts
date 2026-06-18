import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  compress: true, // Habilita compressão gzip/brotli
  experimental: {
    optimizePackageImports: ['recharts', 'date-fns'],
  },
};

export default nextConfig;
