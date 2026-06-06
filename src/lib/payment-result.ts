import { API_BASE } from "@/lib/constants";

export type PaymentPage = "success" | "pending" | "expired" | "failed";

export interface PaymentSessionOrderItem {
    id: string;
    quantity: number;
    priceAtPurchase: string;
    product: {
        id?: string;
        title: string;
        imageUrl: string;
        price?: string;
    };
}

export interface PaymentSessionData {
    provider: string;
    payment: {
        status: string;
        referenceId: string;
        paymentUrl: string | null;
        expiredAt: string | null;
        amount: number;
    };
    order: {
        id: string;
        status: string;
        total: string;
        shippingCost?: string;
        subTotal?: string;
        createdAt: string;
        updatedAt: string;
        user: { name: string; email: string; phone?: string };
        items: PaymentSessionOrderItem[];
    };
    session: {
        status: string;
        amount: number;
    };
}

export function resolvePaymentPage(
    transactionStatus: string | null | undefined,
    paymentStatus: string,
    orderStatus: string,
): PaymentPage {
    const tx = transactionStatus?.toLowerCase();

    if (tx === "settlement" || tx === "capture") return "success";
    if (tx === "pending") return "pending";
    if (tx === "expire") return "expired";
    if (tx === "cancel" || tx === "deny") return "failed";

    if (paymentStatus === "PAID") return "success";
    if (paymentStatus === "EXPIRED" || orderStatus === "EXPIRED")
        return "expired";
    if (paymentStatus === "FAILED") return "failed";
    if (paymentStatus === "PENDING" || orderStatus === "DRAFT")
        return "pending";

    return "failed";
}

export function getPaymentPagePath(page: PaymentPage): string {
    switch (page) {
        case "success":
            return "/success";
        case "pending":
            return "/payment/pending";
        case "expired":
            return "/payment/expired";
        case "failed":
            return "/payment/failed";
    }
}

export function buildPaymentPageUrl(
    page: PaymentPage,
    orderId: string,
    extraParams?: Record<string, string>,
): string {
    const params = new URLSearchParams({ order_id: orderId, ...extraParams });
    return `${getPaymentPagePath(page)}?${params.toString()}`;
}

export async function fetchPaymentSession(
    referenceId: string,
): Promise<PaymentSessionData | null> {
    const res = await fetch(`${API_BASE}/orders/session/${referenceId}`, {
        cache: "no-store",
    });
    const json = await res.json();
    if (!json.success) return null;
    return json.data as PaymentSessionData;
}

export function trackPurchaseEvent(data: PaymentSessionData) {
    if (typeof window.fbq !== "function") return;

    const { order, session } = data;
    const total = Number(order.total || session.amount || 0);

    window.fbq("track", "Purchase", {
        value: total,
        currency: "IDR",
        content_ids: order.items.map((it) => it.product.id ?? it.id),
        content_type: "product",
        contents: order.items.map((it) => ({
            id: it.product.id ?? it.id,
            quantity: it.quantity,
            item_price: Number(it.priceAtPurchase),
        })),
        num_items: order.items.reduce((s, it) => s + it.quantity, 0),
        order_id: order.id,
    });
}

declare global {
    interface Window {
        fbq?: (...args: unknown[]) => void;
    }
}
