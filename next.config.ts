import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  compress: true, // Habilita compressão gzip/brotli
  experimental: {
    optimizePackageImports: ['lucide-react', 'recharts', 'date-fns'],
  },
};

export default nextConfig;
