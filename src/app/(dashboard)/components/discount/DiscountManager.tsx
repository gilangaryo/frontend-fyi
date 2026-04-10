"use client";

import { useEffect, useState } from "react";
import {
    Calendar,
    Layers3,
    Percent,
    Plus,
    Sparkles,
    Tag,
    Trash2,
    Pencil,
} from "lucide-react";
import toast from "react-hot-toast";
import { API_BASE } from "@/lib/constants";
import DeleteConfirmModal from "../DeleteConfirmModal";
import DiscountFormModal, {
    type DiscountForm,
    type PromotionKind,
    type DiscountType,
    type CollectionOption,
    type ProductOption,
} from "./DiscountFormModal";

interface DiscountTargetCollection {
    collectionId: string;
    collection: CollectionOption;
}

interface DiscountTargetProduct {
    productId: string;
    product: ProductOption;
}

interface Discount {
    id: string;
    title: string;
    code: string;
    kind: PromotionKind;
    type: DiscountType;
    value: number;
    status: boolean;
    startsAt: string | null;
    expiresAt: string;
    priority: number;
    usedCount: number;
    minimumOrderAmount: number | null;
    minimumQty: number | null;
    autoApply: boolean;
    combinableWith: PromotionKind[] | string[] | null;
    collectionTargets?: DiscountTargetCollection[];
    productTargets?: DiscountTargetProduct[];
    createdAt: string;
}

interface DiscountManagerProps {
    title?: string;
    description?: string;
    embedded?: boolean;
    externalOpen?: boolean;
    onExternalOpenChange?: (open: boolean) => void;
}

const KIND_OPTIONS: Array<{
    value: PromotionKind;
    label: string;
    helper: string;
}> = [
    {
        value: "COLLECTION_DISCOUNT",
        label: "Collection Discount",
        helper: "Potongan hanya untuk item di collection tertentu.",
    },
    {
        value: "SPECIFIC_PRODUCT_DISCOUNT",
        label: "Specific Product Discount",
        helper: "Potongan untuk produk tertentu, biasanya tampil di product page.",
    },
    {
        value: "MINIMUM_PURCHASE_DISCOUNT",
        label: "Minimum Purchase Discount",
        helper: "Aktif bila subtotal cart mencapai nominal minimum.",
    },
    {
        value: "MINIMUM_QTY_DISCOUNT",
        label: "Minimum Quantity Discount",
        helper: "Aktif bila jumlah item di cart memenuhi threshold qty.",
    },
];

const KIND_LABELS: Record<PromotionKind, string> = {
    COLLECTION_DISCOUNT: "Collection",
    SPECIFIC_PRODUCT_DISCOUNT: "Specific Product",
    MINIMUM_PURCHASE_DISCOUNT: "Minimum Purchase",
    MINIMUM_QTY_DISCOUNT: "Minimum Qty",
};

const COMBINABLE_OPTIONS: PromotionKind[] = [
    "COLLECTION_DISCOUNT",
    "SPECIFIC_PRODUCT_DISCOUNT",
    "MINIMUM_PURCHASE_DISCOUNT",
    "MINIMUM_QTY_DISCOUNT",
];

const TOP_LEVEL_KINDS: PromotionKind[] = [
    "COLLECTION_DISCOUNT",
    "SPECIFIC_PRODUCT_DISCOUNT",
];

const BOTTOM_LEVEL_KINDS: PromotionKind[] = [
    "MINIMUM_PURCHASE_DISCOUNT",
    "MINIMUM_QTY_DISCOUNT",
];

function toInputDateTime(value?: string | null) {
    if (!value) return "";
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return "";
    const offset = date.getTimezoneOffset();
    const localDate = new Date(date.getTime() - offset * 60_000);
    return localDate.toISOString().slice(0, 16);
}

function formatDate(value?: string | null) {
    if (!value) return "-";
    return new Date(value).toLocaleDateString("id-ID", {
        day: "numeric",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
    });
}

function normalizeCombinableWith(value: Discount["combinableWith"]) {
    if (!value) return [] as PromotionKind[];
    if (Array.isArray(value)) {
        return value.filter(Boolean) as PromotionKind[];
    }
    return [] as PromotionKind[];
}

