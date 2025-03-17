import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "i.scdn.co", // Spotify domain
        pathname: "/image/**",
      },
    ],
  },
};

export default nextConfig;
