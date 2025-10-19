'use client'

import Link from 'next/link'
import StatusDropdown from '../StatusDropdown'
import { API_BASE } from '@/lib/constants'

interface CollectionItem {
    id: string
    title: string
    isActive: boolean
}

export default function CollectionTable({
    collections,
}: {
    collections: CollectionItem[]
}) {
    async function updateStatus(id: string, isActive: boolean) {
        try {
            const token = localStorage.getItem('token')
            const res = await fetch(`${API_BASE}/collections/status/${id}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: token ? `Bearer ${token}` : '',
                },
                body: JSON.stringify({ status: isActive }),
            })
            if (!res.ok) throw new Error('Failed to update status')
        } catch (err) {
            console.error(err)
        }
    }

    if (!collections?.length) {
        return (
            <div className="text-center py-12 text-gray-500">
                No collections found.
            </div>
        )
    }

    return (
        <div className="rounded-lg border bg-white overflow-visible">
            {/* Header */}
            <div className="flex bg-sky-500 text-white font-medium text-sm rounded-t-md">
                <div className="flex-1 px-4 py-2">Collection Name</div>
                <div className="w-40 px-4 py-2 text-center">Status</div>
                <div className="w-40 px-4 py-2 text-center">Action</div>
            </div>

            {/* Rows */}
            {collections.map((item) => (
                <div
                    key={item.id}
                    className="flex items-center border-t hover:bg-gray-50 transition"
                >
                    <div className="flex-1 px-4 py-3 text-gray-800 text-sm font-medium">
                        {item.title}
                    </div>

                    <div className="w-40 flex justify-center">
                        <StatusDropdown
                            initial={item.isActive ? 'Active' : 'Inactive'}
                            onChange={(value) =>
                                updateStatus(item.id, value === 'Active')
                            }
                        />
                    </div>

                    <div className="w-40 flex justify-center gap-2 py-3">
                        <Link
                            href={`/dashboard/product/collection/${item.id}/edit`}
                            className="px-3 py-1 bg-sky-500 text-white text-xs rounded hover:bg-sky-600 transition"
                        >
                            Edit
                        </Link>
                        <button
                            onClick={() => alert(`Delete ${item.title}?`)}
                            className="px-2 py-1 border rounded text-xs hover:bg-gray-100 transition"
                        >
                            Delete
                        </button>
                    </div>
                </div>
            ))}
        </div>
    )
}
