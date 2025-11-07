'use client'

import { useState } from "react"
import { API_BASE } from "@/lib/constants"

interface AcceptOrderButtonProps {
    orderId: string
    status: string
    onAccepted: (id: string) => void
    onClose?: () => void
    trackingLink?: string
    fullWidth?: boolean
}

export default function AcceptOrderButton({
    orderId,
    status,
    onAccepted,
    onClose,
    trackingLink,
    fullWidth = false,
}: AcceptOrderButtonProps) {

    const [loading, setLoading] = useState(false)
    const [showConfirm, setShowConfirm] = useState(false)
    const [showSuccess, setShowSuccess] = useState(false)
    const [showError, setShowError] = useState(false)
    const [errorMessage, setErrorMessage] = useState('')
    const [trackingInfo, setTrackingInfo] = useState<{
        courier?: string
        trackingId?: string
        waybillId?: string
        trackingLink?: string
    } | null>(null)

    function handleClickAccept(e: React.MouseEvent) {
        e.stopPropagation()
        if (status !== "NEW") return
        setShowConfirm(true)
    }

    async function confirmAccept() {
        setShowConfirm(false)

        try {
            setLoading(true)
            const token = localStorage.getItem('token')

            if (!token) {
                setErrorMessage('Please login first')
                setShowError(true)
                setTimeout(() => setShowError(false), 3000)
                return
            }

            const res = await fetch(`${API_BASE}/orders/accept/${orderId}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
            })

            if (res.status === 401) {
                setErrorMessage('Session expired. Please login again.')
                setShowError(true)
                setTimeout(() => {
                    setShowError(false)
                    localStorage.removeItem('token')
                    window.location.href = '/login'
                }, 2000)
                return
            }

            const json = await res.json()

            if (json.success) {
                setTrackingInfo(json.data?.tracking || null)
                setShowSuccess(true)
                onAccepted(orderId)
                setTimeout(() => {
                    setShowSuccess(false)
                    if (onClose) {
                        onClose()
                    }
                }, 2000)
            } else {
                setErrorMessage(json.message || 'Failed to accept order')
                setShowError(true)
                setTimeout(() => setShowError(false), 4000)
            }
        } catch (err) {
            console.error("❌ Error:", err)
            setErrorMessage('Connection error. Please try again.')
            setShowError(true)
            setTimeout(() => setShowError(false), 4000)
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className={`${fullWidth ? "w-full" : ""} relative`}>
            {status === "PACKED" ? (
                (trackingInfo?.trackingLink || trackingLink) ? (
                    <a
                        href={trackingInfo?.trackingLink || trackingLink!}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={(e) => e.stopPropagation()}
                        className={`block text-center ${fullWidth ? "w-full py-3" : "px-4 py-2"} 
                rounded-md bg-primary-studio/10 text-primary-studio hover:bg-primary-studio/20 
                text-sm font-medium transition`}
                    >
                        View Tracking →
                    </a>
                ) : (
                    <button
                        disabled
                        className={`bg-gray-200 text-gray-500 cursor-not-allowed 
                ${fullWidth ? "w-full py-3" : "px-4 py-2"} rounded-md text-sm font-medium`}
                    >
                        View Tracking →
                    </button>
                )
            ) : (

                <button
                    onClick={handleClickAccept}
                    disabled={status !== "NEW" || loading}
                    className={`${status === "NEW"
                        ? "bg-primary-studio text-white hover:opacity-90"
                        : "bg-gray-200 text-gray-500 cursor-not-allowed"
                        } ${fullWidth ? "w-full py-3" : "px-4 py-2"} rounded-md text-sm font-medium transition disabled:opacity-50`}
                >
                    {loading ? "Processing..."
                        : status === "PENDING"
                            ? "Waiting Payment"
                            : status === "DRAFT"
                                ? "Waiting Payment"
                                : "Accept Order"

                    }
                </button>
            )}




            {/* Confirmation Modal */}
            {showConfirm && (
                <>
                    <div
                        className="fixed inset-0 bg-black/30 z-40 animate-fadeIn"
                        onClick={() => setShowConfirm(false)}
                    />
                    <div
                        className="fixed top-1/2 left-1/2 z-50 bg-white rounded-xl shadow-2xl p-6 max-w-md w-[90vw] animate-scaleIn"
                        style={{ transformOrigin: 'center center', transform: 'translate(-50%, -50%)' }}
                    >

                        <div className="flex items-start gap-3 mb-4">
                            {/* <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                                <svg className="w-6 h-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </div> */}
                            <div className="text-center ">
                                <h3 className="font-semibold text-gray-900 mb-1">Accept Order?</h3>
                                <p className="text-sm text-gray-600">
                                    This will confirm shipping with the courier and generate a tracking number. The order will be marked as PACKED.
                                </p>
                            </div>
                        </div>
                        <div className="flex gap-3">
                            <button
                                onClick={() => setShowConfirm(false)}
                                className="flex-1 px-4 py-2.5 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={confirmAccept}
                                className="flex-1 px-4 py-2.5 bg-primary-studio text-white rounded-lg font-medium hover:opacity-90 transition"
                            >
                                Accept Order
                            </button>
                        </div>
                    </div>
                </>
            )}

            {/* Success Toast */}
            {showSuccess && (
                <div className="fixed top-4 right-4 z-50 bg-green-50 border border-green-200 rounded-lg p-4 shadow-lg max-w-md animate-slideIn">
                    <div className="flex items-start gap-3">
                        <svg className="w-6 h-6 text-green-600 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        <div className="flex-1">
                            <h4 className="font-semibold text-green-900 mb-1">Order Accepted!</h4>
                            {trackingInfo && (
                                <div className="text-sm text-green-800 space-y-1">
                                    {trackingInfo.courier && (
                                        <p>Courier: <span className="font-medium">{trackingInfo.courier.toUpperCase()}</span></p>
                                    )}
                                    {trackingInfo.trackingId && (
                                        <p>Tracking: <span className="font-mono text-xs">{trackingInfo.trackingId}</span></p>
                                    )}
                                    {trackingInfo.waybillId && (
                                        <p>Waybill: <span className="font-mono text-xs">{trackingInfo.waybillId}</span></p>
                                    )}
                                    {trackingInfo.trackingLink && (
                                        <a
                                            href={trackingInfo.trackingLink}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-blue-600 hover:underline text-xs block mt-1"
                                        >
                                            View Tracking →
                                        </a>
                                    )}
                                </div>
                            )}
                        </div>
                        <button
                            onClick={() => setShowSuccess(false)}
                            className="text-green-600 hover:text-green-800 text-xl"
                        >
                            ×
                        </button>
                    </div>
                </div>
            )}

            {/* Error Toast */}
            {showError && (
                <div className="fixed top-4 right-4 z-50 bg-red-50 border border-red-200 rounded-lg p-4 shadow-lg max-w-md animate-slideIn">
                    <div className="flex items-start gap-3">
                        <svg className="w-6 h-6 text-red-600 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                        <div className="flex-1">
                            <h4 className="font-semibold text-red-900 mb-1">Error</h4>
                            <p className="text-sm text-red-800">{errorMessage}</p>
                        </div>
                        <button
                            onClick={() => setShowError(false)}
                            className="text-red-600 hover:text-red-800 text-xl"
                        >
                            ×
                        </button>
                    </div>
                </div>
            )}

            {/* Animations */}
            <style jsx>{`
                @keyframes fadeIn {
                    from { opacity: 0; }
                    to { opacity: 1; }
                }
                @keyframes slideIn {
                    from {
                        opacity: 0;
                        transform: translateX(100%);
                    }
                    to {
                        opacity: 1;
                        transform: translateX(0);
                    }
                }
               @keyframes scaleIn {
                    from {
                        opacity: 0;
                        transform: translate(-50%, -50%) scale(0.9);
                    }
                    to {
                        opacity: 1;
                        transform: translate(-50%, -50%) scale(1);
                    }
                }

                .animate-fadeIn {
                    animation: fadeIn 0.2s ease-out;
                }
                .animate-slideIn {
                    animation: slideIn 0.3s ease-out;
                }
                .animate-scaleIn {
                    animation: scaleIn 0.3s ease-out;
                }
            `}</style>
        </div>
    )
}
