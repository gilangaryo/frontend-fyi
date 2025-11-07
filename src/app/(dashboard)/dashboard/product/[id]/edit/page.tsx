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
    const [fabrics, setFabrics] = useState<{ id: string; name: string }[]>([])
    const [images, setImages] = useState<{ url: string; isPrimary: boolean }[]>([])
    const [variants, setVariants] = useState([
        { size: '', bust: '', waist: '', length: '', sleeve: '', height: '', stock: '', sku: '' },
    ])

    const [fabricInput, setFabricInput] = useState('')
    const [showFabricSuggestions, setShowFabricSuggestions] = useState(false)

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

                const [prodRes, colRes, catRes, fabRes] = await Promise.all([
                    fetch(`${API_BASE}/products/${id}`, { headers: { Authorization: `Bearer ${token}` } }),
                    fetch(`${API_BASE}/collections`, { headers: { Authorization: `Bearer ${token}` } }),
                    fetch(`${API_BASE}/categories`, { headers: { Authorization: `Bearer ${token}` } }),
                    fetch(`${API_BASE}/kain`, { headers: { Authorization: `Bearer ${token}` } }),
                ])

                const [prodData, colData, catData, fabData] = await Promise.all([
                    prodRes.json(),
                    colRes.json(),
                    catRes.json(),
                    fabRes.ok ? fabRes.json() : { data: [] },
                ])

                if (!prodRes.ok) throw new Error(prodData.message || 'Failed to fetch product')

                const product = prodData.data

                console.log('🔍 Product data:', product)
                console.log('🔍 Kain data:', product.kain)
                console.log('🔍 KainId:', product.kainId)

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
                setFabrics(fabData.data || [])

                if (product.kain?.name) {
                    setFabricInput(product.kain.name)
                } else if (product.kainId && fabData.data) {
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    const kainFromList = fabData.data.find((f: any) => f.id === product.kainId)
                    if (kainFromList) {
                        console.log('✅ Setting fabric from kainId lookup:', kainFromList.name)
                        setFabricInput(kainFromList.name)
                    } else {
                        console.log('⚠️ KainId exists but fabric not found in list')
                    }
                }
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

    const findOrCreateFabric = async (fabricName: string): Promise<string | null> => {
        if (!fabricName.trim()) return null

        try {
            const token = localStorage.getItem('token')
            if (!token) throw new Error('Unauthorized')

            const existingFabric = fabrics.find(
                f => f.name.toLowerCase() === fabricName.trim().toLowerCase()
            )

            if (existingFabric) {
                return existingFabric.id
            }

            const res = await fetch(`${API_BASE}/kain`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({ name: fabricName.trim() }),
            })

            const data = await res.json()
            if (!res.ok) throw new Error(data.message || 'Failed to create fabric')

            return data.data.id
        } catch (err) {
            console.error('❌ Error with fabric:', err)
            return null
        }
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

            const kainId = await findOrCreateFabric(fabricInput)

            const body = {
                title: form.title.trim(),
                description: form.description.trim() || null,
                details: form.details.trim() || null,
                delivery: form.delivery.trim() || null,
                price: Number(form.price),
                imageUrl: images.find((i) => i.isPrimary)?.url || images[0]?.url || '',
                categoryId: form.categoryId,
                collectionId: form.collectionId,
                kainId: kainId || null,
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

                {/* Fabric Section - Combobox Style */}
                <div>
                    <label className="block text-sm font-medium mb-1">Fabric / Kain</label>
                    <div className="flex gap-2 items-center">
                        <div className="flex-1 relative">
                            <input
                                type="text"
                                value={fabricInput}
                                onChange={(e) => {
                                    setFabricInput(e.target.value)
                                    setShowFabricSuggestions(true)
                                }}
                                onFocus={() => setShowFabricSuggestions(true)}
                                onBlur={() => setTimeout(() => setShowFabricSuggestions(false), 200)}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter') {
                                        e.preventDefault()
                                        setShowFabricSuggestions(false)
                                    }
                                }}
                                placeholder="Select or type fabric name..."
                                className="w-full border border-gray-300 rounded-lg p-2 pr-8"
                            />
                            <svg
                                className="absolute right-2 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                            </svg>

                            {/* Suggestions Dropdown */}
                            {showFabricSuggestions && (
                                <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-auto">
                                    {fabrics
                                        .filter(f => f.name.toLowerCase().includes(fabricInput.toLowerCase()))
                                        .map((fabric) => (
                                            <div
                                                key={fabric.id}
                                                onClick={() => {
                                                    setFabricInput(fabric.name)
                                                    setShowFabricSuggestions(false)
                                                }}
                                                className="px-3 py-2 hover:bg-gray-100 cursor-pointer text-sm"
                                            >
                                                {fabric.name}
                                            </div>
                                        ))}
                                    {fabrics.filter(f => f.name.toLowerCase().includes(fabricInput.toLowerCase())).length === 0 && fabricInput && (
                                        <div className="px-3 py-2 text-sm text-gray-500 italic">
                                            No matching fabric. Press Enter to add {fabricInput} as new fabric.
                                        </div>
                                    )}
                                    {!fabricInput && (
                                        <div className="px-3 py-2 text-sm text-gray-400 italic">
                                            Start typing to see suggestions or add new fabric
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                        {fabricInput && !fabrics.find(f => f.name.toLowerCase() === fabricInput.toLowerCase()) && (
                            <span className="flex items-center px-3 py-2 bg-green-50 text-green-700 text-sm rounded-lg border border-green-200 whitespace-nowrap">
                                New: {fabricInput}
                            </span>
                        )}
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                        Click to see options or type directly. New fabrics will be created automatically when you submit.
                    </p>
                </div>

                {/* Variants */}
                <div>
                    <label className="block text-sm font-medium mb-2">Product Variants</label>

                    <div className="space-y-4">
                        {variants.map((v, i) => (
                            <div
                                key={i}
                                className="relative border border-gray-200 rounded-lg p-4 shadow-sm hover:shadow-md transition"
                            >
                                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-3">
                                    {/* Size */}
                                    <div>
                                        <label className="block text-xs text-gray-600 mb-1">Size</label>
                                        <input
                                            type="text"
                                            placeholder="Size"
                                            value={v.size}
                                            onChange={(e) => handleVariantChange(i, 'size', e.target.value)}
                                            className="w-full border rounded-md p-2 text-sm focus:ring focus:ring-gray-200"
                                        />
                                    </div>

                                    {/* Bust */}
                                    <div>
                                        <label className="block text-xs text-gray-600 mb-1">Bust</label>
                                        <input
                                            type="text"
                                            placeholder="Bust"
                                            value={v.bust}
                                            onChange={(e) => handleVariantChange(i, 'bust', e.target.value)}
                                            className="w-full border rounded-md p-2 text-sm focus:ring focus:ring-gray-200"
                                        />
                                    </div>

                                    {/* Waist */}
                                    <div>
                                        <label className="block text-xs text-gray-600 mb-1">Waist</label>
                                        <input
                                            type="text"
                                            placeholder="Waist"
                                            value={v.waist}
                                            onChange={(e) => handleVariantChange(i, 'waist', e.target.value)}
                                            className="w-full border rounded-md p-2 text-sm focus:ring focus:ring-gray-200"
                                        />
                                    </div>

                                    {/* Length */}
                                    <div>
                                        <label className="block text-xs text-gray-600 mb-1">Length</label>
                                        <input
                                            type="text"
                                            placeholder="Length"
                                            value={v.length}
                                            onChange={(e) => handleVariantChange(i, 'length', e.target.value)}
                                            className="w-full border rounded-md p-2 text-sm focus:ring focus:ring-gray-200"
                                        />
                                    </div>

                                    {/* Sleeve */}
                                    <div>
                                        <label className="block text-xs text-gray-600 mb-1">Sleeve</label>
                                        <input
                                            type="text"
                                            placeholder="Sleeve"
                                            value={v.sleeve}
                                            onChange={(e) => handleVariantChange(i, 'sleeve', e.target.value)}
                                            className="w-full border rounded-md p-2 text-sm focus:ring focus:ring-gray-200"
                                        />
                                    </div>

                                    {/* Height */}
                                    <div>
                                        <label className="block text-xs text-gray-600 mb-1">Height</label>
                                        <input
                                            type="text"
                                            placeholder="Height"
                                            value={v.height}
                                            onChange={(e) => handleVariantChange(i, 'height', e.target.value)}
                                            className="w-full border rounded-md p-2 text-sm focus:ring focus:ring-gray-200"
                                        />
                                    </div>

                                    {/* Stock */}
                                    <div>
                                        <label className="block text-xs text-gray-600 mb-1">Stock</label>
                                        <input
                                            type="number"
                                            placeholder="0"
                                            value={v.stock}
                                            onChange={(e) => handleVariantChange(i, 'stock', e.target.value)}
                                            className="w-full border rounded-md p-2 text-sm focus:ring focus:ring-gray-200"
                                        />
                                    </div>
                                </div>

                                {/* Remove button */}
                                <button
                                    type="button"
                                    onClick={() => removeVariant(i)}
                                    className="absolute top-1/2 -translate-y-1/2 right-5 text-red-500 hover:bg-red-600 hover:text-white rounded-full w-9 h-9 flex items-center justify-center  transition"
                                    title="Remove variant"
                                >
                                    <Trash />
                                </button>
                            </div>
                        ))}
                    </div>

                    {/* Add variant button */}
                    <button
                        type="button"
                        onClick={addVariant}
                        className="mt-4 text-sm bg-gray-100 hover:bg-gray-200 px-3 py-2 rounded-md border border-gray-300 transition"
                    >
                        + Add Variant
                    </button>
                </div>


                <button
                    type="submit"
                    disabled={submitting || uploadingImages}
                    className={`w-full py-3 rounded-lg transition text-white ${submitting || uploadingImages
                        ? 'bg-gray-400 cursor-not-allowed'
                        : 'bg-primary-studio hover:bg-secondary-studio'
                        }`}
                >
                    {uploadingImages ? 'Uploading images...' : submitting ? 'Updating...' : 'Update Product'}
                </button>
            </form>
        </div>
    )
}