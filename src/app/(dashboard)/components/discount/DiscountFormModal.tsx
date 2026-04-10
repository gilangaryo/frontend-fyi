"use client";

import { useState } from "react";
import {
    Package,
    Percent,
    Search,
    Shuffle,
    Sparkles,
    Tag,
    X,
} from "lucide-react";
import DateTimePicker from "./DateTimePicker";

export type PromotionKind =
    | "COLLECTION_DISCOUNT"
    | "SPECIFIC_PRODUCT_DISCOUNT"
    | "MINIMUM_PURCHASE_DISCOUNT"
    | "MINIMUM_QTY_DISCOUNT";

export type DiscountType = "PERCENT" | "VALUE";

export interface CollectionOption {
    id: string;
    title: string;
    slug: string;
}

export interface ProductOption {
    id: string;
    title: string;
    slug: string;
    collectionId?: string | null;
    collection?: {
        id: string;
        title: string;
        slug: string;
    } | null;
}

export interface DiscountForm {
    title: string;
    code: string;
    kind: PromotionKind;
    type: DiscountType;
    value: string;
    startsAt: string;
    expiresAt: string;
    minimumOrderAmount: string;
    minimumQty: string;
    autoApply: boolean;
    status: boolean;
    collectionIds: string[];
    productIds: string[];
    combinableWith: PromotionKind[];
}

interface DiscountFormModalProps {
    editingId: string | null;
    submitting: boolean;
    form: DiscountForm;
    collections: CollectionOption[];
    products: ProductOption[];
    onChange: (updater: (current: DiscountForm) => DiscountForm) => void;
    onSubmit: (event: React.FormEvent) => void;
    onClose: () => void;
}

