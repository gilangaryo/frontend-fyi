'use client'

import { useEffect, useState } from 'react'
import { API_BASE } from '@/lib/constants'

const COURIER_OPTIONS = [
    { label: 'JNE', value: 'jne' },
    { label: 'SiCepat', value: 'sicepat' },
    { label: 'j&t', value: 'jnt' },
]

export default function SettingsPage() {
    const [storeOpen, setStoreOpen] = useState(true)
    const [defaultCourier, setDefaultCourier] = useState('')
    const [loading, setLoading] = useState(false)
    const [savingCourier, setSavingCourier] = useState(false)
    const [message, setMessage] = useState('')

    useEffect(() => {
        (async () => {
            try {
                const [storeRes, courierRes] = await Promise.all([
                    fetch(`${API_BASE}/setting/store-status`),
                    fetch(`${API_BASE}/setting/default-courier`),
                ])

                const storeJson = await storeRes.json()
                const courierJson = await courierRes.json()

                if (storeJson.success) setStoreOpen(storeJson.data.isOpen)
                if (courierJson.success) setDefaultCourier(courierJson.data.value || '')
            } catch (err) {
                console.error('Failed to fetch settings:', err)
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
            setMessage('❌ Gagal memperbarui status toko.')
        } finally {
            setLoading(false)
        }
    }

    async function updateCourier() {
        if (!defaultCourier) return alert('Please select a courier.')
        setSavingCourier(true)
        try {
            const res = await fetch(`${API_BASE}/setting/default-courier`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    courier: defaultCourier
                }),
            })
            const json = await res.json()
            if (json.success) {
                setMessage(`Default courier set to ${defaultCourier.toUpperCase()}.`)
            } else {
                setMessage('Failed to update default courier.')
            }
        } catch (err) {
            console.error('Failed to update courier:', err)
            setMessage('Gagal memperbarui default courier.')
        } finally {
            setSavingCourier(false)
        }
    }

    return (
        <div className="max-w-4xl mx-auto mt-12 bg-white shadow p-6 rounded-xl space-y-8">
            <h1 className="text-2xl font-semibold">Store Settings</h1>

            <div className="flex items-center justify-between">
                <div>
                    <p className="text-gray-700 font-medium">Store Status</p>
                    <p className="text-sm text-gray-500">
                        {storeOpen ? 'Store is open.' : 'Store is closed.'}
                    </p>
                </div>

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

            <div>
                <p className="text-gray-700 font-medium mb-2">Default Courier</p>
                <div className="flex gap-2">
                    <select
                        className="border rounded-lg px-3 py-2 flex-1 text-gray-700 focus:outline-none focus:ring-2 focus:ring-primary/50"
                        value={defaultCourier}
                        onChange={(e) => setDefaultCourier(e.target.value)}
                    >
                        <option value="">Select Courier</option>
                        {COURIER_OPTIONS.map((opt) => (
                            <option key={opt.value} value={opt.value}>
                                {opt.label}
                            </option>
                        ))}
                    </select>

                    <button
                        onClick={updateCourier}
                        disabled={savingCourier}
                        className={`px-4 py-2 rounded-md bg-sky-500 text-white font-medium ${savingCourier ? 'bg-sky-400' : 'bg-sky-500 hover:bg-sky-600'}`}
                    >
                        {savingCourier ? 'Saving...' : 'Save'}
                    </button>
                </div>
            </div>

            {message && (
                <p className="mt-2 text-sm text-gray-600 transition-opacity duration-200">
                    {message}
                </p>
            )}
        </div>
    )
}
