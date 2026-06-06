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

function ExpiredContent() {
    const searchParams = useSearchParams();
    const orderId = searchParams.get("order_id");

    const { loading, data, notFound } = usePaymentSession(orderId, {
        expectedPage: "expired",
    });

    if (!orderId) return <MissingOrderId />;
    if (loading) return <PaymentLoading />;
    if (notFound || !data) return <PaymentNotFound />;

    return (
        <PaymentResultLayout
            variant="expired"
            title="Payment Expired"
            message="The payment window for this order has closed. Please place a new order if you would like to continue shopping."
        >
            <PaymentOrderSummary data={data} />
        </PaymentResultLayout>
    );
}

export default function PaymentExpiredPage() {
    return (
        <Suspense fallback={<PaymentLoading />}>
            <ExpiredContent />
        </Suspense>
    );
}
