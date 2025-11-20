"use client";

import { useCallback, useEffect, useState } from "react";
import { Trash } from "lucide-react";
import { API_BASE } from "@/lib/constants";
import StatusDropdown from "../StatusDropdown";
interface Discount {
    id: string;
    title: string;
    code: string;
    type: "PERCENT" | "VALUE";
    value: number;
    status: boolean;
    expiresAt: string;
    usedCount: number;
    minimumOrderAmount: number | null;
    createdAt: string;
}
interface DiscountTabProps {
    externalOpen?: boolean;
    onExternalOpenChange?: (open: boolean) => void;
}

export default function DiscountTab({
    externalOpen,
    onExternalOpenChange,
}: DiscountTabProps) {
    const [discounts, setDiscounts] = useState<Discount[]>([]);
    const [loading, setLoading] = useState(true);
    const [modalOpen, setModalOpen] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [token, setToken] = useState<string | null>(null);

    const [form, setForm] = useState({
        title: "",
        code: "",
        type: "PERCENT" as "PERCENT" | "VALUE",
        value: "",
        expiresAt: "",
        minimumOrderAmount: "",
    });

    // Load token
    useEffect(() => {
        const t = localStorage.getItem("token");
        setToken(t);
    }, []);
    useEffect(() => {
        if (typeof externalOpen === "boolean") {
            setModalOpen(externalOpen);
        }
    }, [externalOpen]);

    // Fetch all discounts
    const fetchDiscounts = useCallback(async () => {
        if (!token) return;

        try {
            setLoading(true);

            const res = await fetch(`${API_BASE}/discounts`, {
                headers: { Authorization: `Bearer ${token}` },
            });

            const data = await res.json();

            if (res.status === 401) {
                alert("Session expired. Login again.");
                localStorage.removeItem("token");
                window.location.href = "/login";
                return;
            }

            if (data.success) setDiscounts(data.data || []);
        } catch (err) {
            console.error("Failed to fetch:", err);
        } finally {
            setLoading(false);
        }
    }, [token]);

    useEffect(() => {
        if (!token) return;
        fetchDiscounts();
    }, [token, fetchDiscounts]);

    const openModal = (discount?: Discount) => {
        if (discount) {
            setEditingId(discount.id);
            setForm({
                title: discount.title,
                code: discount.code,
                type: discount.type,
                value: discount.value.toString(),
                expiresAt: new Date(discount.expiresAt)
                    .toISOString()
                    .slice(0, 16),
                minimumOrderAmount:
                    discount.minimumOrderAmount?.toString() || "",
            });
        } else {
            setEditingId(null);
            setForm({
                title: "",
                code: "",
                type: "PERCENT",
                value: "",
                expiresAt: "",
                minimumOrderAmount: "",
            });
        }

        setModalOpen(true);
    };

    const closeModal = () => {
        setModalOpen(false);
        setEditingId(null);
        onExternalOpenChange?.(false);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!token) return alert("Not authenticated");

        const payload = {
            title: form.title,
            code: form.code.toUpperCase(),
            type: form.type,
            value: parseFloat(form.value),
            expiresAt: new Date(form.expiresAt).toISOString(),
            minimumOrderAmount: form.minimumOrderAmount
                ? parseFloat(form.minimumOrderAmount)
                : null,
        };

        const url = editingId
            ? `${API_BASE}/discounts/${editingId}`
            : `${API_BASE}/discounts`;

        const method = editingId ? "PUT" : "POST";

        try {
            const res = await fetch(url, {
                method,
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify(payload),
            });

            const data = await res.json();

            if (data.success) {
                alert(editingId ? "Updated!" : "Created!");
                closeModal();
                fetchDiscounts();
            } else {
                alert(data.message || "Failed to save");
            }
        } catch (err) {
            alert("Error while saving");
            console.error(err);
        }
    };
    async function updateStatus(id: string, active: boolean) {
        try {
            const token = localStorage.getItem("token");
            const res = await fetch(`${API_BASE}/discounts/${id}/status`, {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({ status: active }),
            });

            if (!res.ok) throw new Error("Failed to update status");

            fetchDiscounts(); // refresh
        } catch (err) {
            console.error(err);
        }
    }

    async function handleDelete(id: string) {
        if (!confirm("Delete this discount?")) return;

        try {
            const res = await fetch(`${API_BASE}/discounts/${id}`, {
                method: "DELETE",
                headers: { Authorization: `Bearer ${token}` },
            });

            const data = await res.json();
            if (data.success) {
                alert("Deleted!");
                fetchDiscounts();
            } else {
                alert(data.message);
            }
        } catch (err) {
            console.error(err);
        }
    }

    const formatDate = (date: string) =>
        new Date(date).toLocaleDateString("id-ID", {
            day: "numeric",
            month: "short",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
        });

    if (!token) {
        return (
            <div className="text-center py-10 text-gray-500">
                Checking authentication...
            </div>
        );
    }

    return (
        <div className="bg-white rounded-lg shadow-sm p-6 overflow-visible">
            {loading && (
                <div className="text-center py-10 text-gray-400">
                    Loading...
                </div>
            )}

            {!loading && discounts.length === 0 && (
                <div className="text-center py-16 text-gray-400">
                    No discount codes yet
                </div>
            )}

            {/* TABLE LIST */}
            {!loading && discounts.length > 0 && (
                <div className="rounded-lg bg-white overflow-visible">
                    <div className="min-w-[900px]">
                        {/* HEADER */}
                        <div className="grid grid-cols-[1fr_15rem_12rem_10rem_8rem] bg-sky-500 text-white font-medium text-sm rounded-t-md">
                            <div className="px-4 py-2">Code Name</div>
                            <div className="px-4 py-2 text-center">
                                Time Period
                            </div>
                            <div className="px-4 py-2 text-center">Status</div>
                            <div className="px-4 py-2 text-center">Used</div>
                            <div className="px-4 py-2 text-center">Action</div>
                        </div>

                        {/* ROWS */}
                        {discounts.map((d) => {
                            // const expired = isExpired(d.expiresAt);

                            return (
                                <div
                                    key={d.id}
                                    className="grid grid-cols-[1fr_15rem_12rem_10rem_8rem] border-t border-gray-200 hover:bg-gray-50 transition items-center"
                                >
                                    {/* Code Name */}
                                    <div className="px-4 py-3 font-medium text-gray-800">
                                        CODE: {d.code}
                                    </div>

                                    {/* Time Period */}
                                    <div className="px-4 py-3 text-center text-gray-700">
                                        {formatDate(d.createdAt).split(",")[0]}{" "}
                                        —{" "}
                                        {formatDate(d.expiresAt).split(",")[0]}
                                    </div>

                                    {/* Status */}
                                    <div className="flex justify-center">
                                        <StatusDropdown
                                            initial={
                                                d.status ? "Active" : "Inactive"
                                            }
                                            onChange={(value) =>
                                                updateStatus(
                                                    d.id,
                                                    value === "Active"
                                                )
                                            }
                                        />
                                    </div>

                                    {/* Used */}
                                    <div className="px-4 py-3 text-center text-gray-700">
                                        {d.usedCount} times
                                    </div>

                                    {/* Actions */}
                                    <div className="flex justify-center gap-4 py-3">
                                        <button
                                            onClick={() => openModal(d)}
                                            className="px-4 py-1 bg-sky-500 text-white text-sm rounded hover:bg-sky-600 transition"
                                        >
                                            Edit
                                        </button>

                                        <button
                                            onClick={() => handleDelete(d.id)}
                                            className="px-2 py-2  border rounded text-sm text-red-500 hover:text-white hover:bg-red-500 transition"
                                        >
                                            <Trash size={16} />
                                        </button>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}

            {/* Modal */}
            {modalOpen && (
                <div className="fixed inset-0 z-[100] bg-black/50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-xl w-full max-w-md shadow-lg overflow-hidden">
                        <div className="px-6 py-4 border-b">
                            <h2 className="text-xl font-bold">
                                {editingId
                                    ? "Edit Discount"
                                    : "Create Discount"}
                            </h2>
                        </div>

                        <form
                            onSubmit={handleSubmit}
                            className="px-6 py-4 space-y-4"
                        >
                            {/* Title */}
                            <div>
                                <label className="block mb-1 text-sm font-medium">
                                    Title
                                </label>
                                <input
                                    required
                                    value={form.title}
                                    onChange={(e) =>
                                        setForm({
                                            ...form,
                                            title: e.target.value,
                                        })
                                    }
                                    className="w-full border px-3 py-2 rounded"
                                />
                            </div>

                            {/* Code */}
                            <div>
                                <label className="block mb-1 text-sm font-medium">
                                    Code
                                </label>
                                <input
                                    required
                                    value={form.code}
                                    onChange={(e) =>
                                        setForm({
                                            ...form,
                                            code: e.target.value.toUpperCase(),
                                        })
                                    }
                                    className="w-full border px-3 py-2 rounded uppercase"
                                />
                            </div>

                            {/* Type */}
                            <div>
                                <label className="block mb-1 text-sm font-medium">
                                    Type
                                </label>

                                <div className="grid grid-cols-2 gap-3">
                                    <button
                                        type="button"
                                        onClick={() =>
                                            setForm({
                                                ...form,
                                                type: "PERCENT",
                                            })
                                        }
                                        className={`py-2 rounded border ${
                                            form.type === "PERCENT"
                                                ? "border-primary-studio bg-primary-studio/10 text-primary-studio"
                                                : "border-gray-300"
                                        }`}
                                    >
                                        Percentage
                                    </button>

                                    <button
                                        type="button"
                                        onClick={() =>
                                            setForm({ ...form, type: "VALUE" })
                                        }
                                        className={`py-2 rounded border ${
                                            form.type === "VALUE"
                                                ? "border-primary-studio bg-primary-studio/10 text-primary-studio"
                                                : "border-gray-300"
                                        }`}
                                    >
                                        Fixed
                                    </button>
                                </div>
                            </div>

                            {/* Value */}
                            <div>
                                <label className="block mb-1 text-sm font-medium">
                                    {form.type === "PERCENT"
                                        ? "Percentage (%)"
                                        : "Amount (IDR)"}
                                </label>
                                <input
                                    required
                                    type="number"
                                    min="0"
                                    max={
                                        form.type === "PERCENT"
                                            ? 100
                                            : undefined
                                    }
                                    value={form.value}
                                    onChange={(e) =>
                                        setForm({
                                            ...form,
                                            value: e.target.value,
                                        })
                                    }
                                    className="w-full border px-3 py-2 rounded"
                                />
                            </div>

                            {/* Expires */}
                            <div>
                                <label className="block mb-1 text-sm font-medium">
                                    Expiration
                                </label>
                                <input
                                    required
                                    type="datetime-local"
                                    value={form.expiresAt}
                                    onChange={(e) =>
                                        setForm({
                                            ...form,
                                            expiresAt: e.target.value,
                                        })
                                    }
                                    className="w-full border px-3 py-2 rounded"
                                />
                            </div>

                            {/* Min Order */}
                            <div>
                                <label className="block mb-1 text-sm font-medium">
                                    Min Order (optional)
                                </label>
                                <input
                                    type="number"
                                    value={form.minimumOrderAmount}
                                    onChange={(e) =>
                                        setForm({
                                            ...form,
                                            minimumOrderAmount: e.target.value,
                                        })
                                    }
                                    className="w-full border px-3 py-2 rounded"
                                />
                            </div>

                            <div className="flex gap-2 pt-2">
                                <button
                                    type="button"
                                    onClick={closeModal}
                                    className="flex-1 border rounded py-2"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="flex-1 bg-primary-studio text-white rounded py-2"
                                >
                                    {editingId ? "Update" : "Create"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
