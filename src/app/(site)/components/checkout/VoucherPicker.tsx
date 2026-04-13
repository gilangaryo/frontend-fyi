"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronDown, Tag } from "lucide-react";

export interface EligiblePromotion {
    id: string;
    code: string;
    title: string;
    kind: string;
    type: string;
    value: number;
    minimumOrderAmount?: number | null;
    minimumQty?: number | null;
    expiresAt?: string;
    autoApply?: boolean;
}

interface VoucherPickerProps {
    itemLevelPromos: EligiblePromotion[];
    cartLevelPromos: EligiblePromotion[];
    availableLoading: boolean;
    availablePromos: EligiblePromotion[];
    selectedItemLevelId: string | null;
    selectedCartLevelId: string | null;
    onSelectItemLevel: (id: string | null) => void;
    onSelectCartLevel: (id: string | null) => void;
}

function formatCurrency(amount: number) {
    return `IDR ${amount.toLocaleString("id-ID")}`;
}

function formatExpiresAt(dateStr?: string) {
    if (!dateStr) return null;
    const d = new Date(dateStr);
    return `Valid until ${d.toLocaleDateString("id-ID", { day: "2-digit", month: "2-digit", year: "2-digit" })} - ${d.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" })} PM`;
}

function getPromoDescription(promo: EligiblePromotion): string {
    const discount =
        promo.type === "PERCENT"
            ? `Disc ${promo.value}%`
            : `Disc ${formatCurrency(promo.value)}`;
    if (promo.kind === "COLLECTION_DISCOUNT")
        return `Collection couture canvas - ${discount}`;
    if (promo.kind === "SPECIFIC_PRODUCT_DISCOUNT")
        return `Product discount - ${discount}`;
    if (promo.kind === "MINIMUM_PURCHASE_DISCOUNT" && promo.minimumOrderAmount)
        return `Min. Spend ${formatCurrency(promo.minimumOrderAmount)} - ${discount}`;
    if (promo.kind === "MINIMUM_QTY_DISCOUNT" && promo.minimumQty)
        return `Min. Qty ${promo.minimumQty} item - ${discount}`;
    return discount;
}

function PromoCard({
    promo,
    name,
    selected,
    onToggle,
}: {
    promo: EligiblePromotion;
    name: string;
    selected: boolean;
    onToggle: () => void;
}) {
    return (
        <label
            className={`flex items-start gap-3 border rounded-xl p-4 cursor-pointer transition-all ${
                selected
                    ? "border-secondary bg-[#e8e3df] shadow-[0_0_0_1px_rgba(107,87,74,0.18)]"
                    : "border-secondary/40 bg-[#f1eeeb] hover:border-secondary/70"
            }`}
        >
            <div className="pt-4">
                <input
                    type="radio"
                    name={name}
                    value={promo.id}
                    checked={selected}
                    onChange={onToggle}
                    onClick={() => {
                        if (selected) onToggle();
                    }}
                    className="sr-only"
                />
                <span
                    className={`block h-5 w-5 rounded-full border transition-colors ${
                        selected
                            ? "border-secondary bg-secondary shadow-[inset_0_0_0_3px_#f1eeeb]"
                            : "border-secondary/40 bg-stone-50"
                    }`}
                />
            </div>
            <div>
                <p
                    className={`font-semibold text-sm ${
                        selected ? "text-secondary" : "text-secondary/95"
                    }`}
                >
                    {promo.code || promo.title}
                </p>
                <p
                    className={`text-xs ${
                        selected ? "text-secondary" : "text-secondary/90"
                    }`}
                >
                    {getPromoDescription(promo)}
                </p>
                {promo.expiresAt && (
                    <p className="text-xs text-secondary/75 mt-0.5">
                        {formatExpiresAt(promo.expiresAt)}
                    </p>
                )}
            </div>
        </label>
    );
}

