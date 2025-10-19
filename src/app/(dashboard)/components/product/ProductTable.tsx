'use client'

import Link from 'next/link'
import Image from 'next/image'
import StatusDropdown from '../StatusDropdown'
import { getImageUrl } from '@/lib/utils'
import { API_BASE } from '@/lib/constants'

interface ProductItem {
    id: string
    title: string
    subLabel?: string
    price: string
    sold: number
    imageUrl: string
    isActive: boolean
}

export default function ProductTable({ products }: { products: ProductItem[] }) {
    async function updateStatus(id: string, isActive: boolean) {
        try {
            const token = localStorage.getItem('token')
            const res = await fetch(`${API_BASE}/products/status/${id}`, {
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

    if (!products?.length) {
        return (
            <div className="text-center py-12 text-gray-500">
                No products found.
            </div>
        )
    }

    return (
        <div className="rounded-lg  bg-white overflow-visible">
            <div className="min-w-[900px]">
                {/* Header */}
                <div className="grid grid-cols-[1fr_8rem_6rem_8rem_8rem] bg-sky-500 text-white font-medium text-sm rounded-t-md">
                    <div className="px-4 py-2 text-left">Product</div>
                    <div className="px-4 py-2 text-center">Price</div>
                    <div className="px-4 py-2 text-center">Sold</div>
                    <div className="px-4 py-2 text-center">Status</div>
                    <div className="px-4 py-2 text-center">Action</div>
                </div>

                {/* Rows */}
                {products.map((item) => (
                    <div
                        key={item.id}
                        className="grid grid-cols-[1fr_8rem_6rem_8rem_8rem] border-t border-gray-200 hover:bg-gray-50 transition items-center"
                    >
                        {/* Product Info */}
                        <div className="flex items-center gap-3 px-4 py-3">
                            {item.imageUrl && (
                                <Image
                                    src={getImageUrl(item.imageUrl)}
                                    alt={item.title}
                                    width={40}
                                    height={40}
                                    className=" w-10 h-10 object-cover"
                                />
                            )}
                            <div>
                                <p className="text-gray-800 text-sm font-medium">{item.title}</p>
                                <p className="text-xs text-gray-400">{item.subLabel || '-'}</p>
                            </div>
                        </div>

                        <div className="text-center text-sm text-gray-700">{item.price}</div>
                        <div className="text-center text-sm text-gray-700">{item.sold}</div>

                        <div className="flex justify-center">
                            <StatusDropdown
                                initial={item.isActive ? 'Active' : 'Inactive'}
                                onChange={(value) =>
                                    updateStatus(item.id, value === 'Active')
                                }
                            />
                        </div>

                        <div className="flex justify-center gap-2 py-3">
                            <Link
                                href={`/dashboard/product/${item.id}/edit`}
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
        </div>
    )
}
