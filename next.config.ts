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
                source: "/api/:path*",
                destination: "http://localhost:4300/api/:path*",
            },
            {
                source: "/api/:path*",
                destination: "http://localhost:4400/api/:path*",
            },
            {
                source: "/api/:path*",
                destination: "http://localhost:4300/api/:path*",
            },
            {
                source: "/api/:path*",
                destination: "http://api.cobatesting.my.id/api/:path*",
            },
            {
                source: "/api/:path*",
                destination: "https://api.cobatesting.my.id/api/:path*",
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
                protocol: "https",
                hostname: "johnhardy.com",
            },
            {
                protocol: "http",
                hostname: "192.168.1.11",
                port: "4300",
            },
            {
                protocol: "http",
                hostname: "192.168.1.13",
                port: "4300",
            },
            {
                protocol: "http",
                hostname: "192.168.56.1",
                port: "4300",
            },
            {
                protocol: "http",
                hostname: "localhost",
                port: "4400",
            },
            {
                protocol: "http",
                hostname: "192.168.56.1",
                port: "4400",
            },
            {
                protocol: "http",
                hostname: "localhost",
                port: "4300",
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

            {
                protocol: "https",
                hostname: "fyicouture.com",
            },
            {
                protocol: "https",
                hostname: "api.fyicouture.com",
            },

            {
                protocol: "https",
                hostname: "api.fyicouture.com",
                pathname: "/api/uploads/**",
            },
            {
                protocol: "http",
                hostname: "api.fyicouture.com",
                pathname: "/api/uploads/**",
            },
        ],
    },
};

export default nextConfig;
