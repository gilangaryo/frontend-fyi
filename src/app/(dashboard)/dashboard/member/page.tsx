"use client";

import { useEffect, useState } from "react";
import { Users, Mail, Search, RefreshCw } from "lucide-react";
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

                // Calculate stats
                const active = data.filter(
                    (m: Membership) => m.status === "ACTIVE"
                ).length;
                const unsubscribed = data.filter(
                    (m: Membership) => m.status === "UNSUBSCRIBED"
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

    useEffect(() => {
        fetchMembers();
    }, []);

    // Filter members based on search and status
    useEffect(() => {
        let result = members;

        if (searchQuery) {
            result = result.filter(
                (m) =>
                    m.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
                    m.name?.toLowerCase().includes(searchQuery.toLowerCase())
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
        <div className="p-6">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800">
                        Membership
                    </h1>
                    <p className="text-gray-500 text-sm">
                        Kelola daftar subscriber email
                    </p>
                </div>
                <button
                    onClick={fetchMembers}
                    className="flex items-center gap-2 px-4 py-2 bg-primary-studio text-white rounded-lg hover:bg-primary-studio/90 transition-colors"
                >
                    <RefreshCw size={18} />
                    Refresh
                </button>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
                    <div className="flex items-center gap-3">
                        <div className="p-3 bg-blue-100 rounded-lg">
                            <Users className="text-blue-600" size={24} />
                        </div>
                        <div>
                            <p className="text-sm text-gray-500">
                                Total Subscriber
                            </p>
                            <p className="text-2xl font-bold text-gray-800">
                                {stats.total}
                            </p>
                        </div>
                    </div>
                </div>
                <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 col-span-2">
                    <div className="flex flex-col md:flex-row gap-4">
                        {/* Search */}
                        <div className="flex-1 relative">
                            <Search
                                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                                size={20}
                            />
                            <input
                                type="text"
                                placeholder="Cari email atau nama..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-studio/50"
                            />
                        </div>
                    </div>
                </div>
            </div>

            {/* Filters */}

            {/* Table */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                {loading ? (
                    <div className="flex items-center justify-center py-20">
                        <div className="flex flex-col items-center gap-3">
                            <div className="w-8 h-8 border-4 border-primary-studio border-t-transparent rounded-full animate-spin"></div>
                            <p className="text-gray-500">Memuat data...</p>
                        </div>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="bg-primary-studio text-white text-left">
                                    <th className="p-4 font-medium">Email</th>
                                    <th className="p-4 font-medium">Nama</th>
                                    <th className="p-4 font-medium">Source</th>
                                    <th className="p-4 font-medium">
                                        Subscribed At
                                    </th>
                                    <th className="p-4 font-medium">Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredMembers.map((member, index) => (
                                    <tr
                                        key={member.id}
                                        className={`border-b border-gray-100 hover:bg-gray-50 transition-colors ${
                                            index % 2 === 0
                                                ? "bg-white"
                                                : "bg-gray-50/50"
                                        }`}
                                    >
                                        <td className="p-4">
                                            <div className="flex items-center gap-2">
                                                <Mail
                                                    size={16}
                                                    className="text-gray-400"
                                                />
                                                <span className="font-medium text-gray-800">
                                                    {member.email}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="p-4 text-gray-600">
                                            {member.name || "-"}
                                        </td>
                                        <td className="p-4">
                                            <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded text-sm">
                                                {member.source}
                                            </span>
                                        </td>
                                        <td className="p-4 text-gray-600">
                                            {formatDate(member.subscribedAt)}
                                        </td>
                                        <td className="p-4">
                                            <span
                                                className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium ${
                                                    member.status === "ACTIVE"
                                                        ? "bg-green-100 text-green-700"
                                                        : "bg-red-100 text-red-700"
                                                }`}
                                            >
                                                <span
                                                    className={`w-2 h-2 rounded-full ${
                                                        member.status ===
                                                        "ACTIVE"
                                                            ? "bg-green-500"
                                                            : "bg-red-500"
                                                    }`}
                                                ></span>
                                                {member.status}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}

                {/* Footer */}
                {!loading && filteredMembers.length > 0 && (
                    <div className="px-4 py-3 bg-gray-50 border-t border-gray-100">
                        <p className="text-sm text-gray-500">
                            Menampilkan {filteredMembers.length} dari{" "}
                            {members.length} subscriber
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}
