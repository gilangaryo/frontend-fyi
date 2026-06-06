"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
    fetchPaymentSession,
    resolvePaymentPage,
    buildPaymentPageUrl,
    type PaymentPage,
    type PaymentSessionData,
} from "@/lib/payment-result";

interface UsePaymentSessionOptions {
    expectedPage: PaymentPage;
    redirectOnMismatch?: boolean;
}

export function usePaymentSession(
    orderId: string | null,
    options: UsePaymentSessionOptions,
) {
    const { expectedPage, redirectOnMismatch = true } = options;
    const [loading, setLoading] = useState(true);
    const [data, setData] = useState<PaymentSessionData | null>(null);
    const [notFound, setNotFound] = useState(false);

    useEffect(() => {
        if (!orderId) {
            setLoading(false);
            return;
        }

        let cancelled = false;

        (async () => {
            try {
                const session = await fetchPaymentSession(orderId);
                if (cancelled) return;

                if (!session) {
                    setNotFound(true);
                    return;
                }

                const resolved = resolvePaymentPage(
                    null,
                    session.payment.status,
                    session.order.status,
                );

                if (redirectOnMismatch && resolved !== expectedPage) {
                    window.location.replace(
                        buildPaymentPageUrl(resolved, orderId),
                    );
                    return;
                }

                setData(session);
            } catch (err) {
                console.error("Failed to fetch payment session:", err);
                if (!cancelled) setNotFound(true);
            } finally {
                if (!cancelled) setLoading(false);
            }
        })();

        return () => {
            cancelled = true;
        };
    }, [orderId, expectedPage, redirectOnMismatch]);

    return { loading, data, notFound };
}

export function PaymentNotFound() {
    return (
        <div className="min-h-screen flex flex-col items-center justify-center text-gray-600">
            <h1 className="text-2xl mb-2">Payment not found</h1>
            <Link href="/" className="text-secondary underline">
                Back to Home
            </Link>
        </div>
    );
}

export function PaymentLoading({ message = "Loading your order..." }) {
    return (
        <div className="min-h-screen flex items-center justify-center text-gray-500">
            {message}
        </div>
    );
}

export function MissingOrderId() {
    return (
        <div className="min-h-screen flex flex-col items-center justify-center text-gray-600">
            <h1 className="text-2xl mb-2">Order ID not found</h1>
            <Link href="/" className="text-secondary underline">
                Back to Home
            </Link>
        </div>
    );
}
