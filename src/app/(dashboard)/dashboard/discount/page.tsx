'use client'

import { useEffect, useState } from 'react'
import { Plus, Trash2, Edit, Percent, DollarSign, Calendar, Tag } from 'lucide-react'
import { API_BASE } from '@/lib/constants'

interface Discount {
    id: string
    title: string
    code: string
    type: 'PERCENT' | 'VALUE'
    value: number
    expiresAt: string
    usedCount: number
    minimumOrderAmount: number | null
    createdAt: string
}

export default function DiscountPage() {
    const [discounts, setDiscounts] = useState<Discount[]>([])
    const [loading, setLoading] = useState(true)
    const [modalOpen, setModalOpen] = useState(false)
    const [editingId, setEditingId] = useState<string | null>(null)
    const [deleting, setDeleting] = useState<string | null>(null)
    const [token, setToken] = useState<string | null>(null)

    const [form, setForm] = useState({
        title: '',
        code: '',
        type: 'PERCENT' as 'PERCENT' | 'VALUE',
        value: '',
        expiresAt: '',
        minimumOrderAmount: '',
    })

    // Get token from localStorage
    useEffect(() => {
        const storedToken = localStorage.getItem('token')
        setToken(storedToken)

        if (!storedToken) {
            alert('⚠️ You need to login first!')
            window.location.href = '/login' // Redirect ke login page
        }
    }, [])

    // Fetch discounts
    const fetchDiscounts = async () => {
        if (!token) return

        try {
            setLoading(true)
            const res = await fetch(`${API_BASE}/discounts`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
            })

            const data = await res.json()

            if (res.status === 401) {
                alert('⚠️ Session expired. Please login again.')
                localStorage.removeItem('token')
                window.location.href = '/login'
                return
            }

            if (data.success) {
                setDiscounts(data.data)
            }
        } catch (err) {
            console.error('Failed to fetch discounts:', err)
            alert('❌ Failed to load discounts')
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        if (!token) return

        const fetchDiscounts = async () => {
            try {
                setLoading(true)
                const res = await fetch(`${API_BASE}/discounts`, {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                    },
                })

                const data = await res.json()

                if (res.status === 401) {
                    alert('⚠️ Session expired. Please login again.')
                    localStorage.removeItem('token')
                    window.location.href = '/login'
                    return
                }

                if (data.success) {
                    setDiscounts(data.data)
                }
            } catch (err) {
                console.error('Failed to fetch discounts:', err)
                alert('❌ Failed to load discounts')
            } finally {
                setLoading(false)
            }
        }

        fetchDiscounts()
    }, [token])
    // Open modal for create/edit
    const openModal = (discount?: Discount) => {
        if (discount) {
            setEditingId(discount.id)
            setForm({
                title: discount.title,
                code: discount.code,
                type: discount.type,
                value: discount.value.toString(),
                expiresAt: new Date(discount.expiresAt).toISOString().slice(0, 16),
                minimumOrderAmount: discount.minimumOrderAmount?.toString() || '',
            })
        } else {
            setEditingId(null)
            setForm({
                title: '',
                code: '',
                type: 'PERCENT',
                value: '',
                expiresAt: '',
                minimumOrderAmount: '',
            })
        }
        setModalOpen(true)
    }

    // Close modal
    const closeModal = () => {
        setModalOpen(false)
        setEditingId(null)
        setForm({
            title: '',
            code: '',
            type: 'PERCENT',
            value: '',
            expiresAt: '',
            minimumOrderAmount: '',
        })
    }

    // Handle submit (create or update)
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        if (!token) {
            alert('⚠️ Authentication required')
            return
        }

        const payload = {
            title: form.title,
            code: form.code.toUpperCase(),
            type: form.type,
            value: parseFloat(form.value),
            expiresAt: new Date(form.expiresAt).toISOString(),
            minimumOrderAmount: form.minimumOrderAmount
                ? parseFloat(form.minimumOrderAmount)
                : null,
        }

        try {
            const url = editingId
                ? `${API_BASE}/discounts/${editingId}`
                : `${API_BASE}/discounts`

            const method = editingId ? 'PUT' : 'POST'

            const res = await fetch(url, {
                method,
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify(payload),
            })

            const data = await res.json()

            if (res.status === 401) {
                alert('⚠️ Session expired. Please login again.')
                localStorage.removeItem('token')
                window.location.href = '/login'
                return
            }

            if (data.success) {
                alert(editingId ? '✅ Discount updated!' : '✅ Discount created!')
                closeModal()
                fetchDiscounts()
            } else {
                alert(`❌ ${data.message || 'Failed to save discount'}`)
            }
        } catch (err) {
            console.error('Error saving discount:', err)
            alert('❌ Something went wrong')
        }
    }

    // Handle delete
    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this discount?')) return

        if (!token) {
            alert('⚠️ Authentication required')
            return
        }

        try {
            setDeleting(id)
            const res = await fetch(`${API_BASE}/discounts/${id}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
            })

            const data = await res.json()

            if (res.status === 401) {
                alert('⚠️ Session expired. Please login again.')
                localStorage.removeItem('token')
                window.location.href = '/login'
                return
            }

            if (data.success) {
                alert('✅ Discount deleted!')
                fetchDiscounts()
            } else {
                alert(`❌ ${data.message || 'Failed to delete discount'}`)
            }
        } catch (err) {
            console.error('Error deleting discount:', err)
            alert('❌ Something went wrong')
        } finally {
            setDeleting(null)
        }
    }

    const formatDate = (date: string) => {
        return new Date(date).toLocaleDateString('id-ID', {
            day: 'numeric',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        })
    }

    const isExpired = (date: string) => {
        return new Date(date) < new Date()
    }

    // Loading state sebelum token tersedia
    if (!token) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <p className="text-gray-600">Checking authentication...</p>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-gray-50 p-6">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">Discount Codes</h1>
                        <p className="text-gray-600 mt-1">
                            Manage discount codes for your store
                        </p>
                    </div>
                    <button
                        onClick={() => openModal()}
                        className="flex items-center gap-2 bg-primary-studio text-white px-5 py-2.5 rounded-lg hover:bg-primary-studio/90 transition font-medium"
                    >
                        <Plus size={20} />
                        Add Discount
                    </button>
                </div>

                {/* Loading */}
                {loading && (
                    <div className="text-center py-20 text-gray-500">
                        Loading discounts...
                    </div>
                )}

                {/* Discount Grid */}
                {!loading && (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {discounts.map((discount) => (
                            <div
                                key={discount.id}
                                className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition"
                            >
                                {/* Header */}
                                <div className="flex items-start justify-between mb-4">
                                    <div className="flex-1">
                                        <h3 className="text-lg font-semibold text-gray-900 mb-1">
                                            {discount.title}
                                        </h3>
                                        <div className="flex items-center gap-2">
                                            <span className="inline-flex items-center gap-1 px-3 py-1 bg-gray-100 text-gray-800 text-sm font-mono font-medium rounded">
                                                <Tag size={14} />
                                                {discount.code}
                                            </span>
                                        </div>
                                    </div>
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => openModal(discount)}
                                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition"
                                        >
                                            <Edit size={18} />
                                        </button>
                                        <button
                                            onClick={() => handleDelete(discount.id)}
                                            disabled={deleting === discount.id}
                                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition disabled:opacity-50"
                                        >
                                            <Trash2 size={18} />
                                        </button>
                                    </div>
                                </div>

                                {/* Value */}
                                <div className="mb-4">
                                    <div className="flex items-center gap-2 text-2xl font-bold text-primary-studio">
                                        {discount.type === 'PERCENT' ? (
                                            <>
                                                <Percent size={24} />
                                                {discount.value}%
                                            </>
                                        ) : (
                                            <>
                                                IDR {discount.value.toLocaleString('id-ID')}
                                            </>
                                        )}
                                    </div>
                                    <p className="text-sm text-gray-500 mt-1">
                                        {discount.type === 'PERCENT' ? 'Percentage' : 'Fixed Amount'}
                                    </p>
                                </div>

                                {/* Details */}
                                <div className="space-y-2 text-sm">
                                    <div className="flex items-center gap-2 text-gray-600">
                                        <Calendar size={16} />
                                        <span>
                                            Expires: {formatDate(discount.expiresAt)}
                                        </span>
                                    </div>
                                    {isExpired(discount.expiresAt) && (
                                        <span className="inline-block px-2 py-1 bg-red-100 text-red-700 text-xs font-medium rounded">
                                            Expired
                                        </span>
                                    )}
                                    <div className="text-gray-600">
                                        Used: <span className="font-semibold">{discount.usedCount}</span> times
                                    </div>
                                    {discount.minimumOrderAmount && (
                                        <div className="text-gray-600">
                                            Min. order: IDR{' '}
                                            {discount.minimumOrderAmount.toLocaleString('id-ID')}
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* Empty State */}
                {!loading && discounts.length === 0 && (
                    <div className="text-center py-20">
                        <div className="text-gray-400 mb-4">
                            <Tag size={64} className="mx-auto" />
                        </div>
                        <h3 className="text-xl font-semibold text-gray-900 mb-2">
                            No discount codes yet
                        </h3>
                        <p className="text-gray-600 mb-6">
                            Create your first discount code to start offering promotions
                        </p>
                        <button
                            onClick={() => openModal()}
                            className="inline-flex items-center gap-2 bg-primary-studio text-white px-5 py-2.5 rounded-lg hover:bg-primary-studio/90 transition font-medium"
                        >
                            <Plus size={20} />
                            Add Discount
                        </button>
                    </div>
                )}
            </div>

            {/* Modal */}
            {modalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
                    <div className="bg-white rounded-xl shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto">
                        <div className="p-6 border-b border-gray-200">
                            <h2 className="text-2xl font-bold text-gray-900">
                                {editingId ? 'Edit Discount' : 'Create Discount'}
                            </h2>
                        </div>

                        <form onSubmit={handleSubmit} className="p-6 space-y-5">
                            {/* Title */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Title *
                                </label>
                                <input
                                    type="text"
                                    required
                                    value={form.title}
                                    onChange={(e) =>
                                        setForm({ ...form, title: e.target.value })
                                    }
                                    placeholder="e.g., Summer Sale 2024"
                                    className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-primary-studio focus:border-transparent"
                                />
                            </div>

                            {/* Code */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Code *
                                </label>
                                <input
                                    type="text"
                                    required
                                    value={form.code}
                                    onChange={(e) =>
                                        setForm({ ...form, code: e.target.value.toUpperCase() })
                                    }
                                    placeholder="e.g., SUMMER2024"
                                    className="w-full border border-gray-300 rounded-lg px-4 py-2.5 font-mono focus:ring-2 focus:ring-primary-studio focus:border-transparent uppercase"
                                />
                            </div>

                            {/* Type */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Discount Type *
                                </label>
                                <div className="grid grid-cols-2 gap-3">
                                    <button
                                        type="button"
                                        onClick={() => setForm({ ...form, type: 'PERCENT' })}
                                        className={`flex items-center justify-center gap-2 py-3 rounded-lg border-2 transition ${form.type === 'PERCENT'
                                            ? 'border-primary-studio bg-primary-studio/5 text-primary-studio font-medium'
                                            : 'border-gray-300 text-gray-700 hover:border-gray-400'
                                            }`}
                                    >
                                        <Percent size={18} />
                                        Percentage
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setForm({ ...form, type: 'VALUE' })}
                                        className={`flex items-center justify-center gap-2 py-3 rounded-lg border-2 transition ${form.type === 'VALUE'
                                            ? 'border-primary-studio bg-primary-studio/5 text-primary-studio font-medium'
                                            : 'border-gray-300 text-gray-700 hover:border-gray-400'
                                            }`}
                                    >
                                        <DollarSign size={18} />
                                        Fixed Amount
                                    </button>
                                </div>
                            </div>

                            {/* Value */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    {form.type === 'PERCENT'
                                        ? 'Percentage (%) *'
                                        : 'Amount (IDR) *'}
                                </label>
                                <input
                                    type="number"
                                    required
                                    min="0"
                                    step={form.type === 'PERCENT' ? '1' : '1000'}
                                    max={form.type === 'PERCENT' ? '100' : undefined}
                                    value={form.value}
                                    onChange={(e) =>
                                        setForm({ ...form, value: e.target.value })
                                    }
                                    placeholder={
                                        form.type === 'PERCENT' ? 'e.g., 10' : 'e.g., 50000'
                                    }
                                    className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-primary-studio focus:border-transparent"
                                />
                            </div>

                            {/* Expires At */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Expiration Date *
                                </label>
                                <input
                                    type="datetime-local"
                                    required
                                    value={form.expiresAt}
                                    onChange={(e) =>
                                        setForm({ ...form, expiresAt: e.target.value })
                                    }
                                    className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-primary-studio focus:border-transparent"
                                />
                            </div>

                            {/* Minimum Order Amount */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Minimum Order Amount (IDR) - Optional
                                </label>
                                <input
                                    type="number"
                                    min="0"
                                    step="1000"
                                    value={form.minimumOrderAmount}
                                    onChange={(e) =>
                                        setForm({
                                            ...form,
                                            minimumOrderAmount: e.target.value,
                                        })
                                    }
                                    placeholder="e.g., 100000"
                                    className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-primary-studio focus:border-transparent"
                                />
                            </div>

                            {/* Actions */}
                            <div className="flex gap-3 pt-4">
                                <button
                                    type="button"
                                    onClick={closeModal}
                                    className="flex-1 px-4 py-2.5 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="flex-1 px-4 py-2.5 bg-primary-studio text-white rounded-lg font-medium hover:bg-primary-studio/90 transition"
                                >
                                    {editingId ? 'Update' : 'Create'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    )
}