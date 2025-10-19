'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import CollectionForm, {
    CollectionFormValues,
} from '@/app/(dashboard)/components/collection/CollectionForm'
import { API_BASE } from '@/lib/constants'

export default function NewCollectionPage() {
    const [form, setForm] = useState<CollectionFormValues>({
        title: '',
        description: '',
        subDescription: '',
        quote: '',
        hero: null,
        heroPreview: null,
    })

    const [loading, setLoading] = useState(false)
    const router = useRouter()

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

            const res = await fetch(`${API_BASE}/collections`, {
                method: 'POST',
                headers: { Authorization: `Bearer ${token}` },
                body: fd,
            })

            const data = await res.json()
            if (!res.ok) throw new Error(data.message)

            alert('✅ Collection created successfully!')
            router.push('/dashboard/product')
        } catch (err) {
            console.error(err)
        } finally {
            setLoading(false)
        }
    }

    return (
        <form
            onSubmit={handleSubmit}
            className="grid grid-cols-1 lg:grid-cols-1 min-h-screen "
        >
            <div className="flex flex-col justify-center items-center p-10">
                <div className="w-full max-w-full">
                    <CollectionForm values={form} onChange={setForm} />
                    <button
                        type="submit"
                        disabled={loading}
                        className="mt-6 bg-black text-white w-full py-2 rounded-lg font-medium hover:bg-gray-800 transition"
                    >
                        {loading ? 'Creating...' : 'Add Collection'}
                    </button>
                </div>
            </div>
        </form>
    )
}
