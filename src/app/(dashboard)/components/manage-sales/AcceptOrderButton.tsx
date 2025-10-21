'use client'

import { useState } from "react"
import { API_BASE } from "@/lib/constants"

interface AcceptOrderButtonProps {
    orderId: string
    status: string
    onAccepted: (id: string) => void
    fullWidth?: boolean // opsional: untuk style di modal
}

export default function AcceptOrderButton({
    orderId,
    status,
    onAccepted,
    fullWidth = false,
}: AcceptOrderButtonProps) {
    const [loading, setLoading] = useState(false)
    const [, setMessage] = useState<string | null>(null)

    async function handleAccept(e: React.MouseEvent) {
        e.stopPropagation()
        if (status !== "NEW") return

        try {
            setLoading(true)
            setMessage(null)

            const res = await fetch(`${API_BASE}/orders/accept/${orderId}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
            })
            const json = await res.json()

            if (json.success) {
                onAccepted(orderId)
                setMessage("Order accepted successfully.")
            } else {
                setMessage("Failed to accept order.")
            }
        } catch (err) {
            console.error("⚠️ Error accepting order:", err)
            setMessage("⚠️ Error connecting to server.")
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className={`${fullWidth ? "w-full" : ""}`}>
            <button
                onClick={handleAccept}
                disabled={status !== "NEW" || loading}
                className={`${status === "NEW"
                    ? "bg-primary-studio text-white hover:opacity-90"
                    : "bg-gray-200 text-gray-500 cursor-not-allowed"
                    } ${fullWidth ? "w-full py-3" : "px-4 py-2"} rounded-md text-sm font-medium transition`}
            >
                {loading ? "Processing..." : status === "NEW" ? "Accept Order" : "Processed"}
            </button>

        </div>
    )
}
