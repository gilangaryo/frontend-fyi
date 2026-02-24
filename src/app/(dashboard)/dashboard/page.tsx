"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import { Package, ShoppingCart, Users, ArrowRight } from "lucide-react";
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

const tabs = [
    { key: "product" as const, label: "Product", icon: Package },
    { key: "orders" as const, label: "Orders", icon: ShoppingCart },
    { key: "membership" as const, label: "Membership", icon: Users },
];

export default function DashboardPage() {
    const [activeTab, setActiveTab] = useState<"product" | "orders" | "membership">("product");
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
                fetch(`${API_BASE}/dashboard/summary?period=${dateFilter}`, { headers, cache: "no-store" }),
                fetch(`${API_BASE}/products?limit=10&sortBy=stock&sortOrder=asc`, { headers, cache: "no-store" }),
                fetch(`${API_BASE}/orders?page=1&limit=5&period=${dateFilter}`, { headers, cache: "no-store" }),
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

            if (summaryJson.success && summaryJson.data) setSummary(summaryJson.data);

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
        } catch {
            // ignore
        }
    }, []);

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

    const stockBadge = (stock: number) => {
        if (stock > 10)
            return (
                <span className="inline-flex items-center bg-emerald-50 text-emerald-600 border border-emerald-200 px-2.5 py-0.5 text-[11px] font-medium rounded-full whitespace-nowrap">
                    In Stock
                </span>
            );
        if (stock > 0)
            return (
                <span className="inline-flex items-center bg-amber-50 text-amber-600 border border-amber-200 px-2.5 py-0.5 text-[11px] font-medium rounded-full whitespace-nowrap">
                    Low Stock
                </span>
            );
        return (
            <span className="inline-flex items-center bg-red-50 text-red-600 border border-red-200 px-2.5 py-0.5 text-[11px] font-medium rounded-full whitespace-nowrap">
                Out of Stock
            </span>
        );
    };

    const orderStatusBadge = (status: string) => {
        const styles: Record<string, string> = {
            NEW: "bg-emerald-50 text-emerald-600 border-emerald-200",
            SHIPPED: "bg-sky-50 text-sky-600 border-sky-200",
            DELIVERED: "bg-violet-50 text-violet-600 border-violet-200",
            CANCELLED: "bg-red-50 text-red-600 border-red-200",
        };
        const style = styles[status] || "bg-gray-50 text-gray-600 border-gray-200";
        return (
            <span className={`inline-flex items-center border px-2.5 py-0.5 text-[11px] font-medium rounded-full ${style}`}>
                {status}
            </span>
        );
    };

    /* ── Skeleton rows ── */
    const SkeletonCards = ({ count = 5 }: { count?: number }) => (
        <div className="flex flex-col gap-2.5 sm:hidden">
            {Array.from({ length: count }).map((_, i) => (
                <div key={i} className="bg-white rounded-xl p-3.5 flex items-center gap-3 border border-gray-100 animate-pulse">
                    <div className="w-11 h-11 rounded-lg bg-gray-200 shrink-0" />
                    <div className="flex-1 flex flex-col gap-2">
                        <div className="h-3.5 w-3/4 bg-gray-200 rounded" />
                        <div className="h-2.5 w-1/2 bg-gray-100 rounded" />
                    </div>
                    <div className="h-5 w-16 bg-gray-200 rounded-full" />
                </div>
            ))}
        </div>
    );

    const SkeletonTable = ({ cols = 4, rows = 5 }: { cols?: number; rows?: number }) => (
        <div className="hidden sm:block overflow-x-auto">
            <table className="w-full">
                <thead>
                    <tr className="bg-primary-studio text-white text-left text-sm">
                        {Array.from({ length: cols }).map((_, i) => (
                            <th key={i} className="p-3">
                                <div className="h-3.5 w-20 bg-white/20 rounded" />
                            </th>
                        ))}
                    </tr>
                </thead>
                <tbody className="bg-white">
                    {Array.from({ length: rows }).map((_, i) => (
                        <tr key={i} className="border-t border-gray-50">
                            {Array.from({ length: cols }).map((_, j) => (
                                <td key={j} className="p-3">
                                    <div className={`h-3.5 bg-gray-200 animate-pulse rounded ${j === 0 ? "w-36" : "w-20"}`} />
                                </td>
                            ))}
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );

    return (
        <div className="min-h-screen p-2 sm:p-4">
            {/* Header */}
            <div className="mb-6">
                <h1 className="text-xl sm:text-2xl font-bold text-gray-900">
                    Good Morning, {userName || "Moni"}!
                </h1>
                <p className="text-gray-400 text-sm mt-0.5">
                    Start your daily by checking today&apos;s tasks and updates.
                </p>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <StatsCard
                    title="Total Order"
                    subtitle={getSubtitleLabel()}
                    value={summary.totalOrders.toString()}
                    change={`${summary.orderChange > 0 ? "+" : ""}${summary.orderChange}%`}
                    changeType={summary.orderChange >= 0 ? "up" : "down"}
                    icon="/dashboard/home/total-order.svg"
                />
                <StatsCard
                    title="Total Revenue"
                    subtitle={getSubtitleLabel()}
                    value={"Rp " + Number(summary.totalRevenue || 0).toLocaleString("id-ID")}
                    change={`${summary.revenueChange > 0 ? "+" : ""}${summary.revenueChange}%`}
                    changeType={summary.revenueChange >= 0 ? "up" : "down"}
                    icon="/dashboard/home/total-revenue.svg"
                />
                <StatsCard
                    title="Total Product"
                    subtitle="Active inventory"
                    value={summary.totalProducts.toString()}
                    change={`${summary.productChange > 0 ? "+" : ""}${summary.productChange}%`}
                    changeType={summary.productChange >= 0 ? "up" : "down"}
                    icon="/dashboard/home/total-reservation.svg"
                />
            </div>

            {/* Activity section */}
            <div className="mt-8">
                {/* Activity header */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-5">
                    <div className="flex items-center gap-3">
                        <h2 className="text-lg sm:text-xl font-bold text-gray-900">Activity</h2>
                        <DateFilter value={dateFilter} onChange={setDateFilter} />
                    </div>
                    <a
                        href="/dashboard/profile#reports"
                        className="text-primary-studio text-sm font-medium self-start sm:self-auto hover:underline flex items-center gap-1"
                    >
                        Download Report <ArrowRight size={14} />
                    </a>
                </div>

                {/* Card container */}
                <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
                    {/* Tabs */}
                    <div className="flex border-b border-gray-100 overflow-x-auto">
                        {tabs.map((tab) => {
                            const Icon = tab.icon;
                            const isActive = activeTab === tab.key;
                            return (
                                <button
                                    key={tab.key}
                                    onClick={() => setActiveTab(tab.key)}
                                    className={`flex items-center gap-2 px-5 py-3.5 text-sm font-medium whitespace-nowrap shrink-0 border-b-2 transition-colors ${
                                        isActive
                                            ? "text-primary-studio border-primary-studio bg-primary-studio/5"
                                            : "text-gray-400 border-transparent hover:text-gray-600 hover:bg-gray-50"
                                    }`}
                                >
                                    <Icon size={16} />
                                    {tab.label}
                                </button>
                            );
                        })}
                    </div>

                    {/* Content */}
                    <div className="p-4 sm:p-5">
                        {/* ── SKELETON ── */}
                        {loading && (
                            <>
                                <SkeletonCards />
                                <SkeletonTable />
                            </>
                        )}

                        {/* ── PRODUCT TAB ── */}
                        {!loading && activeTab === "product" && (
                            <>
                                {/* Mobile: cards */}
                                <div className="flex flex-col gap-2.5 sm:hidden">
                                    {products.map((p) => (
                                        <div key={p.id} className="rounded-xl p-3 flex items-center gap-3 border border-gray-100 hover:bg-gray-50/50 transition">
                                            <Image
                                                src={getImageUrl(p.imageUrl)}
                                                alt={p.title}
                                                width={44}
                                                height={44}
                                                className="w-11 h-11 object-cover rounded-lg shrink-0"
                                            />
                                            <div className="flex-1 min-w-0">
                                                <p className="font-medium text-sm text-gray-800 truncate">{p.title}</p>
                                                <p className="text-[11px] text-gray-400">{p.collection?.title || "-"}</p>
                                                <p className="text-xs text-gray-600 mt-0.5">
                                                    Rp {Number(p.price).toLocaleString("id-ID")} · Stock {p.stock}
                                                </p>
                                            </div>
                                            {stockBadge(p.stock)}
                                        </div>
                                    ))}
                                </div>
                                {/* Desktop: table */}
                                <div className="hidden sm:block overflow-x-auto">
                                    <table className="w-full">
                                        <thead>
                                            <tr className="bg-primary-studio text-white text-left text-sm rounded-t-lg">
                                                <th className="p-3 rounded-tl-lg">Product</th>
                                                <th className="p-3">Price</th>
                                                <th className="p-3">Stock</th>
                                                <th className="p-3 rounded-tr-lg">Status</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {products.map((p, i) => (
                                                <tr key={p.id} className={`border-t border-gray-50 hover:bg-gray-50/50 transition ${i % 2 === 0 ? "bg-white" : "bg-gray-50/30"}`}>
                                                    <td className="p-3">
                                                        <div className="flex items-center gap-3">
                                                            <Image
                                                                src={getImageUrl(p.imageUrl)}
                                                                alt={p.title}
                                                                width={40}
                                                                height={40}
                                                                className="object-cover rounded-lg"
                                                            />
                                                            <div>
                                                                <p className="font-medium text-sm text-gray-800">{p.title}</p>
                                                                <p className="text-[11px] text-gray-400">{p.collection?.title || "-"}</p>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="p-3 text-sm text-gray-700">Rp {Number(p.price).toLocaleString("id-ID")}</td>
                                                    <td className="p-3 text-sm font-medium text-gray-700">{p.stock}</td>
                                                    <td className="p-3">{stockBadge(p.stock)}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </>
                        )}

                        {/* ── ORDERS TAB ── */}
                        {!loading && activeTab === "orders" && (
                            <>
                                {/* Mobile: cards */}
                                <div className="flex flex-col gap-2.5 sm:hidden">
                                    {orders.map((o) => (
                                        <div key={o.id} className="rounded-xl p-3.5 border border-gray-100 hover:bg-gray-50/50 transition">
                                            <div className="flex items-center justify-between gap-2">
                                                <p className="text-[11px] text-gray-400 truncate max-w-[160px] font-mono">#{o.id}</p>
                                                {orderStatusBadge(o.status)}
                                            </div>
                                            <div className="flex items-center justify-between mt-2">
                                                <p className="text-sm font-medium text-gray-800">{o.customer}</p>
                                                <p className="text-sm font-semibold text-gray-700">Rp {Number(o.total).toLocaleString("id-ID")}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                                {/* Desktop: table */}
                                <div className="hidden sm:block overflow-x-auto">
                                    <table className="w-full">
                                        <thead>
                                            <tr className="bg-primary-studio text-white text-left text-sm">
                                                <th className="p-3 rounded-tl-lg">Order No</th>
                                                <th className="p-3">Customer</th>
                                                <th className="p-3">Total</th>
                                                <th className="p-3 rounded-tr-lg">Status</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {orders.map((o, i) => (
                                                <tr key={o.id} className={`border-t border-gray-50 hover:bg-gray-50/50 transition ${i % 2 === 0 ? "bg-white" : "bg-gray-50/30"}`}>
                                                    <td className="p-3 text-sm text-gray-500 font-mono max-w-[160px] truncate">{o.id}</td>
                                                    <td className="p-3 text-sm font-medium text-gray-800">{o.customer}</td>
                                                    <td className="p-3 text-sm text-gray-700">Rp {Number(o.total).toLocaleString("id-ID")}</td>
                                                    <td className="p-3">{orderStatusBadge(o.status)}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </>
                        )}

                        {/* ── MEMBERSHIP TAB ── */}
                        {!loading && activeTab === "membership" && (
                            <div className="overflow-x-auto">
                                <MembershipTable />
                            </div>
                        )}
                    </div>

                    {/* Footer link */}
                    {activeTab !== "membership" && (
                        <div className="flex justify-end px-5 py-3 border-t border-gray-100">
                            <a
                                href={activeTab === "orders" ? "/dashboard/manage-sales" : "/dashboard/product"}
                                className="text-primary-studio text-sm font-medium flex items-center gap-1.5 hover:underline transition"
                            >
                                {activeTab === "orders" ? "See all Orders" : "View All Product"}
                                <ArrowRight size={14} />
                            </a>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
