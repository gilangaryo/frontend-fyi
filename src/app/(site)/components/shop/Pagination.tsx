"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";

type PaginationProps = {
    currentPage: number;
    totalPages: number;
    onPageChange: (page: number) => void;
    isLoading?: boolean;
    itemsCount?: number;
    className?: string;
};

type PageToken = number | "ellipsis-start" | "ellipsis-end";

function buildPageTokens(
    currentPage: number,
    totalPages: number,
    windowSize: number, // how many pages to show in the active cluster
): PageToken[] {
    if (totalPages <= 0) return [];

    const edgeSize = 2; // pages always shown on the far side

    // No ellipsis needed – show everything
    if (totalPages <= windowSize + edgeSize + 1) {
        return Array.from({ length: totalPages }, (_, i) => i + 1);
    }

    const nearStart = currentPage <= windowSize;
    const nearEnd = currentPage > totalPages - windowSize;

    if (nearStart) {
        // e.g. 1 2 3 4 ... 13 14
        const leadPages: PageToken[] = Array.from(
            { length: windowSize },
            (_, i) => i + 1,
        );
        // skip ellipsis if the gap is only 1 page
        if (
            (leadPages[leadPages.length - 1] as number) + 1 >=
            totalPages - edgeSize + 1
        ) {
            return Array.from({ length: totalPages }, (_, i) => i + 1);
        }
        return [...leadPages, "ellipsis-end", totalPages - 1, totalPages];
    }

    if (nearEnd) {
        // e.g. 1 2 ... 11 12 13 14
        const trailStart = totalPages - windowSize + 1;
        const trailPages: PageToken[] = Array.from(
            { length: windowSize },
            (_, i) => trailStart + i,
        );
        // skip ellipsis if the gap is only 1 page
        if ((trailPages[0] as number) - 1 <= edgeSize) {
            return Array.from({ length: totalPages }, (_, i) => i + 1);
        }
        return [1, 2, "ellipsis-start", ...trailPages];
    }

    // Middle: 1 2 ... prev current next ... last-1 last
    return [
        1,
        2,
        "ellipsis-start",
        currentPage - 1,
        currentPage,
        currentPage + 1,
        "ellipsis-end",
        totalPages - 1,
        totalPages,
    ];
}

export default function Pagination({
    currentPage,
    totalPages,
    onPageChange,
    isLoading = false,
    itemsCount = 0,
    className = "",
}: PaginationProps) {
    const [isMobile, setIsMobile] = useState(false);
    const [isSwitching, setIsSwitching] = useState(false);
    const hasMounted = useRef(false);

    useEffect(() => {
        const mediaQuery = window.matchMedia("(max-width: 767px)");
        const handleChange = () => setIsMobile(mediaQuery.matches);

        handleChange();

        mediaQuery.addEventListener("change", handleChange);
        return () => mediaQuery.removeEventListener("change", handleChange);
    }, []);

    useEffect(() => {
        if (!hasMounted.current) {
            hasMounted.current = true;
            return;
        }

        setIsSwitching(true);
        const timeoutId = window.setTimeout(() => {
            setIsSwitching(false);
        }, 180);

        return () => window.clearTimeout(timeoutId);
    }, [currentPage]);

    if (isLoading || itemsCount === 0 || totalPages <= 1) {
        return null;
    }

    const windowSize = isMobile ? 3 : 4;
    const tokens = buildPageTokens(currentPage, totalPages, windowSize);

    const goToPage = (targetPage: number) => {
        const clampedPage = Math.min(Math.max(targetPage, 1), totalPages);
        if (clampedPage !== currentPage) onPageChange(clampedPage);
    };

    return (
        <div className={`mt-10 flex justify-center ${className}`}>
            <nav
                aria-label="Pagination"
                className="inline-flex items-center gap-6 rounded-sm px-3 py-3 md:px-4"
            >
                {currentPage > 1 && (
                    <button
                        type="button"
                        aria-label="Go to previous page"
                        onClick={() => goToPage(currentPage - 1)}
                        className="h-9 w-9 transition-opacity hover:opacity-60"
                    >
                        <Image
                            src="/pagination-left.svg"
                            alt=""
                            width={44}
                            height={44}
                            aria-hidden="true"
                            className="mx-auto"
                        />
                    </button>
                )}

                <div
                    className={`flex items-center gap-4 transition-all duration-200 ease-out ${
                        isSwitching
                            ? "opacity-60 translate-y-[1px]"
                            : "opacity-100 translate-y-0"
                    }`}
                >
                    {tokens.map((token) => {
                        if (typeof token !== "number") {
                            return (
                                <span
                                    key={token}
                                    aria-hidden="true"
                                    className="px-1 text-base text-gray-400"
                                >
                                    ...
                                </span>
                            );
                        }

                        const isActive = token === currentPage;

                        return (
                            <button
                                key={token}
                                type="button"
                                aria-label={`Go to page ${token}`}
                                aria-current={isActive ? "page" : undefined}
                                onClick={() => goToPage(token)}
                                className={`h-9 min-w-[2rem] px-1 text-xl transition-all duration-200 ${
                                    isActive
                                        ? "font-semibold text-[#5a4b43] scale-105"
                                        : "text-gray-400 hover:text-charcoal"
                                }`}
                            >
                                {token}
                            </button>
                        );
                    })}
                </div>

                {currentPage < totalPages && (
                    <button
                        type="button"
                        aria-label="Go to next page"
                        onClick={() => goToPage(currentPage + 1)}
                        className="h-9 w-9 transition-opacity hover:opacity-60"
                    >
                        <Image
                            src="/pagination-right.svg"
                            alt=""
                            width={44}
                            height={44}
                            aria-hidden="true"
                            className="mx-auto"
                        />
                    </button>
                )}
            </nav>
        </div>
    );
}
