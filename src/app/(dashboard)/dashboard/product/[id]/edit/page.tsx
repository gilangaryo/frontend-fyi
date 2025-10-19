'use client'

import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { API_BASE } from '@/lib/constants'
import PhotoUploadGrid from '@/app/(dashboard)/components/PhotoUploadGrid'
import { formatRupiah } from '@/lib/utils'
import { Trash } from 'lucide-react'
type ProductImage = {
    imageUrl: string
    isPrimary: boolean
}

type ProductVariant = {
    size: string
    bust: string
    waist: string
    length: string
    sleeve: string
    height: string
    stock: string
    sku: string
}

export default function EditProductPage() {
    const router = useRouter()
    const { id } = useParams<{ id: string }>()
    const [loading, setLoading] = useState(true)
    const [submitting, setSubmitting] = useState(false)
    const [uploadingImages, setUploadingImages] = useState(false)

    const [collections, setCollections] = useState<{ id: string; title: string }[]>([])
    const [categories, setCategories] = useState<{ id: string; title: string }[]>([])
    const [images, setImages] = useState<{ url: string; isPrimary: boolean }[]>([])
    const [variants, setVariants] = useState([
        { size: '', bust: '', waist: '', length: '', sleeve: '', height: '', stock: '', sku: '' },
    ])

    const [form, setForm] = useState({
        title: '',
        description: '',
        details: '',
        delivery: '',
        price: '',
        collectionId: '',
        categoryId: '',
    })

    useEffect(() => {
        async function fetchProduct() {
            try {
                const token = localStorage.getItem('token')
                if (!token) throw new Error('Unauthorized')

                const [prodRes, colRes, catRes] = await Promise.all([
                    fetch(`${API_BASE}/products/${id}`, { headers: { Authorization: `Bearer ${token}` } }),
                    fetch(`${API_BASE}/collections`, { headers: { Authorization: `Bearer ${token}` } }),
                    fetch(`${API_BASE}/categories`, { headers: { Authorization: `Bearer ${token}` } }),
                ])

                const [prodData, colData, catData] = await Promise.all([
                    prodRes.json(),
                    colRes.json(),
                    catRes.json(),
                ])

                if (!prodRes.ok) throw new Error(prodData.message || 'Failed to fetch product')

                const product = prodData.data
                setForm({
                    title: product.title,
                    description: product.description || '',
                    details: product.details || '',
                    delivery: product.delivery || '',
                    price: product.price?.toString() || '',
                    collectionId: product.collectionId || '',
                    categoryId: product.categoryId || '',
                })

                setImages(
                    (product.images as ProductImage[] || []).map((img) => ({
                        url: img.imageUrl,
                        isPrimary: img.isPrimary,
                    }))
                )

                setVariants(
                    (product.variants as ProductVariant[] || []).map((v) => ({
                        size: v.size || '',
                        bust: v.bust || '',
                        waist: v.waist || '',
                        length: v.length || '',
                        sleeve: v.sleeve || '',
                        height: v.height || '',
                        stock: v.stock?.toString() || '',
                        sku: v.sku || '',
                    }))
                )


                setCollections(colData.data || [])
                setCategories(catData.data || [])
            } catch (err) {
                console.error('❌ Error fetching product:', err)
                alert('Failed to load product data.')
            } finally {
                setLoading(false)
            }
        }

        fetchProduct()
    }, [id])

    const handleChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
    ) => {
        setForm({ ...form, [e.target.name]: e.target.value })
    }

    const handleVariantChange = (index: number, field: string, value: string) => {
        const updated = [...variants]
        updated[index] = { ...updated[index], [field]: value }
        setVariants(updated)
    }

    const addVariant = () => {
        setVariants([
            ...variants,
            { size: '', bust: '', waist: '', length: '', sleeve: '', height: '', stock: '', sku: '' },
        ])
    }

    const removeVariant = (index: number) => {
        setVariants(variants.filter((_, i) => i !== index))
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (uploadingImages) {
            alert('Please wait until all images are uploaded!')
            return
        }
        setSubmitting(true)

        try {
            const token = localStorage.getItem('token')
            if (!token) throw new Error('Unauthorized')

            if (!form.title || !form.collectionId || !form.categoryId) {
                alert('Please fill required fields!')
                return
            }

            const body = {
                title: form.title.trim(),
                description: form.description.trim() || null,
                details: form.details.trim() || null,
                delivery: form.delivery.trim() || null,
                price: Number(form.price),
                imageUrl: images.find((i) => i.isPrimary)?.url || images[0]?.url || '',
                categoryId: form.categoryId,
                collectionId: form.collectionId,
                images: images.map((img) => ({
                    imageUrl: img.url,
                    isPrimary: img.isPrimary,
                })),
                variants: variants.map((v) => ({
                    size: v.size,
                    color: null,
                    stock: Number(v.stock) || 0,
                    sku: v.sku || `${form.title.slice(0, 3).toUpperCase()}-${v.size}`,
                    bust: v.bust || null,
                    waist: v.waist || null,
                    length: v.length || null,
                    sleeve: v.sleeve || null,
                    height: v.height || null,
                })),
            }

            const res = await fetch(`${API_BASE}/products/${id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify(body),
            })

            const data = await res.json()
            if (!res.ok) throw new Error(data.message || 'Failed to update product')

            alert('✅ Product updated successfully!')
            router.push('/dashboard/product')
        } catch (err) {
            console.error('❌ Update error:', err)
            alert('❌ Failed to update product')
        } finally {
            setSubmitting(false)
        }
    }

    if (loading)
        return (
            <div className="flex items-center justify-center min-h-screen text-gray-500">
                Loading product...
            </div>
        )

    return (
        <div className="max-w-full mx-auto mt-10 bg-white p-8 rounded-xl shadow">
            <h1 className="text-2xl font-semibold mb-6">Edit Product</h1>

            <form onSubmit={handleSubmit} className="space-y-6">
                <PhotoUploadGrid onChange={setImages} onUploadingChange={setUploadingImages} initialImages={images} />

                {/* Collection */}
                <div>
                    <label className="block text-sm font-medium mb-1">Collection*</label>
                    <select
                        name="collectionId"
                        value={form.collectionId}
                        onChange={handleChange}
                        required
                        className="w-full border border-gray-300 rounded-lg p-2"
                    >
                        <option value="">Select collection</option>
                        {collections.map((col) => (
                            <option key={col.id} value={col.id}>
                                {col.title}
                            </option>
                        ))}
                    </select>
                </div>

                {/* Product Name */}
                <div>
                    <label className="block text-sm font-medium mb-1">Product Name*</label>
                    <input
                        name="title"
                        value={form.title}
                        onChange={handleChange}
                        required
                        className="w-full border border-gray-300 rounded-lg p-2"
                    />
                </div>

                {/* Description */}
                <div>
                    <label className="block text-sm font-medium mb-1">Short Description</label>
                    <textarea
                        name="description"
                        value={form.description}
                        onChange={handleChange}
                        rows={2}
                        className="w-full border border-gray-300 rounded-lg p-2"
                    />
                </div>

                {/* Details */}
                <div>
                    <label className="block text-sm font-medium mb-1">Product Details*</label>
                    <textarea
                        name="details"
                        value={form.details}
                        onChange={handleChange}
                        rows={4}
                        className="w-full border border-gray-300 rounded-lg p-2"
                    />
                </div>

                {/* Delivery */}
                <div>
                    <label className="block text-sm font-medium mb-1">Delivery & Return*</label>
                    <textarea
                        name="delivery"
                        value={form.delivery}
                        onChange={handleChange}
                        rows={3}
                        className="w-full border border-gray-300 rounded-lg p-2"
                    />
                </div>

                {/* Price */}
                <div>
                    <label className="block text-sm font-medium mb-1">Price (Rp)*</label>
                    <input
                        name="price"
                        type="text"
                        value={form.price ? formatRupiah(form.price.toString()) : ''}
                        onChange={(e) => {
                            const raw = e.target.value.replace(/\D/g, '')
                            setForm({ ...form, price: raw })
                        }}
                        required
                        className="w-full border border-gray-300 rounded-lg p-2"
                    />
                </div>

                {/* Category */}
                <div>
                    <label className="block text-sm font-medium mb-1">Category*</label>
                    <select
                        name="categoryId"
                        value={form.categoryId}
                        onChange={handleChange}
                        required
                        className="w-full border border-gray-300 rounded-lg p-2"
                    >
                        <option value="">Select category</option>
                        {categories.map((cat) => (
                            <option key={cat.id} value={cat.id}>
                                {cat.title}
                            </option>
                        ))}
                    </select>
                </div>

                {/* Variants */}
                <div>
                    <label className="block text-sm font-medium mb-2">Product Variants</label>
                    <div className="border border-gray-200 rounded-lg divide-y divide-gray-200">
                        {variants.map((v, i) => (
                            <div key={i} className="relative grid grid-cols-7 gap-2 p-3 items-center">
                                <input
                                    type="text"
                                    placeholder="Size"
                                    value={v.size}
                                    onChange={(e) => handleVariantChange(i, 'size', e.target.value)}
                                    className="border rounded p-2 text-sm"
                                />
                                <input
                                    type="text"
                                    placeholder="Bust"
                                    value={v.bust}
                                    onChange={(e) => handleVariantChange(i, 'bust', e.target.value)}
                                    className="border rounded p-2 text-sm"
                                />
                                <input
                                    type="text"
                                    placeholder="Waist"
                                    value={v.waist}
                                    onChange={(e) => handleVariantChange(i, 'waist', e.target.value)}
                                    className="border rounded p-2 text-sm"
                                />
                                <input
                                    type="text"
                                    placeholder="Length"
                                    value={v.length}
                                    onChange={(e) => handleVariantChange(i, 'length', e.target.value)}
                                    className="border rounded p-2 text-sm"
                                />
                                <input
                                    type="text"
                                    placeholder="Sleeve"
                                    value={v.sleeve}
                                    onChange={(e) => handleVariantChange(i, 'sleeve', e.target.value)}
                                    className="border rounded p-2 text-sm"
                                />
                                <input
                                    type="text"
                                    placeholder="Height"
                                    value={v.height}
                                    onChange={(e) => handleVariantChange(i, 'height', e.target.value)}
                                    className="border rounded p-2 text-sm"
                                />
                                <input
                                    type="number"
                                    placeholder="Stock"
                                    value={v.stock}
                                    onChange={(e) => handleVariantChange(i, 'stock', e.target.value)}
                                    className="border rounded p-2 text-sm"
                                />

                                <button
                                    type="button"
                                    onClick={() => removeVariant(i)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-red-500 hover:bg-red-600 hover:text-white rounded-full w-7 h-7 flex items-center justify-center transition"
                                >
                                    <Trash size={16} />
                                </button>
                            </div>
                        ))}
                    </div>

                    <button
                        type="button"
                        onClick={addVariant}
                        className="mt-2 text-sm bg-gray-100 px-3 py-1 rounded hover:bg-gray-200 transition"
                    >
                        + Add Variant
                    </button>
                </div>

                <button
                    type="submit"
                    disabled={submitting}
                    className="w-full bg-primary-studio text-white py-3 rounded-lg hover:bg-secondary-studio transition"
                >
                    {submitting ? 'Updating...' : 'Update Product'}
                </button>
            </form>
        </div>
    )
}
