import { buildPageMetadata } from "@/lib/seo";

export const metadata = buildPageMetadata({
    title: "Sale",
    description: "Shop FYI Couture pieces on sale for a limited time.",
    path: "/sale",
});

export default function Layout({ children }: { children: React.ReactNode }) {
    return children;
}
