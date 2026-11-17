import { buildPageMetadata } from "@/lib/seo";

import HeroSection from "../components/story/HeroSection";
import StorySection from "../components/story/StorySection";

export const metadata = buildPageMetadata({
    title: "Story",
    description:
        "The story behind FYI Couture — our craft, our people, and what we stand for.",
    path: "/story",
});

export default function Home() {
    return (
        <>
            <HeroSection />
            <StorySection />
        </>
    );
}
