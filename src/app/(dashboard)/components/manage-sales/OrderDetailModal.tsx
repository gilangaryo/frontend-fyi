'use client'

import Image from "next/image"
import { useRef, useEffect } from "react"
import { getImageUrl } from "@/lib/utils"
import type { OrderApi } from "@/types/order"
import AcceptOrderButton from "./AcceptOrderButton"

interface OrderDetailModalProps {
    order: OrderApi
    onClose: () => void
    onAccepted: (id: string) => void
}

export default function OrderDetailModal({ order, onClose, onAccepted }: OrderDetailModalProps) {
    const modalRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
                onClose()
            }
        }
        document.addEventListener("mousedown", handleClickOutside)
        return () => document.removeEventListener("mousedown", handleClickOutside)
    }, [onClose])

    const totalPrice = (order.items ?? []).reduce(
        (sum, item) => sum + Number(item.priceAtPurchase) * item.quantity,
        0
    )

    const discountAmount = order.discount
        ? (order.discount.type === 'PERCENT'
            ? (totalPrice * Number(order.discount.value)) / 100
            : Number(order.discount.value))
        : 0

    const totalAfterDiscount = totalPrice - discountAmount
    const totalSales = totalAfterDiscount + Number(order.shippingCost || 0)


    return (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
            <div
                ref={modalRef}
                className="bg-white rounded-xl shadow-lg w-full max-w-2xl overflow-y-auto max-h-[95vh]"
            >
                {/* Header */}
                <div className="flex justify-left items-center border-b border-gray-200 px-6 py-4">
                    <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded-full">
                        <Image
                            src="/arrow-left.svg"
                            alt="close"
                            width={20}
                            height={20}
                            className="object-contain"
                        />
                    </button>
                    <h2 className="text-xl font-semibold text-gray-800 ml-3">Detail Orders</h2>
                </div>

                {/* Body */}
                <div className="p-6 space-y-6">
                    {/* Order Info */}
                    <div>
                        <h3 className="text-lg font-semibold text-gray-700 mb-2">New Order</h3>
                        <div className="text-sm text-gray-600 space-y-1">
                            <p><span className="font-medium">Order ID:</span> #{order.id}</p>
                            <p><span className="font-medium">Buyer Name:</span> {order.user.name}</p>
                            <p><span className="font-medium">Buyer Email:</span> {order.user.email}</p>
                            <p><span className="font-medium">Buyer Phone:</span> {order.user.phone}</p>
                            <p>
                                <span className="font-medium">Order Date:</span>{" "}
                                {new Date(order.createdAt).toLocaleDateString("en-US", {
                                    month: "long",
                                    day: "2-digit",
                                    year: "numeric",
                                    hour: "2-digit",
                                    minute: "2-digit",
                                })}
                            </p>
                        </div>
                    </div>

                    {/* Product Detail */}
                    <div>
                        <h3 className="text-lg font-semibold text-gray-700 mb-2 border-b border-gray-200 pb-1">
                            Detail Product
                        </h3>
                        {order.items?.map((item) => (
                            <div key={item.id} className="flex items-center gap-3 rounded-lg p-3 mb-2">
                                {item.product?.imageUrl && (
                                    <Image
                                        src={getImageUrl(item.product.imageUrl)}
                                        alt={item.product.title}
                                        width={60}
                                        height={60}
                                        className="rounded-md object-cover"
                                    />
                                )}
                                <div className="flex-1">
                                    <p className="font-medium text-gray-800">{item.product.title}</p>
                                </div>
                                <p className="text-sm font-medium text-gray-700">
                                    {item.quantity}x Rp {Number(item.priceAtPurchase).toLocaleString("id-ID")}
                                </p>
                            </div>
                        ))}
                    </div>

                    {/* Gift Note */}
                    {order.giftNote && (
                        <div className="bg-pink-50 border border-pink-200 rounded-lg p-4">
                            <div className="flex items-start gap-2">
                                <svg className="w-5 h-5 text-pink-600 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7" />
                                </svg>
                                <div className="flex-1">
                                    <p className="text-sm font-semibold text-pink-900 mb-1">Gift Note:</p>
                                    <p className="text-sm text-pink-800 italic">&quot;{order.giftNote}&quot;</p>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Shipping Detail */}
                    <div className="mb-3">
                        <h3 className="text-lg font-semibold text-gray-700 mb-2">Detail Shipping</h3>
                        <div className="text-sm text-gray-600 space-y-1">
                            <p><span className="font-medium">Courier:</span> {order.courierCompany?.toUpperCase() || "N/A"}</p>
                            <p><span className="font-medium">Byteship ID:</span> {order.bytestepShipmentId}</p>
                            <p><span className="font-medium">Shipping Cost: </span> Rp {Number(order.shippingCost || 0).toLocaleString("id-ID")}</p>

                            <div className="mt-2">
                                <p>{order.user?.name}</p>
                                <p>{order.user?.email}</p>
                                <p>{order.user?.phone || "-"}</p>

                                <p className="font-medium mt-4">Address:</p>
                                <p>{order.shippingAddress?.address}</p>
                                <p>{order.shippingAddress?.addressDetails}</p>
                                <p>
                                    {order.shippingAddress?.village}, {order.shippingAddress?.district},{" "}
                                    {order.shippingAddress?.city}, {order.shippingAddress?.province} -{" "}
                                    {order.shippingAddress?.postalCode}
                                </p>

                            </div>
                        </div>
                    </div>

                    {/* Payment Details */}
                    <div>
                        <h3 className="text-lg font-semibold text-gray-700">Payment Details</h3>
                        <div className="text-sm text-gray-600 space-y-1">
                            <div className="flex justify-between">
                                <span>Total Product</span>
                                <span>Rp {totalPrice.toLocaleString("id-ID")}</span>
                            </div>

                            {order.discount && discountAmount > 0 && (
                                <div className="flex justify-between text-green-600">
                                    <span className="flex items-center gap-2">
                                        <span>Discount</span>
                                        <span className="bg-green-100 text-green-700 px-2 py-0.5 rounded text-xs font-medium">
                                            {order.discount.code}
                                        </span>
                                        <span className="text-xs text-gray-500">
                                            ({order.discount.type === 'PERCENT' ? `${order.discount.value}%` : `IDR ${Number(order.discount.value).toLocaleString('id-ID')}`})
                                        </span>
                                    </span>
                                    <span>-Rp {discountAmount.toLocaleString("id-ID")}</span>
                                </div>
                            )}



                            <div className="flex justify-between font-semibold text-gray-800 pt-2 border-t border-gray-200">
                                <span>Total Sales</span>
                                <span>Rp {totalSales.toLocaleString("id-ID")}</span>
                            </div>
                        </div>
                    </div>

                    {/* Action */}
                    <div>
                        <AcceptOrderButton
                            orderId={order.id}
                            status={order.status.toUpperCase()}
                            onAccepted={(id) => {
                                onAccepted(id)
                            }}
                            onClose={onClose}
                            trackingLink={Array.isArray(order.tracking) ? order.tracking[0]?.trackingLink : undefined}
                            fullWidth
                        />
                    </div>
                </div>
            </div>
        </div>
    )
}