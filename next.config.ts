import type { NextConfig } from "next";

// Always allow the API host from the current env, so switching NEXT_PUBLIC_API_BASE_URL
// (LAN IP, staging, prod) never breaks image optimization.
type RemotePattern = { protocol: "http" | "https"; hostname: string; port?: string };
const apiImagePattern: RemotePattern[] = (() => {
    try {
        const u = new URL(process.env.NEXT_PUBLIC_API_BASE_URL ?? "");
        return [{
            protocol: u.protocol.replace(":", "") as "http" | "https",
            hostname: u.hostname,
            ...(u.port ? { port: u.port } : {}),
        }];
    } catch {
        return [];
    }
})();

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
        "192.168.18.20",
        "172.20.10.2",
    ],
    async headers() {
        return [
            {
                // Static images in public/product (dummy.jpg, size-chart, etc.)
                source: "/product/:file(.*\\.(?:jpg|jpeg|png|webp))",
                headers: [
                    {
                        key: "Cache-Control",
                        value: "public, max-age=86400, stale-while-revalidate=604800",
                    },
                ],
            },
        ];
    },
    async rewrites() {
        return [
            {
                source: "/api/:path*",
                destination: "http://localhost:4300/api/:path*",
            },
        ];
    },
    images: {
        // Next resizes per device + converts to WebP; results cached on disk for 30 days.
        formats: ["image/webp"],
        deviceSizes: [384, 640, 828, 1080, 1290, 1600, 1920],
        imageSizes: [96, 128, 192, 256, 384],
        qualities: [60, 75, 85, 90],
        minimumCacheTTL: 60 * 60 * 24 * 30,
        remotePatterns: [
            ...apiImagePattern,
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
                hostname: "192.168.1.8",
                port: "4300",
            },
            {
                protocol: "http",
                hostname: "172.20.10.2",
                port: "4300",
            },
            {
                protocol: "http",
                hostname: "192.168.18.20",
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
            {
                protocol: "http",
                hostname:
                    "fyi-backend-fyi-g9fh5m-33cd7a-76-13-193-236.traefik.me",
                pathname: "/api/uploads/**",
            },
            {
                protocol: "https",
                hostname:
                    "fyi-backend-fyi-g9fh5m-33cd7a-76-13-193-236.traefik.me",
                pathname: "/api/uploads/**",
            },
            {
                protocol: "http",
                hostname: "api-staging.fyicouture.com",
                pathname: "/api/uploads/**",
            },
            {
                protocol: "https",
                hostname: "api-staging.fyicouture.com",
                pathname: "/api/uploads/**",
            },
        ],
    },
};

export default nextConfig;
