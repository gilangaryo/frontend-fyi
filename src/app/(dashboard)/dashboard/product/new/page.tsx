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
    const [fabrics, setFabrics] = useState<{ id: string; name: string }[]>([])
    const [images, setImages] = useState<{ url: string; isPrimary: boolean }[]>([])
    const [variants, setVariants] = useState([
        { size: '', bust: '', length: '', sleeve: '', height: '', stock: '', sku: '', waist: '' },
    ])

    const [uploadingImages, setUploadingImages] = useState(false)
    const [fabricInput, setFabricInput] = useState('')
    const [showFabricSuggestions, setShowFabricSuggestions] = useState(false)
    const [categoryInput, setCategoryInput] = useState('')
    const [showCategorySuggestions, setShowCategorySuggestions] = useState(false)

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

    // Fetch collections, categories & fabrics
    useEffect(() => {
        async function fetchData() {
            try {
                const token = localStorage.getItem('token')
                if (!token) throw new Error('Unauthorized')

                const [colRes, catRes, fabRes] = await Promise.all([
                    fetch(`${API_BASE}/collections`, {
                        headers: { Authorization: `Bearer ${token}` },
                    }),
                    fetch(`${API_BASE}/categories`, {
                        headers: { Authorization: `Bearer ${token}` },
                    }),
                    fetch(`${API_BASE}/kain`, {
                        headers: { Authorization: `Bearer ${token}` },
                    }),
                ])

                const [colData, catData, fabData] = await Promise.all([
                    colRes.json(),
                    catRes.json(),
                    fabRes.ok ? fabRes.json() : { data: [] }
                ])

                setCollections(colData.data || [])
                setCategories(catData.data || [])
                setFabrics(fabData.data || [])
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

    // Function to find or create fabric
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

    // Function to find or create category
    const findOrCreateCategory = async (categoryTitle: string): Promise<string | null> => {
        if (!categoryTitle.trim()) return null

        try {
            const token = localStorage.getItem('token')
            if (!token) throw new Error('Unauthorized')

            // Backend will automatically return existing category if found
            const res = await fetch(`${API_BASE}/categories`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({ title: categoryTitle.trim() }),
            })

            const data = await res.json()

            if (!res.ok) {
                throw new Error(data.message || 'Failed to create category')
            }

            // Update categories list if it's a new category
            const existingCategory = categories.find(c => c.id === data.data.id)
            if (!existingCategory) {
                setCategories([...categories, data.data])
            }

            return data.data.id
        } catch (err) {
            console.error('❌ Error with category:', err)
            return null
        }
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

            if (!form.title || !form.collectionId || !categoryInput) {
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

            const kainId = await findOrCreateFabric(fabricInput)
            const categoryId = await findOrCreateCategory(categoryInput)

            if (!categoryId) {
                alert('Failed to create or find category!')
                return
            }

            const body = {
                title: form.title.trim(),
                description: form.description.trim() || null,
                details: form.details.trim() || null,
                delivery: form.delivery.trim() || null,
                price: Number(form.price),
                imageUrl: images.find((img) => img.isPrimary)?.url || images[0].url,
                categoryId: categoryId,
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

                <div className='grid grid-cols-3 gap-8'>
                    {/* Collection */}
                    <div>
                        <label className="block text-sm font-medium mb-1">Collection*</label>
                        <select
                            name="collectionId"
                            value={form.collectionId}
                            onChange={handleChange}
                            required
                            className="w-full border-b border-gray-300 p-2"
                        >
                            <option value="">Select collection</option>
                            {collections.map((col) => (
                                <option key={col.id} value={col.id}>
                                    {col.title}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Category - Now with Autocomplete */}
                    <div>
                        <label className="block text-sm font-medium mb-1">Category*</label>
                        <div className="flex gap-2 items-center">
                            <div className="flex-1 relative">
                                <input
                                    type="text"
                                    value={categoryInput}
                                    onChange={(e) => {
                                        setCategoryInput(e.target.value)
                                        setShowCategorySuggestions(true)
                                    }}
                                    onFocus={() => setShowCategorySuggestions(true)}
                                    onBlur={() => setTimeout(() => setShowCategorySuggestions(false), 200)}
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter') {
                                            e.preventDefault()
                                            setShowCategorySuggestions(false)
                                        }
                                    }}
                                    placeholder="Select or type category..."
                                    className="w-full border-b border-gray-300 p-2 pr-8"
                                    required
                                />
                                <svg
                                    className="absolute right-2 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                </svg>

                                {showCategorySuggestions && (
                                    <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 shadow-lg max-h-60 overflow-auto">
                                        {categories
                                            .filter(c => c.title.toLowerCase().includes(categoryInput.toLowerCase()))
                                            .map((category) => (
                                                <div
                                                    key={category.id}
                                                    onClick={() => {
                                                        setCategoryInput(category.title)
                                                        setShowCategorySuggestions(false)
                                                    }}
                                                    className="px-3 py-2 hover:bg-gray-100 cursor-pointer text-sm"
                                                >
                                                    {category.title}
                                                </div>
                                            ))}
                                        {categories.filter(c => c.title.toLowerCase().includes(categoryInput.toLowerCase())).length === 0 && categoryInput && (
                                            <div className="px-3 py-2 text-sm text-gray-500 italic">
                                                No matching category. Press Enter to add {categoryInput} as new category.
                                            </div>
                                        )}
                                        {!categoryInput && (
                                            <div className="px-3 py-2 text-sm text-gray-400 italic">
                                                Start typing to see suggestions or add new category
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Fabric Section */}
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
                                    className="w-full border-b border-gray-300 p-2 pr-8"
                                />
                                <svg
                                    className="absolute right-2 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                </svg>

                                {showFabricSuggestions && (
                                    <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 shadow-lg max-h-60 overflow-auto">
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
                        </div>
                    </div>
                </div>

                {/* Rest of the form remains the same... */}
                {/* Product Name */}
                <div>
                    <label className="block text-sm font-medium mb-1">Product Name*</label>
                    <input
                        name="title"
                        value={form.title}
                        onChange={handleChange}
                        required
                        className="w-full border-b border-gray-300 p-2"
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
                        className="w-full border-b border-gray-300 p-2"
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
                        className="w-full border-b border-gray-300 p-2"
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
                        className="w-full border-b border-gray-300 p-2"
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
                        className="w-full border-b border-gray-300 p-2"
                        placeholder="3.500.000"
                    />
                </div>

                {/* Variants Section */}
                <div className="space-y-6">
                    {/* Size & Stock Table */}
                    <div>
                        <label className="block text-base font-medium mb-3">Size & Stock*</label>
                        <div className="">
                            {/* Header */}
                            <div className="grid grid-cols-9 gap-4 p-3 bg-white font-normal text-sm text-gray-500 ">
                                <div className="col-span-4">Size</div>
                                <div className="col-span-4">Stock</div>
                                <div className="col-span-1"></div>
                            </div>

                            {/* Rows */}
                            {variants.map((v, i) => (
                                <div key={i} className="grid grid-cols-9 gap-4 p-3 items-center ">
                                    <div className="col-span-4">
                                        <input
                                            type="text"
                                            placeholder="Add Size"
                                            value={v.size}
                                            onChange={(e) => handleVariantChange(i, 'size', e.target.value)}
                                            className="w-full border-b border-gray-300 px-2 py-1 text-sm focus:outline-none focus:border-gray-500"
                                        />
                                    </div>
                                    <div className="col-span-4">
                                        <input
                                            type="number"
                                            placeholder="add stock"
                                            value={v.stock}
                                            onChange={(e) => handleVariantChange(i, 'stock', e.target.value)}
                                            className="w-full border-b border-gray-300 px-2 py-1 text-sm focus:outline-none focus:border-gray-500"
                                        />
                                    </div>
                                    <div className="col-span-1 flex justify-end">
                                        <button
                                            type="button"
                                            onClick={() => removeVariant(i)}
                                            className="text-gray-400 hover:text-gray-600 transition"
                                        >
                                            <Trash size={18} />
                                        </button>
                                    </div>
                                </div>
                            ))}

                            {/* Add Column Button */}
                            <button
                                type="button"
                                onClick={addVariant}
                                className="w-full p-3 text-sm text-gray-500 bg-gray-200 hover:bg-gray-300 transition border-t border-gray-200"
                            >
                                + add Column
                            </button>
                        </div>
                    </div>

                    {/* Size Chart Table */}
                    <div>
                        <label className="block text-base font-medium mb-3">Size Chart</label>
                        <div className="border border-gray-200">
                            {/* Rows */}
                            {variants.map((v, i) => (
                                <div key={i} className={`grid grid-cols-12 gap-4 p-3 items-center ${i > 0 ? 'border-t border-gray-200' : ''}`}>
                                    <div className="col-span-1">
                                        <div className="text-sm font-normal text-gray-700">{v.size || '-'}</div>
                                    </div>
                                    <div className="col-span-2">
                                        <input
                                            type="text"
                                            placeholder="[Waist] Add Size in cm"
                                            value={v.waist}
                                            onChange={(e) => handleVariantChange(i, 'waist', e.target.value)}
                                            className="w-full border-b border-gray-300 px-2 py-1 text-sm focus:outline-none focus:border-gray-500"
                                        />
                                    </div>
                                    <div className="col-span-2">
                                        <input
                                            type="text"
                                            placeholder="[Length] Add Size in cm"
                                            value={v.length}
                                            onChange={(e) => handleVariantChange(i, 'length', e.target.value)}
                                            className="w-full border-b border-gray-300 px-2 py-1 text-sm focus:outline-none focus:border-gray-500"
                                        />
                                    </div>
                                    <div className="col-span-2">
                                        <input
                                            type="text"
                                            placeholder="[Hip] Add Size in cm"
                                            value={v.height}
                                            onChange={(e) => handleVariantChange(i, 'height', e.target.value)}
                                            className="w-full border-b border-gray-300 px-2 py-1 text-sm focus:outline-none focus:border-gray-500"
                                        />
                                    </div>
                                    <div className="col-span-2">
                                        <input
                                            type="text"
                                            placeholder="[Bust] Add Size in cm"
                                            value={v.bust}
                                            onChange={(e) => handleVariantChange(i, 'bust', e.target.value)}
                                            className="w-full border-b border-gray-300 px-2 py-1 text-sm focus:outline-none focus:border-gray-500"
                                        />
                                    </div>
                                    <div className="col-span-2">
                                        <input
                                            type="text"
                                            placeholder="[Sleeve] Add Size in cm"
                                            value={v.sleeve}
                                            onChange={(e) => handleVariantChange(i, 'sleeve', e.target.value)}
                                            className="w-full border-b border-gray-300 px-2 py-1 text-sm focus:outline-none focus:border-gray-500"
                                        />
                                    </div>
                                    <div className="col-span-1"></div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                <button
                    type="submit"
                    disabled={uploadingImages}
                    className={`w-full py-3 transition text-white ${uploadingImages
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