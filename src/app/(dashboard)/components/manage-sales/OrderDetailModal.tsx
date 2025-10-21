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
    const totalSales = totalPrice + Number(order.shippingCost || 0)

    const responseDeadline = new Date(
        new Date(order.createdAt).getTime() + 24 * 60 * 60 * 1000
    ).toLocaleString("en-US", {
        day: "2-digit",
        month: "long",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
    })

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
                            <p className="flex items-center gap-2">
                                <span className="font-medium">Response Deadline:</span>
                                <span className="bg-yellow-400/20 text-yellow-700 px-2 py-0.5 rounded text-xs font-medium">
                                    {responseDeadline}
                                </span>
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

                    {/* Shipping Detail */}
                    <div>
                        <h3 className="text-lg font-semibold text-gray-700 mb-2">Detail Shipping</h3>
                        <div className="text-sm text-gray-600 space-y-1">
                            <p><span className="font-medium">Courier:</span> {order.courierCompany?.toUpperCase() || "N/A"}</p>
                            <div className="mt-2">
                                <p className="font-medium">Address:</p>
                                <p>{order.user?.name}</p>
                                <p>{order.user?.email}</p>
                                <p>{order.user?.phone || "-"}</p>
                                <p>{order.shippingAddress?.addressLine || "Jl. Sagan, Terban Yogyakarta City, Indonesia 5520"}</p>
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
                            <div className="flex justify-between mb-2">
                                <span>Total Shipping</span>
                                <span>Rp {Number(order.shippingCost || 0).toLocaleString("id-ID")}</span>
                            </div>
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
                            status={order.status}
                            onAccepted={(id) => {
                                onAccepted(id)
                                setTimeout(onClose, 1000)
                            }}
                            fullWidth
                        />
                    </div>
                </div>
            </div>
        </div>
    )
}
