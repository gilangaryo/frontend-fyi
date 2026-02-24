"use client";

import Link from "next/link";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import StatusDropdown from "../StatusDropdown";
import DeleteConfirmModal from "../DeleteConfirmModal";
import { API_BASE } from "@/lib/constants";
import React from "react"
import type { DropResult } from "@hello-pangea/dnd"
import toast from "react-hot-toast"
import { Grip, Trash } from "lucide-react";
interface CollectionItem {
    id: string;
    title: string;
    isActive: boolean;
}

export default function CollectionTable({
    collections,
}: {
    collections: CollectionItem[];
}) {
    const [items, setItems] = React.useState(collections)
    const [deleteTarget, setDeleteTarget] = React.useState<{ id: string; title: string } | null>(null)
    const [deleting, setDeleting] = React.useState(false)

    React.useEffect(() => {
        setItems(collections)
    }, [collections])

    async function updateStatus(id: string, isActive: boolean) {
        try {
            const token = localStorage.getItem("token");
            await fetch(`${API_BASE}/collections/status/${id}`, {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: token ? `Bearer ${token}` : "",
                },
                body: JSON.stringify({ status: isActive }),
            });
        } catch (err) {
            console.error(err);
        }
    }

    async function handleReorder(result: DropResult) {

        if (!result.destination) return;

        const reordered = Array.from(items);
        const [moved] = reordered.splice(result.source.index, 1);
        reordered.splice(result.destination.index, 0, moved);
        setItems(reordered);

        // Kirim urutan baru ke backend
        try {
            const token = localStorage.getItem("token");
            const orderedIds = reordered.map((i) => i.id);
            await fetch(`${API_BASE}/collections/reorder`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: token ? `Bearer ${token}` : "",
                },
                body: JSON.stringify({ orderedIds }),
            });
        } catch (err) {
            console.error("Failed to reorder:", err);
        }
    }

    async function fetchCollections() {
        try {
            const token = localStorage.getItem("token");
            const res = await fetch(`${API_BASE}/collections`, {
                headers: { Authorization: `Bearer ${token}` },
                credentials: "include",
            });
            if (!res.ok) throw new Error("Failed to fetch collections");
            const data = await res.json();
            setItems(data.data || []);
        } catch (err) {
            console.error("❌ Fetch error:", err);
        }
    }
    async function handleDelete() {
        if (!deleteTarget) return;
        setDeleting(true);

        try {
            const token = localStorage.getItem("token");
            const res = await fetch(`${API_BASE}/collections/${deleteTarget.id}`, {
                method: "DELETE",
                headers: { Authorization: `Bearer ${token}` },
            });
            const json = await res.json();
            if (json.success) {
                toast.success(`"${deleteTarget.title}" has been deleted.`);
                setDeleteTarget(null);
                fetchCollections();
            } else {
                toast.error(json.message || "Failed to delete");
            }
        } catch (err) {
            console.error(err);
            toast.error("Error deleting collection");
        } finally {
            setDeleting(false);
        }
    }
    return (
        <div className="rounded-lg border border-gray-300 bg-white overflow-visible">
            {/* Header */}
            <div className="flex bg-sky-500 text-white font-medium text-sm rounded-t-md">
                <div className="w-8 px-4 py-2 text-center">#</div>
                <div className="flex-1 px-4 py-2">Collection Name</div>
                <div className="w-50 px-4 py-2 text-center">Status</div>
                <div className="w-40 px-4 py-2 text-center">Action</div>
            </div>

            {/* Rows with drag n drop */}
            <DragDropContext onDragEnd={handleReorder}>
                <Droppable droppableId="collections">
                    {(provided) => (
                        <div {...provided.droppableProps} ref={provided.innerRef} >
                            {items.map((item, index) => (
                                <Draggable key={item.id} draggableId={item.id} index={index}>
                                    {(provided) => (
                                        <div
                                            ref={provided.innerRef}
                                            {...provided.draggableProps}
                                            className="flex items-center hover:bg-gray-50 transition border-b border-gray-300"
                                        >
                                            <div
                                                {...provided.dragHandleProps}
                                                className="w-8 flex justify-center cursor-grab text-gray-400 hover:text-gray-600 ml-2"
                                            >
                                                <Grip />
                                            </div>
                                            <div className="flex-1 px-4 py-3 text-gray-800 text-sm font-medium">
                                                {item.title}
                                            </div>

                                            <div className="w-50 flex justify-center">
                                                <StatusDropdown
                                                    initial={item.isActive ? "Active" : "Inactive"}
                                                    onChange={(value) =>
                                                        updateStatus(item.id, value === "Active")
                                                    }
                                                />
                                            </div>

                                            <div className="w-40 flex justify-center gap-2 py-3">
                                                <Link
                                                    href={`/dashboard/product/collection/${item.id}/edit`}
                                                    className="px-4 py-2 bg-sky-500 text-white text-xs rounded hover:bg-sky-600 transition"
                                                >
                                                    Edit
                                                </Link>
                                                <button
                                                    onClick={() =>
                                                        setDeleteTarget({ id: item.id, title: item.title })
                                                    }
                                                    className=" px-2 py-2 border rounded text-sm text-red-500 hover:text-white hover:bg-red-500 transition"
                                                >
                                                    <Trash size={16} />
                                                </button>
                                            </div>
                                        </div>
                                    )}
                                </Draggable>
                            ))}
                            {provided.placeholder}
                        </div>
                    )}
                </Droppable>
            </DragDropContext>

            <DeleteConfirmModal
                open={!!deleteTarget}
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
