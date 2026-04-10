"use client";

import Image from "next/image";
import { useRef, useEffect } from "react";
import { getImageUrl } from "@/lib/utils";
import type {
    AppliedPromotion,
    OrderApi,
    PricingBreakdownItem,
} from "@/types/order";
import AcceptOrderButton from "./AcceptOrderButton";

interface OrderDetailModalProps {
    order: OrderApi;
    onClose: () => void;
    onAccepted: (id: string) => void;
}

function formatCurrency(value: number) {
    return `Rp ${value.toLocaleString("id-ID")}`;
}

function formatPromotionValue(promotion: AppliedPromotion) {
    return promotion.type === "PERCENT"
        ? `${promotion.value}%`
        : formatCurrency(Number(promotion.value));
}

export default function OrderDetailModal({
    order,
    onClose,
    onAccepted,
}: OrderDetailModalProps) {
    const modalRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (
                modalRef.current &&
                !modalRef.current.contains(event.target as Node)
            ) {
                onClose();
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () =>
            document.removeEventListener("mousedown", handleClickOutside);
    }, [onClose]);

    const pricing = order.pricingBreakdown;

    const fallbackTotalPrice = (order.items ?? []).reduce(
        (sum, item) => sum + Number(item.priceAtPurchase) * item.quantity,
        0,
    );

    const baseSubtotal = pricing?.summary.baseSubtotal ?? fallbackTotalPrice;
    const finalProductSubtotal =
        pricing?.summary.payableSubtotal ??
        Number(order.total || fallbackTotalPrice);
    const totalDiscount =
        pricing?.summary.totalDiscount ?? Number(order.discountTotal || 0);
    const shippingCost = Number(order.shippingCost || 0);
    const totalPayment = Number(order.total || finalProductSubtotal);
    const appliedPromotions = pricing?.promotions.applied ?? [];

    const pricingItemsByVariantId = new Map(
        (pricing?.items ?? []).map((item) => [item.variantId, item]),
    );

    const getPricingItem = (
        variantId?: string | null,
    ): PricingBreakdownItem | undefined => {
        if (!variantId) return undefined;
        return pricingItemsByVariantId.get(variantId);
    };

    return (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
            <div
                ref={modalRef}
                className="bg-white rounded-xl shadow-lg w-full max-w-2xl overflow-y-auto max-h-[95vh]"
            >
                {/* Header */}
                <div className="flex justify-left items-center border-b border-gray-200 px-6 py-4">
                    <button
                        onClick={onClose}
                        className="p-1 hover:bg-gray-100 rounded-full"
                    >
                        <Image
                            src="/arrow-left.svg"
                            alt="close"
                            width={20}
                            height={20}
                            className="object-contain"
                        />
                    </button>
                    <h2 className="text-xl font-semibold text-gray-800 ml-3">
                        Detail Orders
                    </h2>
                </div>

                {/* Body */}
                <div className="p-6 space-y-6">
                    {/* Order Info */}
                    <div>
                        <h3 className="text-lg font-semibold text-gray-700 mb-2">
                            New Order
                        </h3>
                        <div className="text-sm text-gray-600 space-y-1">
                            <p>
                                <span className="font-medium">Order ID:</span> #
                                {order.id}
                            </p>
                            <p>
                                <span className="font-medium">Buyer Name:</span>{" "}
                                {order.user.name}
                            </p>
                            <p>
                                <span className="font-medium">
                                    Buyer Email:
                                </span>{" "}
                                {order.user.email}
                            </p>
                            <p>
                                <span className="font-medium">
                                    Buyer Phone:
                                </span>{" "}
                                {order.user.phone}
                            </p>
                            <p>
                                <span className="font-medium">Order Date:</span>{" "}
                                {new Date(order.createdAt).toLocaleDateString(
                                    "en-US",
                                    {
                                        month: "long",
                                        day: "2-digit",
                                        year: "numeric",
                                        hour: "2-digit",
                                        minute: "2-digit",
                                    },
                                )}
                            </p>
                        </div>
                    </div>

                    {/* Product Detail */}
                    <div>
                        <h3 className="text-lg font-semibold text-gray-700 mb-2 border-b border-gray-200 pb-1">
                            Detail Product
                        </h3>
                        {order.items?.map((item) => {
                            const pricingItem = getPricingItem(item.variantId);
                            const baseUnitPrice =
                                pricingItem?.baseUnitPrice ??
                                Number(
                                    item.product.price || item.priceAtPurchase,
                                );
                            const finalUnitPrice =
                                pricingItem?.effectiveUnitPrice ??
                                Number(item.priceAtPurchase);
                            const itemDiscount = (
                                pricingItem?.adjustments ?? []
                            ).reduce(
                                (sum, adjustment) => sum + adjustment.amount,
                                0,
                            );

                            return (
                                <div
                                    key={item.id}
                                    className="rounded-lg p-3 mb-2 border border-gray-100"
                                >
                                    <div className="flex items-center gap-3">
                                        {item.product?.imageUrl && (
                                            <Image
                                                src={getImageUrl(
                                                    item.product.imageUrl,
                                                )}
                                                alt={item.product.title}
                                                width={60}
                                                height={60}
                                                className="rounded-md object-cover"
                                            />
                                        )}
                                        <div className="flex-1">
                                            <p className="font-medium text-gray-800">
                                                {item.product.title}
                                            </p>
                                            <p className="text-xs text-gray-500">
                                                {item.quantity}x item
                                            </p>
                                        </div>
                                        <div className="text-right text-sm text-gray-700">
                                            {baseUnitPrice !==
                                                finalUnitPrice && (
                                                <p className="text-gray-400 line-through">
                                                    {formatCurrency(
                                                        baseUnitPrice,
                                                    )}
                                                </p>
                                            )}
                                            <p className="font-medium">
                                                {item.quantity}x{" "}
                                                {formatCurrency(finalUnitPrice)}
                                            </p>
                                        </div>
                                    </div>

                                    {itemDiscount > 0 && (
                                        <div className="mt-3 rounded-md bg-green-50 px-3 py-2 text-sm text-green-700">
                                            <div className="flex justify-between">
                                                <span>Total discount item</span>
                                                <span>
                                                    -
                                                    {formatCurrency(
                                                        itemDiscount,
                                                    )}
                                                </span>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>

                    {/* Gift Note */}
                    {order.giftNote && (
                        <div className="bg-pink-50 border border-pink-200 rounded-lg p-4">
                            <div className="flex items-start gap-2">
                                <svg
                                    className="w-5 h-5 text-pink-600 flex-shrink-0 mt-0.5"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7"
                                    />
                                </svg>
                                <div className="flex-1">
                                    <p className="text-sm font-semibold text-pink-900 mb-1">
                                        Gift Note:
                                    </p>
                                    <p className="text-sm text-pink-800 italic">
                                        &quot;{order.giftNote}&quot;
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Shipping Detail */}
                    <div className="mb-3">
                        <h3 className="text-lg font-semibold text-gray-700 mb-2">
                            Detail Shipping
                        </h3>
                        <div className="text-sm text-gray-600 space-y-1">
                            <p>
                                <span className="font-medium">Courier:</span>{" "}
                                {order.courierCompany?.toUpperCase() || "N/A"}
                            </p>
                            <p>
                                <span className="font-medium">
                                    Byteship ID:
                                </span>{" "}
                                {order.bytestepShipmentId}
                            </p>
                            <p>
                                <span className="font-medium">
                                    Shipping Cost:{" "}
                                </span>{" "}
                                Rp{" "}
                                {Number(order.shippingCost || 0).toLocaleString(
                                    "id-ID",
                                )}
                            </p>

                            <div className="mt-2">
                                <p>{order.user?.name}</p>
                                <p>{order.user?.email}</p>
                                <p>{order.user?.phone || "-"}</p>

                                <p className="font-medium mt-4">Address:</p>
                                <p>{order.shippingAddress?.address}</p>
                                <p>{order.shippingAddress?.addressDetails}</p>
                                <p>
                                    {order.shippingAddress?.village},{" "}
                                    {order.shippingAddress?.district},{" "}
                                    {order.shippingAddress?.city},{" "}
                                    {order.shippingAddress?.province} -{" "}
                                    {order.shippingAddress?.postalCode}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Payment Details */}
                    <div>
                        <h3 className="text-lg font-semibold text-gray-700">
                            Payment Details
                        </h3>
                        <div className="text-sm text-gray-600 space-y-1">
                            <div className="flex justify-between">
                                <span>Initial Product Total</span>
                                <span>{formatCurrency(baseSubtotal)}</span>
                            </div>

                            {appliedPromotions.map((promotion) => (
                                <div
                                    key={`${promotion.id}-${promotion.stage}`}
                                    className="flex justify-between text-green-600 gap-4"
                                >
                                    <span className="flex items-center gap-2 flex-wrap">
                                        <span>Discount</span>
                                        <span className="bg-green-100 text-green-700 px-2 py-0.5 rounded text-xs font-medium">
                                            {promotion.code}
                                        </span>
                                        <span className="text-xs text-gray-500">
                                            {promotion.title} (
                                            {formatPromotionValue(promotion)})
                                        </span>
                                    </span>
                                    <span>
                                        -{formatCurrency(promotion.amount)}
                                    </span>
                                </div>
                            ))}

                            {totalDiscount > 0 && (
                                <div className="flex justify-between">
                                    <span>Product Total After Discount</span>
                                    <span>
                                        {formatCurrency(finalProductSubtotal)}
                                    </span>
                                </div>
                            )}

                            <div className="flex justify-between">
                                <span>Shipping Cost</span>
                                <span>{formatCurrency(shippingCost)}</span>
                            </div>

                            <div className="flex justify-between font-semibold text-gray-800 pt-2 border-t border-gray-200">
                                <span>Total Payment</span>
                                <span>{formatCurrency(totalPayment)}</span>
                            </div>
                        </div>
                    </div>

                    {/* Action */}
                    <div>
                        <AcceptOrderButton
                            orderId={order.id}
                            status={order.status.toUpperCase()}
                            onAccepted={(id) => {
                                onAccepted(id);
                            }}
                            onClose={onClose}
                            trackingLink={
                                Array.isArray(order.tracking)
                                    ? order.tracking[0]?.trackingLink
                                    : undefined
                            }
                            fullWidth
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}
