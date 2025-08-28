import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  eslint: {
    // Não falhe o build por erros de ESLint
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;
