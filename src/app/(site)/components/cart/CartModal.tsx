/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { AnimatePresence, motion } from "framer-motion";
import Image from "next/image";
import { useSelector, useDispatch } from "react-redux";
import { RootState } from "@/store";
import { removeFromCart, updateQuantity, setGiftNote } from "@/store/cartSlice";
import { Gift } from "lucide-react";
import { useEffect, useState } from "react";
import { API_BASE } from "@/lib/constants";
import toast from "react-hot-toast";

interface CartModalProps {
    open: boolean;
    onClose: () => void;
}

export default function CartModal({ open, onClose }: CartModalProps) {
    const dispatch = useDispatch();
    const cartItems = useSelector((state: RootState) => state.cart.items);
    const giftNote = useSelector((state: RootState) => state.cart.giftNote);
    const total = cartItems.reduce(
        (sum, item) => sum + item.price * item.quantity,
        0
    );

    const [storeOpen, setStoreOpen] = useState<boolean | null>(null);
    const [giftNoteOpen, setGiftNoteOpen] = useState(false);
    const [variantStocks, setVariantStocks] = useState<Record<string, number>>(
        {}
    );

    useEffect(() => {
        (async () => {
            try {
                const res = await fetch(`${API_BASE}/setting/store-status`);
                const json = await res.json();
                if (json.success) {
                    setStoreOpen(json.data.isOpen);
                } else {
                    setStoreOpen(true);
                }
            } catch (err) {
                console.error("Failed to fetch store status:", err);
                setStoreOpen(true);
            }
        })();
    }, []);

    // Fetch variant stocks for all cart items
    useEffect(() => {
        if (!open || cartItems.length === 0) return;

        const fetchStocks = async () => {
            const stocks: Record<string, number> = {};
            const uniqueProductIds = [
                ...new Set(cartItems.map((item) => item.id)),
            ];

            await Promise.all(
                uniqueProductIds.map(async (productId) => {
                    try {
                        const res = await fetch(
                            `${API_BASE}/products/${productId}`
                        );
                        const json = await res.json();
                        if (json.success && json.data?.variants) {
                            json.data.variants.forEach((variant: any) => {
                                stocks[variant.id] = variant.stock;
                            });
                        }
                    } catch (err) {
                        console.error(
                            `Failed to fetch product ${productId}:`,
                            err
                        );
                    }
                })
            );

            setVariantStocks(stocks);
        };

        fetchStocks();
    }, [open, cartItems]);

    const handleGiftNoteChange = (value: string) => {
        dispatch(setGiftNote(value));
    };

    const handleCheckout = async () => {
        try {
            const res = await fetch(`${API_BASE}/cart/validate`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    items: cartItems.map((item) => ({
                        productId: item.id,
                        variantId: item.variantId,
                        quantity: item.quantity,
                    })),
                }),
            });

            const data = await res.json();

            if (!data.success) {
                toast.error(data.message || "Failed to validate cart.");
                return;
            }

            if (data.invalid.length > 0) {
                data.invalid.forEach((inv: any) => {
                    dispatch(
                        removeFromCart({ id: "", variantId: inv.variantId })
                    );
                });

                toast.error(
                    `Some products are no longer available:\n${data.invalid
                        .map((i: any) => `- ${i.productName}`)
                        .join("\n")}`,
                    { duration: 5000 }
                );

                return;
            }

            toast.success("Proceeding to checkout!");
            onClose();
            setTimeout(() => {
                window.location.href = "/checkout";
            }, 1000);
        } catch (err) {
            console.error("❌ Error validating cart:", err);
            toast.error("An error occurred while validating your cart.");
        }
    };

    return (
        <AnimatePresence>
            {open && (
                <>
                    {/* Overlay */}
                    <motion.div
                        className="fixed inset-0 bg-black/30 backdrop-blur-sm z-40"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.25 }}
                        onClick={onClose}
                    />

                    {/* Side Drawer */}
                    <motion.div
                        className="fixed top-0 right-0 h-full w-[92%] md:w-[85%] max-w-2xl bg-white shadow-xl z-50 flex flex-col"
                        initial={{ x: "100%" }}
                        animate={{ x: 0 }}
                        exit={{ x: "100%" }}
                        transition={{
                            type: "tween",
                            ease: "easeOut",
                            duration: 0.35,
                        }}
                    >
                        {/* Header */}
                        <div className="flex items-center justify-between p-6 bg-primary-muted border-b border-gray-200">
                            <div>
                                <h2 className="text-2xl font-semibold mb-1">
                                    Your Bag
                                </h2>
                                <p className="text-sm text-gray-500">
                                    {cartItems.length > 0
                                        ? "Your order qualifies for free shipping!"
                                        : "Your bag is empty"}
                                </p>
                            </div>
                            <button
                                onClick={onClose}
                                className="text-gray-500 hover:text-gray-800 text-2xl"
                            >
                                ×
                            </button>
                        </div>

                        {/* Cart Items */}
                        <div className="p-6 flex-1 overflow-y-auto space-y-4">
                            {cartItems.map((item) => (
                                <div
                                    key={`${item.id}-${
                                        item.variantId || "default"
                                    }`}
                                    className="flex gap-6 border-b border-gray-200 pb-6 last:border-none"
                                >
                                    {/* Product Image */}
                                    <div className="relative w-20 aspect-auto md:w-40 md:h-52 flex-shrink-0">
                                        <Image
                                            src={item.imageUrl}
                                            alt={item.title}
                                            fill
                                            className="object-cover"
                                        />
                                    </div>

                                    {/* Product Info */}
                                    <div className="flex-1 flex flex-col justify-between">
                                        <div>
                                            <h3 className="text-[17px] font-medium leading-snug text-gray-900 mb-1">
                                                {item.title}
                                            </h3>
                                            <p className="text-sm text-gray-500 mb-1">
                                                {item.size || "All Size"}
                                            </p>
                                            {item.color && (
                                                <p className="text-sm text-gray-500 mb-1">
                                                    Color: {item.color}
                                                </p>
                                            )}
                                            <p className="text-[16px] font-semibold text-gray-900">
                                                IDR{" "}
                                                {item.price.toLocaleString(
                                                    "id-ID"
                                                )}
                                            </p>
                                        </div>

                                        {/* Quantity & Remove */}
                                        <div className="flex items-center justify-between mt-4">
                                            <div className="flex items-center border border-gray-400 divide-x divide-gray-400 text-xs md:text-base">
                                                <button
                                                    className="px-3 md:px-4 py-2 hover:bg-gray-100 transition disabled:opacity-40"
                                                    onClick={() =>
                                                        dispatch(
                                                            updateQuantity({
                                                                id: item.id,
                                                                variantId:
                                                                    item.variantId,
                                                                quantity:
                                                                    item.quantity -
                                                                    1,
                                                            })
                                                        )
                                                    }
                                                    disabled={
                                                        item.quantity <= 1
                                                    }
                                                >
                                                    −
                                                </button>
                                                <span className="px-6 py-2 text-gray-800 select-none">
                                                    {item.quantity}
                                                </span>
                                                <button
                                                    className="px-3 md:px-4 py-2 hover:bg-gray-100 transition disabled:opacity-40"
                                                    onClick={() =>
                                                        dispatch(
                                                            updateQuantity({
                                                                id: item.id,
                                                                variantId:
                                                                    item.variantId,
                                                                quantity:
                                                                    item.quantity +
                                                                    1,
                                                            })
                                                        )
                                                    }
                                                    disabled={
                                                        item.quantity >=
                                                        (item.variantId
                                                            ? variantStocks[
                                                                  item.variantId
                                                              ] ?? 999
                                                            : 999)
                                                    }
                                                >
                                                    +
                                                </button>
                                            </div>

                                            <button
                                                onClick={() =>
                                                    dispatch(
                                                        removeFromCart({
                                                            id: item.id,
                                                            variantId:
                                                                item.variantId,
                                                        })
                                                    )
                                                }
                                                className="text-xs md:text-sm text-gray-800 underline hover:text-black transition"
                                            >
                                                Remove
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Footer */}
                        {cartItems.length > 0 && (
                            <motion.div
                                className="p-6 border-t border-gray-200 space-y-4"
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.2 }}
                            >
                                {/* Gift Note Section */}
                                <div className="border border-gray-200 rounded-md">
                                    <button
                                        type="button"
                                        onClick={() =>
                                            setGiftNoteOpen(!giftNoteOpen)
                                        }
                                        className="w-full flex items-center justify-between p-4 text-left hover:bg-gray-50 transition"
                                    >
                                        <div className="flex items-center gap-2 text-gray-700">
                                            <Gift size={18} />
                                            <span className="text-sm font-medium">
                                                Add gift note
                                            </span>
                                        </div>
                                        <svg
                                            className={`w-5 h-5 text-gray-500 transition-transform ${
                                                giftNoteOpen ? "rotate-180" : ""
                                            }`}
                                            fill="none"
                                            viewBox="0 0 24 24"
                                            stroke="currentColor"
                                        >
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                strokeWidth={2}
                                                d="M19 9l-7 7-7-7"
                                            />
                                        </svg>
                                    </button>

                                    {giftNoteOpen && (
                                        <div className="px-4 pb-4 space-y-2">
                                            <textarea
                                                value={giftNote}
                                                onChange={(e) =>
                                                    handleGiftNoteChange(
                                                        e.target.value
                                                    )
                                                }
                                                placeholder="Write your gift message here..."
                                                rows={3}
                                                maxLength={200}
                                                className="w-full border border-gray-300 rounded-md p-3 text-sm focus:outline-none focus:ring-1 focus:ring-gray-400 resize-none"
                                            />
                                            <p className="text-xs text-gray-500 text-right">
                                                {giftNote.length}/200 characters
                                            </p>
                                        </div>
                                    )}
                                </div>

                                {/* Summary */}
                                <div className="flex justify-between text-gray-700 font-medium">
                                    <span>
                                        Subtotal{" "}
                                        <span className="text-gray-500 font-normal text-sm">
                                            ({cartItems.length}{" "}
                                            {cartItems.length > 1
                                                ? "items"
                                                : "item"}
                                            )
                                        </span>
                                    </span>
                                    <span>
                                        Rp {total.toLocaleString("id-ID")}
                                    </span>
                                </div>
                                <p className="text-gray-500 text-sm">
                                    Shipping and tax will be calculated at
                                    checkout.
                                </p>

                                {storeOpen ? (
                                    <button
                                        onClick={handleCheckout}
                                        className="block w-full text-center bg-secondary text-white py-3 rounded font-semibold hover:bg-secondary/90 transition"
                                    >
                                        Checkout Now
                                    </button>
                                ) : (
                                    <button
                                        onClick={onClose}
                                        className="block w-full text-center bg-gray-400 text-white py-3 rounded font-semibold hover:bg-gray-500 transition"
                                    >
                                        Store Closed
                                    </button>
                                )}
                            </motion.div>
                        )}
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}
