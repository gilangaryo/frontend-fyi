import { buildPageMetadata } from "@/lib/seo";

export const metadata = buildPageMetadata({
    title: "Collection",
    description: "Discover FYI Couture collections, curated pieces crafted with timeless detail.",
    path: "/collection",
});

export default function Layout({ children }: { children: React.ReactNode }) {
    return children;
}
