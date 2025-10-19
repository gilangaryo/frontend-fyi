'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { API_BASE } from '@/lib/constants'
import PhotoUploadGrid from '@/app/(dashboard)/components/PhotoUploadGrid'
import { formatRupiah } from '@/lib/utils'
import { Trash } from 'lucide-react'
export default function NewProductPage() {
    const [collections, setCollections] = useState<{ id: string; title: string }[]>([])
    const [categories, setCategories] = useState<{ id: string; title: string }[]>([])
    const [images, setImages] = useState<{ url: string; isPrimary: boolean }[]>([])
    const [variants, setVariants] = useState([
        { size: '', bust: '', length: '', sleeve: '', height: '', stock: '', sku: '', waist: '' },
    ])

    const [uploadingImages, setUploadingImages] = useState(false)

    const [form, setForm] = useState({
        title: '',
        description: '',
        details: '',
        delivery: '',
        price: '',
        collectionId: '',
        categoryId: '',
    })

    const router = useRouter()

    // Fetch collections & categories
    useEffect(() => {
        async function fetchData() {
            try {
                const token = localStorage.getItem('token')
                if (!token) throw new Error('Unauthorized')

                const [colRes, catRes] = await Promise.all([
                    fetch(`${API_BASE}/collections`, {
                        headers: { Authorization: `Bearer ${token}` },
                    }),
                    fetch(`${API_BASE}/categories`, {
                        headers: { Authorization: `Bearer ${token}` },
                    }),
                ])

                const [colData, catData] = await Promise.all([colRes.json(), catRes.json()])
                setCollections(colData.data || [])
                setCategories(catData.data || [])
            } catch (err) {
                console.error('❌ Fetch error:', err)
            }
        }
        fetchData()
    }, [])

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
            { size: '', bust: '', length: '', sleeve: '', height: '', stock: '', sku: '', waist: '' },
        ])
    }


    const removeVariant = (index: number) => {
        const updated = variants.filter((_, i) => i !== index)
        setVariants(updated)
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (uploadingImages) {
            alert('Please wait until all images are uploaded!')
            return
        }
        try {
            const token = localStorage.getItem('token')
            if (!token) throw new Error('Unauthorized')

            if (!form.title || !form.collectionId || !form.categoryId) {
                alert('Please fill required fields!')
                return
            }

            if (images.length === 0) {
                alert('Please upload at least one product photo!')
                return
            }

            if (variants.length === 0 || variants.some(v => !v.size)) {
                alert('Please add at least one variant with a size!')
                return
            }

            // Susun body data
            const body = {
                title: form.title.trim(),
                description: form.description.trim() || null,
                details: form.details.trim() || null,
                delivery: form.delivery.trim() || null,
                price: Number(form.price),
                imageUrl: images.find((img) => img.isPrimary)?.url || images[0].url,
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


            const res = await fetch(`${API_BASE}/products`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify(body),
            })

            const data = await res.json()
            if (!res.ok) throw new Error(data.message || 'Failed to create product')

            alert('✅ Product created successfully!')
            router.push('/dashboard/product')
        } catch (err) {
            console.error('❌ Error creating product:', err)
            alert('❌ Failed to create product')
        }
    }

    return (
        <div className="max-w-full mx-auto mt-10 bg-white p-8 rounded-xl shadow">
            <h1 className="text-2xl font-semibold mb-6">Add Product</h1>

            <form onSubmit={handleSubmit} className="space-y-6">
                <PhotoUploadGrid onChange={setImages} onUploadingChange={setUploadingImages} />

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
                        placeholder="e.g. REVERSIBLE MADAME"
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
                        placeholder="Minimal, clean, and versatile..."
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
                            const raw = e.target.value.replace(/\D/g, '') // simpan angka murni ke state
                            setForm({ ...form, price: raw })
                        }}
                        required
                        className="w-full border border-gray-300 rounded-lg p-2"
                        placeholder="3.500.000"
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

                {/* Variants Section */}
                <div>
                    <label className="block text-sm font-medium mb-2">Product Variants</label>
                    <div className="border border-gray-200 rounded-lg divide-y divide-gray-200 ">
                        {variants.map((v, i) => (
                            <div key={i} className="grid grid-cols-8 gap-3 p-3 items-center">
                                <input
                                    type="text"
                                    placeholder="Size (e.g. M)"
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
                                    type="text"
                                    placeholder="Waist"
                                    value={v.waist}
                                    onChange={(e) => handleVariantChange(i, 'waist', e.target.value)}
                                    className="border rounded p-2 text-sm"
                                />
                                <input
                                    type="number"
                                    placeholder="Stock"
                                    value={v.stock}
                                    onChange={(e) => handleVariantChange(i, 'stock', e.target.value)}
                                    className="border rounded p-2 text-sm"
                                />
                                <div className="place-self-end">
                                    <button
                                        type="button"
                                        onClick={() => removeVariant(i)}
                                        className="text-red-500 hover:bg-red-600 hover:text-white rounded-full p-2 flex align-center justify-center transition"
                                    >
                                        <Trash />
                                    </button>
                                </div>
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
                    disabled={uploadingImages}
                    className={`w-full py-3 rounded-lg transition text-white ${uploadingImages
                        ? 'bg-gray-400 cursor-not-allowed'
                        : 'bg-primary-studio hover:bg-secondary-studio'
                        }`}
                >
                    {uploadingImages ? 'Uploading images...' : 'Add Product'}
                </button>

            </form>
        </div>
    )
}
