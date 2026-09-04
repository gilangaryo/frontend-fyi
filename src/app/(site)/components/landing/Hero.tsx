"use client";

import { useEffect, useRef } from "react";

export default function Hero() {
    const videoRef = useRef<HTMLVideoElement>(null);

    useEffect(() => {
        const video = videoRef.current;
        if (!video) return;

        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    video.play().catch(() => {});
                } else {
                    video.pause();
                }
            },
            { threshold: 0.15 },
        );

        observer.observe(video);
        return () => observer.disconnect();
    }, []);

    return (
        <section className="relative top-0 md:-top-30  w-full h-[80vh] md:h-svh flex items-center justify-center overflow-hidden bg-white">
            {/* Background video — paused off-screen to keep scroll at 60fps */}
            <video
                ref={videoRef}
                autoPlay
                loop
                muted
                playsInline
                preload="metadata"
                className="absolute top-0 left-0 w-full h-full object-cover"
            >
                <source
                    src="https://cdn.fyicouture.com/videos/fyi-cover.mp4"
                    type="video/mp4"
                />
            </video>
        </section>
    );
}
