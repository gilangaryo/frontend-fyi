"use client";

import { useEffect, useRef, useState } from "react";

interface ScrollRevealProps {
    children: React.ReactNode;
    className?: string;
    delay?: number;
    yOffset?: number;
}

/**
 * Fades + slides children in the first time they enter the viewport.
 * Plain IntersectionObserver + CSS transition (no animation library).
 */
export default function ScrollReveal({
    children,
    className,
    delay = 0,
    yOffset = 16,
}: ScrollRevealProps) {
    const ref = useRef<HTMLDivElement>(null);
    const [shown, setShown] = useState(false);

    useEffect(() => {
        const el = ref.current;
        if (!el) return;
        if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
            setShown(true);
            return;
        }
        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    setShown(true);
                    observer.disconnect();
                }
            },
            { threshold: 0.15, rootMargin: "0px 0px -8% 0px" },
        );
        observer.observe(el);
        return () => observer.disconnect();
    }, []);

    return (
        <div
            ref={ref}
            className={className}
            style={{
                opacity: shown ? 1 : 0,
                transform: shown ? "none" : `translate3d(0, ${yOffset}px, 0)`,
                transition: `opacity 550ms cubic-bezier(0.25,0.1,0.25,1) ${delay}ms, transform 550ms cubic-bezier(0.25,0.1,0.25,1) ${delay}ms`,
                willChange: shown ? undefined : "opacity, transform",
            }}
        >
            {children}
        </div>
    );
}
