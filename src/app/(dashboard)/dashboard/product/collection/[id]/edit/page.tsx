'use client'

import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import CollectionForm, {
    CollectionFormValues,
} from '@/app/(dashboard)/components/collection/CollectionForm'
import { API_BASE } from '@/lib/constants'

export default function EditCollectionPage() {
    const router = useRouter()
    const params = useParams()
    const id = params?.id as string

    const [form, setForm] = useState<CollectionFormValues>({
        title: '',
        description: '',
        subDescription: '',
        quote: '',
        hero: null,
        heroPreview: null,
    })

    const [loading, setLoading] = useState(false)
    const [fetching, setFetching] = useState(true)

    useEffect(() => {
        async function fetchCollection() {
            try {
                const token = localStorage.getItem('token')
                const res = await fetch(`${API_BASE}/collections/${id}`, {
                    headers: { Authorization: `Bearer ${token}` },
                })
                const data = await res.json()

                if (!res.ok) throw new Error(data.message || 'Failed to fetch collection')

                setForm({
                    title: data.data.title,
                    description: data.data.description,
                    subDescription: data.data.subDescription,
                    quote: data.data.quote,
                    hero: null,
                    heroPreview: data.data.heroImage
                        ? `${API_BASE}${data.data.heroImage}`
                        : null,
                })
            } catch (err) {
                console.error(err)
            } finally {
                setFetching(false)
            }
        }

        if (id) fetchCollection()
    }, [id])

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault()
        setLoading(true)

        try {
            const token = localStorage.getItem('token')
            if (!token) throw new Error('Unauthorized')

            const fd = new FormData()
            fd.append('title', form.title)
            fd.append('description', form.description)
            fd.append('subDescription', form.subDescription)
            fd.append('quote', form.quote)
            if (form.hero) fd.append('hero', form.hero)

            const res = await fetch(`${API_BASE}/collections/${id}`, {
                method: 'PUT',
                headers: { Authorization: `Bearer ${token}` },
                body: fd,
            })

            const data = await res.json()
            if (!res.ok) throw new Error(data.message)

            alert('✅ Collection updated successfully!')
            router.push('/dashboard/product')
        } catch (err) {
            console.error(err)
        } finally {
            setLoading(false)
        }
    }

    if (fetching) {
        return (
            <div className="flex items-center justify-center min-h-screen text-gray-500">
                Loading collection...
            </div>
        )
    }

    return (
        <form
            onSubmit={handleSubmit}
            className="grid grid-cols-1 lg:grid-cols-1 min-h-screen"
        >
            <div className="flex flex-col justify-center items-center p-10">
                <div className="w-full max-w-full">
                    <CollectionForm values={form} onChange={setForm} />
                    <button
                        type="submit"
                        disabled={loading}
                        className="mt-6 bg-black text-white w-full py-2 rounded-lg font-medium hover:bg-gray-800 transition"
                    >
                        {loading ? 'Updating...' : 'Update Collection'}
                    </button>
                </div>
            </div>
        </form>
    )
}
