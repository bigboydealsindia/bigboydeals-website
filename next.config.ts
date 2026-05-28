import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    serverActions: {
      bodySizeLimit: "50mb", // Video uploads ke liye limit
    },
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "qvjlgawirrtevybixqbr.supabase.co", // Aapka Supabase domain
        port: "",
        pathname: "/storage/v1/object/public/**", // Storage path
      },
    ],
  },
};

export default nextConfig;
