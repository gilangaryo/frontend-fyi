'use client'

import { useState, useRef } from 'react'
import Image from 'next/image'
import { X, Upload, Plus, Trash2 } from 'lucide-react'
import { API_BASE } from '@/lib/constants'
import { getImageUrl } from '@/lib/utils'

const slugify = (text: string) =>
    text.toLowerCase().trim().replace(/\s+/g, '-').replace(/[^\w-]+/g, '')

interface Section {
    headerImage: string
    heading: string
    description: string
    headerFile?: File | null
}

export default function BeyondForm({
    initialData,
    mode,
}: {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    initialData?: any
    mode?: 'edit' | 'create'
}) {
    const [event, setEvent] = useState(initialData?.event || '')
    const [title, setTitle] = useState(initialData?.title || '')
    const [description, setDescription] = useState(initialData?.description || '')
    const [heroImage, setHeroImage] = useState(initialData?.heroImage || '')
    const [heroFile, setHeroFile] = useState<File | null>(null)
    const [loading, setLoading] = useState(false)

    const [sections, setSections] = useState<Section[]>(() => {
        if (initialData) {
            const arr = []
            for (let i = 1; i <= 4; i++) {
                const prefix = ['first', 'second', 'third', 'fourth'][i - 1]
                const img = initialData[`${prefix}HeaderImage`]
                const head = initialData[`${prefix}Heading`]
                const desc = initialData[`${prefix}Description`]
                if (head || desc || img) {
                    arr.push({
                        headerImage: img || '',
                        heading: head || '',
                        description: desc || '',
                        headerFile: null,
                    })
                }
            }
            return arr.length
                ? arr
                : [{ headerImage: '', heading: '', description: '', headerFile: null }]
        }
        return [{ headerImage: '', heading: '', description: '', headerFile: null }]
    })

    const addSection = () => {
        if (sections.length >= 4) return
        setSections([
            ...sections,
            { headerImage: '', heading: '', description: '', headerFile: null },
        ])
    }

    const removeSection = (index: number) => {
        setSections(sections.filter((_, i) => i !== index))
    }

    const updateSection = <K extends keyof Section>(
        index: number,
        key: K,
        value: Section[K]
    ) => {
        const updated = [...sections]
        updated[index][key] = value
        setSections(updated)
    }

    const handlePreview = (
        e: React.ChangeEvent<HTMLInputElement>,
        cb: (url: string) => void,
        fileCb?: (file: File | null) => void
    ) => {
        const file = e.target.files?.[0]
        if (!file) return
        const previewUrl = URL.createObjectURL(file)
        cb(previewUrl)
        if (fileCb) fileCb(file)
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)

        const endpoint =
            mode === 'edit'
                ? `${API_BASE}/blog/${initialData?.id}`
                : '/api/blog'
        const method = mode === 'edit' ? 'PUT' : 'POST'

        try {
            const token = localStorage.getItem('token')
            if (!token) throw new Error('Unauthorized')

            // 🔹 Upload helper
            const uploadImage = async (file: File | null = null) => {
                if (!file) return null
                const formData = new FormData()
                formData.append('file', file)
                const res = await fetch(`${API_BASE}/upload/blog`, {
                    method: 'POST',
                    body: formData,
                    headers: { Authorization: `Bearer ${token}` },
                })
                const json = await res.json()
                if (!res.ok) throw new Error(json.message || 'Upload failed')
                return json.url
            }

            const uploadedHero = heroFile ? await uploadImage(heroFile) : heroImage

            const uploadedSections = await Promise.all(
                sections.map(async (section) => ({
                    ...section,
                    headerImage: section.headerFile
                        ? await uploadImage(section.headerFile)
                        : section.headerImage,
                }))
            )

            const payload = {
                event,
                title,
                description,
                slug: slugify(title),
                heroImage: uploadedHero,
                firstHeaderImage: uploadedSections[0]?.headerImage || null,
                firstHeading: uploadedSections[0]?.heading || null,
                firstDescription: uploadedSections[0]?.description || null,
                secondHeaderImage: uploadedSections[1]?.headerImage || null,
                secondHeading: uploadedSections[1]?.heading || null,
                secondDescription: uploadedSections[1]?.description || null,
                thirdHeaderImage: uploadedSections[2]?.headerImage || null,
                thirdHeading: uploadedSections[2]?.heading || null,
                thirdDescription: uploadedSections[2]?.description || null,
                fourthHeaderImage: uploadedSections[3]?.headerImage || null,
                fourthHeading: uploadedSections[3]?.heading || null,
                fourthDescription: uploadedSections[3]?.description || null,
            }

            const res = await fetch(endpoint, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            })
            const data = await res.json()
            if (!res.ok) throw new Error(data.message || 'Failed to save blog')

            alert(mode === 'edit' ? '✅ Blog updated!' : '✅ Blog created!')
        } catch (err) {
            console.error(err)
            alert('❌ Error saving blog')
        } finally {
            setLoading(false)
        }
    }

    // 🔹 DropImage component (inline)
    const DropImage = ({
        value,
        onChange,
        label,
        onFileChange,
    }: {
        value: string
        onChange: (url: string) => void
        label: string
        onFileChange?: (file: File | null) => void
    }) => {
        const inputRef = useRef<HTMLInputElement>(null)
        return (
            <div
                onDragOver={(e) => e.preventDefault()}
                onClick={() => inputRef.current?.click()}
                className="max-w-sm border-2 border-gray-500 border-dashed h-full p-3 text-center cursor-pointer hover:bg-gray-50 relative"
            >
                {value ? (
                    <div className="relative">
                        <div className="relative  aspect-[4/3]">
                            <Image
                                src={getImageUrl(value)}
                                alt={label}
                                fill
                                className="object-contain"
                            />
                        </div>
                        <button
                            type="button"
                            onClick={(e) => {
                                e.stopPropagation()
                                onChange('')
                                if (onFileChange) onFileChange(null)
                            }}
                            className="absolute top-1 right-1 bg-white rounded-full p-1 shadow"
                        >
                            <X size={16} />
                        </button>
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center text-gray-400 py-10">
                        <Upload className="w-8 h-8 mb-2" />
                        <p className="text-sm">{label}</p>
                    </div>
                )}
                <input
                    ref={inputRef}
                    type="file"
                    accept="image/*"
                    hidden
                    onChange={(e) => handlePreview(e, onChange, onFileChange)}
                />
            </div>
        )
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            {/* Hero Image */}
            <div>
                <label className="block text-sm font-medium mb-2">Hero Image*</label>
                <DropImage
                    value={heroImage}
                    onChange={setHeroImage}
                    onFileChange={setHeroFile}
                    label="+ Add Hero Image"
                />
            </div>

            {/* Title */}
            <div>
                <label className="block text-sm font-medium mb-1">Headline</label>
                <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full border-b-2 border-gray-200  p-2"
                />
            </div>

            {/* Event */}
            <div>
                <label className="block text-sm font-medium mb-1">Event</label>
                <input
                    type="text"
                    value={event}
                    onChange={(e) => setEvent(e.target.value)}
                    className="w-full border-b-2 border-gray-200  p-2"
                />
            </div>

            {/* Description */}
            <div>
                <label className="block text-sm font-medium mb-1">Description</label>
                <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="w-full border-b-2 border-gray-200   p-2"
                    rows={3}
                />
            </div>

            {/* Sections */}
            <div className="space-y-8">
                {sections.map((section, index) => (
                    <div key={index} className="border-b-2 border-gray-200  p-4 relative">
                        <div className="flex justify-between items-center mb-2">
                            <h3 className="font-semibold">Section {index + 1}</h3>
                            {sections.length > 1 && (
                                <button
                                    type="button"
                                    onClick={() => removeSection(index)}
                                    className="text-red-500 hover:text-red-700 flex items-center gap-1 text-sm"
                                >
                                    <Trash2 size={14} /> Remove
                                </button>
                            )}
                        </div>

                        <div className="space-y-3">
                            <DropImage
                                value={section.headerImage}
                                onChange={(url) => updateSection(index, 'headerImage', url)}
                                onFileChange={(file) => updateSection(index, 'headerFile', file)}
                                label="+ Add Header Image"
                            />

                            <input
                                type="text"
                                placeholder="Heading"
                                value={section.heading}
                                onChange={(e) =>
                                    updateSection(index, 'heading', e.target.value)
                                }
                                className="w-full border border-gray-500  p-2"
                            />

                            <textarea
                                placeholder="Description"
                                value={section.description}
                                onChange={(e) =>
                                    updateSection(index, 'description', e.target.value)
                                }
                                className="w-full border border-gray-500 p-2"
                                rows={3}
                            />
                        </div>
                    </div>
                ))}

                {sections.length < 4 && (
                    <button
                        type="button"
                        onClick={addSection}
                        className="w-full border-dashed border-gray-500 border-2  p-3 text-gray-500 hover:bg-gray-50 flex items-center justify-center gap-2"
                    >
                        <Plus size={16} /> Add Section
                    </button>
                )}
            </div>

            {/* Submit */}
            <button
                type="submit"
                disabled={loading}
                className="w-full bg-gray-800 text-white py-3 mt-6 hover:bg-gray-700 disabled:opacity-50"
            >
                {loading
                    ? 'Saving...'
                    : mode === 'edit'
                        ? 'Update Blog'
                        : 'Add Blog'}
            </button>
        </form>
    )
}
