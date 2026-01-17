"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import StatsCard from "../components/StatsCard";
import DateFilter, { DateFilterOption } from "../components/DateFilter";
import { API_BASE } from "@/lib/constants";
import { getImageUrl } from "@/lib/utils";
import MembershipTable from "../components/MembershipTable";

interface Product {
    id: string;
    title: string;
    collection?: { title: string };
    price: string;
    stock: number;
    imageUrl: string;
}

interface Order {
    id: string;
    customer: string;
    total: number;
    status: string;
    user: {
        name: string;
    };
}

export default function DashboardPage() {
    const [activeTab, setActiveTab] = useState<
        "product" | "orders" | "membership"
    >("product");
    const [dateFilter, setDateFilter] = useState<DateFilterOption>("today");

    const [products, setProducts] = useState<Product[]>([]);
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);
    const [summary, setSummary] = useState({
        totalOrders: 0,
        totalRevenue: 0,
        totalProducts: 0,
        orderChange: 0,
        revenueChange: 0,
        productChange: 0,
    });
    const [userName, setUserName] = useState<string | null>(null);

    const fetchDashboardData = useCallback(async () => {
        try {
            setLoading(true);

            const token = localStorage.getItem("token");
            if (!token) throw new Error("Unauthorized — token not found");

            const headers = {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
            };

            const [summaryRes, prodRes, orderRes] = await Promise.all([
                fetch(`${API_BASE}/dashboard/summary?period=${dateFilter}`, {
                    headers,
                    cache: "no-store",
                }),
                fetch(
                    `${API_BASE}/products?limit=10&sortBy=stock&sortOrder=asc`,
                    {
                        headers,
                        cache: "no-store",
                    }
                ),
                fetch(
                    `${API_BASE}/orders?page=1&limit=5&period=${dateFilter}`,
                    {
                        headers,
                        cache: "no-store",
                    }
                ),
            ]);

            if (summaryRes.status === 401) {
                localStorage.removeItem("token");
                localStorage.removeItem("user");
                document.cookie = "token=; path=/; max-age=0;";
                window.location.href = "/login";
                return;
            }

            const [summaryJson, prodJson, orderJson] = await Promise.all([
                summaryRes.json(),
                prodRes.json(),
                orderRes.json(),
            ]);

            if (summaryJson.success && summaryJson.data)
                setSummary(summaryJson.data);

            if (prodJson.success && Array.isArray(prodJson.data)) {
                const mappedProducts = prodJson.data.map((p: Product) => ({
                    id: p.id,
                    title: p.title,
                    collection: p.collection,
                    price: p.price,
                    stock: p.stock,
                    imageUrl: `${API_BASE}${p.imageUrl}`,
                }));
                setProducts(mappedProducts);
            }

            if (orderJson.success && Array.isArray(orderJson.data)) {
                const mappedOrders = orderJson.data.map((o: Order) => ({
                    id: o.id,
                    customer: o.user.name,
                    total: o.total,
                    status: o.status,
                }));
                setOrders(mappedOrders);
            }
        } catch (err) {
            console.error("⚠️ Failed to fetch dashboard data:", err);
        } finally {
            setLoading(false);
        }
    }, [dateFilter]);

    useEffect(() => {
        fetchDashboardData();
    }, [fetchDashboardData]);

    useEffect(() => {
        try {
            const stored = localStorage.getItem("user");
            if (stored) {
                const parsed = JSON.parse(stored);
                setUserName(parsed?.name || null);
            }
        } catch (e) {
            // ignore
        }
    }, []);

    // Helper untuk mendapatkan label subtitle berdasarkan filter
    const getSubtitleLabel = () => {
        const labels: Record<DateFilterOption, string> = {
            today: "Today",
            yesterday: "Yesterday",
            this_week: "This week",
            last_week: "Last week",
            last_30_days: "Last 30 days",
            last_60_days: "Last 60 days",
        };
        return labels[dateFilter];
    };

    return (
        <div className="min-h-screen p-2">
            {/* Header */}
            <div>
                <h1 className="text-2xl font-semibold">
                    Good Morning, {userName || "Moni"}!
                </h1>
                <p className="text-gray-500">
                    Start your daily by checking today&apos;s tasks and updates.
                </p>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
                <StatsCard
                    title="Total Order"
                    subtitle={getSubtitleLabel()}
                    value={summary.totalOrders.toString()}
                    change={`${summary.orderChange > 0 ? "+" : ""}${
                        summary.orderChange
                    }%`}
                    changeType={summary.orderChange >= 0 ? "up" : "down"}
                    icon="/dashboard/home/total-order.svg"
                />
                <StatsCard
                    title="Total Revenue"
                    subtitle={getSubtitleLabel()}
                    value={
                        "Rp " +
                        Number(summary.totalRevenue || 0).toLocaleString(
                            "id-ID"
                        )
                    }
                    change={`${summary.revenueChange > 0 ? "+" : ""}${
                        summary.revenueChange
                    }%`}
                    changeType={summary.revenueChange >= 0 ? "up" : "down"}
                    icon="/dashboard/home/total-revenue.svg"
                />
                <StatsCard
                    title="Total Product"
                    subtitle="Active inventory"
                    value={summary.totalProducts.toString()}
                    change={`${summary.productChange > 0 ? "+" : ""}${
                        summary.productChange
                    }%`}
                    changeType={summary.productChange >= 0 ? "up" : "down"}
                    icon="/dashboard/home/total-reservation.svg"
                />
            </div>

            <div className="flex items-center justify-between py-5 rounded-lg">
                <div className="flex items-center gap-6">
                    <h2 className="text-2xl font-semibold">Activity</h2>
                    <DateFilter value={dateFilter} onChange={setDateFilter} />
                </div>
                <a
                    href="/dashboard/profile#reports"
                    className="text-primary-studio text-sm"
                >
                    Download Report →
                </a>
            </div>

            {/* Rest of the component remains the same... */}
            {/* Today Activity */}
            <div>
                {/* Tabs */}
                <div className="flex gap-8 mt-4 border-b border-gray-200">
                    <button
                        onClick={() => setActiveTab("product")}
                        className={`pb-2 ${
                            activeTab === "product"
                                ? "text-primary-studio font-medium border-b-2 border-primary-studio"
                                : "text-gray-500"
                        }`}
                    >
                        Add Product
                    </button>
                    <button
                        onClick={() => setActiveTab("orders")}
                        className={`pb-2 ${
                            activeTab === "orders"
                                ? "text-primary-studio font-medium border-b-2 border-primary-studio"
                                : "text-gray-500"
                        }`}
                    >
                        Orders
                    </button>
                    <button
                        onClick={() => setActiveTab("membership")}
                        className={`pb-2 ${
                            activeTab === "membership"
                                ? "text-primary-studio font-medium border-b-2 border-primary-studio"
                                : "text-gray-500"
                        }`}
                    >
                        Membership
                    </button>
                </div>

                {/* Table content... sama seperti sebelumnya */}
                <div className="overflow-x-auto mt-4">
                    {loading ? (
                        <div className="text-center text-gray-400 py-16">
                            Loading data...
                        </div>
                    ) : activeTab === "product" ? (
                        <table className="w-full rounded-t-xl overflow-hidden">
                            {/* ... product table content */}
                            <thead>
                                <tr className="bg-primary-studio text-white text-left">
                                    <th className="p-3">Product</th>
                                    <th className="p-3">Price</th>
                                    <th className="p-3">Stock</th>
                                    <th className="p-3">Status</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white">
                                {products.map((p) => (
                                    <tr key={p.id}>
                                        <td className="p-3 flex items-center gap-3">
                                            <Image
                                                src={getImageUrl(p.imageUrl)}
                                                alt={p.title}
                                                width={40}
                                                height={40}
                                                className="object-cover"
                                            />
                                            <div>
                                                <p className="font-medium">
                                                    {p.title}
                                                </p>
                                                <p className="text-sm text-gray-500">
                                                    {p.collection?.title || "-"}
                                                </p>
                                            </div>
                                        </td>
                                        <td className="p-3">
                                            Rp{" "}
                                            {Number(p.price).toLocaleString(
                                                "id-ID"
                                            )}
                                        </td>
                                        <td className="p-3">{p.stock}</td>
                                        <td>
                                            {p.stock > 10 ? (
                                                <span className="bg-green-100 text-green-600 px-3 py-1 text-xs rounded-full">
                                                    Enough Stock
                                                </span>
                                            ) : p.stock > 0 ? (
                                                <span className="bg-orange-100 text-orange-600 px-3 py-1 text-xs rounded-full">
                                                    Almost Out
                                                </span>
                                            ) : (
                                                <span className="bg-red-100 text-red-600 px-3 py-1 text-xs rounded-full">
                                                    Out of Stock
                                                </span>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    ) : activeTab === "orders" ? (
                        <table className="w-full rounded-t-xl overflow-hidden">
                            {/* ... orders table content */}
                            <thead>
                                <tr className="bg-sky-400 text-white text-left">
                                    <th className="p-3">Order No</th>
                                    <th className="p-3">Customer</th>
                                    <th className="p-3">Total</th>
                                    <th className="p-3">Status</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white">
                                {orders.map((o) => (
                                    <tr key={o.id}>
                                        <td className="p-3">{o.id}</td>
                                        <td className="p-3">{o.customer}</td>
                                        <td className="p-3">
                                            Rp{" "}
                                            {Number(o.total).toLocaleString(
                                                "id-ID"
                                            )}
                                        </td>
                                        <td className="p-3">
                                            <span
                                                className={`text-sm ${
                                                    o.status === "NEW"
                                                        ? "text-green-600"
                                                        : o.status === "SHIPPED"
                                                        ? "text-sky-500"
                                                        : "text-gray-600"
                                                }`}
                                            >
                                                ● {o.status}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    ) : (
                        <MembershipTable />
                    )}
                </div>

                {/* Footer link */}
                <div className="flex justify-end mt-4">
                    {activeTab !== "membership" && (
                        <div className="flex justify-end mt-4">
                            <a
                                href={
                                    activeTab === "orders"
                                        ? "/dashboard/manage-sales"
                                        : "/dashboard/product"
                                }
                                className="text-primary-studio text-sm flex items-center gap-1"
                            >
                                {activeTab === "orders"
                                    ? "See all Orders"
                                    : "View All Product"}{" "}
                                →
                            </a>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
