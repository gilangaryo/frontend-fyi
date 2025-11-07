'use client'

import { useEffect, useState, useRef } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Image from 'next/image'
import { Plus, Trash2, Upload, X } from 'lucide-react'
import { API_BASE } from '@/lib/constants'
import { getImageUrl } from '@/lib/utils'
import AlertModal from '@/app/(dashboard)/components/AlertModal'
import LoadingOverlay from '@/app/(dashboard)/components/LoadingOverlay'

// utils
const slugify = (text: string) =>
    text.toLowerCase().trim().replace(/\s+/g, '-').replace(/[^\w-]+/g, '')

interface Section {
    headerImage: string
    heading: string
    description: string
    subDescription?: string
    headerFile?: File | null

}

export default function EditBeyondPage() {
    const { id } = useParams()
    const router = useRouter()
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)

    const [event, setEvent] = useState('')
    const [title, setTitle] = useState('')
    const [description, setDescription] = useState('')
    const [quote, setQuote] = useState('')

    const [heroImage, setHeroImage] = useState<string>('')
    const [heroFile, setHeroFile] = useState<File | null>(null)
    const [imageDivider, setImageDivider] = useState<string>('')
    const [imageDividerFile, setImageDividerFile] = useState<File | null>(null)
    const [firstFooterImage, setFirstFooterImage] = useState<string>('')
    const [secondFooterImage, setSecondFooterImage] = useState<string>('')
    const [firstFooterFile, setFirstFooterFile] = useState<File | null>(null)
    const [secondFooterFile, setSecondFooterFile] = useState<File | null>(null)

    const [sections, setSections] = useState<Section[]>([])


    const [alertOpen, setAlertOpen] = useState(false)
    const [alertType, setAlertType] = useState<'success' | 'error'>('success')
    const [alertTitle, setAlertTitle] = useState('')
    const [alertMessage, setAlertMessage] = useState('')
    useEffect(() => {
        ; (async () => {
            try {
                const res = await fetch(`${API_BASE}/blog/${id}`)
                const json = await res.json()
                if (json.success) {
                    const d = json.data
                    setEvent(d.event || '')
                    setTitle(d.title || '')
                    setDescription(d.description || '')
                    setHeroImage(d.heroImage || '')
                    setQuote(d.quote || '')
                    setImageDivider(d.imageDivider || '')
                    setFirstFooterImage(d.firstFooterImage || '')
                    setSecondFooterImage(d.secondFooterImage || '')

                    const arr: Section[] = []
                    const keys = ['first', 'second', 'third', 'fourth']
                    keys.forEach((key) => {
                        const img = d[`${key}HeaderImage`]
                        const head = d[`${key}Heading`]
                        const desc = d[`${key}Description`]

                        const subDesc = key === 'third' ? d[`thirdSubDescription`] : ''

                        if (img || head || desc || subDesc)
                            arr.push({
                                headerImage: img || '',
                                heading: head || '',
                                description: desc || '',
                                subDescription: subDesc || '',
                                headerFile: null,
                            })
                    })

                    setSections(
                        arr.length
                            ? arr
                            : [{
                                headerImage: '',
                                heading: '',
                                description: '',
                                subDescription: '',
                                headerFile: null
                            }]
                    )

                }
            } catch (err) {
                console.error('❌ Failed to load blog', err)
            } finally {
                setLoading(false)
            }
        })()
    }, [id])

    const addSection = () => {
        if (sections.length >= 3) return
        setSections([...sections, { headerImage: '', heading: '', description: '', headerFile: null }])
    }

    const removeSection = (index: number) => {
        setSections(sections.filter((_, i) => i !== index))
    }

    const updateSection = <K extends keyof Section>(index: number, key: K, value: Section[K]) => {
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

    const uploadImage = async (file: File | null, token: string) => {
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

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setSaving(true)
        try {
            const token = localStorage.getItem('token')
            if (!token) throw new Error('Unauthorized')

            // Upload hero/footer/divider if replaced
            const uploadedHero = heroFile ? await uploadImage(heroFile, token) : heroImage
            const uploadedDivider = imageDividerFile ? await uploadImage(imageDividerFile, token) : imageDivider
            const uploadedFirstFooter = firstFooterFile ? await uploadImage(firstFooterFile, token) : firstFooterImage
            const uploadedSecondFooter = secondFooterFile ? await uploadImage(secondFooterFile, token) : secondFooterImage

            const uploadedSections = await Promise.all(
                sections.map(async (section) => ({
                    ...section,
                    headerImage: section.headerFile
                        ? await uploadImage(section.headerFile, token)
                        : section.headerImage,
                }))
            )

            const payload = {
                event,
                title,
                description,
                quote,
                slug: slugify(event + title),
                heroImage: uploadedHero,
                imageDivider: uploadedDivider,
                firstFooterImage: uploadedFirstFooter,
                secondFooterImage: uploadedSecondFooter,
                firstHeaderImage: uploadedSections[0]?.headerImage || null,
                firstHeading: uploadedSections[0]?.heading || null,
                firstDescription: uploadedSections[0]?.description || null,
                secondHeaderImage: uploadedSections[1]?.headerImage || null,
                secondHeading: uploadedSections[1]?.heading || null,
                secondDescription: uploadedSections[1]?.description || null,
                thirdHeaderImage: uploadedSections[2]?.headerImage || null,
                thirdHeading: uploadedSections[2]?.heading || null,
                thirdDescription: uploadedSections[2]?.description || null,
                thirdSubDescription: uploadedSections[2]?.subDescription || null,
                fourthHeaderImage: uploadedSections[3]?.headerImage || null,
                fourthHeading: uploadedSections[3]?.heading || null,
                fourthDescription: uploadedSections[3]?.description || null,
            }

            const res = await fetch(`${API_BASE}/blog/${id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify(payload),
            })
            const json = await res.json()
            if (!res.ok) throw new Error(json.message || 'Failed to update')

            setAlertType('success')
            // setAlertTitle('Beyond Updated!')
            setAlertMessage(' Your Beyond was successfully updated.')
            setAlertOpen(true)
            setTimeout(() => router.push('/dashboard/beyond'), 1500)
        } catch (err) {
            console.error(err)
            setAlertType('error')
            setAlertTitle('Update Failed')
            setAlertMessage('❌ Something went wrong while updating the Beyond.')
            setAlertOpen(true)
        } finally {
            setSaving(false)
        }
    }

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
        const displayUrl = value?.startsWith('blob:') || value?.startsWith('data:') ? value : getImageUrl(value)

        return (
            <div
                onDragOver={(e) => e.preventDefault()}
                className="border-2 border-dashed max-w-xs rounded-lg p-3 text-center cursor-pointer hover:bg-gray-50 relative"
                onClick={() => inputRef.current?.click()}
            >
                {value ? (
                    <div className="relative">
                        <div className="relative w-full aspect-[4/3]">
                            <Image src={displayUrl || ''} alt={label} fill className="object-cover rounded-md" />
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

    if (loading) return <div className="p-8 text-gray-500 text-center">Loading...</div>

    return (
        <div className="p-8 max-w-full mx-auto">
            <button onClick={() => router.back()} className="text-sm text-gray-500 hover:text-gray-800 mb-6">
                ← Back to Beyond
            </button>

            <h1 className="text-2xl font-semibold mb-6">Edit Beyond</h1>

            <form onSubmit={handleSubmit} className="space-y-6">
                {/* Hero Image */}
                <div>
                    <label className="block text-sm font-medium mb-2">Hero Image*</label>
                    <DropImage value={heroImage} onChange={setHeroImage} onFileChange={setHeroFile} label="+ Add Hero Image" />
                </div>

                {/* Headline */}
                <div>
                    <label className="block text-sm font-medium mb-1">Headline</label>
                    <input
                        type="text"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        className="w-full border rounded-md p-2"
                    />
                </div>

                {/* Event */}
                <div>
                    <label className="block text-sm font-medium mb-1">Event</label>
                    <input
                        type="text"
                        value={event}
                        onChange={(e) => setEvent(e.target.value)}
                        className="w-full border rounded-md p-2"
                    />
                </div>

                {/* Description */}
                <div>
                    <label className="block text-sm font-medium mb-1">Description</label>
                    <textarea
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        className="w-full border rounded-md p-2"
                        rows={3}
                    />
                </div>

                {/* Sections */}
                <div className="space-y-8">
                    {sections.map((section, index) => (
                        <div key={index} className="border rounded-xl p-4 relative">
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
                                    onChange={(e) => updateSection(index, 'heading', e.target.value)}
                                    className="w-full border rounded-md p-2"
                                />

                                <textarea
                                    placeholder="Description"
                                    value={section.description}
                                    onChange={(e) => updateSection(index, 'description', e.target.value)}
                                    className="w-full border rounded-md p-2"
                                    rows={3}
                                />

                                {index === 2 && (
                                    <textarea
                                        placeholder="Sub Description (third section only)"
                                        value={section.subDescription || ''}
                                        onChange={(e) => updateSection(index, 'subDescription', e.target.value)}
                                        className="w-full border rounded-md p-2"
                                        rows={3}
                                    />
                                )}

                            </div>
                        </div>
                    ))}

                    {sections.length < 3 && (
                        <button
                            type="button"
                            onClick={addSection}
                            className="w-full border-dashed border-2 rounded-xl p-3 text-gray-500 hover:bg-gray-50 flex items-center justify-center gap-2"
                        >
                            <Plus size={16} /> Add Section
                        </button>
                    )}
                </div>

                {/* Divider Image */}
                <div className="flex-1 min-w-[20px]">
                    <h3 className="font-semibold mb-2">Image Divider</h3>
                    <DropImage
                        value={imageDivider}
                        onChange={setImageDivider}
                        onFileChange={setImageDividerFile}
                        label="+ Add Image Divider"
                    />
                </div>

                {/* Quote */}
                <div className="border rounded-xl p-4">
                    <h3 className="font-semibold mb-2">Quote</h3>
                    <input
                        type="text"
                        placeholder="Quote"
                        value={quote}
                        onChange={(e) => setQuote(e.target.value)}
                        className="w-full border rounded-md p-2"
                    />
                </div>

                {/* Footer Images */}
                <div className="flex flex-wrap gap-6">
                    <div className="flex-1 min-w-[20px]">
                        <h3 className="font-semibold mb-2">First Footer Image</h3>
                        <DropImage
                            value={firstFooterImage}
                            onChange={setFirstFooterImage}
                            onFileChange={setFirstFooterFile}
                            label="+ Add First Footer Image"
                        />
                    </div>

                    <div className="flex-1 min-w-[20px]">
                        <h3 className="font-semibold mb-2">Second Footer Image</h3>
                        <DropImage
                            value={secondFooterImage}
                            onChange={setSecondFooterImage}
                            onFileChange={setSecondFooterFile}
                            label="+ Add Second Footer Image"
                        />
                    </div>
                </div>

                {/* Submit */}
                <button
                    type="submit"
                    disabled={saving}
                    className="w-full bg-gray-800 text-white rounded-lg py-3 mt-6 hover:bg-gray-700 disabled:opacity-50"
                >
                    {saving ? 'Updating...' : 'Update Blog'}
                </button>
            </form>
            <AlertModal
                open={alertOpen}
                type={alertType}
                title={alertTitle}
                message={alertMessage}
                onClose={() => setAlertOpen(false)}
            />

            {/* <LoadingOverlay show={loading} message="Editing blog..." /> */}
            {/* ✅ Overlay untuk loading awal */}
            {/* <LoadingOverlay show={loading} message="Loading content..." /> */}

            {/* ✅ Overlay untuk submit/update */}
            <LoadingOverlay show={saving} message="Updating blog..." />
        </div>

    )
}
