'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'
import { API_BASE } from '@/lib/constants'
import { getImageUrl } from '@/lib/utils'

type UploadedImage = {
    url: string
    isPrimary: boolean
}

interface PhotoUploadGridProps {
    onChange: (images: UploadedImage[]) => void
    onUploadingChange?: (status: boolean) => void
    initialImages?: UploadedImage[]
}

export default function PhotoUploadGrid({ onChange, onUploadingChange, initialImages = [] }: PhotoUploadGridProps) {
    const [images, setImages] = useState<UploadedImage[]>([])
    const [uploading, setUploading] = useState(false)

    useEffect(() => {
        onUploadingChange?.(uploading)
    }, [uploading, onUploadingChange])

    useEffect(() => {
        if (initialImages.length > 0) {
            setImages(initialImages)
            onChange(initialImages)
        }
    }, [initialImages, onChange])


    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files
        if (!files?.length) return
        const token = localStorage.getItem('token')
        if (!token) return alert('Unauthorized')

        setUploading(true)
        try {
            const newImages: UploadedImage[] = []

            for (const file of Array.from(files)) {
                const formData = new FormData()
                formData.append('file', file)

                const res = await fetch(`${API_BASE}/upload`, {
                    method: 'POST',
                    headers: { Authorization: `Bearer ${token}` },
                    body: formData,
                })

                const data = await res.json()
                if (!res.ok) throw new Error(data.message || 'Upload failed')

                const isFirst = images.length === 0 && newImages.length === 0
                newImages.push({ url: data.url, isPrimary: isFirst })

            }

            const updated = [...images, ...newImages]

            if (!updated.some((img) => img.isPrimary) && updated.length > 0) {
                updated[0].isPrimary = true
            }

            setImages(updated)
            onChange(updated)

        } catch (err) {
            console.error(err)
            alert('Upload failed')
        } finally {
            setUploading(false)
        }
    }

    const handleRemove = (index: number) => {
        const updated = images.filter((_, i) => i !== index)
        setImages(updated)
        onChange(updated)
    }

    const handleSetPrimary = (index: number) => {
        const updated = images.map((img, i) => ({
            ...img,
            isPrimary: i === index,
        }))
        setImages(updated)
        onChange(updated)
    }

    return (
        <div>
            <label className="block text-sm font-medium mb-2">Photo Product*</label>

            <div className="flex gap-4 flex-wrap">
                {images.map((img, i) => (
                    <div
                        key={i}
                        className="relative w-32 h-40 border rounded-lg overflow-hidden group"
                    >
                        <Image
                            src={getImageUrl(img.url)}
                            alt={`photo-${i}`}
                            fill
                            className="object-cover"
                        />

                        <button
                            type="button"
                            onClick={() => handleRemove(i)}
                            className="absolute top-1 right-1 bg-black/60 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition"
                        >
                            ✕
                        </button>

                        <button
                            type="button"
                            onClick={() => handleSetPrimary(i)}
                            className={`absolute bottom-1 left-1 right-1 mx-auto text-xs rounded px-2 py-1 ${img.isPrimary
                                ? 'bg-blue-600 text-white'
                                : 'bg-white/80 text-gray-700 hover:bg-gray-200'
                                }`}
                        >
                            {img.isPrimary ? 'Primary' : 'Set Primary'}
                        </button>
                    </div>
                ))}

                <label className="w-32 h-40 border-2 border-dashed border-gray-300 flex flex-col items-center justify-center text-gray-500 cursor-pointer hover:bg-gray-50">
                    {uploading ? (
                        <span className="text-xs text-blue-500 animate-pulse">Uploading...</span>
                    ) : (
                        <>
                            <span className="text-2xl mb-1">＋</span>
                            <span className="text-sm">Add photo</span>
                        </>
                    )}
                    <input
                        type="file"
                        accept="image/*"
                        multiple
                        onChange={handleFileChange}
                        className="hidden"
                    />
                </label>
            </div>
        </div>
    )
}
