"use client";

import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";

interface AddToCartModalProps {
    isOpen: boolean;
    onClose: () => void;
    onViewCart?: () => void;
    productTitle: string;
    productImage: string;
}

export default function AddToCartModal({
    isOpen,
    onClose,
    productTitle,
    productImage,
}: AddToCartModalProps) {
    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm transition"
                    animate={{ y: 0, opacity: 1 }}
                    onClick={onClose}
                >
                    <motion.div
                        onClick={(e) => e.stopPropagation()}
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0.9, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="bg-white rounded-2xl p-6 w-[90%] max-w-md shadow-lg text-center"
                    >
                        <div className="flex justify-center mb-4">
                            <Image
                                src={productImage}
                                alt={productTitle}
                                width={100}
                                height={130}
                                className="object-cover rounded-md"
                            />
                        </div>

                        <h2 className="text-lg font-medium text-gray-800 mb-2">
                            Added to your bag
                        </h2>
                        <p className="text-sm text-gray-600 mb-6">
                            <strong>{productTitle}</strong> has been added to
                            your cart.
                        </p>

                        <div className="flex gap-3 justify-center">
                            <button
                                onClick={onClose}
                                className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-100 transition"
                            >
                                Continue Shopping
                            </button>

                            <button
                                onClick={() => {
                                    onClose();
                                    window.dispatchEvent(
                                        new Event("open-cart")
                                    );
                                }}
                                className="px-4 py-2 bg-black text-white rounded-md hover:bg-gray-800 transition"
                            >
                                View Cart
                            </button>
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
