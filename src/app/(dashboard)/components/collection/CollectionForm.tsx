'use client'

import { useState } from 'react'
import Image from 'next/image'

export interface CollectionFormValues {
    title: string
    description: string
    subDescription: string
    quote: string
    hero: File | null
    heroPreview?: string | null
}

interface Props {
    onChange: (data: CollectionFormValues) => void
    values: CollectionFormValues
}

export default function CollectionForm({ onChange, values }: Props) {
    const [heroPreview, setHeroPreview] = useState<string | null>(values.heroPreview || null)
    const [errorMessage, setErrorMessage] = useState<string | null>(null)

    const MAX_FILE_SIZE = 5 * 1024 * 1024

    const handleInput = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target
        onChange({ ...values, [name]: value })
    }

    const validateFile = (file: File): boolean => {
        if (!file.type.startsWith('image/')) {
            setErrorMessage('Hanya file gambar yang diperbolehkan.')
            return false
        }
        if (file.size > MAX_FILE_SIZE) {
            setErrorMessage('Ukuran file terlalu besar. Maksimal 5MB.')
            return false
        }
        setErrorMessage(null)
        return true
    }

    const handleFile = (file: File) => {
        if (!validateFile(file)) return
        const previewURL = URL.createObjectURL(file)
        onChange({ ...values, hero: file, heroPreview: previewURL })
        setHeroPreview(previewURL)
    }

    return (
        <div>
            <h2 className="text-2xl font-semibold mb-6 text-gray-800">Add Collection</h2>

            <div
                className="border-2 border-dashed border-gray-300 rounded-lg p-6 flex flex-col items-center justify-center cursor-pointer hover:border-gray-400 transition mb-2"
                onClick={() => document.getElementById('heroInput')?.click()}
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => {
                    e.preventDefault()
                    const file = e.dataTransfer.files[0]
                    if (file) handleFile(file)
                }}
            >
                {heroPreview ? (
                    <Image
                        src={heroPreview}
                        alt="Preview"
                        width={160}
                        height={160}
                        className="object-cover rounded-md"
                    />
                ) : (
                    <p className="text-sm text-gray-500">+ Add Photo</p>
                )}
                <input
                    id="heroInput"
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                        const file = e.target.files?.[0]
                        if (file) handleFile(file)
                    }}
                />
            </div>

            {errorMessage && (
                <p className="text-sm text-red-500 mb-4">{errorMessage}</p>
            )}

            {/* Title */}
            <div className="mb-4">
                <label className="block text-sm font-medium mb-1 text-gray-700">Collection Name*</label>
                <input
                    type="text"
                    name="title"
                    value={values.title}
                    onChange={handleInput}
                    required
                    placeholder="Add collection name"
                    className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-gray-700"
                />
            </div>

            {/* Description */}
            <div className="mb-4">
                <label className="block text-sm font-medium mb-1 text-gray-700">Product Description*</label>
                <textarea
                    name="description"
                    value={values.description}
                    onChange={handleInput}
                    rows={3}
                    required
                    placeholder="Add collection description"
                    className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-gray-700"
                />
            </div>

            {/* Sub Description */}
            <div className="mb-4">
                <label className="block text-sm font-medium mb-1 text-gray-700">Sub Description*</label>
                <textarea
                    name="subDescription"
                    value={values.subDescription}
                    onChange={handleInput}
                    rows={3}
                    required
                    placeholder="Add supporting details"
                    className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-gray-700"
                />
            </div>

            {/* Quote */}
            <div className="mb-4">
                <label className="block text-sm font-medium mb-1 text-gray-700">Quote*</label>
                <input
                    type="text"
                    name="quote"
                    value={values.quote}
                    onChange={handleInput}
                    required
                    placeholder="Add collection quote"
                    className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-gray-700"
                />
            </div>
        </div>
    )
}
