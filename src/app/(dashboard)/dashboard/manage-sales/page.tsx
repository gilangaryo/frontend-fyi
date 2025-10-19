'use client'

import { useState, useEffect } from "react"
import { API_BASE } from "@/lib/constants"
import OrderCard from "../../components/manage-sales/OrderCard"
import OrderDetailModal from "../../components/manage-sales/OrderDetailModal"
import type { OrderApi, OrderCardData } from "@/types/order"

type TabKey = 'all' | 'new' | 'draft' | 'packed' | 'shipped' | 'delivered' | 'cancelled'

export default function ManageSalesPage() {
    const [activeTab, setActiveTab] = useState<TabKey>('all')
    const [orders, setOrders] = useState<OrderCardData[]>([])
    const [loading, setLoading] = useState(true)
    const [page, setPage] = useState(1)
    const [totalPages, setTotalPages] = useState(1)
    const [selectedOrder, setSelectedOrder] = useState<OrderApi | null>(null)

    useEffect(() => {
        fetchOrders(page, activeTab)
    }, [page, activeTab])

    async function fetchOrders(page: number, status: TabKey) {
        try {
            setLoading(true)
            const query = new URLSearchParams({
                page: String(page),
                limit: "6",
                ...(status !== "all" ? { status } : {}),
            }).toString()

            const res = await fetch(`${API_BASE}/orders?${query}`, { cache: "no-store" })
            const json = await res.json()

            if (json.success && Array.isArray(json.data)) {
                const mapped: OrderCardData[] = json.data.map((o: OrderApi) => ({
                    id: o.id,
                    customer: o.user?.name || "Guest",
                    product: o.items?.[0]?.product?.title || "No Product",
                    productImage: o.items?.[0]?.product?.imageUrl,
                    location: o.user?.city || "Unknown City",
                    shipping: o.courierCompany?.toUpperCase() || "N/A",
                    createdAt: o.createdAt,
                    status: o.status,
                    paymentStatus: o.payments?.[0]?.status || "PENDING",
                }))

                setOrders(mapped)
                setTotalPages(json.pagination?.totalPages || 1)
            } else {
                setOrders([])
                console.error("❌ Failed to fetch orders:", json.message)
            }
        } catch (err) {
            console.error("⚠️ Error fetching orders:", err)
        } finally {
            setLoading(false)
        }
    }

    const tabs = [
        { key: "all", label: "All" },
        { key: "new", label: "New" },
        { key: "draft", label: "Draft" },
        { key: "packed", label: "Packed" },
        { key: "shipped", label: "Shipped" },
        { key: "delivered", label: "Delivered" },
        { key: "cancelled", label: "Cancelled" },
    ]

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-semibold text-gray-800">Manage Sales</h1>
            </div>

            {/* Tabs */}
            <div className="flex gap-3 border-b border-gray-200 pb-2 overflow-x-auto">
                {tabs.map(tab => (
                    <button
                        key={tab.key}
                        onClick={() => { setActiveTab(tab.key as TabKey); setPage(1) }}
                        className={`px-4 py-2 rounded-md text-sm whitespace-nowrap transition-all duration-200 
              ${activeTab === tab.key
                                ? "bg-primary-studio/10 text-primary-studio border border-primary-studio"
                                : "bg-gray-100 text-gray-500 hover:bg-gray-200"
                            }`}
                    >
                        {tab.label}
                    </button>
                ))}
            </div>

            {/* Orders */}
            {loading ? (
                <div className="text-center text-gray-400 py-20">Loading orders...</div>
            ) : orders.length > 0 ? (
                <>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {orders.map(order => (
                            <div key={order.id} onClick={() => setSelectedOrder(order as unknown as OrderApi)}>
                                <OrderCard order={order} />
                            </div>
                        ))}
                    </div>

                    {/* Pagination */}
                    <div className="flex justify-center items-center gap-4 mt-8">
                        <button
                            disabled={page === 1}
                            onClick={() => setPage(p => Math.max(1, p - 1))}
                            className="px-4 py-2 bg-primary-studio text-white rounded disabled:opacity-50"
                        >
                            Prev
                        </button>
                        <span className="text-sm text-gray-600">
                            Page {page} of {totalPages}
                        </span>
                        <button
                            disabled={page === totalPages}
                            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                            className="px-4 py-2 bg-primary-studio text-white rounded disabled:opacity-50"
                        >
                            Next
                        </button>
                    </div>
                </>
            ) : (
                <div className="text-center text-gray-400 py-20">No orders found.</div>
            )}

            {/* Detail Modal */}
            {selectedOrder && (
                <OrderDetailModal order={selectedOrder} onClose={() => setSelectedOrder(null)} />
            )}
        </div>
    )
}
