import { buildPageMetadata } from "@/lib/seo";

export const metadata = buildPageMetadata({
    title: "Shop",
    description: "Shop the latest FYI Couture pieces — refined, made-to-fit fashion delivered to your door.",
    path: "/shop",
});

export default function Layout({ children }: { children: React.ReactNode }) {
    return children;
}
