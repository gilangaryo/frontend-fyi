'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { AlertTriangle, X, Loader2 } from 'lucide-react'

interface DeleteConfirmModalProps {
    open: boolean
    title?: string
    message?: string
    itemName?: string
    loading?: boolean
    onConfirm: () => void
    onCancel: () => void
}

export default function DeleteConfirmModal({
    open,
    title = 'Delete Confirmation',
    message,
    itemName,
    loading = false,
    onConfirm,
    onCancel,
}: DeleteConfirmModalProps) {
    return (
        <AnimatePresence>
            {open && (
                <motion.div
                    className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={(e) => {
                        if (e.target === e.currentTarget && !loading) onCancel()
                    }}
                >
                    <motion.div
                        initial={{ scale: 0.9, opacity: 0, y: 10 }}
                        animate={{ scale: 1, opacity: 1, y: 0 }}
                        exit={{ scale: 0.9, opacity: 0, y: 10 }}
                        transition={{ duration: 0.2, ease: 'easeOut' }}
                        className="relative w-full max-w-sm bg-white rounded-2xl shadow-2xl overflow-hidden"
                    >
                        {/* Close button */}
                        <button
                            onClick={onCancel}
                            disabled={loading}
                            className="absolute top-3 right-3 w-8 h-8 flex items-center justify-center rounded-lg text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition disabled:opacity-50"
                        >
                            <X size={18} />
                        </button>

                        <div className="px-6 pt-6 pb-5">
                            {/* Icon */}
                            <div className="flex justify-center mb-4">
                                <div className="w-14 h-14 rounded-full bg-red-50 flex items-center justify-center">
                                    <AlertTriangle size={28} className="text-red-500" />
                                </div>
                            </div>

                            {/* Title */}
                            <h3 className="text-lg font-semibold text-gray-900 text-center mb-1">
                                {title}
                            </h3>

                            {/* Message */}
                            <p className="text-sm text-gray-500 text-center leading-relaxed">
                                {message || (
                                    <>
                                        Are you sure you want to delete
                                        {itemName ? (
                                            <> <span className="font-medium text-gray-700">&quot;{itemName}&quot;</span></>
                                        ) : (
                                            ' this item'
                                        )}
                                        ? This action cannot be undone.
                                    </>
                                )}
                            </p>
                        </div>

                        {/* Actions */}
                        <div className="flex gap-3 px-6 pb-6">
                            <button
                                onClick={onCancel}
                                disabled={loading}
                                className="flex-1 px-4 py-2.5 rounded-xl text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 transition disabled:opacity-50"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={onConfirm}
                                disabled={loading}
                                className="flex-1 px-4 py-2.5 rounded-xl text-sm font-medium text-white bg-red-500 hover:bg-red-600 transition disabled:opacity-50 flex items-center justify-center gap-2"
                            >
                                {loading ? (
                                    <>
                                        <Loader2 size={16} className="animate-spin" />
                                        Deleting...
                                    </>
                                ) : (
                                    'Delete'
                                )}
                            </button>
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    )
}
