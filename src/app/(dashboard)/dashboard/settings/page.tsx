'use client'

import { useEffect, useState } from 'react'
import { API_BASE } from '@/lib/constants'

export default function SettingsPage() {
    const [storeOpen, setStoreOpen] = useState(true)
    const [loading, setLoading] = useState(false)
    const [message, setMessage] = useState('')

    useEffect(() => {
        (async () => {
            try {
                const res = await fetch(`${API_BASE}/setting/store-status`)
                const json = await res.json()
                if (json.success) setStoreOpen(json.data.isOpen)
            } catch (err) {
                console.error('Failed to fetch store status:', err)
            }
        })()
    }, [])

    async function toggleStore() {
        setLoading(true)
        try {
            const res = await fetch(`${API_BASE}/setting/store-status`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ isOpen: !storeOpen }),
            })
            const json = await res.json()
            if (json.success) {
                setStoreOpen(!storeOpen)
                setMessage(`Now, the store is ${!storeOpen ? 'open' : 'closed'}.`)
            }
        } catch (err) {
            console.error('Failed to update store status:', err)
            setMessage('Gagal memperbarui status toko.')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="max-w-2xl mx-auto mt-8 bg-white shadow p-6 rounded-xl">
            <h1 className="text-2xl font-semibold mb-6">Store Settings</h1>

            <div className="flex items-center justify-between">
                <div>
                    <p className="text-gray-700 font-medium">Store Status</p>
                    <p className="text-sm text-gray-500">
                        {storeOpen ? 'Store is open.' : 'Store is closed.'}
                    </p>
                </div>

                {/* ✅ Toggle Switch */}
                <div
                    onClick={!loading ? toggleStore : undefined}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition cursor-pointer ${storeOpen ? 'bg-green-500' : 'bg-gray-300'} ${loading ? 'opacity-50 cursor-not-allowed' : ''
                        }`}
                >
                    <span
                        className={`inline-block h-5 w-5 transform rounded-full bg-white transition ${storeOpen ? 'translate-x-5' : 'translate-x-1'
                            }`}
                    />
                </div>
            </div>

            {message && (
                <p className="mt-4 text-sm text-gray-600 transition-opacity duration-200">
                    {message}
                </p>
            )}
        </div>
    )
}
