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
import { formatPaymentExpiry } from "@/lib/utils";

function PendingContent() {
    const searchParams = useSearchParams();
    const orderId = searchParams.get("order_id");

    const { loading, data, notFound } = usePaymentSession(orderId, {
        expectedPage: "pending",
    });

    if (!orderId) return <MissingOrderId />;
    if (loading) return <PaymentLoading />;
    if (notFound || !data) return <PaymentNotFound />;

    const expiredLabel = data.payment.expiredAt
        ? formatPaymentExpiry(data.payment.expiredAt, "en-US")
        : null;

    return (
        <PaymentResultLayout
            variant="pending"
            title="Awaiting Payment"
            message={
                <>
                    Your order has not been paid yet. Please complete payment
                    before the deadline.
                    {expiredLabel && (
                        <>
                            {" "}
                            Payment deadline:{" "}
                            <strong>{expiredLabel}</strong>
                        </>
                    )}
                </>
            }
            retryPaymentUrl={data.payment.paymentUrl}
        >
            <PaymentOrderSummary data={data} />
        </PaymentResultLayout>
    );
}

export default function PaymentPendingPage() {
    return (
        <Suspense fallback={<PaymentLoading />}>
            <PendingContent />
        </Suspense>
    );
}
