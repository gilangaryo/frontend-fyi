"use client";

import { Suspense, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import {
    resolvePaymentPage,
    buildPaymentPageUrl,
    fetchPaymentSession,
} from "@/lib/payment-result";
import {
    PaymentLoading,
    MissingOrderId,
} from "@/app/(site)/components/payment/usePaymentSession";

function PaymentResultGateway() {
    const searchParams = useSearchParams();
    const orderId = searchParams.get("order_id");
    const transactionStatus = searchParams.get("transaction_status");

    useEffect(() => {
        if (!orderId) return;

        const extraParams: Record<string, string> = {};
        searchParams.forEach((value, key) => {
            if (key !== "order_id" && key !== "transaction_status") {
                extraParams[key] = value;
            }
        });

        const txPage = transactionStatus
            ? resolvePaymentPage(transactionStatus, "", "")
            : null;

        if (txPage) {
            window.location.replace(
                buildPaymentPageUrl(txPage, orderId, extraParams),
            );
            return;
        }

        (async () => {
            const session = await fetchPaymentSession(orderId);
            if (!session) {
                window.location.replace(
                    buildPaymentPageUrl("failed", orderId, extraParams),
                );
                return;
            }

            const page = resolvePaymentPage(
                null,
                session.payment.status,
                session.order.status,
            );
            window.location.replace(
                buildPaymentPageUrl(page, orderId, extraParams),
            );
        })();
    }, [orderId, transactionStatus, searchParams]);

    if (!orderId) return <MissingOrderId />;

    return <PaymentLoading message="Redirecting..." />;
}

export default function PaymentResultPage() {
    return (
        <Suspense fallback={<PaymentLoading />}>
            <PaymentResultGateway />
        </Suspense>
    );
}
