"use client";

import { useEffect, useState } from "react";

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

export default function MembershipTable() {
    const [data, setData] = useState<Membership[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchMembership() {
            try {
                const token = localStorage.getItem("token");
                if (!token) return;

                const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/subscribe`, {
                    headers: { Authorization: `Bearer ${token}` }
                });

                const json = await res.json();
                if (json.success) setData(json.data || []);
            } catch (err) {
                console.error("Failed to fetch membership:", err);
            } finally {
                setLoading(false);
            }
        }

        fetchMembership();
    }, []);

    const formatDate = (v: string) =>
        new Date(v).toLocaleDateString("id-ID", {
            day: "numeric",
            month: "short",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit"
        });

    if (!loading && data.length === 0) {
        return (
            <div className="text-center py-10 text-gray-500">
                No membership found
            </div>
        );
    }
    return (
        <div className="overflow-x-auto mt-4">
            {loading ? (
                <div className="text-center py-10 text-gray-400">Loading membership...</div>
            ) : (
                <table className="w-full rounded-t-xl overflow-hidden">
                    <thead>
                        <tr className="bg-primary-studio text-white text-left">
                            <th className="p-3">Email</th>
                            {/* <th className="p-3">Name</th> */}
                            <th className="p-3">Source</th>
                            <th className="p-3">Subscribed At</th>
                            <th className="p-3">Status</th>
                        </tr>
                    </thead>

                    <tbody className="bg-white">
                        {data.map((m) => (
                            <tr key={m.id}>
                                <td className="p-3">{m.email}</td>
                                {/* <td className="p-3">{m.name || "-"}</td> */}
                                <td className="p-3">{m.source}</td>
                                <td className="p-3">{formatDate(m.subscribedAt)}</td>
                                <td className="p-3">
                                    <span
                                        className={`text-sm font-medium ${m.status === "ACTIVE"
                                            ? "text-green-600"
                                            : "text-red-500"
                                            }`}
                                    >
                                        ● {m.status}
                                    </span>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}
        </div>
    );
}
