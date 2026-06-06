"use client";

import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";

type Variant = "success" | "pending" | "expired" | "failed";

interface PaymentResultLayoutProps {
    variant: Variant;
    title: string;
    message: ReactNode;
    children?: ReactNode;
    retryPaymentUrl?: string | null;
}

const variantStyles: Record<
    Variant,
    { ring: string; mid: string; inner: string; icon: ReactNode }
> = {
    success: {
        ring: "bg-secondary/20",
        mid: "bg-secondary/60",
        inner: "bg-secondary",
        icon: (
            <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-20 w-20 text-white"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={1.5}
            >
                <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M6 14l4 4L19 7"
                />
            </svg>
        ),
    },
    pending: {
        ring: "bg-secondary/20",
        mid: "bg-secondary/60",
        inner: "bg-secondary",
        icon: (
            <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-20 w-20 text-white"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={1.5}
            >
                <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M12 6v6l4 2m6-2a10 10 0 11-20 0 10 10 0 0120 0z"
                />
            </svg>
        ),
    },
    expired: {
        ring: "bg-secondary/20",
        mid: "bg-secondary/60",
        inner: "bg-secondary",
        icon: (
            <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-20 w-20 text-white"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={1.5}
            >
                <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
            </svg>
        ),
    },
    failed: {
        ring: "bg-red-100",
        mid: "bg-red-300/60",
        inner: "bg-red-500",
        icon: (
            <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-20 w-20 text-white"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={1.5}
            >
                <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M6 18L18 6M6 6l12 12"
                />
            </svg>
        ),
    },
};

export default function PaymentResultLayout({
    variant,
    title,
    message,
    children,
    retryPaymentUrl,
}: PaymentResultLayoutProps) {
    const styles = variantStyles[variant];

    return (
        <div className="min-h-screen flex flex-col">
            <header className="sticky top-0 bg-white z-10 flex items-center justify-between px-10 py-6 shadow-sm">
                <Link href="/">
                    <Image
                        src="/logo-fyi.png"
                        alt="FYI Logo"
                        width={80}
                        height={60}
                    />
                </Link>
            </header>

            <main className="flex-1 flex flex-col items-center justify-center px-4 py-10">
                <div
                    className={`w-70 h-70 rounded-full ${styles.ring} flex items-center justify-center mb-8`}
                >
                    <div
                        className={`w-50 h-50 rounded-full ${styles.mid} flex items-center justify-center`}
                    >
                        <div
                            className={`w-28 h-28 rounded-full ${styles.inner} flex items-center justify-center`}
                        >
                            {styles.icon}
                        </div>
                    </div>
                </div>

                <h2 className="text-3xl font-light mb-2 text-center">
                    {title}
                </h2>
                <p className="text-gray-600 mb-8 text-center max-w-lg">
                    {message}
                </p>

                {children}

                <div className="mt-8 flex flex-col gap-3 w-full max-w-xl">
                    {retryPaymentUrl && (
                        <a
                            href={retryPaymentUrl}
                            className="bg-secondary/20 text-secondary py-3 px-8 w-full text-center font-medium"
                        >
                            Pay Now
                        </a>
                    )}
                    <Link
                        href="/shop"
                        className="bg-secondary text-white py-3 px-8 w-full text-center font-medium"
                    >
                        Continue Shopping
                    </Link>
                </div>
            </main>
        </div>
    );
}
