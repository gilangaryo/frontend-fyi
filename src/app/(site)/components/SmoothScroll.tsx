"use client";

import { ReactLenis, useLenis } from "lenis/react";
import { usePathname } from "next/navigation";
import { useEffect, type ReactNode } from "react";
import type Lenis from "lenis";
import "lenis/dist/lenis.css";

/** Shared lock count so cart/menu/zoom/email don't fight start/stop. */
let lenisLockCount = 0;
let lenisInstance: Lenis | null = null;

function acquireLenisLock(lenis: Lenis) {
    lenisInstance = lenis;
    lenisLockCount += 1;
    lenis.stop();
}

function releaseLenisLock(lenis: Lenis) {
    lenisLockCount = Math.max(0, lenisLockCount - 1);
    if (lenisLockCount === 0) {
        lenis.start();
    }
    if (lenisInstance === lenis && lenisLockCount === 0) {
        lenisInstance = null;
    }
}

function RouteScrollReset() {
    const pathname = usePathname();
    const lenis = useLenis();

    useEffect(() => {
        if (typeof window === "undefined") return;
        if (window.location.hash) return;
        if (lenisLockCount > 0) return;

        if (lenis) {
            lenis.scrollTo(0, { immediate: true });
        } else {
            window.scrollTo({ top: 0, behavior: "auto" });
        }
    }, [pathname, lenis]);

    return null;
}

/** Pause / resume Lenis while overlays (menu, cart, zoom, email) are open. */
export function useLockLenis(locked: boolean) {
    const lenis = useLenis();

    useEffect(() => {
        if (!lenis || !locked) return;

        acquireLenisLock(lenis);
        return () => {
            releaseLenisLock(lenis);
        };
    }, [locked, lenis]);
}

export default function SmoothScroll({ children }: { children: ReactNode }) {
    // Always enable Lenis on the storefront. Windows "Animation effects" off
    // sets prefers-reduced-motion and would otherwise skip smooth scroll entirely.
    return (
        <ReactLenis
            root
            options={{
                lerp: 0.09,
                duration: 1.1,
                smoothWheel: true,
                wheelMultiplier: 0.9,
                touchMultiplier: 1.5,
            }}
        >
            <RouteScrollReset />
            {children}
        </ReactLenis>
    );
}
