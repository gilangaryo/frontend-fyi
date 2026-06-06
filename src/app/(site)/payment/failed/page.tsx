"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import PaymentResultLayout from "@/app/(site)/components/payment/PaymentResultLayout";
import PaymentOrderSummary from "@/app/(site)/components/payment/PaymentOrderSummary";
import {
    usePaymentSession,
    PaymentLoading,
    PaymentNotFound,
    MissingOrderId,
} from "@/app/(site)/components/payment/usePaymentSession";

function FailedContent() {
    const searchParams = useSearchParams();
    const orderId = searchParams.get("order_id");

    const { loading, data, notFound } = usePaymentSession(orderId, {
        expectedPage: "failed",
    });

    if (!orderId) return <MissingOrderId />;
    if (loading) return <PaymentLoading />;
    if (notFound) return <PaymentNotFound />;

    return (
        <PaymentResultLayout
            variant="failed"
            title="Payment Failed or Cancelled"
            message="Your payment was unsuccessful or was cancelled. You can try checking out again or contact us if you need assistance."
        >
            {data && <PaymentOrderSummary data={data} />}
        </PaymentResultLayout>
    );
}

export default function PaymentFailedPage() {
    return (
        <Suspense fallback={<PaymentLoading />}>
            <FailedContent />
        </Suspense>
    );
}
