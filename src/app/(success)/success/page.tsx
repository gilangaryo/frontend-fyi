"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";

import { API_BASE } from "@/lib/constants";
import { getImageUrl } from "@/lib/utils";

interface Product {
    id: string;
    title: string;
    imageUrl: string;
    price: string;
    category: { title: string };
}

interface OrderItem {
    id: string;
    quantity: number;
    priceAtPurchase: string;
    product: Product;
}

interface Order {
    id: string;
    status: string;
    total: string;
    shippingCost: string;
    subTotal: string;
    courierCompany: string | null;
    user: { name: string; email: string; phone: string };
    items: OrderItem[];
    createdAt: string;
    updatedAt: string;
}

interface Payment {
    id: string;
    status: string;
    method: string;
    channel: string;
    paid_at: string;
}

interface Session {
    id: string;
    status: string;
    amount: number;
    created: string;
    updated: string;
}

interface OrderResponse {
    success: boolean;
    message: string;
    data: {
        session: Session;
        payment: Payment;
        order: Order;
        provider?: string;
    };
}

function SuccessContent() {
    const searchParams = useSearchParams();
    const order_id = searchParams.get("order_id");

    const [loading, setLoading] = useState(true);
    const [data, setData] = useState<OrderResponse["data"] | null>(null);

    useEffect(() => {
        if (!order_id) return;
        (async () => {
            try {
                const res = await fetch(
                    `${API_BASE}/orders/session/${order_id}`,
                );
                const json: OrderResponse = await res.json();
                if (json.success) {
                    setData(json.data);

                    // ✅ Purchase event — fire sekali saat order sukses
                    if (typeof window.fbq === "function") {
                        const order = json.data.order;
                        const total = Number(
                            order.total || json.data.session.amount || 0,
                        );
                        window.fbq("track", "Purchase", {
                            value: total,
                            currency: "IDR",
                            content_ids: order.items.map(
                                (it: OrderItem) => it.product.id,
                            ),
                            content_type: "product",
                            contents: order.items.map((it: OrderItem) => ({
                                id: it.product.id,
                                quantity: it.quantity,
                                item_price: Number(it.priceAtPurchase),
                            })),
                            num_items: order.items.reduce(
                                (s: number, it: OrderItem) => s + it.quantity,
                                0,
                            ),
                            order_id: order.id,
                        });
                    }
                }
            } catch (err) {
                console.error("Failed to fetch payment:", err);
            } finally {
                setLoading(false);
            }
        })();
    }, [order_id]);

    if (loading)
        return (
            <div className="min-h-screen flex items-center justify-center text-gray-500">
                Loading your order...
            </div>
        );

    if (!data)
        return (
            <div className="min-h-screen flex flex-col items-center justify-center text-gray-600">
                <h1 className="text-2xl mb-2">Payment not found</h1>
                <Link href="/" className="text-secondary underline">
                    Back to Home
                </Link>
            </div>
        );

    const { session, order, payment, provider } = data;
    const customer = order.user;
    const items = order.items ?? [];
    const total = Number(order.total || session.amount || 0);

    return (
        <div className="min-h-screen flex flex-col">
            {/* Header */}
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

            {/* Main */}
            <main className="flex-1 flex flex-col items-center justify-center px-4 py-10">
                {/* Success Icon */}
                <div className="w-70 h-70 rounded-full bg-secondary/20 flex items-center justify-center mb-8">
                    <div className="w-50 h-50 rounded-full bg-secondary/60 flex items-center justify-center">
                        <div className="w-28 h-28 rounded-full bg-secondary flex items-center justify-center">
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
                        </div>
                    </div>
                </div>

                <h2 className="text-3xl font-light mb-2">
                    Payment Successful!
                </h2>
                <p className="text-gray-600 mb-8">
                    The order confirmation has been sent to{" "}
                    <strong>{customer.email}</strong>
                </p>

                {/* Order Summary */}
                <div className="bg-primary p-6 w-full max-w-xl">
                    {items.map((it: OrderItem) => (
                        <div key={it.id} className="flex justify-between mb-3">
                            <div className="flex gap-3">
                                <div className="relative w-16 h-20">
                                    <Image
                                        src={getImageUrl(it.product?.imageUrl)}
                                        alt={it.product?.title}
                                        fill
                                        className="object-cover rounded"
                                    />
                                </div>
                                <div>
                                    <p className="font-medium">
                                        {it.product?.title}
                                    </p>
                                    <p className="text-gray-500 text-sm">
                                        x{it.quantity} — IDR{" "}
                                        {Number(
                                            it.priceAtPurchase,
                                        ).toLocaleString("id-ID")}
                                    </p>
                                </div>
                            </div>
                        </div>
                    ))}

                    <div className="border-t pt-4 border-gray-300 text-gray-500 space-y-3 text-sm font-light">
                        <div className="flex justify-between">
                            <span>Transaction Date</span>
                            <span>
                                {new Intl.DateTimeFormat("en-US", {
                                    month: "long",
                                    day: "2-digit",
                                    year: "numeric",
                                    hour: "2-digit",
                                    minute: "2-digit",
                                    second: "2-digit",
                                    hour12: true,
                                    timeZone: "Asia/Jakarta",
                                }).format(new Date(order.updatedAt))}{" "}
                                WIB
                            </span>
                        </div>

                        {/* <div className="flex justify-between">
                            <span>Payment Method</span>
                            <span>{provider || "Xendit Payment Link"}</span>
                        </div> */}

                        <div className="flex justify-between font-medium border-t border-gray-300 pt-3">
                            <span>Total</span>
                            <span>IDR {total.toLocaleString("id-ID")}</span>
                        </div>
                    </div>
                </div>

                <Link
                    href="/shop"
                    className="mt-8 bg-secondary text-white py-3 px-8 w-full max-w-xl text-center font-medium"
                >
                    Continue Shopping
                </Link>
            </main>
        </div>
    );
}

export default function SuccessPage() {
    return (
        <Suspense
            fallback={
                <div className="min-h-screen flex items-center justify-center">
                    Loading...
                </div>
            }
        >
            <SuccessContent />
        </Suspense>
    );
}
