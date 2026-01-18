"use client";
import { useEffect, useState } from "react";
import { Users, Search, RefreshCw, Download } from "lucide-react";
import { API_BASE } from "@/lib/constants";

interface Membership {
    id: string;
    email: string;
    name: string | null;
    source: string;
    isVerified: boolean;
    subscribedAt: string;
    unsubscribedAt: string | null;
    status: string;
}

interface MembershipStats {
    total: number;
    active: number;
    unsubscribed: number;
}

export default function MemberPage() {
    const [members, setMembers] = useState<Membership[]>([]);
    const [filteredMembers, setFilteredMembers] = useState<Membership[]>([]);
    const [loading, setLoading] = useState(true);
    const [downloading, setDownloading] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const [stats, setStats] = useState<MembershipStats>({
        total: 0,
        active: 0,
        unsubscribed: 0,
    });

    const fetchMembers = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem("token");
            if (!token) {
                window.location.href = "/login";
                return;
            }

            const res = await fetch(`${API_BASE}/subscribe`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            if (res.status === 401) {
                localStorage.removeItem("token");
                localStorage.removeItem("user");
                window.location.href = "/login";
                return;
            }

            const json = await res.json();
            if (json.success) {
                const data = json.data || [];
                setMembers(data);
                setFilteredMembers(data);

                const active = data.filter(
                    (m: Membership) => m.status === "ACTIVE",
                ).length;
                const unsubscribed = data.filter(
                    (m: Membership) => m.status === "UNSUBSCRIBED",
                ).length;

                setStats({
                    total: data.length,
                    active,
                    unsubscribed,
                });
            }
        } catch (err) {
            console.error("Failed to fetch members:", err);
        } finally {
            setLoading(false);
        }
    };

    const downloadCSV = async () => {
        try {
            setDownloading(true);
            const token = localStorage.getItem("token");
            if (!token) {
                window.location.href = "/login";
                return;
            }

            const res = await fetch(`${API_BASE}/subscribe/export/csv`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            if (res.status === 401) {
                localStorage.removeItem("token");
                localStorage.removeItem("user");
                window.location.href = "/login";
                return;
            }

            if (!res.ok) {
                throw new Error("Failed to download CSV");
            }

            // Get blob data
            const blob = await res.blob();

            // Create download link
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = `subscribers-${new Date().toISOString().split("T")[0]}.csv`;
            document.body.appendChild(a);
            a.click();

            // Cleanup
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);
        } catch (err) {
            console.error("Failed to download CSV:", err);
            alert("Gagal mengunduh file CSV");
        } finally {
            setDownloading(false);
        }
    };

    useEffect(() => {
        fetchMembers();
    }, []);

    useEffect(() => {
        let result = members;
        if (searchQuery) {
            result = result.filter(
                (m) =>
                    m.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
                    m.name?.toLowerCase().includes(searchQuery.toLowerCase()),
            );
        }
        setFilteredMembers(result);
    }, [searchQuery, members]);

    const formatDate = (v: string) =>
        new Date(v).toLocaleDateString("id-ID", {
            day: "numeric",
            month: "short",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
        });

    return (
        <div className="p-6 space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">
                        Membership
                    </h1>
                    <p className="text-gray-600 mt-1">
                        Manage email Membership subscribers
                    </p>
                </div>
                <div className="flex gap-2">
                    <button
                        onClick={downloadCSV}
                        disabled={downloading || loading}
                        className="flex items-center gap-2 px-4 py-2 bg-green-700 text-white rounded-lg hover:bg-green-900 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <Download className="w-4 h-4" />
                        {downloading ? "Downloading..." : "Download CSV"}
                    </button>
                    <button
                        onClick={fetchMembers}
                        disabled={loading}
                        className="flex items-center gap-2 px-4 py-2 bg-primary-studio text-white rounded-lg hover:bg-primary-studio/80 transition-colors disabled:opacity-50"
                    >
                        <RefreshCw
                            className={`w-4 h-4 ${loading ? "animate-spin" : ""}`}
                        />
                        Refresh
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Stats Cards */}
                <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-600">
                                Total Subscriber
                            </p>
                            <p className="text-2xl font-bold text-gray-900 mt-1">
                                {stats.total}
                            </p>
                        </div>
                        <Users className="w-8 h-8 text-primary-studio" />
                    </div>
                </div>
                {/* Search */}
                <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 col-span-2">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search email or name..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-studio/50"
                        />
                    </div>
                </div>
            </div>

            {/* Table */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                {loading ? (
                    <div className="p-8 text-center text-gray-500">
                        Loading data...
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-primary-studio border-b border-gray-200 text-left text-xs text-white   uppercase tracking-wider ">
                                <tr>
                                    <th className="px-6 py-3 ">Email</th>
                                    <th className="px-6 py-3 ">Name</th>
                                    <th className="px-6 py-3 ">Source</th>
                                    <th className="px-6 py-3 ">
                                        Subscribed At
                                    </th>
                                    <th className="px-6 py-3 ">Status</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {filteredMembers.map((member) => (
                                    <tr
                                        key={member.id}
                                        className="hover:bg-gray-50"
                                    >
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm text-gray-900">
                                                {member.email}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm text-gray-900">
                                                {member.name || "-"}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm text-gray-500">
                                                {member.source}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm text-gray-500">
                                                {formatDate(
                                                    member.subscribedAt,
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span
                                                className={`px-2 py-1 text-xs rounded-full ${
                                                    member.status === "ACTIVE"
                                                        ? "bg-green-100 text-green-800"
                                                        : "bg-red-100 text-red-800"
                                                }`}
                                            >
                                                {member.status}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
}
