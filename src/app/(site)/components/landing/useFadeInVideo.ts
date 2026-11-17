"use client";

import { useEffect, useState, type RefObject } from "react";

/**
 * Plays a muted video while it is on screen, pauses it off-screen, and reports
 * when the first frame is actually playing so the caller can fade it in from white.
 */
export function useFadeInVideo(
    ref: RefObject<HTMLVideoElement | null>,
    { threshold = 0.15, fallbackMs = 4000 }: { threshold?: number; fallbackMs?: number } = {},
) {
    const [visible, setVisible] = useState(false);

    useEffect(() => {
        const video = ref.current;
        if (!video) return;

        const show = () => setVisible(true);
        // Already playing (e.g. restored from bfcache) — show right away.
        if (!video.paused && video.readyState >= 3) show();
        video.addEventListener("playing", show, { once: true });

        // Never leave the video hidden forever if "playing" doesn't fire (autoplay blocked).
        const timer = window.setTimeout(() => {
            if (video.readyState >= 2) show();
        }, fallbackMs);
        video.addEventListener("loadeddata", () => {
            if (video.paused) window.setTimeout(show, 300);
        }, { once: true });

        const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting && !reduceMotion) {
                    video.play().catch(() => {});
                } else {
                    video.pause();
                }
            },
            { threshold },
        );
        observer.observe(video);

        return () => {
            observer.disconnect();
            window.clearTimeout(timer);
            video.removeEventListener("playing", show);
        };
    }, [ref, threshold, fallbackMs]);

    return visible;
}
