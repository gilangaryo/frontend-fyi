"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { DndContext, DragEndEvent, closestCenter } from "@dnd-kit/core";
import {
    arrayMove,
    SortableContext,
    useSortable,
    rectSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Plus, Trash2, GripVertical, Search, ChevronDown } from "lucide-react";
import toast from "react-hot-toast";
import { API_BASE } from "@/lib/constants";
import DeleteConfirmModal from "./DeleteConfirmModal";
import Image from "next/image";
import { getImageUrl } from "@/lib/utils";

type Product = {
    id: string;
    title: string;
    imageUrl: string | null;
};

type Suggested = {
    id: string;
    position: number;
    isActive: boolean;
    product: Product;
};

export default function SuggestedProductTab() {
    const [suggested, setSuggested] = useState<Suggested[]>([]);
    const [allProducts, setAllProducts] = useState<Product[]>([]);
    const [selectedProduct, setSelectedProduct] = useState("");
    const [productSearch, setProductSearch] = useState("");
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [loading, setLoading] = useState(true);
    const [deleteTarget, setDeleteTarget] = useState<{ id: string; title: string } | null>(null);
    const [deleting, setDeleting] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    const token =
        typeof window !== "undefined" ? localStorage.getItem("token") : null;

    // ✅ Fetch data
    const fetchData = useCallback(async () => {
        try {
            const [sugRes, prodRes] = await Promise.all([
                fetch(`${API_BASE}/suggested-products`, {
                    headers: { Authorization: `Bearer ${token}` },
                }),
                fetch(`${API_BASE}/products?all=true`, {
                    headers: { Authorization: `Bearer ${token}` },
                }),
            ]);
            const sugData = await sugRes.json();
            const prodData = await prodRes.json();
            setSuggested(sugData.data || sugData);
            setAllProducts(prodData.data || []);
        } catch (err) {
            console.error("Failed to fetch suggested products:", err);
        } finally {
            setLoading(false);
        }
    }, [token]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    // Click outside to close dropdown
    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
                setIsDropdownOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    // Produk yang belum disuggest
    const availableProducts = allProducts.filter(
        (p) => !suggested.some((s) => s.product.id === p.id)
    );

    // Filtered by search
    const filteredProducts = availableProducts.filter((p) =>
        p.title.toLowerCase().includes(productSearch.toLowerCase())
    );

    const selectedProductTitle = availableProducts.find(
        (p) => p.id === selectedProduct
    )?.title;

    async function handleAdd() {
        if (!selectedProduct) return;
        await fetch(`${API_BASE}/suggested-products`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({ productId: selectedProduct }),
        });
        setSelectedProduct("");
        setProductSearch("");
        fetchData();
    }

    async function handleDelete() {
        if (!deleteTarget) return;
        setDeleting(true);
        try {
            const res = await fetch(`${API_BASE}/suggested-products/${deleteTarget.id}`, {
                method: "DELETE",
                headers: { Authorization: `Bearer ${token}` },
            });
            if (!res.ok) throw new Error("Failed to delete");
            toast.success(`"${deleteTarget.title}" removed from suggested`);
            setDeleteTarget(null);
            fetchData();
        } catch (err) {
            console.error(err);
            toast.error("Failed to remove product");
        } finally {
            setDeleting(false);
        }
    }

    async function handleReorder(newItems: Suggested[]) {
        setSuggested(newItems);
        const ordered = newItems.map((s, i) => ({ id: s.id, position: i + 1 }));
        await fetch(`${API_BASE}/suggested-products/reorder`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({ items: ordered }),
        });
    }

    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event;
        if (!over || active.id === over.id) return;
        const oldIndex = suggested.findIndex((s) => s.id === active.id);
        const newIndex = suggested.findIndex((s) => s.id === over.id);
        const newItems = arrayMove(suggested, oldIndex, newIndex);
        handleReorder(newItems);
    };

    return (
        <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between mb-6">
                <h2 className="font-semibold text-primary-studio text-lg">
                    Suggested Products (max 4)
                </h2>
                <div className="flex gap-3">
                    {/* Searchable product dropdown */}
                    <div className="relative min-w-[460px]" ref={dropdownRef}>
                        <button
                            type="button"
                            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                            className="w-full border border-gray-300 rounded-lg p-2 text-sm bg-white hover:bg-gray-50 transition flex items-center justify-between gap-2 focus:ring-2 focus:ring-primary-studio focus:outline-none"
                        >
                            <span className={selectedProductTitle ? "text-gray-800" : "text-gray-400"}>
                                {selectedProductTitle || "Select product"}
                            </span>
                            <ChevronDown
                                className={`w-4 h-4 text-gray-400 transition-transform ${isDropdownOpen ? "rotate-180" : ""}`}
                            />
                        </button>

                        {isDropdownOpen && (
                            <div className="absolute z-20 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg overflow-hidden">
                                <div className="relative p-2 border-b border-gray-100">
                                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                    <input
                                        type="text"
                                        placeholder="Search products..."
                                        value={productSearch}
                                        onChange={(e) => setProductSearch(e.target.value)}
                                        className="w-full pl-8 pr-3 py-1.5 text-sm border border-gray-200 rounded-md focus:ring-1 focus:ring-primary-studio focus:outline-none"
                                        autoFocus
                                    />
                                </div>
                                <div className="max-h-48 overflow-y-auto">
                                    {filteredProducts.length === 0 ? (
                                        <p className="text-sm text-gray-400 text-center py-3">
                                            No products found
                                        </p>
                                    ) : (
                                        filteredProducts.map((p) => (
                                            <button
                                                key={p.id}
                                                onClick={() => {
                                                    setSelectedProduct(p.id);
                                                    setProductSearch("");
                                                    setIsDropdownOpen(false);
                                                }}
                                                className={`w-full px-4 py-2 text-left text-sm hover:bg-gray-50 transition ${
                                                    selectedProduct === p.id
                                                        ? "bg-primary-studio/10 text-primary-studio font-medium"
                                                        : "text-gray-700"
                                                }`}
                                            >
                                                {p.title}
                                            </button>
                                        ))
                                    )}
                                </div>
                            </div>
                        )}
                    </div>

                    <button
                        onClick={handleAdd}
                        disabled={!selectedProduct || suggested.length >= 4}
                        className="flex items-center gap-2 bg-primary-studio text-white px-4 py-2 rounded-lg disabled:opacity-40"
                    >
                        <Plus className="w-4 h-4" />
                        Add
                    </button>
                </div>
            </div>

            {/* Skeleton loading */}
            {loading && (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
                    {Array.from({ length: 4 }).map((_, i) => (
                        <div
                            key={i}
                            className="bg-gray-50 border border-gray-200 rounded-xl overflow-hidden shadow-sm animate-pulse"
                        >
                            <div className="w-full aspect-[3/4] bg-gray-200" />
                            <div className="p-3 bg-white flex justify-center">
                                <div className="h-4 w-28 bg-gray-200 rounded" />
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Grid drag area */}
            {!loading && (
                <DndContext collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                    <SortableContext
                        items={suggested.map((s) => s.id)}
                        strategy={rectSortingStrategy}
                    >
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
                            {suggested.map((s) => (
                                <SortableCard
                                    key={s.id}
                                    id={s.id}
                                    product={s.product}
                                    onDelete={() => setDeleteTarget({ id: s.id, title: s.product.title })}
                                />
                            ))}
                        </div>
                    </SortableContext>
                </DndContext>
            )}

            {!loading && suggested.length === 0 && (
                <p className="text-gray-400 text-sm mt-4">
                    No suggested products yet.
                </p>
            )}

            <DeleteConfirmModal
                open={!!deleteTarget}
                title="Remove Suggested Product"
                itemName={deleteTarget?.title}
                loading={deleting}
                onConfirm={handleDelete}
                onCancel={() => {
                    if (!deleting) setDeleteTarget(null);
                }}
            />
        </div>
    );
}

function SortableCard({
    id,
    product,
    onDelete,
}: {
    id: string;
    product: Product;
    onDelete: () => void;
}) {
    const { attributes, listeners, setNodeRef, transform, transition } =
        useSortable({ id });
    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
    };

    return (
        <div
            ref={setNodeRef}
            style={style}
            className="relative group bg-gray-50 border border-gray-200 rounded-xl overflow-hidden shadow-sm"
        >
            <div
                {...attributes}
                {...listeners}
                className="absolute top-4 left-4 cursor-grab bg-white/70 rounded-full p-1 opacity-0 group-hover:opacity-100 transition"
            >
                <GripVertical className="w-10 h-10 text-gray-500" />
            </div>
            <button
                onClick={onDelete}
                className="absolute top-4 right-4 cursor-pointer p-3 rounded-full opacity-0 group-hover:opacity-100 transition"
            >
                <Trash2 className=" w-5 h-5 text-red-500" />
            </button>
            <Image
                {...attributes}
                {...listeners}
                src={getImageUrl(product.imageUrl)}
                alt={product.title}
                width={200}
                height={200}
                className="w-full aspect-[3/4] object-cover"
            />
            <div className="p-3 text-center bg-white">
                <p className="font-medium text-gray-800 text-sm">{product.title}</p>
            </div>
        </div>
    );
}
