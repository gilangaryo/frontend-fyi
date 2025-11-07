'use client'
import { motion, AnimatePresence } from 'framer-motion'
import { CheckCircle, XCircle, X } from 'lucide-react'
import React from 'react'

interface AlertModalProps {
    open: boolean
    type?: 'success' | 'error'
    title?: string
    message?: string
    onClose: () => void
}

export default function AlertModal({
    open,
    type = 'success',
    title,
    message,
    onClose,
}: AlertModalProps) {
    if (!open) return null

    const Icon = type === 'success' ? CheckCircle : XCircle
    const color =
        type === 'success' ? 'text-green-500' : 'text-red-500'
    const bg =
        type === 'success'
            ? 'bg-green-50 border-green-400'
            : 'bg-red-50 border-red-400'

    return (
        <AnimatePresence>
            {open && (
                <motion.div
                    className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/40"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                >
                    <motion.div
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0.9, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className={`relative w-[90%] max-w-sm rounded-xl border p-6 shadow-xl ${bg}`}
                    >
                        <button
                            onClick={onClose}
                            className="absolute top-3 right-3 text-gray-500 hover:text-black"
                        >
                            <X size={20} />
                        </button>

                        <div className="flex flex-col items-center text-center">
                            <Icon size={48} className={`${color} mb-2`} />
                            <h3 className="text-lg font-semibold mb-1">{title}</h3>
                            {message && <p className="text-gray-700 mb-4 text-sm">{message}</p>}

                            <button
                                onClick={onClose}
                                className="bg-gray-800 text-white rounded-md px-4 py-2 text-sm hover:bg-gray-700 transition"
                            >
                                OK
                            </button>
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    )
}
