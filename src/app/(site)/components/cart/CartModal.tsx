"use client"

import { AnimatePresence, motion } from "framer-motion"
import Image from "next/image"
import Link from "next/link"
import { useSelector, useDispatch } from "react-redux"
import { RootState } from "@/store"
import { removeFromCart, updateQuantity } from "@/store/cartSlice"

interface CartModalProps {
    open: boolean
    onClose: () => void
}

export default function CartModal({ open, onClose }: CartModalProps) {
    const dispatch = useDispatch()
    const cartItems = useSelector((state: RootState) => state.cart.items)
    const total = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0)

    return (
        <AnimatePresence>
            {open && (
                <>
                    {/* Background Overlay */}
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
                        className="fixed top-0 right-0 h-full w-[85%] max-w-2xl bg-white shadow-2xl z-50 flex flex-col"
                        initial={{ x: "100%" }}
                        animate={{ x: 0 }}
                        exit={{ x: "100%" }}
                        transition={{ type: "tween", ease: "easeOut", duration: 0.35 }}
                    >
                        {/* Header */}
                        <div className="flex items-center justify-between p-6 border-b border-gray-200">
                            <div>
                                <h2 className="text-2xl font-semibold">Your Bag</h2>
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

                        {/* Items */}
                        <div className="p-6 flex-1 overflow-y-auto space-y-4">
                            {cartItems.map((item) => (
                                <div
                                    key={`${item.id}-${item.variantId || "default"}`}
                                    className="flex gap-6 border-b border-gray-200 pb-6 last:border-none"
                                >
                                    {/* Product Image */}
                                    <div className="relative w-40 h-52 flex-shrink-0">
                                        <Image
                                            src={item.imageUrl}
                                            alt={item.title}
                                            fill
                                            className="object-cover"
                                        />
                                    </div>

                                    {/* Info Section */}
                                    <div className="flex-1 flex flex-col justify-between">
                                        <div>
                                            <h3 className="text-[17px] font-medium tracking-tight leading-snug text-gray-900 mb-1">
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
                                                IDR {item.price.toLocaleString("id-ID")}
                                            </p>
                                        </div>

                                        {/* Quantity & Remove */}
                                        <div className="flex items-center justify-between mt-4">
                                            <div className="flex items-center border border-gray-400 divide-x divide-gray-400">
                                                <button
                                                    className="px-4 py-2 hover:bg-gray-100 transition disabled:opacity-40"
                                                    onClick={() =>
                                                        dispatch(
                                                            updateQuantity({
                                                                id: item.id,
                                                                variantId: item.variantId,
                                                                quantity: item.quantity - 1,
                                                            })
                                                        )
                                                    }
                                                    disabled={item.quantity <= 1}
                                                >
                                                    −
                                                </button>
                                                <span className="px-6 py-2 text-gray-800 select-none">
                                                    {item.quantity}
                                                </span>
                                                <button
                                                    className="px-4 py-2 hover:bg-gray-100 transition"
                                                    onClick={() =>
                                                        dispatch(
                                                            updateQuantity({
                                                                id: item.id,
                                                                variantId: item.variantId,
                                                                quantity: item.quantity + 1,
                                                            })
                                                        )
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
                                                            variantId: item.variantId,
                                                        })
                                                    )
                                                }
                                                className="text-sm text-gray-800 underline hover:text-black transition"
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
                                <div className="flex justify-between text-gray-700 font-medium">
                                    <span>
                                        Subtotal{" "}
                                        <span className="text-gray-500 font-normal text-sm">
                                            ({cartItems.length}{" "}
                                            {cartItems.length > 1 ? "items" : "item"})
                                        </span>
                                    </span>
                                    <span>Rp {total.toLocaleString("id-ID")}</span>
                                </div>
                                <p className="text-gray-500 text-sm">
                                    Shipping and tax calculated at checkout
                                </p>
                                <Link
                                    href="/checkout"
                                    onClick={onClose}
                                    className="block w-full text-center bg-secondary text-white py-3 rounded font-semibold hover:bg-secondary/90 transition"
                                >
                                    Checkout Now
                                </Link>
                            </motion.div>
                        )}
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    )
}
