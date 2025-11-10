'use client'
import Image from "next/image"
import { getImageUrl } from "@/lib/utils"
import AcceptOrderButton from "./AcceptOrderButton"

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
    trackingLink: string
}

export default function OrderCard({
    order,
    onAccepted,
}: { order: Order; onAccepted: (id: string) => void }) {

    // const paymentColor =
    //     order.paymentStatus === "PAID"
    //         ? "bg-green-100 text-green-700"
    //         : order.paymentStatus === "PENDING"
    //             ? "bg-yellow-100 text-yellow-700"
    //             : "bg-red-100 text-red-700"

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
        <div className="h-full bg-white rounded-xl border border-gray-200 shadow-sm p-4 flex flex-col hover:shadow-md transition cursor-pointer">
            {/* Header */}
            <div className="flex justify-between items-start border-b border-gray-100 pb-3">
                <div className="border-l-4 border-primary-studio pl-3 flex-1 min-w-0">
                    <h3 className="font-semibold text-gray-900 text-base truncate">{order.product}</h3>
                    <p className="text-sm text-gray-500 truncate">#{order.id}</p>
                    <p className="text-sm text-gray-700 font-medium truncate">{order.customer}</p>
                </div>

                <div className="text-right space-y-1 flex-shrink-0 ml-2">
                    {/* <span className={`text-xs px-2 py-1 rounded whitespace-nowrap ${paymentColor}`}>
                        {order.paymentStatus}
                    </span> */}
                    {/* <br /> */}
                    <span className={`text-xs px-2 py-1 rounded whitespace-nowrap ${orderColor}`}>
                        {order.status}
                    </span>
                </div>
            </div>

            {/* Product Info - Flex-grow untuk push footer ke bawah */}
            <div className="flex items-center gap-3 border-t border-gray-100 pt-3 mt-3 flex-grow">
                <Image
                    src={getImageUrl(order.productImage)}
                    alt={order.product}
                    width={48}
                    height={64}
                    className="rounded-md object-cover flex-shrink-0"
                />
                <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-800 truncate">{order.product}</p>
                    <p className="text-xs text-gray-500 truncate">{order.location}</p>
                    <p className="text-xs text-gray-400">
                        Created {new Date(order.createdAt).toLocaleDateString("en-US", {
                            month: "short",
                            day: "2-digit",
                            year: "numeric",
                        })}
                    </p>
                </div>
            </div>

            {/* Footer - Always at bottom */}
            <div className="flex justify-between items-center border-t border-gray-100 mt-4 pt-3">
                <div className="flex flex-col gap-1 text-xs text-gray-500">
                    <div className="flex items-center gap-2">
                        <Image src="/dashboard/icons/truck.svg" alt="shipping" width={16} height={16} />
                        <span className="truncate">{order.shipping}</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <Image src="/dashboard/icons/location.svg" alt="location" width={16} height={16} />
                        <span className="truncate">{order.location}</span>
                    </div>
                </div>

                <div className="text-right flex-shrink-0 ml-2" onClick={(e) => e.stopPropagation()}>
                    <AcceptOrderButton
                        orderId={order.id}
                        status={order.status.toUpperCase()}
                        onAccepted={onAccepted}
                        trackingLink={order.trackingLink}
                    />
                </div>
            </div>
        </div>
    )
}