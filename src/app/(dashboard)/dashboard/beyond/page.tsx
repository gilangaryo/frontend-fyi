'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { API_BASE } from '@/lib/constants'
import { Plus } from 'lucide-react'
import { getImageUrl } from '@/lib/utils'

interface Blog {
    id: string
    title: string
    event: string
    description: string
    heroImage: string
    createdAt: string
}

export default function BeyondListPage() {
    const [blogs, setBlogs] = useState<Blog[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        fetchBlogs()
    }, [])

    async function fetchBlogs() {
        setLoading(true)
        try {
            const res = await fetch(`${API_BASE}/blog`)
            const json = await res.json()
            if (json.success) setBlogs(json.data)
        } catch (err) {
            console.error(err)
        } finally {
            setLoading(false)
        }
    }

    async function deleteBlog(id: string) {
        if (!confirm('Delete this Beyond article?')) return
        try {
            const token = localStorage.getItem('token')
            const res = await fetch(`${API_BASE}/blog/${id}`, {
                method: 'DELETE',
                headers: { Authorization: `Bearer ${token}` },
            })
            const json = await res.json()
            if (json.success) {
                alert('✅ Deleted successfully!')
                fetchBlogs()
            } else {
                alert(json.message || 'Failed to delete')
            }
        } catch (err) {
            console.error(err)
            alert('Error deleting blog')
        }
    }

    return (
        <div className="p-2 max-w-full mx-auto">
            {/* Header */}
            <div className="flex justify-between items-center mb-10">
                <div>
                    <h1 className="text-2xl font-semibold text-gray-800">Beyond</h1>
                    <p className="text-gray-400 text-sm">Managing Gallery &amp; Video</p>
                </div>
                <Link
                    href="/dashboard/beyond/new"
                    className="flex items-center gap-2 bg-gray-100 text-gray-700 hover:bg-gray-200 px-4 py-2 rounded-lg text-sm font-medium"
                >
                    <Plus size={16} /> Add Beyond
                </Link>
            </div>

            {/* Loading & Empty */}
            {loading ? (
                <p className="text-gray-500">Loading Beyond articles...</p>
            ) : blogs.length === 0 ? (
                <p className="text-gray-500">No Beyond articles found.</p>
            ) : (
                <div className="space-y-10">
                    {blogs.map((b) => (
                        <div
                            key={b.id}
                            className="flex flex-col md:flex-row gap-6 pb-10 border-b border-gray-100"
                        >
                            <div className="relative w-full md:w-1/4 aspect-[4/3] rounded-lg overflow-hidden flex-shrink-0">
                                <Image
                                    src={getImageUrl(b.heroImage)}
                                    alt={b.title}
                                    fill
                                    className="object-cover"
                                />
                                <div className="absolute inset-0 bg-black/30 flex items-end">
                                    <p className="text-white text-xs md:text-sm p-3 italic font-medium">
                                        {b.title}
                                    </p>
                                </div>
                            </div>

                            <div className="flex-1 flex flex-col min-h-0">
                                <div className="flex-1">
                                    <p className="text-gray-400 font-medium text-sm mb-1">
                                        {new Date(b.createdAt).toLocaleDateString('en-GB', {
                                            day: 'numeric',
                                            month: 'short',
                                            year: 'numeric',
                                        })}
                                    </p>
                                    <h2 className="italic font-medium text-lg mb-3">{b.event + "  " + b.title}</h2>
                                    <p className="text-secondary text-sm leading-relaxed">
                                        {b.description?.slice(0, 250) || ''}...
                                    </p>
                                </div>

                                <div className="flex gap-3 mt-6">
                                    <button
                                        onClick={() => deleteBlog(b.id)}
                                        className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-600 py-2 rounded-md transition"
                                    >
                                        Delete
                                    </button>
                                    <Link
                                        href={`/dashboard/beyond/${b.id}`}
                                        className="flex-1 bg-sky-500 hover:bg-sky-600 text-white py-2 rounded-md text-center transition"
                                    >
                                        Edit Beyond
                                    </Link>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
}