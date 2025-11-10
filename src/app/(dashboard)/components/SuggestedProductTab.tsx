"use client";

import { useCallback, useEffect, useState } from "react";
import { DndContext, DragEndEvent, closestCenter } from "@dnd-kit/core";
import {
    arrayMove,
    SortableContext,
    useSortable,
    rectSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Plus, Trash2, GripVertical } from "lucide-react";
import { API_BASE } from "@/lib/constants";
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

    const token =
        typeof window !== "undefined" ? localStorage.getItem("token") : null;

    // ✅ Fetch data
    const fetchData = useCallback(async () => {
        const [sugRes, prodRes] = await Promise.all([
            fetch(`${API_BASE}/suggested-products`, {
                headers: { Authorization: `Bearer ${token}` },
            }),
            fetch(`${API_BASE}/products`, {
                headers: { Authorization: `Bearer ${token}` },
            }),
        ]);
        const sugData = await sugRes.json();
        const prodData = await prodRes.json();
        setSuggested(sugData.data || sugData);
        setAllProducts(prodData.data || []);
    }, [token]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    // ✅ Produk yang belum disuggest
    const availableProducts = allProducts.filter(
        (p) => !suggested.some((s) => s.product.id === p.id)
    );

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
        fetchData();
    }

    async function handleDelete(id: string) {
        await fetch(`${API_BASE}/suggested-products/${id}`, {
            method: "DELETE",
            headers: { Authorization: `Bearer ${token}` },
        });
        fetchData();
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
                    <select
                        value={selectedProduct}
                        onChange={(e) => setSelectedProduct(e.target.value)}
                        className="border rounded-lg p-2 text-sm min-w-[200px]"
                    >
                        <option value="">Select product</option>
                        {availableProducts.map((p) => (
                            <option key={p.id} value={p.id}>
                                {p.title}
                            </option>
                        ))}
                    </select>
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

            {/* Grid drag area */}
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
                                onDelete={() => handleDelete(s.id)}
                            />
                        ))}
                    </div>
                </SortableContext>
            </DndContext>

            {suggested.length === 0 && (
                <p className="text-gray-400 text-sm mt-4">
                    No suggested products yet.
                </p>
            )}
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
