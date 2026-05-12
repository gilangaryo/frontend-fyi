"use client";

import { DndContext, DragEndEvent, closestCenter } from "@dnd-kit/core";
import {
    arrayMove,
    SortableContext,
    useSortable,
    verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical, Plus, Trash, Trash2 } from "lucide-react";
import {
    AdminMeasurementField,
    AdminVariant,
    normalizeMeasurementKey,
} from "@/app/(dashboard)/components/product/measurement-helpers";

type DynamicMeasurementEditorProps = {
    measurementFields: AdminMeasurementField[];
    variants: AdminVariant[];
    onAddField: () => void;
    onRemoveField: (index: number) => void;
    onReorderFields: (newFields: AdminMeasurementField[]) => void;
    onFieldChange: (
        index: number,
        field: "name" | "displayName" | "unit",
        value: string,
    ) => void;
    onMeasurementValueChange: (
        variantIndex: number,
        fieldName: string,
        value: string,
    ) => void;
};

export default function DynamicMeasurementEditor({
    measurementFields,
    variants,
    onAddField,
    onRemoveField,
    onReorderFields,
    onFieldChange,
    onMeasurementValueChange,
}: DynamicMeasurementEditorProps) {
    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event;
        if (!over || active.id === over.id) return;

        const oldIndex = measurementFields.findIndex(
            (f) => f.id === active.id || f.name === active.id,
        );
        const newIndex = measurementFields.findIndex(
            (f) => f.id === over.id || f.name === over.id,
        );

        if (oldIndex === -1 || newIndex === -1) return;

        const newFields = arrayMove(measurementFields, oldIndex, newIndex);
        onReorderFields(newFields);
    };

    return (
        <div className="space-y-6">
            {/* Measurement Fields Section */}
            <div>
                <div className="flex items-center justify-between mb-4">
                    <label className="block text-lg font-semibold text-gray-900">
                        Measurement Fields
                    </label>
                    <p className="text-xs text-gray-500">
                        Drag to reorder · {measurementFields.length} field
                        {measurementFields.length !== 1 ? "s" : ""}
                    </p>
                </div>
                <DndContext
                    collisionDetection={closestCenter}
                    onDragEnd={handleDragEnd}
                >
                    <SortableContext
                        items={measurementFields.map((f) => f.id || f.name)}
                        strategy={verticalListSortingStrategy}
                    >
                        <div className="overflow-hidden bg-white   ">
                            {measurementFields.map((field, index) => (
                                <SortableField
                                    key={`${field.id || "new"}-${index}`}
                                    field={field}
                                    index={index}
                                    canDelete={measurementFields.length > 1}
                                    onFieldChange={onFieldChange}
                                    onRemoveField={onRemoveField}
                                />
                            ))}

                            {/* Add Field Button */}
                            <button
                                type="button"
                                onClick={onAddField}
                                className="w-full p-4 text-sm font-medium text-gray-500 bg-gray-200 hover:bg-gray-300 transition flex items-center justify-center gap-2"
                            >
                                <Plus className="w-5 h-5" />
                                Add Measurement Field
                            </button>
                        </div>
                    </SortableContext>
                </DndContext>
            </div>

            {/* Size Chart Section */}
            <div>
                <label className="block text-lg font-semibold text-gray-900 mb-4">
                    Size Chart Preview
                </label>
                <div className="border border-gray-200 rounded-lg overflow-x-auto bg-white shadow-sm">
                    <table className="min-w-full text-sm">
                        <thead className="bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200">
                            <tr>
                                <th className="px-4 py-3 border-r border-gray-200 text-left font-semibold text-gray-700">
                                    Size
                                </th>
                                {measurementFields.map((field, index) => (
                                    <th
                                        key={`${field.name}-${index}`}
                                        className="px-4 py-3 border-r border-gray-200 text-left font-semibold text-gray-700 whitespace-nowrap"
                                    >
                                        {field.displayName || field.name}
                                        {field.unit ? ` (${field.unit})` : ""}
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {variants.map((variant, variantIndex) => (
                                <tr
                                    key={`${variant.id || "new"}-${variantIndex}`}
                                    className="hover:bg-gray-50 transition"
                                >
                                    <td className="px-4 py-3 border-r border-gray-200 font-semibold text-gray-900 bg-gray-50">
                                        {variant.size || "-"}
                                    </td>
                                    {measurementFields.map(
                                        (field, fieldIndex) => (
                                            <td
                                                key={`${field.name}-${variant.id || variantIndex}-${fieldIndex}`}
                                                className="px-4 py-3 border-r border-gray-200"
                                            >
                                                <input
                                                    type="text"
                                                    value={
                                                        variant.measurements[
                                                            field.name
                                                        ] || ""
                                                    }
                                                    onChange={(e) =>
                                                        onMeasurementValueChange(
                                                            variantIndex,
                                                            field.name,
                                                            e.target.value,
                                                        )
                                                    }
                                                    placeholder="—"
                                                    className="w-full max-w-xs px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                                                />
                                            </td>
                                        ),
                                    )}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}

function SortableField({
    field,
    index,
    canDelete,
    onFieldChange,
    onRemoveField,
}: {
    field: AdminMeasurementField;
    index: number;
    canDelete: boolean;
    onFieldChange: (
        index: number,
        field: "name" | "displayName" | "unit",
        value: string,
    ) => void;
    onRemoveField: (index: number) => void;
}) {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({
        id: field.id || field.name,
    });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.5 : 1,
    };

    return (
        <div
            ref={setNodeRef}
            style={style}
            className={`grid grid-cols-10 gap-6 p-4 items-center transition-colors border-gray-300 border-b  ${
                isDragging ? "bg-blue-50" : "hover:bg-gray-50"
            }`}
        >
            {/* Drag Handle */}
            <div
                {...attributes}
                {...listeners}
                className="col-span-1 flex justify-center text-gray-400 cursor-grab active:cursor-grabbing"
            >
                <GripVertical className="w-5 h-5" />
            </div>

            {/* Display Name Input */}
            <input
                type="text"
                value={field.displayName}
                onChange={(e) => {
                    const val = e.target.value;
                    onFieldChange(index, "displayName", val);
                    onFieldChange(index, "name", normalizeMeasurementKey(val));
                }}
                placeholder="Label (e.g., Bust)"
                className="col-span-8 border-b border-gray-300 px-2 py-2 text-sm focus:outline-none focus:border-primary-studio transition"
            />

            {/* Field Name Input */}
            {/* <input
                type="text"
                value={field.name}
                onChange={(e) => onFieldChange(index, "name", e.target.value)}
                placeholder="key (e.g., bust)"
                className="col-span-3 border-b border-gray-300 px-2 py-2 text-sm focus:outline-none focus:border-primary-studio transition"
            /> */}

            {/* Unit Input */}
            {/* <input
                type="text"
                value={field.unit || ""}
                onChange={(e) => onFieldChange(index, "unit", e.target.value)}
                placeholder="cm"
                className="col-span-2 border-b border-gray-300 px-2 py-2 text-sm focus:outline-none focus:border-primary-studio transition"
            /> */}

            {/* Delete Button */}
            <div className="col-span-1 flex items-center justify-end">
                <button
                    type="button"
                    onClick={() => onRemoveField(index)}
                    disabled={!canDelete}
                    title="Delete field"
                    className="p-2 text-red-600 hover:bg-red-50 rounded transition disabled:text-gray-300 disabled:hover:bg-transparent"
                >
                    <Trash className="w-5 h-5" />
                </button>
            </div>
        </div>
    );
}
