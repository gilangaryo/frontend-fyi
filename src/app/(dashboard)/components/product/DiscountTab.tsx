"use client";

import { useCallback, useEffect, useState } from "react";
import { Trash2, Pencil, Plus, Tag, Percent, Clock, X } from "lucide-react";
import toast from "react-hot-toast";
import { API_BASE } from "@/lib/constants";
import StatusDropdown from "../StatusDropdown";
import DeleteConfirmModal from "../DeleteConfirmModal";

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
    const [deleteTarget, setDeleteTarget] = useState<{ id: string; title: string } | null>(null);
    const [deleting, setDeleting] = useState(false);
    const [token, setToken] = useState<string | null>(null);
    const [submitting, setSubmitting] = useState(false);

    const [form, setForm] = useState({
        title: "",
        code: "",
        type: "PERCENT" as "PERCENT" | "VALUE",
        value: "",
        expiresAt: "",
        minimumOrderAmount: "",
    });

    useEffect(() => {
        const t = localStorage.getItem("token");
        setToken(t);
    }, []);

    useEffect(() => {
        if (typeof externalOpen === "boolean") {
            setModalOpen(externalOpen);
        }
    }, [externalOpen]);

    const fetchDiscounts = useCallback(async () => {
        if (!token) return;
        try {
            setLoading(true);
            const res = await fetch(`${API_BASE}/discounts`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            const data = await res.json();

            if (res.status === 401) {
                toast.error("Session expired. Please login again.");
                localStorage.removeItem("token");
                window.location.href = "/login";
                return;
            }

            if (data.success) setDiscounts(data.data || []);
        } catch (err) {
            console.error("Failed to fetch:", err);
            toast.error("Failed to load discounts");
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
                expiresAt: new Date(discount.expiresAt).toISOString().slice(0, 16),
                minimumOrderAmount: discount.minimumOrderAmount?.toString() || "",
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
        if (!token) return toast.error("Not authenticated");

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

        setSubmitting(true);
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
                toast.success(editingId ? "Discount updated!" : "Discount created!");
                closeModal();
                fetchDiscounts();
            } else {
                toast.error(data.message || "Failed to save");
            }
        } catch (err) {
            console.error(err);
            toast.error("Error while saving");
        } finally {
            setSubmitting(false);
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
            toast.success(`Status changed to ${active ? "Active" : "Inactive"}`);
            fetchDiscounts();
        } catch (err) {
            console.error(err);
            toast.error("Failed to update status");
        }
    }

    async function handleDeleteConfirm() {
        if (!deleteTarget) return;
        setDeleting(true);
        try {
            const res = await fetch(`${API_BASE}/discounts/${deleteTarget.id}`, {
                method: "DELETE",
                headers: { Authorization: `Bearer ${token}` },
            });
            const data = await res.json();
            if (data.success) {
                toast.success(`"${deleteTarget.title}" deleted!`);
                setDeleteTarget(null);
                fetchDiscounts();
            } else {
                toast.error(data.message || "Failed to delete");
            }
        } catch (err) {
            console.error(err);
            toast.error("Error while deleting");
        } finally {
            setDeleting(false);
        }
    }

    const formatDate = (date: string) =>
        new Date(date).toLocaleDateString("id-ID", {
            day: "numeric",
            month: "short",
            year: "numeric",
        });

    const isExpired = (date: string) => new Date(date) < new Date();

    const getDaysLeft = (date: string) => {
        const diff = new Date(date).getTime() - new Date().getTime();
        const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
        return days;
    };

    if (!token) {
        return (
            <div className="text-center py-10 text-gray-500">
                Checking authentication...
            </div>
        );
    }

    return (
        <div className="bg-white rounded-xl shadow-sm overflow-visible">
            {/* Loading skeleton */}
            {loading && (
                <div className="p-6">
                    <div className="space-y-4">
                        {Array.from({ length: 3 }).map((_, i) => (
                            <div key={i} className="flex items-center gap-4 p-4 rounded-xl border border-gray-100 animate-pulse">
                                <div className="w-12 h-12 rounded-xl bg-gray-200 shrink-0" />
                                <div className="flex-1 space-y-2">
                                    <div className="h-4 w-32 bg-gray-200 rounded" />
                                    <div className="h-3 w-48 bg-gray-100 rounded" />
                                </div>
                                <div className="h-6 w-20 bg-gray-200 rounded-full" />
                                <div className="h-8 w-16 bg-gray-200 rounded" />
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Empty state */}
            {!loading && discounts.length === 0 && (
                <div className="text-center py-16 px-6">
                    <div className="w-16 h-16 rounded-2xl bg-gray-100 flex items-center justify-center mx-auto mb-4">
                        <Tag size={28} className="text-gray-400" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-800 mb-1">No discount codes yet</h3>
                    <p className="text-sm text-gray-400 mb-5">Create your first discount to start offering promotions</p>
                    <button
                        onClick={() => openModal()}
                        className="inline-flex items-center gap-2 bg-primary-studio text-white text-sm font-medium px-4 py-2.5 rounded-lg hover:bg-primary-studio/90 transition"
                    >
                        <Plus size={16} />
                        Add Discount
                    </button>
                </div>
            )}

            {/* Discount cards */}
            {!loading && discounts.length > 0 && (
                <div className="p-4 sm:p-6 space-y-3">
                    {discounts.map((d) => {
                        const expired = isExpired(d.expiresAt);
                        const daysLeft = getDaysLeft(d.expiresAt);

                        return (
                            <div
                                key={d.id}
                                className={`relative rounded-xl border transition-all duration-200 ${
                                    expired
                                        ? "border-red-100 bg-red-50/30"
                                        : "border-gray-100 bg-white hover:border-gray-200 hover:shadow-sm"
                                }`}
                            >
                                <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4 p-4">
                                    {/* Icon + Info */}
                                    <div className="flex items-center gap-3 flex-1 min-w-0">
                                        {/* Type icon */}
                                        <div className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 ${
                                            expired
                                                ? "bg-red-100 text-red-500"
                                                : d.type === "PERCENT"
                                                    ? "bg-violet-100 text-violet-600"
                                                    : "bg-emerald-100 text-emerald-600"
                                        }`}>
                                            {d.type === "PERCENT" ? <Percent size={20} /> : <Tag size={20} />}
                                        </div>

                                        {/* Title + Code + Date range */}
                                        <div className="min-w-0 flex-1">
                                            <div className="flex items-center gap-2 flex-wrap">
                                                <span className="font-semibold text-sm text-gray-800 truncate">
                                                    {d.title || d.code}
                                                </span>
                                                <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-gray-100 text-gray-600 text-[11px] font-mono font-medium rounded-md">
                                                    {d.code}
                                                </span>
                                            </div>

                                            {/* Date range visual */}
                                            <div className="flex items-center gap-1.5 mt-1">
                                                <Clock size={12} className="text-gray-400 shrink-0" />
                                                <span className="text-[12px] text-gray-400">
                                                    {formatDate(d.createdAt)}
                                                </span>
                                                <span className="text-[12px] text-gray-300">→</span>
                                                <span className={`text-[12px] font-medium ${
                                                    expired ? "text-red-500" : daysLeft <= 7 ? "text-amber-500" : "text-gray-500"
                                                }`}>
                                                    {formatDate(d.expiresAt)}
                                                </span>
                                                {expired ? (
                                                    <span className="text-[10px] bg-red-100 text-red-600 font-medium px-1.5 py-0.5 rounded-full">
                                                        Expired
                                                    </span>
                                                ) : daysLeft <= 7 ? (
                                                    <span className="text-[10px] bg-amber-100 text-amber-600 font-medium px-1.5 py-0.5 rounded-full">
                                                        {daysLeft}d left
                                                    </span>
                                                ) : null}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Value + Used */}
                                    <div className="flex items-center gap-4 sm:gap-6 pl-14 sm:pl-0">
                                        <div className="text-right">
                                            <p className={`text-lg font-bold ${
                                                expired ? "text-gray-400" : "text-gray-800"
                                            }`}>
                                                {d.type === "PERCENT" ? `${d.value}%` : `Rp ${d.value.toLocaleString("id-ID")}`}
                                            </p>
                                            <p className="text-[11px] text-gray-400">
                                                Used <span className="font-semibold text-gray-500">{d.usedCount}</span>×
                                                {d.minimumOrderAmount ? (
                                                    <span> · Min Rp {d.minimumOrderAmount.toLocaleString("id-ID")}</span>
                                                ) : null}
                                            </p>
                                        </div>

                                        {/* Status */}
                                        <StatusDropdown
                                            initial={d.status ? "Active" : "Inactive"}
                                            onChange={(value) => updateStatus(d.id, value === "Active")}
                                        />

                                        {/* Actions */}
                                        <div className="flex items-center gap-1">
                                            <button
                                                onClick={() => openModal(d)}
                                                className="p-2 rounded-lg text-gray-400 hover:text-sky-600 hover:bg-sky-50 transition"
                                                title="Edit"
                                            >
                                                <Pencil size={15} />
                                            </button>
                                            <button
                                                onClick={() => setDeleteTarget({ id: d.id, title: d.title || d.code })}
                                                className="p-2 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 transition"
                                                title="Delete"
                                            >
                                                <Trash2 size={15} />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            <DeleteConfirmModal
                open={!!deleteTarget}
                itemName={deleteTarget?.title}
                loading={deleting}
                onConfirm={handleDeleteConfirm}
                onCancel={() => {
                    if (!deleting) setDeleteTarget(null);
                }}
            />

            {/* Modal */}
            {modalOpen && (
                <div className="fixed inset-0 z-[100] bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden">
                        {/* Modal header */}
                        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
                            <div>
                                <h2 className="text-lg font-bold text-gray-900">
                                    {editingId ? "Edit Discount" : "Create Discount"}
                                </h2>
                                <p className="text-xs text-gray-400 mt-0.5">
                                    {editingId ? "Update the discount details" : "Add a new discount code"}
                                </p>
                            </div>
                            <button
                                onClick={closeModal}
                                className="w-8 h-8 flex items-center justify-center rounded-lg text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition"
                            >
                                <X size={18} />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">
                            {/* Title */}
                            <div>
                                <label className="block mb-1.5 text-sm font-medium text-gray-700">
                                    Title <span className="text-red-400">*</span>
                                </label>
                                <input
                                    required
                                    value={form.title}
                                    onChange={(e) => setForm({ ...form, title: e.target.value })}
                                    placeholder="e.g., Summer Sale"
                                    className="w-full border border-gray-200 px-3.5 py-2.5 rounded-xl text-sm focus:ring-2 focus:ring-primary-studio/20 focus:border-primary-studio outline-none transition"
                                />
                            </div>

                            {/* Code */}
                            <div>
                                <label className="block mb-1.5 text-sm font-medium text-gray-700">
                                    Code <span className="text-red-400">*</span>
                                </label>
                                <input
                                    required
                                    value={form.code}
                                    onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })}
                                    placeholder="e.g., SUMMER2026"
                                    className="w-full border border-gray-200 px-3.5 py-2.5 rounded-xl text-sm font-mono uppercase focus:ring-2 focus:ring-primary-studio/20 focus:border-primary-studio outline-none transition"
                                />
                            </div>

                            {/* Type */}
                            <div>
                                <label className="block mb-1.5 text-sm font-medium text-gray-700">
                                    Type <span className="text-red-400">*</span>
                                </label>
                                <div className="grid grid-cols-2 gap-2">
                                    <button
                                        type="button"
                                        onClick={() => setForm({ ...form, type: "PERCENT" })}
                                        className={`flex items-center justify-center gap-2 py-2.5 rounded-xl border-2 text-sm font-medium transition ${
                                            form.type === "PERCENT"
                                                ? "border-primary-studio bg-primary-studio/5 text-primary-studio"
                                                : "border-gray-200 text-gray-500 hover:border-gray-300"
                                        }`}
                                    >
                                        <Percent size={15} />
                                        Percentage
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setForm({ ...form, type: "VALUE" })}
                                        className={`flex items-center justify-center gap-2 py-2.5 rounded-xl border-2 text-sm font-medium transition ${
                                            form.type === "VALUE"
                                                ? "border-primary-studio bg-primary-studio/5 text-primary-studio"
                                                : "border-gray-200 text-gray-500 hover:border-gray-300"
                                        }`}
                                    >
                                        <Tag size={15} />
                                        Fixed Amount
                                    </button>
                                </div>
                            </div>

                            {/* Value */}
                            <div>
                                <label className="block mb-1.5 text-sm font-medium text-gray-700">
                                    {form.type === "PERCENT" ? "Percentage (%)" : "Amount (IDR)"}{" "}
                                    <span className="text-red-400">*</span>
                                </label>
                                <input
                                    required
                                    type="number"
                                    min="0"
                                    max={form.type === "PERCENT" ? 100 : undefined}
                                    value={form.value}
                                    onChange={(e) => setForm({ ...form, value: e.target.value })}
                                    placeholder={form.type === "PERCENT" ? "e.g., 10" : "e.g., 50000"}
                                    className="w-full border border-gray-200 px-3.5 py-2.5 rounded-xl text-sm focus:ring-2 focus:ring-primary-studio/20 focus:border-primary-studio outline-none transition"
                                />
                            </div>

                            {/* Expires */}
                            <div>
                                <label className="block mb-1.5 text-sm font-medium text-gray-700">
                                    Expiration <span className="text-red-400">*</span>
                                </label>
                                <input
                                    required
                                    type="datetime-local"
                                    value={form.expiresAt}
                                    onChange={(e) => setForm({ ...form, expiresAt: e.target.value })}
                                    className="w-full border border-gray-200 px-3.5 py-2.5 rounded-xl text-sm focus:ring-2 focus:ring-primary-studio/20 focus:border-primary-studio outline-none transition"
                                />
                            </div>

                            {/* Min Order */}
                            <div>
                                <label className="block mb-1.5 text-sm font-medium text-gray-700">
                                    Min Order Amount <span className="text-gray-400 text-xs font-normal">(optional)</span>
                                </label>
                                <input
                                    type="number"
                                    value={form.minimumOrderAmount}
                                    onChange={(e) => setForm({ ...form, minimumOrderAmount: e.target.value })}
                                    placeholder="e.g., 100000"
                                    className="w-full border border-gray-200 px-3.5 py-2.5 rounded-xl text-sm focus:ring-2 focus:ring-primary-studio/20 focus:border-primary-studio outline-none transition"
                                />
                            </div>

                            {/* Actions */}
                            <div className="flex gap-2.5 pt-2">
                                <button
                                    type="button"
                                    onClick={closeModal}
                                    className="flex-1 px-4 py-2.5 border border-gray-200 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-50 transition"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={submitting}
                                    className="flex-1 px-4 py-2.5 bg-primary-studio text-white rounded-xl text-sm font-medium hover:bg-primary-studio/90 disabled:opacity-60 transition"
                                >
                                    {submitting ? "Saving..." : editingId ? "Update" : "Create"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