export default function VoucherPicker({
    itemLevelPromos,
    cartLevelPromos,
    availableLoading,
    availablePromos,
    selectedItemLevelId,
    selectedCartLevelId,
    onSelectItemLevel,
    onSelectCartLevel,
}: VoucherPickerProps) {
    const [open, setOpen] = useState(false);
    const [showAllCartLevel, setShowAllCartLevel] = useState(false);

    const selectedCount = [selectedItemLevelId, selectedCartLevelId].filter(
        Boolean,
    ).length;
    const hasPromos = availablePromos.length > 0;

    return (
        <div className="border border-stone-300 rounded-2xl bg-stone-50 p-2">
            {/* Header button */}
            <button
                type="button"
                onClick={() => setOpen((v) => !v)}
                className="w-full flex items-center justify-between px-4 py-3 font-medium transition-colors duration-200 bg-secondary text-white rounded-xl"
            >
                <span className="flex items-center gap-2 font-light">
                    <Tag size={16} />
                    Use Voucher
                </span>
                <motion.span
                    animate={{ rotate: open ? 180 : 0 }}
                    transition={{ duration: 0.2 }}
                >
                    <ChevronDown size={16} />
                </motion.span>
            </button>

            {/* Animated panel */}
            <AnimatePresence initial={false}>
                {open && (
                    <motion.div
                        key="voucher-panel"
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.25, ease: "easeInOut" }}
                        className="overflow-hidden"
                    >
                        <div className="p-3 pt-4 space-y-4 bg-stone-50">
                            {availableLoading ? (
                                <p className="text-xs text-secondary/70 animate-pulse text-center py-2">
                                    Loading vouchers...
                                </p>
                            ) : !hasPromos ? (
                                <p className="text-xs text-secondary/80 text-center py-2">
                                    No vouchers available for your cart.
                                </p>
                            ) : (
                                <>
                                    {/* Collection vouchers */}
                                    {itemLevelPromos.length > 0 && (
                                        <div className="space-y-2">
                                            {itemLevelPromos.map((promo) => (
                                                <PromoCard
                                                    key={promo.id}
                                                    promo={promo}
                                                    name="itemLevelPromo"
                                                    selected={
                                                        selectedItemLevelId ===
                                                        promo.id
                                                    }
                                                    onToggle={() =>
                                                        onSelectItemLevel(
                                                            selectedItemLevelId ===
                                                                promo.id
                                                                ? null
                                                                : promo.id,
                                                        )
                                                    }
                                                />
                                            ))}
                                        </div>
                                    )}

                                    {/* Min.Spend / Min.Qty vouchers */}
                                    {cartLevelPromos.length > 0 && (
                                        <div className="space-y-2">
                                            {cartLevelPromos.length > 1 && (
                                                <p className="text-xs font-semibold text-secondary/90 uppercase tracking-wide">
                                                    Select 1 voucher
                                                </p>
                                            )}

                                            {(showAllCartLevel
                                                ? cartLevelPromos
                                                : cartLevelPromos.slice(0, 3)
                                            ).map((promo) => (
                                                <PromoCard
                                                    key={promo.id}
                                                    promo={promo}
                                                    name="cartLevelPromo"
                                                    selected={
                                                        selectedCartLevelId ===
                                                        promo.id
                                                    }
                                                    onToggle={() =>
                                                        onSelectCartLevel(
                                                            selectedCartLevelId ===
                                                                promo.id
                                                                ? null
                                                                : promo.id,
                                                        )
                                                    }
                                                />
                                            ))}
                                            {cartLevelPromos.length > 3 && (
                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        setShowAllCartLevel(
                                                            (v) => !v,
                                                        )
                                                    }
                                                    className="w-full py-2 text-xs text-secondary bg-[#ded9d0] border border-stone-300 rounded-md hover:bg-[#d5cfc5] transition"
                                                >
                                                    {showAllCartLevel
                                                        ? "Show less"
                                                        : `Show More Voucher (${cartLevelPromos.length - 3} more)`}
                                                </button>
                                            )}
                                        </div>
                                    )}
                                </>
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Collapsed summary */}
            {!open && selectedCount > 0 && (
                <div className="mt-2 space-y-3">
                    {selectedItemLevelId &&
                        (() => {
                            const p = availablePromos.find(
                                (x) => x.id === selectedItemLevelId,
                            );
                            return p ? (
                                <div
                                    key={p.id}
                                    className="flex items-center gap-3 border border-secondary/60 rounded-xl px-4 py-3 bg-[#f1eeeb]"
                                >
                                    <span className="mt-0.5 h-5 w-5 shrink-0 rounded-full border border-secondary/70 bg-secondary shadow-[inset_0_0_0_3px_#f1eeeb]" />
                                    <div className="min-w-0">
                                        <p className="font-semibold text-sm text-secondary">
                                            {p.code || p.title}
                                        </p>
                                        <p className="text-xs text-secondary/90 mt-0.5">
                                            {getPromoDescription(p)}
                                        </p>
                                        {p.expiresAt && (
                                            <p className="text-xs text-secondary/75 mt-0.5">
                                                {formatExpiresAt(p.expiresAt)}
                                            </p>
                                        )}
                                    </div>
                                </div>
                            ) : null;
                        })()}
                    {selectedCartLevelId &&
                        (() => {
                            const p = availablePromos.find(
                                (x) => x.id === selectedCartLevelId,
                            );
                            return p ? (
                                <div
                                    key={p.id}
                                    className="flex items-center gap-3 border border-secondary/60 rounded-xl px-4 py-3 bg-[#f1eeeb]"
                                >
                                    <span className="mt-0.5 h-5 w-5 shrink-0 rounded-full border border-secondary/70 bg-secondary shadow-[inset_0_0_0_3px_#f1eeeb]" />
                                    <div className="min-w-0">
                                        <p className="font-semibold text-sm text-secondary">
                                            {p.code || p.title}
                                        </p>
                                        <p className="text-xs text-secondary/90 mt-0.5">
                                            {getPromoDescription(p)}
                                        </p>
                                        {p.expiresAt && (
                                            <p className="text-xs text-secondary/75 mt-0.5">
                                                {formatExpiresAt(p.expiresAt)}
                                            </p>
                                        )}
                                    </div>
                                </div>
                            ) : null;
                        })()}
                </div>
            )}
        </div>
    );
}
