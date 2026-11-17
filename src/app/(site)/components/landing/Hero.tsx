"use client";

import { useRef } from "react";
import { useFadeInVideo } from "@/app/(site)/components/landing/useFadeInVideo";

const CDN = "https://cdn.fyicouture.com/videos";

export default function Hero() {
    const videoRef = useRef<HTMLVideoElement>(null);
    const visible = useFadeInVideo(videoRef, { threshold: 0.15 });

    return (
        <section className="relative top-0 md:-top-30  w-full h-[80vh] md:h-svh flex items-center justify-center overflow-hidden bg-white">
            {/* Starts white, fades in once the first frame is playing. Paused off-screen. */}
            <video
                ref={videoRef}
                loop
                muted
                playsInline
                preload="metadata"
                className={`absolute top-0 left-0 w-full h-full object-cover transition-opacity duration-700 ease-out ${visible ? "opacity-100" : "opacity-0"}`}
            >
                {/* Kept at full quality on purpose: grainy footage, AV1 saved nothing without visible loss. */}
                <source src={`${CDN}/fyi-cover.mp4`} type="video/mp4" />
            </video>
        </section>
    );
}