function getAllowedCombinableOptions(kind: PromotionKind) {
    // Cross-level stacking: item-level ↔ cart-level (but not same-level)
    if (TOP_LEVEL_KINDS.includes(kind)) {
        return BOTTOM_LEVEL_KINDS;
    }
    return TOP_LEVEL_KINDS;
}

export default function DiscountManager({
    title = "Discount Rules",
    description = "Kelola collection discount, product discount, dan promo cart-level.",
    embedded = false,
    externalOpen,
    onExternalOpenChange,
}: DiscountManagerProps) {
    const [discounts, setDiscounts] = useState<Discount[]>([]);
    const [collections, setCollections] = useState<CollectionOption[]>([]);
    const [products, setProducts] = useState<ProductOption[]>([]);
    const [token, setToken] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const [modalOpen, setModalOpen] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [submitting, setSubmitting] = useState(false);
    const [deleteTarget, setDeleteTarget] = useState<{
        id: string;
        title: string;
    } | null>(null);
    const [deleting, setDeleting] = useState(false);

    const [form, setForm] = useState<DiscountForm>({
        title: "",
        code: "",
        kind: "COLLECTION_DISCOUNT",
        type: "PERCENT",
        value: "",
        startsAt: "",
        expiresAt: "",
        minimumOrderAmount: "",
        minimumQty: "",
        autoApply: false,
        status: true,
        collectionIds: [],
        productIds: [],
        combinableWith: [],
    });

    const allowedCombinableOptions = getAllowedCombinableOptions(form.kind);

    useEffect(() => {
        const storedToken = localStorage.getItem("token");
        setToken(storedToken);

        if (!storedToken) {
            toast.error("You need to login first!");
            window.location.href = "/login";
        }
    }, []);

    useEffect(() => {
        if (typeof externalOpen === "boolean") {
            setModalOpen(externalOpen);
        }
    }, [externalOpen]);

    useEffect(() => {
        if (!token) return;

        const loadData = async () => {
            try {
                setLoading(true);

                const [discountRes, collectionRes, productRes] =
                    await Promise.all([
                        fetch(`${API_BASE}/discounts`, {
                            headers: {
                                Authorization: `Bearer ${token}`,
                            },
                        }),
                        fetch(`${API_BASE}/collections?status=true`),
                        fetch(`${API_BASE}/products?all=true&status=true`),
                    ]);

                const [discountJson, collectionJson, productJson] =
                    await Promise.all([
                        discountRes.json(),
                        collectionRes.json(),
                        productRes.json(),
                    ]);

                if (discountRes.status === 401) {
                    toast.error("Session expired. Please login again.");
                    localStorage.removeItem("token");
                    window.location.href = "/login";
                    return;
                }

                if (discountJson.success) {
                    setDiscounts(discountJson.data || []);
                }

                if (collectionJson.success) {
                    setCollections(
                        (collectionJson.data || []).map(
                            (collection: CollectionOption) => ({
                                id: collection.id,
                                title: collection.title,
                                slug: collection.slug,
                            }),
                        ),
                    );
                }

                if (productJson.success) {
                    setProducts(productJson.data || []);
                }
            } catch (error) {
                console.error("Failed to load promotion manager data:", error);
                toast.error("Failed to load promotion manager data");
            } finally {
                setLoading(false);
            }
        };

        void loadData();
    }, [token]);

    function resetForm() {
        setForm({
            title: "",
            code: "",
            kind: "COLLECTION_DISCOUNT",
            type: "PERCENT",
            value: "",
            startsAt: "",
            expiresAt: "",
            minimumOrderAmount: "",
            minimumQty: "",
            autoApply: false,
            status: true,
            collectionIds: [],
            productIds: [],
            combinableWith: [],
        });
    }

    function fetchDiscountsOnly() {
        if (!token) return;

        void (async () => {
            try {
                setLoading(true);
                const res = await fetch(`${API_BASE}/discounts`, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });
                const json = await res.json();
                if (json.success) {
                    setDiscounts(json.data || []);
                }
            } catch (error) {
                console.error("Failed to refresh promotions:", error);
                toast.error("Failed to refresh promotions");
            } finally {
                setLoading(false);
            }
        })();
    }

    function openModal(discount?: Discount) {
        if (discount) {
            setEditingId(discount.id);
            setForm({
                title: discount.title,
                code: discount.code,
                kind: discount.kind,
                type: discount.type,
                value: String(discount.value),
                startsAt: toInputDateTime(discount.startsAt),
                expiresAt: toInputDateTime(discount.expiresAt),
                minimumOrderAmount:
                    discount.minimumOrderAmount !== null &&
                    discount.minimumOrderAmount !== undefined
                        ? String(discount.minimumOrderAmount)
                        : "",
                minimumQty:
                    discount.minimumQty !== null &&
                    discount.minimumQty !== undefined
                        ? String(discount.minimumQty)
                        : "",
                autoApply: Boolean(discount.autoApply),
                status: Boolean(discount.status),
                collectionIds: (discount.collectionTargets || []).map(
                    (target) => target.collectionId,
                ),
                productIds: (discount.productTargets || []).map(
                    (target) => target.productId,
                ),
                combinableWith: normalizeCombinableWith(
                    discount.combinableWith,
                ).filter((kind) =>
                    getAllowedCombinableOptions(discount.kind).includes(kind),
                ),
            });
        } else {
            setEditingId(null);
            resetForm();
        }

        setModalOpen(true);
        onExternalOpenChange?.(true);
    }

    function closeModal() {
        setModalOpen(false);
        setEditingId(null);
        resetForm();
        onExternalOpenChange?.(false);
    }

    async function handleSubmit(event: React.FormEvent) {
        event.preventDefault();

        if (!token) {
            toast.error("Authentication required");
            return;
        }

        const sanitizedCombinableWith = form.combinableWith.filter((kind) =>
            getAllowedCombinableOptions(form.kind).includes(kind),
        );

        const payload = {
            title: form.title,
            code: form.code.toUpperCase(),
            kind: form.kind,
            type: form.type,
            value: Number(form.value),
            startsAt: form.startsAt
                ? new Date(form.startsAt).toISOString()
                : null,
            expiresAt: new Date(form.expiresAt).toISOString(),
            minimumOrderAmount: form.minimumOrderAmount
                ? Number(form.minimumOrderAmount)
                : null,
            minimumQty: form.minimumQty ? Number(form.minimumQty) : null,
            autoApply: form.autoApply,
            status: form.status,
            collectionIds: form.collectionIds,
            productIds: form.productIds,
            combinableWith: sanitizedCombinableWith,
        };

        if (
            form.kind === "COLLECTION_DISCOUNT" &&
            form.collectionIds.length === 0
        ) {
            toast.error("Select at least one collection target");
            return;
        }

        if (
            form.kind === "SPECIFIC_PRODUCT_DISCOUNT" &&
            form.productIds.length === 0
        ) {
            toast.error("Select at least one product target");
            return;
        }

        if (
            form.kind === "MINIMUM_PURCHASE_DISCOUNT" &&
            !form.minimumOrderAmount
        ) {
            toast.error("Minimum purchase amount is required");
            return;
        }

        if (form.kind === "MINIMUM_QTY_DISCOUNT" && !form.minimumQty) {
            toast.error("Minimum quantity is required");
            return;
        }

        if (
            form.kind === "MINIMUM_PURCHASE_DISCOUNT" &&
            Number(form.minimumOrderAmount) <= 0
        ) {
            toast.error("Minimum purchase amount must be greater than zero");
            return;
        }

        if (
            form.kind === "MINIMUM_QTY_DISCOUNT" &&
            Number(form.minimumQty) <= 0
        ) {
            toast.error("Minimum quantity must be greater than zero");
            return;
        }

        const method = editingId ? "PUT" : "POST";
        const url = editingId
            ? `${API_BASE}/discounts/${editingId}`
            : `${API_BASE}/discounts`;

        try {
            setSubmitting(true);
            const response = await fetch(url, {
                method,
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify(payload),
            });

            const json = await response.json();

            if (!response.ok || !json.success) {
                throw new Error(json.message || "Failed to save promotion");
            }

            toast.success(
                editingId ? "Promotion updated" : "Promotion created",
            );
            closeModal();
            fetchDiscountsOnly();
        } catch (error) {
            console.error("Failed to save promotion:", error);
            toast.error(
                error instanceof Error
                    ? error.message
                    : "Failed to save promotion",
            );
        } finally {
            setSubmitting(false);
        }
    }

    async function handleDeleteConfirm() {
        if (!deleteTarget || !token) return;

        try {
            setDeleting(true);
            const response = await fetch(
                `${API_BASE}/discounts/${deleteTarget.id}`,
                {
                    method: "DELETE",
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                },
            );
            const json = await response.json();

            if (!response.ok || !json.success) {
                throw new Error(json.message || "Failed to delete promotion");
            }

            toast.success(`"${deleteTarget.title}" deleted`);
            setDeleteTarget(null);
            fetchDiscountsOnly();
        } catch (error) {
            console.error("Failed to delete promotion:", error);
            toast.error(
                error instanceof Error
                    ? error.message
                    : "Failed to delete promotion",
            );
        } finally {
            setDeleting(false);
        }
    }

    async function updateStatus(discount: Discount, nextStatus: boolean) {
        if (!token) return;

        try {
            const response = await fetch(
                `${API_BASE}/discounts/${discount.id}/status`,
                {
                    method: "PATCH",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`,
                    },
                    body: JSON.stringify({ status: nextStatus }),
                },
            );
            const json = await response.json();

            if (!response.ok || !json.success) {
                throw new Error(json.message || "Failed to update status");
            }

            toast.success(
                `${discount.title} is now ${nextStatus ? "active" : "inactive"}`,
            );
            fetchDiscountsOnly();
        } catch (error) {
            console.error("Failed to update promotion status:", error);
            toast.error(
                error instanceof Error
                    ? error.message
                    : "Failed to update promotion status",
            );
        }
    }

    if (!token) {
        return (
            <div className="py-16 text-center text-sm text-gray-500">
                Checking authentication...
            </div>
        );
    }

    return (
        <div className={embedded ? "" : "min-h-screen bg-stone-50 p-6"}>
            <div className={embedded ? "" : "mx-auto max-w-7xl"}>
                {/* <div className="mb-6 flex flex-col gap-4 rounded-3xl border border-stone-200 bg-white p-6 shadow-sm md:flex-row md:items-end md:justify-between">
                    <div className="max-w-2xl">
                        <h1 className="text-2xl font-semibold text-stone-900 md:text-3xl">
                            {title}
                        </h1>
                        <p className="mt-2 text-sm text-stone-500 md:text-base">
                            {description}
                        </p>
                    </div>

                    <button
                        type="button"
                        onClick={() => openModal()}
                        className="inline-flex items-center justify-center gap-2 rounded-2xl bg-primary-studio px-5 py-3 text-sm font-medium text-white transition hover:bg-secondary-studio"
                    >
                        <Plus size={16} />
                        Add Discount
                    </button>
                </div> */}

                {loading ? (
                    <div className="overflow-hidden rounded-2xl border border-stone-200 bg-white">
                        {Array.from({ length: 5 }).map((_, index) => (
                            <div
                                key={index}
                                className="flex items-center gap-4 border-b border-stone-100 px-5 py-4 last:border-0"
                            >
                                <div className="h-4 w-24 animate-pulse rounded bg-stone-100" />
                                <div className="h-4 w-40 animate-pulse rounded bg-stone-100" />
                                <div className="ml-auto h-4 w-16 animate-pulse rounded bg-stone-100" />
                            </div>
                        ))}
                    </div>
                ) : discounts.length === 0 ? (
                    <div className="rounded-2xl border border-dashed border-stone-300 bg-white p-14 text-center text-stone-500">
                        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-stone-100 text-stone-400">
                            <Layers3 size={28} />
                        </div>
                        <h2 className="text-lg font-semibold text-stone-900">
                            No promotions yet
                        </h2>
                        <p className="mt-2 text-sm text-stone-500">
                            Create your first promotion rule to connect the new
                            promo engine.
                        </p>
                    </div>
                ) : (
                    <div className="overflow-hidden rounded-2xl border border-stone-200 bg-white shadow-sm">
                        <table className="w-full table-auto text-sm">
                            <thead>
                                <tr className="border-b border-stone-100 bg-stone-50 text-left">
                                    <th className="px-5 py-3 text-xs font-semibold uppercase tracking-[0.12em] text-stone-400">
                                        Title
                                    </th>
                                    <th className="px-5 py-3 text-xs font-semibold uppercase tracking-[0.12em] text-stone-400">
                                        Type
                                    </th>
                                    <th className="px-5 py-3 text-xs font-semibold uppercase tracking-[0.12em] text-stone-400">
                                        Value
                                    </th>
                                    <th className="px-5 py-3 text-xs font-semibold uppercase tracking-[0.12em] text-stone-400">
                                        Expires
                                    </th>
                                    <th className="px-5 py-3 text-xs font-semibold uppercase tracking-[0.12em] text-stone-400">
                                        Status
                                    </th>
                                    <th className="px-5 py-3 text-xs font-semibold uppercase tracking-[0.12em] text-stone-400">
                                        Actions
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-stone-100">
                                {discounts.map((discount) => (
                                    <tr
                                        key={discount.id}
                                        className="group transition hover:bg-stone-50/60"
                                    >
                                        {/* Promotion */}
                                        <td className="px-5 py-4">
                                            <p className="font-medium text-stone-900">
                                                {discount.title}
                                            </p>
                                            <p className="mt-0.5 flex items-center gap-1.5 font-mono text-xs text-stone-400">
                                                <Tag size={11} />
                                                {discount.code}
                                            </p>
                                            {discount.autoApply && (
                                                <span className="mt-1.5 inline-flex items-center gap-1 rounded-md bg-amber-50 px-2 py-0.5 text-[11px] font-medium text-amber-600">
                                                    <Sparkles size={10} />
                                                    Auto Apply
                                                </span>
                                            )}
                                        </td>

                                        {/* Kind */}
                                        <td className="px-5 py-4">
                                            <span className="inline-block rounded-md bg-primary-studio/10 px-2.5 py-1 text-xs font-semibold text-primary-studio">
                                                {KIND_LABELS[discount.kind]}
                                            </span>
                                        </td>

                                        {/* Value */}
                                        <td className="px-5 py-4">
                                            <span className="font-semibold text-stone-800">
                                                {discount.type === "PERCENT"
                                                    ? `${discount.value}%`
                                                    : `Rp ${Number(discount.value).toLocaleString("id-ID")}`}
                                            </span>
                                            <p className="mt-0.5 text-xs text-stone-400">
                                                Used {discount.usedCount}×
                                            </p>
                                        </td>

                                        {/* Expires */}
                                        <td className="px-5 py-4 text-xs text-stone-500">
                                            {formatDate(discount.expiresAt)}
                                        </td>

                                        {/* Status */}
                                        <td className="px-5 py-4">
                                            <button
                                                type="button"
                                                onClick={() =>
                                                    updateStatus(
                                                        discount,
                                                        !discount.status,
                                                    )
                                                }
                                                className={`rounded-full px-3 py-1 text-xs font-semibold transition ${
                                                    discount.status
                                                        ? "bg-emerald-100 text-emerald-700 hover:bg-emerald-200"
                                                        : "bg-stone-200 text-stone-600 hover:bg-stone-300"
                                                }`}
                                            >
                                                {discount.status
                                                    ? "Active"
                                                    : "Inactive"}
                                            </button>
                                        </td>

                                        {/* Actions */}
                                        <td className="px-5 py-4">
                                            <div className="flex items-center gap-1.5">
                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        openModal(discount)
                                                    }
                                                    className="rounded-lg border border-stone-200 p-1.5 text-stone-400 transition hover:border-sky-200 hover:bg-sky-50 hover:text-sky-600"
                                                >
                                                    <Pencil size={14} />
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        setDeleteTarget({
                                                            id: discount.id,
                                                            title: discount.title,
                                                        })
                                                    }
                                                    className="rounded-lg border border-stone-200 p-1.5 text-stone-400 transition hover:border-red-200 hover:bg-red-50 hover:text-red-500"
                                                >
                                                    <Trash2 size={14} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            <DeleteConfirmModal
                open={!!deleteTarget}
                itemName={deleteTarget?.title}
                loading={deleting}
                onConfirm={handleDeleteConfirm}
                onCancel={() => {
                    if (!deleting) setDeleteTarget(null);
                }}
            />

            {modalOpen ? (
                <DiscountFormModal
                    editingId={editingId}
                    submitting={submitting}
                    form={form}
                    collections={collections}
                    products={products}
                    onChange={setForm}
                    onSubmit={handleSubmit}
                    onClose={closeModal}
                />
            ) : null}
        </div>
    );
}
