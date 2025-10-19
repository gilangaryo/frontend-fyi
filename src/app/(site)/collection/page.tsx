'use client'

import { useEffect, useState } from 'react'
import CollectionSection from '../components/collection/CollectionSection'
import { API_BASE } from '@/lib/constants'

interface Product {
    id: string
    slug: string
    title: string
    description: string
    price: string
    stock: number
    imageUrl: string
    details: string | null
    delivery: string | null
    status: boolean
}

interface Collection {
    id: string
    title: string
    heroImage: string
    description: string
    subDescription: string
    quote: string
    slug: string
    status: boolean
    products: Product[]
}

export default function CollectionPage() {
    const [collections, setCollections] = useState<Collection[]>([])
    const [loading, setLoading] = useState(true)
    const [error] = useState<string | null>(null)

    useEffect(() => {
        async function fetchCollections() {
            try {
                setLoading(true)
                const res = await fetch(`${API_BASE}/collections?status=true`, { cache: 'no-store' })
                const json = await res.json()

                if (!json.success) throw new Error(json.message || 'Failed to fetch collections')
                setCollections(json.data)
            } catch (err) {
                console.error(err)
            } finally {
                setLoading(false)
            }
        }

        fetchCollections()
    }, [])

    if (loading) return <div className="p-10 text-center">Loading collections...</div>
    if (error) return <div className="p-10 text-center text-red-500">{error}</div>

    return (
        <>
            {/* <Navbar /> */}
            {collections.length > 0 ? (
                collections.map((col, i) => (
                    <CollectionSection key={col.id} data={col} index={i} />
                ))
            ) : (
                <div className="p-10 text-center text-gray-500">No collections found.</div>
            )}
        </>
    )
}
