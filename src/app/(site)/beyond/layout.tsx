import { buildPageMetadata } from "@/lib/seo";

export const metadata = buildPageMetadata({
    title: "Beyond",
    description: "Go beyond the clothes — events, stories, and behind-the-scenes from FYI Couture.",
    path: "/beyond",
});

export default function Layout({ children }: { children: React.ReactNode }) {
    return children;
}
