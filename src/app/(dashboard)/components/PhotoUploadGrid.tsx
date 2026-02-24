"use client";

import { useEffect, useState, useRef } from "react";
import Image from "next/image";
import toast from "react-hot-toast";
import { ImagePlus, X, Star, Sparkles, Loader2 } from "lucide-react";
import { API_BASE } from "@/lib/constants";
import { getImageUrl } from "@/lib/utils";

type UploadedImage = {
    url: string;
    isPrimary: boolean;
    isSecondary: boolean;
};

interface PhotoUploadGridProps {
    onChange: (images: UploadedImage[]) => void;
    onUploadingChange?: (status: boolean) => void;
    initialImages?: UploadedImage[];
}

export default function PhotoUploadGrid({
    onChange,
    onUploadingChange,
    initialImages = [],
}: PhotoUploadGridProps) {
    const [images, setImages] = useState<UploadedImage[]>([]);
    const [uploading, setUploading] = useState(false);
    const [isDragging, setIsDragging] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        onUploadingChange?.(uploading);
    }, [uploading, onUploadingChange]);

    useEffect(() => {
        if (initialImages.length > 0) {
            setImages(initialImages);
            onChange(initialImages);
        }
    }, [initialImages, onChange]);

    const uploadFiles = async (files: File[]) => {
        const token = localStorage.getItem("token");
        if (!token) return toast.error("Unauthorized");

        const remaining = 5 - images.length;
        if (remaining <= 0) {
            return toast.error("Maximum 5 photos allowed");
        }

        const filesToUpload = files.slice(0, remaining);
        if (filesToUpload.length < files.length) {
            toast(`Only uploading ${filesToUpload.length} of ${files.length} — max 5 photos`, { icon: "⚠️" });
        }

        setUploading(true);
        try {
            const newImages: UploadedImage[] = [];

            for (const file of filesToUpload) {
                const formData = new FormData();
                formData.append("file", file);

                const res = await fetch(`${API_BASE}/upload?folder=product`, {
                    method: "POST",
                    headers: { Authorization: `Bearer ${token}` },
                    body: formData,
                });

                const data = await res.json();
                if (!res.ok) throw new Error(data.message || "Upload failed");

                const isFirst = images.length === 0 && newImages.length === 0;
                const isSecond = images.length === 1 && newImages.length === 0;

                newImages.push({
                    url: data.url,
                    isPrimary: isFirst,
                    isSecondary: isSecond,
                });
            }

            const updated = [...images, ...newImages].slice(0, 5);

            if (!updated.some((img) => img.isPrimary) && updated.length > 0) {
                updated[0].isPrimary = true;
            }

            setImages(updated);
            onChange(updated);
            toast.success(`${newImages.length} photo(s) uploaded`);
        } catch (err) {
            console.error(err);
            toast.error("Upload failed. Please try again.");
        } finally {
            setUploading(false);
        }
    };

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (!files?.length) return;
        await uploadFiles(Array.from(files));
        if (fileInputRef.current) fileInputRef.current.value = "";
    };

    const handleDrop = async (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
        const files = Array.from(e.dataTransfer.files).filter((f) =>
            f.type.startsWith("image/")
        );
        if (files.length > 0) await uploadFiles(files);
    };

    const handleRemove = async (index: number) => {
        const removed = images[index];
        const filename = removed.url.split("/").pop();
        const token = localStorage.getItem("token");

        if (filename && token) {
            await fetch(
                `${API_BASE}/upload?folder=product&filename=${filename}`,
                {
                    method: "DELETE",
                    headers: { Authorization: `Bearer ${token}` },
                }
            );
        }

        const updated = images.filter((_, i) => i !== index);

        if (removed.isPrimary && updated.length > 0) {
            updated[0].isPrimary = true;
        }

        if (removed.isSecondary && updated.length > 1) {
            updated[1].isSecondary = true;
        }

        setImages(updated);
        onChange(updated);
        toast.success("Photo removed");
    };

    const handleSetPrimary = (index: number) => {
        const updated = images.map((img, i) => ({
            ...img,
            isPrimary: i === index,
        }));
        setImages(updated);
        onChange(updated);
    };

    const handleSetSecondary = (index: number) => {
        const updated = images.map((img, i) => ({
            ...img,
            isSecondary: i === index,
        }));
        setImages(updated);
        onChange(updated);
    };

    return (
        <div>
            <div className="flex items-center justify-between mb-3">
                <label className="block text-sm font-medium text-gray-700">
                    Photo Product<span className="text-red-500">*</span>
                </label>
                {images.length > 0 && (
                    <span className={`text-xs ${images.length >= 5 ? "text-amber-500 font-medium" : "text-gray-400"}`}>
                        {images.length}/5 photo{images.length > 1 ? "s" : ""}
                    </span>
                )}
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
                {/* Uploaded images */}
                {images.map((img, i) => (
                    <div
                        key={i}
                        className="relative aspect-[3/4] rounded-xl overflow-hidden group border border-gray-200 bg-gray-50 shadow-sm"
                    >
                        <Image
                            src={getImageUrl(img.url)}
                            alt={`photo-${i}`}
                            fill
                            sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, 20vw"
                            className="object-cover"
                        />

                        {/* Overlay on hover */}
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-all duration-200" />

                        {/* Remove button */}
                        <button
                            type="button"
                            onClick={() => handleRemove(i)}
                            className="absolute top-2 right-2 w-7 h-7 flex items-center justify-center rounded-full bg-black/50 text-white opacity-0 group-hover:opacity-100 hover:bg-red-500 transition-all duration-200"
                        >
                            <X size={14} />
                        </button>

                        {/* Badges */}
                        <div className="absolute top-2 left-2 flex flex-col gap-1">
                            {img.isPrimary && (
                                <span className="flex items-center gap-1 bg-primary-studio text-white text-[10px] font-medium px-2 py-0.5 rounded-full shadow">
                                    <Star size={10} />
                                    Primary
                                </span>
                            )}
                            {img.isSecondary && (
                                <span className="flex items-center gap-1 bg-blue-600 text-white text-[10px] font-medium px-2 py-0.5 rounded-full shadow">
                                    <Sparkles size={10} />
                                    Secondary
                                </span>
                            )}
                        </div>

                        {/* Action buttons on hover */}
                        <div className="absolute bottom-0 left-0 right-0 p-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-all duration-200">
                            {!img.isPrimary && (
                                <button
                                    type="button"
                                    onClick={() => handleSetPrimary(i)}
                                    className="flex-1 flex items-center justify-center gap-1 bg-white/90 hover:bg-primary-studio hover:text-white text-gray-700 text-[11px] font-medium rounded-lg py-1.5 transition backdrop-blur-sm"
                                >
                                    <Star size={11} />
                                    Primary
                                </button>
                            )}
                            {!img.isSecondary && (
                                <button
                                    type="button"
                                    onClick={() => handleSetSecondary(i)}
                                    className="flex-1 flex items-center justify-center gap-1 bg-white/90 hover:bg-blue-600 hover:text-white text-gray-700 text-[11px] font-medium rounded-lg py-1.5 transition backdrop-blur-sm"
                                >
                                    <Sparkles size={11} />
                                    Secondary
                                </button>
                            )}
                        </div>
                    </div>
                ))}

                {/* Upload area */}
                {images.length < 5 && (
                <label
                    className={`relative aspect-[3/4] rounded-xl border-2 border-dashed flex flex-col items-center justify-center cursor-pointer transition-all duration-200 ${
                        isDragging
                            ? "border-primary-studio bg-primary-studio/5 scale-[1.02]"
                            : "border-gray-300 bg-gray-50 hover:border-gray-400 hover:bg-gray-100"
                    } ${uploading ? "pointer-events-none" : ""}`}
                    onDragOver={(e) => {
                        e.preventDefault();
                        setIsDragging(true);
                    }}
                    onDragLeave={() => setIsDragging(false)}
                    onDrop={handleDrop}
                >
                    {uploading ? (
                        <div className="flex flex-col items-center gap-2 text-primary-studio">
                            <Loader2 size={28} className="animate-spin" />
                            <span className="text-xs font-medium">Uploading...</span>
                        </div>
                    ) : (
                        <div className="flex flex-col items-center gap-1.5 text-gray-400">
                            <ImagePlus size={28} strokeWidth={1.5} />
                            <span className="text-xs font-medium">Add photo</span>
                            <span className="text-[10px] text-gray-300">or drag & drop</span>
                        </div>
                    )}
                    <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        multiple
                        onChange={handleFileChange}
                        className="hidden"
                    />
                </label>
                )}
            </div>
        </div>
    );
}
