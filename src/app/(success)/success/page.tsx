"use client";

import { Suspense, useEffect, useRef } from "react";
import { useSearchParams } from "next/navigation";
import PaymentResultLayout from "@/app/(site)/components/payment/PaymentResultLayout";
import PaymentOrderSummary from "@/app/(site)/components/payment/PaymentOrderSummary";
import {
    usePaymentSession,
    PaymentLoading,
    PaymentNotFound,
    MissingOrderId,
} from "@/app/(site)/components/payment/usePaymentSession";
import { trackPurchaseEvent } from "@/lib/payment-result";

function SuccessContent() {
    const searchParams = useSearchParams();
    const orderId = searchParams.get("order_id");
    const purchaseTracked = useRef(false);

    const { loading, data, notFound } = usePaymentSession(orderId, {
        expectedPage: "success",
    });

    useEffect(() => {
        if (!data || purchaseTracked.current) return;
        purchaseTracked.current = true;
        trackPurchaseEvent(data);
    }, [data]);

    if (!orderId) return <MissingOrderId />;
    if (loading) return <PaymentLoading />;
    if (notFound || !data) return <PaymentNotFound />;

    const customer = data.order.user;

    return (
        <PaymentResultLayout
            variant="success"
            title="Payment Successful!"
            message={
                <>
                    The order confirmation has been sent to{" "}
                    <strong>{customer.email}</strong>
                </>
            }
        >
            <PaymentOrderSummary data={data} />
        </PaymentResultLayout>
    );
}

export default function SuccessPage() {
    return (
        <Suspense fallback={<PaymentLoading />}>
            <SuccessContent />
        </Suspense>
    );
}
