import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  allowedDevOrigins: [
    "fyicouture.com",
    "*.fyicouture.com",
    "cdn.fyicouture.com",
    "api.cobatesting.my.id",
    "app.cobatesting.my.id",
    "localhost",
    "192.168.1.11",
    "192.168.1.13",
  ],
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: 'http://localhost:4300/api/:path*',
      },
      {
        source: '/api/:path*',
        destination: 'http://api.cobatesting.my.id/api/:path*',
      },
      {
        source: '/api/:path*',
        destination: 'https://api.cobatesting.my.id/api/:path*',
      },
    ];
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "placehold.co",
      },
      {
        protocol: 'http',
        hostname: '192.168.1.11',
        port: '4300',
      },
      {
        protocol: 'http',
        hostname: '192.168.1.13',
        port: '4300',
      },
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '4300',
      },
      {
        protocol: 'https',
        hostname: 'app.cobatesting.my.id',
      },
      {
        protocol: 'http',
        hostname: 'app.cobatesting.my.id',
      },
      {
        protocol: "https",
        hostname: "api.cobatesting.my.id"
      },
      {
        protocol: "https",
        hostname: "api.cobatesting.my.id",
        pathname: "/api/uploads/**",
      },
      {
        protocol: "http",
        hostname: "api.cobatesting.my.id",
        pathname: "/api/uploads/**",
      },

      {
        protocol: "https",
        hostname: "cdn.fyicouture.com",
        pathname: "/**",
      },
      {
        protocol: "http",
        hostname: "cdn.fyicouture.com",
        pathname: "/**",
      },

    ],
  },
};

export default nextConfig;