const KIND_OPTIONS: Array<{
    value: PromotionKind;
    label: string;
    helper: string;
}> = [
    {
        value: "COLLECTION_DISCOUNT",
        label: "Collection Discount",
        helper: "Applies only to items in selected collections.",
    },
    {
        value: "SPECIFIC_PRODUCT_DISCOUNT",
        label: "Specific Product Discount",
        helper: "Applies to selected products, typically shown on product pages.",
    },
    {
        value: "MINIMUM_PURCHASE_DISCOUNT",
        label: "Minimum Purchase Discount",
        helper: "Applies when the cart subtotal reaches the minimum amount.",
    },
    {
        value: "MINIMUM_QTY_DISCOUNT",
        label: "Minimum Quantity Discount",
        helper: "Applies when the total item quantity reaches the threshold.",
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

const ITEM_LEVEL_KINDS: PromotionKind[] = [
    "COLLECTION_DISCOUNT",
    "SPECIFIC_PRODUCT_DISCOUNT",
];

const CART_LEVEL_KINDS: PromotionKind[] = [
    "MINIMUM_PURCHASE_DISCOUNT",
    "MINIMUM_QTY_DISCOUNT",
];

function getAllowedCombinableOptions(kind: PromotionKind) {
    // Cross-level stacking: item-level ↔ cart-level (but not same-level)
    if (ITEM_LEVEL_KINDS.includes(kind)) {
        return CART_LEVEL_KINDS;
    }
    return ITEM_LEVEL_KINDS;
}

function isCartLevelKind(kind: PromotionKind) {
    return CART_LEVEL_KINDS.includes(kind);
}

function formatThousands(raw: string): string {
    const num = raw.replace(/\D/g, "");
    if (!num) return "";
    return Number(num).toLocaleString("id-ID");
}

function parseThousands(formatted: string): string {
    return formatted.replace(/\D/g, "");
}

function normalizePercentageValue(raw: string): string {
    if (!raw) return "";

    const numericValue = Number(raw);
    if (Number.isNaN(numericValue)) return "";

    return String(Math.min(Math.max(numericValue, 0), 100));
}

export default function DiscountFormModal({
    editingId,
    submitting,
    form,
    collections,
    products,
    onChange,
    onSubmit,
    onClose,
}: DiscountFormModalProps) {
    const allowedCombinableOptions = getAllowedCombinableOptions(form.kind);
    const isCartLevelPromotion = CART_LEVEL_KINDS.includes(form.kind);
    const [collectionSearch, setCollectionSearch] = useState("");
    const [productSearch, setProductSearch] = useState("");

    const filteredCollections = collections.filter((c) =>
        c.title.toLowerCase().includes(collectionSearch.toLowerCase()),
    );
    const filteredProducts = products.filter(
        (p) =>
            p.title.toLowerCase().includes(productSearch.toLowerCase()) ||
            (p.collection?.title ?? "")
                .toLowerCase()
                .includes(productSearch.toLowerCase()),
    );

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 p-4 backdrop-blur-md">
            <div className="flex max-h-[90vh] w-full max-w-5xl flex-col overflow-hidden rounded-3xl bg-white shadow-2xl">
                {/* Header */}
                <div className="relative  bg-gradient-to-br from-primary-studio via-secondary-studio to-primary-studio px-8 py-6">
                    <div className="relative flex items-start justify-between gap-4">
                        <div>
                            <h2 className="text-2xl font-semibold text-white">
                                {editingId
                                    ? "Edit Promotion"
                                    : "Create Promotion"}
                            </h2>
                            <p className="mt-1 text-sm text-white/55">
                                {editingId
                                    ? "Update the promotion rule configuration below."
                                    : "Set up a new promotion rule for your store."}
                            </p>
                        </div>
                        <button
                            type="button"
                            onClick={onClose}
                            className="shrink-0 rounded-xl bg-white/10 p-2 text-white/70 transition hover:bg-white/20 hover:text-white"
                        >
                            <X size={18} />
                        </button>
                    </div>
                </div>

                {/* Form */}
                <form
                    onSubmit={onSubmit}
                    className="flex flex-1 flex-col overflow-hidden"
                >
                    <div className="flex-1 overflow-y-auto">
                        <div className="grid grid-cols-1 xl:grid-cols-[1fr_320px]">
                            {/* Left — main fields */}
                            <div className="divide-y divide-stone-100 p-6">
                                {/* Section 1 — Basic Info */}
                                <div className="space-y-4 pb-6">
                                    <div className="flex items-center gap-2.5">
                                        <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary-studio text-[10px] font-bold text-white">
                                            1
                                        </span>
                                        <p className="text-xs font-semibold uppercase tracking-[0.15em] text-stone-400">
                                            Basic Info
                                        </p>
                                    </div>
                                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                        <div className="space-y-1.5">
                                            <label className="text-sm font-medium text-stone-700">
                                                Title
                                            </label>
                                            <input
                                                required
                                                value={form.title}
                                                onChange={(e) =>
                                                    onChange((c) => ({
                                                        ...c,
                                                        title: e.target.value,
                                                    }))
                                                }
                                                className="w-full rounded-xl border border-stone-200 bg-stone-50 px-4 py-2.5 text-sm text-stone-900 outline-none transition placeholder:text-stone-400 focus:border-stone-400 focus:bg-white"
                                                placeholder="Summer Collection Booster"
                                            />
                                        </div>
                                        <div className="space-y-1.5">
                                            <label className="text-sm font-medium text-stone-700">
                                                Promo Code
                                            </label>
                                            <div className="relative">
                                                <Tag
                                                    size={14}
                                                    className="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400"
                                                />
                                                <input
                                                    required
                                                    value={form.code}
                                                    onChange={(e) =>
                                                        onChange((c) => ({
                                                            ...c,
                                                            code: e.target.value.toUpperCase(),
                                                        }))
                                                    }
                                                    className="w-full rounded-xl border border-stone-200 bg-stone-50 py-2.5 pl-9 pr-4 text-sm font-mono uppercase text-stone-900 outline-none transition placeholder:text-stone-400 focus:border-stone-400 focus:bg-white"
                                                    placeholder="SUMMER26"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Section 2 — Promotion Kind */}
                                <div className="space-y-4 py-6">
                                    <div className="flex items-center gap-2.5">
                                        <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary-studio text-[10px] font-bold text-white">
                                            2
                                        </span>
                                        <p className="text-xs font-semibold uppercase tracking-[0.15em] text-stone-400">
                                            Promotion Kind
                                        </p>
                                    </div>
                                    <div className="grid grid-cols-2 gap-3">
                                        {KIND_OPTIONS.map((option) => (
                                            <button
                                                key={option.value}
                                                type="button"
                                                onClick={() =>
                                                    onChange((c) => {
                                                        const nextIsCartLevel =
                                                            isCartLevelKind(
                                                                option.value,
                                                            );

                                                        return {
                                                            ...c,
                                                            kind: option.value,
                                                            autoApply:
                                                                nextIsCartLevel,
                                                            collectionIds:
                                                                option.value ===
                                                                "COLLECTION_DISCOUNT"
                                                                    ? c.collectionIds
                                                                    : [],
                                                            productIds:
                                                                option.value ===
                                                                "SPECIFIC_PRODUCT_DISCOUNT"
                                                                    ? c.productIds
                                                                    : [],
                                                            combinableWith:
                                                                c.combinableWith.filter(
                                                                    (kind) =>
                                                                        getAllowedCombinableOptions(
                                                                            option.value,
                                                                        ).includes(
                                                                            kind,
                                                                        ),
                                                                ),
                                                        };
                                                    })
                                                }
                                                className={`rounded-2xl border p-4 text-left transition ${
                                                    form.kind === option.value
                                                        ? "border-primary-studio bg-primary-studio text-white"
                                                        : "border-stone-200 bg-stone-50 text-stone-700 hover:border-stone-300 hover:bg-white"
                                                }`}
                                            >
                                                <p className="text-sm font-semibold">
                                                    {option.label}
                                                </p>
                                                <p
                                                    className={`mt-1 text-[11px] leading-snug ${form.kind === option.value ? "text-white/60" : "text-stone-400"}`}
                                                >
                                                    {option.helper}
                                                </p>
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Section 3 — Discount Value */}
                                <div className="space-y-4 py-6">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2.5">
                                            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary-studio text-[10px] font-bold text-white">
                                                3
                                            </span>
                                            <p className="text-xs font-semibold uppercase tracking-[0.15em] text-stone-400">
                                                Discount Value
                                            </p>
                                        </div>
                                        <div className="flex gap-1 rounded-xl border border-stone-200 p-1">
                                            {(
                                                [
                                                    "PERCENT",
                                                    "VALUE",
                                                ] as DiscountType[]
                                            ).map((type) => (
                                                <button
                                                    key={type}
                                                    type="button"
                                                    onClick={() =>
                                                        onChange((c) => ({
                                                            ...c,
                                                            type,
                                                        }))
                                                    }
                                                    className={`rounded-lg px-3 py-1.5 text-xs font-medium transition ${form.type === type ? "bg-primary-studio text-white" : "text-stone-500 hover:text-primary-studio"}`}
                                                >
                                                    {type === "PERCENT"
                                                        ? "Percentage"
                                                        : "Fixed IDR"}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-[1fr_auto]">
                                        <div className="relative">
                                            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-lg font-semibold text-stone-400">
                                                {form.type === "PERCENT"
                                                    ? "%"
                                                    : "Rp"}
                                            </span>
                                            <input
                                                required
                                                type={
                                                    form.type === "PERCENT"
                                                        ? "number"
                                                        : "text"
                                                }
                                                inputMode="numeric"
                                                min={
                                                    form.type === "PERCENT"
                                                        ? "0"
                                                        : undefined
                                                }
                                                max={
                                                    form.type === "PERCENT"
                                                        ? 100
                                                        : undefined
                                                }
                                                value={
                                                    form.type === "VALUE"
                                                        ? formatThousands(
                                                              form.value,
                                                          )
                                                        : form.value
                                                }
                                                onChange={(e) =>
                                                    onChange((c) => ({
                                                        ...c,
                                                        value:
                                                            form.type ===
                                                            "VALUE"
                                                                ? parseThousands(
                                                                      e.target
                                                                          .value,
                                                                  )
                                                                : normalizePercentageValue(
                                                                      e.target
                                                                          .value,
                                                                  ),
                                                    }))
                                                }
                                                className="w-full rounded-xl border border-stone-200 bg-stone-50 py-3 pl-10 pr-4 text-xl font-semibold text-stone-900 outline-none transition focus:border-stone-400 focus:bg-white"
                                                placeholder={
                                                    form.type === "PERCENT"
                                                        ? "0–100"
                                                        : "0"
                                                }
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-1">
                                        {form.type === "PERCENT" && (
                                            <p className="text-xs text-amber-500">
                                                Percentage max 100%.
                                            </p>
                                        )}
                                    </div>
                                </div>

                                {/* Section 4 — Schedule */}
                                <div className="space-y-4 py-6">
                                    <div className="flex items-center gap-2.5">
                                        <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary-studio text-[10px] font-bold text-white">
                                            4
                                        </span>
                                        <p className="text-xs font-semibold uppercase tracking-[0.15em] text-stone-400">
                                            Schedule
                                        </p>
                                    </div>
                                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                        <DateTimePicker
                                            label="Starts At"
                                            value={form.startsAt}
                                            onChange={(value) =>
                                                onChange((c) => ({
                                                    ...c,
                                                    startsAt: value,
                                                }))
                                            }
                                            optional
                                        />
                                        <DateTimePicker
                                            label="Expires At"
                                            value={form.expiresAt}
                                            onChange={(value) =>
                                                onChange((c) => ({
                                                    ...c,
                                                    expiresAt: value,
                                                }))
                                            }
                                            required
                                        />
                                    </div>
                                </div>

                                {/* Section 5 — Conditions (cart-level only) */}
                                {isCartLevelPromotion && (
                                    <div className="space-y-4 py-6">
                                        <div className="flex items-center gap-2.5">
                                            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary-studio text-[10px] font-bold text-white">
                                                5
                                            </span>
                                            <p className="text-xs font-semibold uppercase tracking-[0.15em] text-stone-400">
                                                Conditions
                                            </p>
                                        </div>
                                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                            {form.kind ===
                                                "MINIMUM_PURCHASE_DISCOUNT" && (
                                                <div className="space-y-1.5">
                                                    <label className="text-sm font-medium text-stone-700">
                                                        Minimum Purchase (IDR)
                                                    </label>
                                                    <input
                                                        type="text"
                                                        inputMode="numeric"
                                                        value={formatThousands(
                                                            form.minimumOrderAmount,
                                                        )}
                                                        onChange={(e) =>
                                                            onChange((c) => ({
                                                                ...c,
                                                                minimumOrderAmount:
                                                                    parseThousands(
                                                                        e.target
                                                                            .value,
                                                                    ),
                                                            }))
                                                        }
                                                        className="w-full rounded-xl border border-stone-200 bg-stone-50 px-4 py-2.5 text-sm outline-none transition focus:border-stone-400 focus:bg-white"
                                                        placeholder="1.000.000"
                                                    />
                                                    <p className="text-xs text-stone-400">
                                                        Checked after the
                                                        selected item-level
                                                        promo recalculates cart
                                                        subtotal.
                                                    </p>
                                                </div>
                                            )}
                                            {form.kind ===
                                                "MINIMUM_QTY_DISCOUNT" && (
                                                <div className="space-y-1.5">
                                                    <label className="text-sm font-medium text-stone-700">
                                                        Minimum Quantity
                                                    </label>
                                                    <input
                                                        type="number"
                                                        min="1"
                                                        value={form.minimumQty}
                                                        onChange={(e) =>
                                                            onChange((c) => ({
                                                                ...c,
                                                                minimumQty:
                                                                    e.target
                                                                        .value,
                                                            }))
                                                        }
                                                        className="w-full rounded-xl border border-stone-200 bg-stone-50 px-4 py-2.5 text-sm outline-none transition focus:border-stone-400 focus:bg-white"
                                                        placeholder="3"
                                                    />
                                                    <p className="text-xs text-stone-400">
                                                        Uses the total item
                                                        quantity across the full
                                                        cart.
                                                    </p>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )}

                                {/* Section 6 — Targets (conditional) */}
                                {form.kind === "COLLECTION_DISCOUNT" ? (
                                    <div className="space-y-4 pt-6">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-2.5">
                                                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary-studio text-[10px] font-bold text-white">
                                                    6
                                                </span>
                                                <p className="text-xs font-semibold uppercase tracking-[0.15em] text-stone-400">
                                                    Collection Targets
                                                </p>
                                            </div>
                                            {form.collectionIds.length > 0 && (
                                                <span className="rounded-full bg-primary-studio px-2.5 py-0.5 text-[11px] font-semibold text-white">
                                                    {form.collectionIds.length}{" "}
                                                    selected
                                                </span>
                                            )}
                                        </div>
                                        <div className="relative mb-2">
                                            <Search
                                                size={13}
                                                className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400"
                                            />
                                            <input
                                                type="text"
                                                placeholder="Search collections..."
                                                value={collectionSearch}
                                                onChange={(e) =>
                                                    setCollectionSearch(
                                                        e.target.value,
                                                    )
                                                }
                                                className="w-full rounded-xl border border-stone-200 bg-white py-2 pl-8 pr-3 text-xs outline-none transition focus:border-stone-400"
                                            />
                                        </div>
                                        <div className="max-h-52 overflow-y-auto rounded-2xl border border-stone-200 bg-stone-50">
                                            {filteredCollections.length ===
                                            0 ? (
                                                <p className="px-4 py-3 text-xs text-stone-400">
                                                    No collections found.
                                                </p>
                                            ) : (
                                                filteredCollections.map(
                                                    (collection) => {
                                                        const isSelected =
                                                            form.collectionIds.includes(
                                                                collection.id,
                                                            );
                                                        return (
                                                            <label
                                                                key={
                                                                    collection.id
                                                                }
                                                                className={`flex cursor-pointer items-center justify-between border-b border-stone-100 px-4 py-3 last:border-0 transition ${isSelected ? "bg-stone-100" : "hover:bg-white"}`}
                                                            >
                                                                <span className="text-sm text-stone-700">
                                                                    {
                                                                        collection.title
                                                                    }
                                                                </span>
                                                                <input
                                                                    type="checkbox"
                                                                    checked={
                                                                        isSelected
                                                                    }
                                                                    onChange={(
                                                                        e,
                                                                    ) => {
                                                                        onChange(
                                                                            (
                                                                                c,
                                                                            ) => ({
                                                                                ...c,
                                                                                collectionIds:
                                                                                    e
                                                                                        .target
                                                                                        .checked
                                                                                        ? [
                                                                                              ...c.collectionIds,
                                                                                              collection.id,
                                                                                          ]
                                                                                        : c.collectionIds.filter(
                                                                                              (
                                                                                                  id,
                                                                                              ) =>
                                                                                                  id !==
                                                                                                  collection.id,
                                                                                          ),
                                                                            }),
                                                                        );
                                                                    }}
                                                                    className="h-4 w-4 rounded border-stone-300 text-primary-studio focus:ring-primary-studio"
                                                                />
                                                            </label>
                                                        );
                                                    },
                                                )
                                            )}
                                        </div>
                                    </div>
                                ) : null}

                                {form.kind === "SPECIFIC_PRODUCT_DISCOUNT" ? (
                                    <div className="space-y-4 pt-6">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-2.5">
                                                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary-studio text-[10px] font-bold text-white">
                                                    6
                                                </span>
                                                <p className="text-xs font-semibold uppercase tracking-[0.15em] text-stone-400">
                                                    Product Targets
                                                </p>
                                            </div>
                                            {form.productIds.length > 0 && (
                                                <span className="rounded-full bg-primary-studio px-2.5 py-0.5 text-[11px] font-semibold text-white">
                                                    {form.productIds.length}{" "}
                                                    selected
                                                </span>
                                            )}
                                        </div>
                                        <div className="relative mb-2">
                                            <Search
                                                size={13}
                                                className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400"
                                            />
                                            <input
                                                type="text"
                                                placeholder="Search products..."
                                                value={productSearch}
                                                onChange={(e) =>
                                                    setProductSearch(
                                                        e.target.value,
                                                    )
                                                }
                                                className="w-full rounded-xl border border-stone-200 bg-white py-2 pl-8 pr-3 text-xs outline-none transition focus:border-stone-400"
                                            />
                                        </div>
                                        <div className="max-h-80 overflow-y-auto rounded-2xl border border-stone-200 bg-stone-50">
                                            {filteredProducts.length === 0 ? (
                                                <p className="px-4 py-3 text-xs text-stone-400">
                                                    No products found.
                                                </p>
                                            ) : (
                                                filteredProducts.map(
                                                    (product) => {
                                                        const isSelected =
                                                            form.productIds.includes(
                                                                product.id,
                                                            );
                                                        return (
                                                            <label
                                                                key={product.id}
                                                                className={`flex cursor-pointer items-center justify-between border-b border-stone-100 px-4 py-3 last:border-0 transition ${isSelected ? "bg-stone-100" : "hover:bg-white"}`}
                                                            >
                                                                <div>
                                                                    <span className="text-sm text-stone-700">
                                                                        {
                                                                            product.title
                                                                        }
                                                                    </span>
                                                                    {product
                                                                        .collection
                                                                        ?.title && (
                                                                        <span className="ml-2 text-xs text-stone-400">
                                                                            {
                                                                                product
                                                                                    .collection
                                                                                    .title
                                                                            }
                                                                        </span>
                                                                    )}
                                                                </div>
                                                                <input
                                                                    type="checkbox"
                                                                    checked={
                                                                        isSelected
                                                                    }
                                                                    onChange={(
                                                                        e,
                                                                    ) => {
                                                                        onChange(
                                                                            (
                                                                                c,
                                                                            ) => ({
                                                                                ...c,
                                                                                productIds:
                                                                                    e
                                                                                        .target
                                                                                        .checked
                                                                                        ? [
                                                                                              ...c.productIds,
                                                                                              product.id,
                                                                                          ]
                                                                                        : c.productIds.filter(
                                                                                              (
                                                                                                  id,
                                                                                              ) =>
                                                                                                  id !==
                                                                                                  product.id,
                                                                                          ),
                                                                            }),
                                                                        );
                                                                    }}
                                                                    className="h-4 w-4 rounded border-stone-300 text-primary-studio focus:ring-primary-studio"
                                                                />
                                                            </label>
                                                        );
                                                    },
                                                )
                                            )}
                                        </div>
                                    </div>
                                ) : null}
                            </div>

                            {/* Right — aside */}
                            <div className="border-t border-stone-100 bg-stone-50/80 p-6 xl:border-l xl:border-t-0">
                                <div className="space-y-6">
                                    {/* Publish Options */}
                                    <div>
                                        <div className="mb-3 flex items-center gap-2">
                                            <Package
                                                size={14}
                                                className="text-stone-500"
                                            />
                                            <h3 className="text-sm font-semibold text-stone-900">
                                                Publish Options
                                            </h3>
                                        </div>
                                        <div className="space-y-2">
                                            <label className="flex cursor-pointer items-center justify-between rounded-2xl border border-stone-200 bg-white px-4 py-3">
                                                <div>
                                                    <p className="text-sm font-medium text-stone-700">
                                                        Active
                                                    </p>
                                                    <p className="text-xs text-stone-400">
                                                        Promo is live
                                                    </p>
                                                </div>
                                                <div
                                                    className={`relative h-6 w-11 shrink-0 rounded-full transition-colors ${form.status ? "bg-primary-studio" : "bg-stone-200"}`}
                                                >
                                                    <div
                                                        className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-all ${form.status ? "left-[1.375rem]" : "left-0.5"}`}
                                                    />
                                                    <input
                                                        type="checkbox"
                                                        checked={form.status}
                                                        onChange={(e) =>
                                                            onChange((c) => ({
                                                                ...c,
                                                                status: e.target
                                                                    .checked,
                                                            }))
                                                        }
                                                        className="sr-only"
                                                    />
                                                </div>
                                            </label>
                                            <label className="flex cursor-pointer items-center justify-between rounded-2xl border border-stone-200 bg-white px-4 py-3">
                                                <div>
                                                    <p className="text-sm font-medium text-stone-700">
                                                        Auto Apply
                                                    </p>
                                                    <p className="text-xs text-stone-400">
                                                        {isCartLevelPromotion
                                                            ? "Enabled by default for cart-level promotions, but can still be turned off."
                                                            : "Stored on the promo, but checkout still uses code validation today."}
                                                    </p>
                                                </div>
                                                <div
                                                    className={`relative h-6 w-11 shrink-0 rounded-full transition-colors ${form.autoApply ? "bg-primary-studio" : "bg-stone-200"}`}
                                                >
                                                    <div
                                                        className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-all ${form.autoApply ? "left-[1.375rem]" : "left-0.5"}`}
                                                    />
                                                    <input
                                                        type="checkbox"
                                                        checked={form.autoApply}
                                                        onChange={(e) =>
                                                            onChange((c) => ({
                                                                ...c,
                                                                autoApply:
                                                                    e.target
                                                                        .checked,
                                                            }))
                                                        }
                                                        className="sr-only"
                                                    />
                                                </div>
                                            </label>
                                        </div>
                                    </div>

                                    {/* Stack With */}
                                    {/* <div>
                                        <div className="mb-1 flex items-center gap-2">
                                            <Shuffle
                                                size={14}
                                                className="text-stone-500"
                                            />
                                            <h3 className="text-sm font-semibold text-stone-900">
                                                Stack With
                                            </h3>
                                        </div>
                                        {allowedCombinableOptions.length > 0 ? (
                                            <>
                                                <p className="mb-3 text-xs text-stone-400">
                                                    Both promos must opt in to
                                                    each other for stacking to
                                                    work.
                                                </p>
                                                <div className="space-y-2">
                                                    {allowedCombinableOptions.map(
                                                        (kind) => {
                                                            const checked =
                                                                form.combinableWith.includes(
                                                                    kind,
                                                                );
                                                            return (
                                                                <label
                                                                    key={kind}
                                                                    className={`flex cursor-pointer items-center justify-between rounded-2xl border px-4 py-3 transition ${checked ? "border-stone-400 bg-white" : "border-stone-200 bg-white hover:border-stone-300"}`}
                                                                >
                                                                    <span className="text-sm text-stone-700">
                                                                        {
                                                                            KIND_LABELS[
                                                                                kind
                                                                            ]
                                                                        }
                                                                    </span>
                                                                    <div
                                                                        className={`relative h-6 w-11 shrink-0 rounded-full transition-colors ${checked ? "bg-primary-studio" : "bg-stone-200"}`}
                                                                    >
                                                                        <div
                                                                            className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-all ${checked ? "left-[1.375rem]" : "left-0.5"}`}
                                                                        />
                                                                        <input
                                                                            type="checkbox"
                                                                            checked={
                                                                                checked
                                                                            }
                                                                            onChange={(
                                                                                e,
                                                                            ) => {
                                                                                onChange(
                                                                                    (
                                                                                        c,
                                                                                    ) => ({
                                                                                        ...c,
                                                                                        combinableWith:
                                                                                            e
                                                                                                .target
                                                                                                .checked
                                                                                                ? [
                                                                                                      ...c.combinableWith,
                                                                                                      kind,
                                                                                                  ]
                                                                                                : c.combinableWith.filter(
                                                                                                      (
                                                                                                          v,
                                                                                                      ) =>
                                                                                                          v !==
                                                                                                          kind,
                                                                                                  ),
                                                                                    }),
                                                                                );
                                                                            }}
                                                                            className="sr-only"
                                                                        />
                                                                    </div>
                                                                </label>
                                                            );
                                                        },
                                                    )}
                                                </div>
                                            </>
                                        ) : null}
                                    </div> */}

                                    {/* Notes */}
                                    {/* <div className="rounded-2xl border border-dashed border-stone-300 p-4">
                                        <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.15em] text-stone-400">
                                            How It Works
                                        </p>
                                        <ul className="space-y-2 text-xs text-stone-500">
                                            <li className="flex gap-2">
                                                <span className="mt-0.5 text-stone-300">
                                                    •
                                                </span>
                                                Engine menerapkan{" "}
                                                <span className="font-medium text-stone-700">
                                                    Collection / Product
                                                </span>{" "}
                                                discount lebih dulu, lalu
                                                menghitung ulang subtotal.
                                            </li>
                                            <li className="flex gap-2">
                                                <span className="mt-0.5 text-stone-300">
                                                    •
                                                </span>
                                                <span className="font-medium text-stone-700">
                                                    Min. Purchase / Min. Qty
                                                </span>{" "}
                                                dicek dari subtotal setelah
                                                item-level discount diterapkan.
                                            </li>
                                            <li className="flex gap-2">
                                                <span className="mt-0.5 text-stone-300">
                                                    •
                                                </span>
                                                Item-level dan cart-level bisa
                                                stack — keduanya harus aktifkan
                                                "Stack With" satu sama lain.
                                            </li>
                                        </ul>
                                    </div> */}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Footer */}
                    <div className="flex items-center justify-between border-t border-stone-200 bg-white px-6 py-4">
                        <p className="text-xs text-stone-400">
                            {editingId
                                ? "Editing promotion"
                                : "Fields marked * are required"}
                        </p>
                        <div className="flex gap-3">
                            <button
                                type="button"
                                onClick={onClose}
                                className="rounded-xl border border-stone-200 px-5 py-2.5 text-sm font-medium text-stone-600 transition hover:bg-stone-100"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={submitting}
                                className="inline-flex items-center gap-2 rounded-xl bg-primary-studio px-5 py-2.5 text-sm font-medium text-white transition hover:bg-secondary-studio disabled:opacity-60"
                            >
                                {submitting ? (
                                    <>
                                        <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                                        Saving...
                                    </>
                                ) : editingId ? (
                                    "Update Promotion"
                                ) : (
                                    "Create Promotion"
                                )}
                            </button>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    );
}
