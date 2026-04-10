"use client";

import { useState, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import toast from "react-hot-toast";
import StatusDropdown from "../StatusDropdown";
import DeleteConfirmModal from "../DeleteConfirmModal";
import { getImageUrl } from "@/lib/utils";
import { API_BASE } from "@/lib/constants";
import { Trash, ImageOff } from "lucide-react";

interface ProductItem {
    id: string;
    title: string;
    subLabel?: string;
    price: string;
    stock: number;
    sold: number;
    imageUrl: string;
    isActive: boolean;
}

interface ProductTableProps {
    products: ProductItem[];
    onDelete?: () => void;
}

function ProductImage({ src, alt }: { src: string; alt: string }) {
    const [status, setStatus] = useState<"loading" | "loaded" | "error">(
        "loading",
    );

    const handleLoad = useCallback(() => setStatus("loaded"), []);
    const handleError = useCallback(() => setStatus("error"), []);

    if (status === "error" || !src) {
        return (
            <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center shrink-0">
                <ImageOff size={16} className="text-gray-300" />
            </div>
        );
    }

    return (
        <div className="relative w-10 h-10 shrink-0">
            {status === "loading" && (
                <div className="absolute inset-0 rounded-lg bg-gray-200 animate-pulse" />
            )}
            <Image
                src={getImageUrl(src)}
                alt={alt}
                width={40}
                height={40}
                sizes="40px"
                className={`w-10 h-10 object-cover rounded-lg transition-opacity duration-300 ${
                    status === "loaded" ? "opacity-100" : "opacity-0"
                }`}
                onLoad={handleLoad}
                onError={handleError}
            />
        </div>
    );
}

export default function ProductTable({
    products,
    onDelete,
}: ProductTableProps) {
    const [deletingId, setDeletingId] = useState<string | null>(null);
    const [deleteTarget, setDeleteTarget] = useState<{
        id: string;
        title: string;
    } | null>(null);

    async function updateStatus(id: string, isActive: boolean) {
        try {
            const token = localStorage.getItem("token");
            const res = await fetch(`${API_BASE}/products/status/${id}`, {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: token ? `Bearer ${token}` : "",
                },
                body: JSON.stringify({ status: isActive }),
            });
            if (!res.ok) throw new Error("Failed to update status");
            toast.success(
                `Status updated to ${isActive ? "Active" : "Inactive"}`,
            );
        } catch (err) {
            console.error(err);
            toast.error("Failed to update status. Please try again.");
        }
    }

    async function handleDelete() {
        if (!deleteTarget) return;
        setDeletingId(deleteTarget.id);

        try {
            const token = localStorage.getItem("token");
            const res = await fetch(`${API_BASE}/products/${deleteTarget.id}`, {
                method: "DELETE",
                headers: {
                    Authorization: token ? `Bearer ${token}` : "",
                },
            });

            if (!res.ok) {
                const errText = await res.text();
                throw new Error(errText || "Failed to delete product");
            }

            toast.success(`"${deleteTarget.title}" has been deleted.`);
            setDeleteTarget(null);
            onDelete?.();
        } catch (err) {
            console.error(err);
            toast.error("Failed to delete product. See console for details.");
        } finally {
            setDeletingId(null);
        }
    }

    if (!products?.length) {
        return (
            <div className="text-center py-12 text-gray-500">
                No products found.
            </div>
        );
    }

    return (
        <div className="rounded-lg bg-white overflow-visible">
            <div className="min-w-[900px]">
                {/* Header */}
                <div className="grid grid-cols-[1fr_15rem_15rem_15rem_8rem] bg-sky-500 text-white font-medium text-sm rounded-t-md">
                    <div className="px-4 py-2 text-left">Product</div>
                    <div className="px-4 py-2 text-center">Price</div>
                    <div className="px-4 py-2 text-center">Stock</div>
                    <div className="px-4 py-2 text-center">Status</div>
                    <div className="px-4 py-2 text-center">Action</div>
                </div>

                {/* Rows */}
                {products.map((item) => (
                    <div
                        key={item.id}
                        className="grid grid-cols-[1fr_15rem_15rem_15rem_8rem] border-t border-gray-200 hover:bg-gray-50 transition items-center"
                    >
                        {/* Product Info */}
                        <div className="flex items-center gap-3 px-4 py-3">
                            <ProductImage
                                src={item.imageUrl}
                                alt={item.title}
                            />
                            <div>
                                <p className="text-gray-800 text-sm font-medium">
                                    {item.title}
                                </p>
                                <p className="text-xs text-gray-400">
                                    {item.subLabel || "-"}
                                </p>
                            </div>
                        </div>

                        <div className="text-center text-sm text-gray-700">
                            {item.price}
                        </div>
                        <div className="text-center text-sm text-gray-700">
                            {item.stock}
                        </div>

                        <div className="flex justify-center">
                            <StatusDropdown
                                initial={item.isActive ? "Active" : "Inactive"}
                                onChange={(value) =>
                                    updateStatus(item.id, value === "Active")
                                }
                            />
                        </div>

                        <div className="flex justify-center gap-2 py-3">
                            <Link
                                href={`/dashboard/product/${item.id}/edit`}
                                className="px-4 py-2 bg-sky-500 text-white text-xs rounded hover:bg-sky-600 transition"
                            >
                                Edit
                            </Link>

                            <button
                                onClick={() =>
                                    setDeleteTarget({
                                        id: item.id,
                                        title: item.title,
                                    })
                                }
                                className="px-2 py-2 text-red-500 border rounded text-xs hover:text-white hover:bg-red-500 transition"
                            >
                                <Trash size={16} />
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            <DeleteConfirmModal
                open={!!deleteTarget}
                itemName={deleteTarget?.title}
                loading={!!deletingId}
                onConfirm={handleDelete}
                onCancel={() => {
                    if (!deletingId) setDeleteTarget(null);
                }}
            />
        </div>
    );
}
