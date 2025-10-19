'use client'

import { getImageUrl } from "@/lib/utils"
import Image from "next/image"

interface Order {
    id: string
    customer: string
    product: string
    productImage: string
    location: string
    shipping: string
    createdAt: string
    status: string
    paymentStatus: string
}

export default function OrderCard({ order }: { order: Order }) {
    const paymentColor =
        order.paymentStatus === "PAID"
            ? "bg-green-100 text-green-700"
            : order.paymentStatus === "PENDING"
                ? "bg-yellow-100 text-yellow-700"
                : "bg-red-100 text-red-700"

    const orderColor =
        order.status === "NEW"
            ? "bg-sky-100 text-sky-700"
            : order.status === "PACKED"
                ? "bg-blue-100 text-blue-700"
                : order.status === "SHIPPED"
                    ? "bg-indigo-100 text-indigo-700"
                    : order.status === "DELIVERED" || order.status === "COMPLETED"
                        ? "bg-green-100 text-green-700"
                        : order.status === "CANCELLED"
                            ? "bg-red-100 text-red-700"
                            : "bg-gray-100 text-gray-600"

    return (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4 flex flex-col justify-between hover:shadow-md transition cursor-pointer">
            {/* Header */}
            <div className="flex justify-between items-start border-b border-gray-100 pb-3">
                <div className="border-l-4 border-primary-studio pl-3">
                    <h3 className="font-semibold text-gray-900 text-base">{order.product}</h3>
                    <p className="text-sm text-gray-500">#{order.id}</p>
                    <p className="text-sm text-gray-700 font-medium">{order.customer}</p>
                </div>

                <div className="text-right space-y-1">
                    <span className={`text-xs px-2 py-1 rounded ${paymentColor}`}>{order.paymentStatus}</span><br />
                    <span className={`text-xs px-2 py-1 rounded ${orderColor}`}>{order.status}</span>
                </div>
            </div>

            {/* Product Info */}
            <div className="flex items-center gap-3 border-t border-gray-100 pt-3 mt-3">
                <Image
                    src={getImageUrl(order.productImage)}
                    alt={order.product}
                    width={48}
                    height={64}
                    className="rounded-md object-cover"
                />
                <div>
                    <p className="text-sm font-medium text-gray-800">{order.product}</p>
                    <p className="text-xs text-gray-500">{order.location}</p>
                    <p className="text-xs text-gray-400">Created {new Date(order.createdAt).toLocaleDateString("en-US", {
                        month: "long",
                        day: "2-digit",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                    })}</p>
                </div>
            </div>

            {/* Footer */}
            <div className="flex justify-between items-center border-t border-gray-100 mt-4 pt-3">
                <div className="flex flex-col gap-1 text-xs text-gray-500">
                    <div className="flex items-center gap-2">
                        <Image src="/dashboard/icons/truck.svg" alt="shipping" width={16} height={16} />
                        <span>{order.shipping}</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <Image src="/dashboard/icons/location.svg" alt="location" width={16} height={16} />
                        <span>{order.location}</span>
                    </div>
                </div>

                <button
                    disabled={order.status !== "NEW"}
                    className={`${order.status === "NEW"
                        ? "bg-sky-500 hover:bg-sky-600 text-white"
                        : "bg-gray-200 text-gray-500 cursor-not-allowed"
                        } text-sm font-medium px-4 py-2 rounded-md transition`}
                >
                    {order.status === "NEW" ? "Accept Order" : "Processed"}
                </button>
            </div>
        </div>
    )
}
