"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter, useParams, useSearchParams } from "next/navigation";
import { API_BASE } from "@/lib/constants";
import PhotoUploadGrid from "@/app/(dashboard)/components/PhotoUploadGrid";
import { formatRupiah } from "@/lib/utils";
import { Trash } from "lucide-react";
import DynamicMeasurementEditor from "@/app/(dashboard)/components/product/DynamicMeasurementEditor";
import {
    AdminVariant,
    AdminMeasurementField,
    DEFAULT_MEASUREMENT_FIELDS,
    createEmptyVariant,
    extractMeasurementFieldsFromProduct,
    extractVariantMeasurements,
    getNextMeasurementField,
    normalizeMeasurementKey,
} from "@/app/(dashboard)/components/product/measurement-helpers";
import { Product } from "@/types/product";

function AutoResizeTextarea({
    value,
    onChange,
    name,
    rows = 2,
    placeholder,
    className = "",
    required = false,
}: {
    value: string;
    onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
    name: string;
    rows?: number;
    placeholder?: string;
    className?: string;
    required?: boolean;
}) {
    const handleRef = useCallback((el: HTMLTextAreaElement | null) => {
        if (el) {
            el.style.height = "auto";
            el.style.height = el.scrollHeight + "px";
        }
    }, []);

    const handleInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        const el = e.target;
        el.style.height = "auto";
        el.style.height = el.scrollHeight + "px";
        onChange(e);
    };

    return (
        <textarea
            ref={handleRef}
            name={name}
            value={value}
            onChange={handleInput}
            rows={rows}
            placeholder={placeholder}
            required={required}
            className={`w-full border-b border-gray-300 p-2 resize-none overflow-hidden ${className}`}
        />
    );
}

type ProductImage = {
    imageUrl: string;
    isPrimary: boolean;
    isSecondary: boolean; // ✅ Tambahan
};

export default function EditProductPage() {
    const router = useRouter();
    const { id } = useParams<{ id: string }>();
    const searchParams = useSearchParams();
    const fromPage = Math.max(
        1,
        Number(searchParams.get("from_page") ?? 1) || 1,
    );
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [uploadingImages, setUploadingImages] = useState(false);

    const [collections, setCollections] = useState<
        { id: string; title: string }[]
    >([]);
    const [categories, setCategories] = useState<
        { id: string; title: string }[]
    >([]);
    const [fabrics, setFabrics] = useState<{ id: string; name: string }[]>([]);
    const [images, setImages] = useState<
        { url: string; isPrimary: boolean; isSecondary: boolean }[]
    >([]);
    const [measurementFields, setMeasurementFields] = useState(
        DEFAULT_MEASUREMENT_FIELDS,
    );
    const [variants, setVariants] = useState<AdminVariant[]>([]);

    const [fabricInput, setFabricInput] = useState("");
    const [showFabricSuggestions, setShowFabricSuggestions] = useState(false);
    const [categoryInput, setCategoryInput] = useState("");
    const [showCategorySuggestions, setShowCategorySuggestions] =
        useState(false);

    const [form, setForm] = useState({
        title: "",
        description: "",
        details: "",
        delivery: "",
        price: "",
        collectionId: "",
        categoryId: "",
        modelHeight: "",
        modelWeight: "",
    });

    useEffect(() => {
        async function fetchProduct() {
            try {
                const token = localStorage.getItem("token");
                if (!token) throw new Error("Unauthorized");

                const [prodRes, colRes, catRes, fabRes] = await Promise.all([
                    fetch(`${API_BASE}/products/${id}`, {
                        headers: { Authorization: `Bearer ${token}` },
                    }),
                    fetch(`${API_BASE}/collections`, {
                        headers: { Authorization: `Bearer ${token}` },
                    }),
                    fetch(`${API_BASE}/categories`, {
                        headers: { Authorization: `Bearer ${token}` },
                    }),
                    fetch(`${API_BASE}/kain`, {
                        headers: { Authorization: `Bearer ${token}` },
                    }),
                ]);

                const [prodData, colData, catData, fabData] = await Promise.all(
                    [
                        prodRes.json(),
                        colRes.json(),
                        catRes.json(),
                        fabRes.ok ? fabRes.json() : { data: [] },
                    ],
                );

                if (!prodRes.ok)
                    throw new Error(
                        prodData.message || "Failed to fetch product",
                    );
                const product = prodData.data as Product;
                const normalizedFields =
                    extractMeasurementFieldsFromProduct(product);
                setMeasurementFields(normalizedFields);

                setForm({
                    title: product.title,
                    description: product.description || "",
                    details: product.details || "",
                    delivery: product.delivery || "",
                    price: product.price?.toString() || "",
                    collectionId: product.collectionId || "",
                    categoryId: product.categoryId || "",
                    modelHeight:
                        product.modelHeight !== null &&
                        product.modelHeight !== undefined
                            ? String(product.modelHeight)
                            : "",
                    modelWeight:
                        product.modelWeight !== null &&
                        product.modelWeight !== undefined
                            ? String(product.modelWeight)
                            : "",
                });

                setImages(
                    (product.images || []).map((img: ProductImage) => ({
                        url: img.imageUrl,
                        isPrimary: img.isPrimary,
                        isSecondary: img.isSecondary || false,
                    })),
                );

                setVariants(
                    (product.variants || []).map((v) => ({
                        id: v.id,
                        size: v.size || "",
                        stock: v.stock?.toString() || "",
                        sku: v.sku || "",
                        measurements: extractVariantMeasurements(
                            v,
                            normalizedFields,
                        ),
                    })),
                );

                setCollections(colData.data || []);
                setCategories(catData.data || []);
                setFabrics(fabData.data || []);

                // Set fabric input
                if (product.kain?.name) {
                    setFabricInput(product.kain.name);
                } else if (product.kainId && fabData.data) {
                    const kainFromList = (
                        fabData.data as { id: string; name: string }[]
                    ).find((f) => f.id === product.kainId);
                    if (kainFromList) setFabricInput(kainFromList.name);
                }

                // Set category input
                if (product.category?.title) {
                    setCategoryInput(product.category.title);
                } else if (product.categoryId && catData.data) {
                    const categoryFromList = (
                        catData.data as { id: string; title: string }[]
                    ).find((c) => c.id === product.categoryId);
                    if (categoryFromList)
                        setCategoryInput(categoryFromList.title);
                }
            } catch (err) {
                console.error("❌ Error fetching product:", err);
                alert("Failed to load product data.");
            } finally {
                setLoading(false);
            }
        }

        fetchProduct();
    }, [id]);

    // 🔹 Generic form handler
    const handleChange = (
        e: React.ChangeEvent<
            HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
        >,
    ) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    // 🔹 Variant Handlers
    const handleVariantChange = (
        index: number,
        field: "size" | "stock" | "sku",
        value: string,
    ) => {
        const normalizedValue =
            field === "stock"
                ? value.replace(/\D/g, "").replace(/^0+(?=\d)/, "")
                : value;
        const updated = [...variants];
        updated[index] = { ...updated[index], [field]: normalizedValue };
        setVariants(updated);
    };

    const addVariant = () => {
        setVariants([...variants, createEmptyVariant(measurementFields)]);
    };

    const removeVariant = (index: number) => {
        setVariants(variants.filter((_, i) => i !== index));
    };

    const handleMeasurementFieldChange = (
        index: number,
        field: "name" | "displayName" | "unit",
        value: string,
    ) => {
        setMeasurementFields((prev) => {
            const next = [...prev];
            const target = { ...next[index] };

            if (field === "name") {
                const oldName = target.name;
                const normalized = normalizeMeasurementKey(value);
                if (!normalized) return prev;

                if (
                    next.some((item, itemIndex) => {
                        return itemIndex !== index && item.name === normalized;
                    })
                ) {
                    return prev;
                }

                target.name = normalized;
                if (!target.displayName || target.displayName === oldName) {
                    target.displayName = normalized;
                }

                setVariants((variantPrev) =>
                    variantPrev.map((variant) => {
                        const measurements = { ...variant.measurements };
                        measurements[normalized] = measurements[oldName] || "";
                        delete measurements[oldName];

                        return {
                            ...variant,
                            measurements,
                        };
                    }),
                );
            } else if (field === "displayName") {
                target.displayName = value;
            } else {
                target.unit = value;
            }

            next[index] = target;

            return next.map((item, itemIndex) => ({
                ...item,
                position: itemIndex,
            }));
        });
    };

    const handleAddMeasurementField = () => {
        const nextField = getNextMeasurementField(measurementFields);
        setMeasurementFields((prev) => [...prev, nextField]);
        setVariants((prev) =>
            prev.map((variant) => ({
                ...variant,
                measurements: {
                    ...variant.measurements,
                    [nextField.name]: "",
                },
            })),
        );
    };

    const handleRemoveMeasurementField = (index: number) => {
        if (measurementFields.length <= 1) return;

        const removed = measurementFields[index];
        const nextFields = measurementFields
            .filter((_, i) => i !== index)
            .map((field, i) => ({ ...field, position: i }));

        setMeasurementFields(nextFields);
        setVariants((prev) =>
            prev.map((variant) => {
                const measurements = { ...variant.measurements };
                delete measurements[removed.name];
                return { ...variant, measurements };
            }),
        );
    };

    const handleReorderMeasurementFields = (
        newFields: AdminMeasurementField[],
    ) => {
        setMeasurementFields(
            newFields.map((field, i) => ({
                ...field,
                position: i,
            })),
        );
    };

    const handleMeasurementValueChange = (
        variantIndex: number,
        fieldName: string,
        value: string,
    ) => {
        setVariants((prev) => {
            const next = [...prev];
            next[variantIndex] = {
                ...next[variantIndex],
                measurements: {
                    ...next[variantIndex].measurements,
                    [fieldName]: value,
                },
            };
            return next;
        });
    };

    const findOrCreateFabric = async (
        fabricName: string,
    ): Promise<string | null> => {
        if (!fabricName.trim()) return null;
        try {
            const token = localStorage.getItem("token");
            const existing = fabrics.find(
                (f) => f.name.toLowerCase() === fabricName.trim().toLowerCase(),
            );
            if (existing) return existing.id;

            const res = await fetch(`${API_BASE}/kain`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({ name: fabricName.trim() }),
            });
            const data = await res.json();
            if (!res.ok)
                throw new Error(data.message || "Failed to create fabric");
            return data.data.id;
        } catch (err) {
            console.error("❌ Error with fabric:", err);
            return null;
        }
    };

    // Function to find or create category
    const findOrCreateCategory = async (
        categoryTitle: string,
    ): Promise<string | null> => {
        if (!categoryTitle.trim()) return null;

        try {
            const token = localStorage.getItem("token");
            if (!token) throw new Error("Unauthorized");

            // Backend will automatically return existing category if found
            const res = await fetch(`${API_BASE}/categories`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({ title: categoryTitle.trim() }),
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.message || "Failed to create category");
            }

            // Update categories list if it's a new category
            const existingCategory = categories.find(
                (c) => c.id === data.data.id,
            );
            if (!existingCategory) {
                setCategories([...categories, data.data]);
            }

            return data.data.id;
        } catch (err) {
            console.error("❌ Error with category:", err);
            return null;
        }
    };

    const handleDeleteCategory = async (categoryId: string) => {
        const confirmDelete = window.confirm(
            "Delete this category? You can reactivate it later by typing the same name.",
        );
        if (!confirmDelete) return;

        try {
            const token = localStorage.getItem("token");
            if (!token) throw new Error("Unauthorized");

            const res = await fetch(`${API_BASE}/categories/${categoryId}`, {
                method: "DELETE",
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            const data = await res.json();
            if (!res.ok) {
                throw new Error(data.message || "Failed to delete category");
            }

            const deletedCategory = categories.find((c) => c.id === categoryId);
            setCategories((prev) => prev.filter((c) => c.id !== categoryId));

            if (
                deletedCategory &&
                deletedCategory.title.toLowerCase() ===
                    categoryInput.trim().toLowerCase()
            ) {
                setCategoryInput("");
            }
        } catch (err) {
            console.error("❌ Error deleting category:", err);
            alert("❌ Failed to delete category");
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (uploadingImages)
            return alert("Please wait until all images are uploaded!");
        setSubmitting(true);

        try {
            const token = localStorage.getItem("token");
            if (!token) throw new Error("Unauthorized");

            if (!form.title || !form.collectionId || !categoryInput) {
                alert("Please fill required fields!");
                setSubmitting(false);
                return;
            }

            const kainId = await findOrCreateFabric(fabricInput);
            const categoryId = await findOrCreateCategory(categoryInput);

            if (!categoryId) {
                alert("Failed to create or find category!");
                setSubmitting(false);
                return;
            }

            const body = {
                title: form.title.trim(),
                description: form.description.trim() || null,
                details: form.details.trim() || null,
                delivery: form.delivery.trim() || null,
                price: Number(form.price),
                imageUrl:
                    images.find((i) => i.isPrimary)?.url ||
                    images[0]?.url ||
                    "",
                categoryId: categoryId,
                collectionId: form.collectionId,
                kainId: kainId || null,
                modelHeight: form.modelHeight ? Number(form.modelHeight) : null,
                modelWeight: form.modelWeight ? Number(form.modelWeight) : null,
                images: images.map((img) => ({
                    imageUrl: img.url,
                    isPrimary: img.isPrimary,
                    isSecondary: img.isSecondary || false,
                })),
                variants: variants.map((v) => ({
                    id: v.id,
                    size: v.size,
                    color: null,
                    stock: Number(v.stock) || 0,
                    sku:
                        v.sku ||
                        `${form.title.slice(0, 3).toUpperCase()}-${v.size}`,
                    measurements: v.measurements,
                })),
                measurementFields: measurementFields.map((field, index) => ({
                    name: field.name,
                    displayName: field.displayName || field.name,
                    unit: field.unit || null,
                    position: index,
                })),
            };

            const res = await fetch(`${API_BASE}/products/${id}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify(body),
            });

            const data = await res.json();
            if (!res.ok)
                throw new Error(data.message || "Failed to update product");

            alert("✅ Product updated successfully!");
            router.push(
                fromPage > 1
                    ? `/dashboard/product?page=${fromPage}`
                    : "/dashboard/product",
            );
        } catch (err) {
            console.error("❌ Update error:", err);
            alert("❌ Failed to update product");
        } finally {
            setSubmitting(false);
        }
    };

    if (loading)
        return (
            <div className="flex items-center justify-center min-h-screen text-gray-500">
                Loading product...
            </div>
        );

    return (
        <div className="max-w-full mx-auto mt-10 bg-white p-8 rounded-xl shadow">
            <h1 className="text-2xl font-semibold mb-6">Edit Product</h1>

            <form onSubmit={handleSubmit} className="space-y-6">
                <PhotoUploadGrid
                    onChange={setImages}
                    onUploadingChange={setUploadingImages}
                    initialImages={images}
                />

                <div className="grid grid-cols-3 gap-8">
                    {/* Collection */}
                    <div>
                        <label className="block text-sm font-medium mb-1">
                            Collection*
                        </label>
                        <select
                            name="collectionId"
                            value={form.collectionId}
                            onChange={handleChange}
                            required
                            className="w-full border-b border-gray-300 p-2"
                        >
                            <option value="">Select collection</option>
                            {collections.map((col) => (
                                <option key={col.id} value={col.id}>
                                    {col.title}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Category - Now with Autocomplete */}
                    <div>
                        <label className="block text-sm font-medium mb-1">
                            Category*
                        </label>
                        <div className="flex gap-2 items-center">
                            <div className="flex-1 relative">
                                <input
                                    type="text"
                                    value={categoryInput}
                                    onChange={(e) => {
                                        setCategoryInput(e.target.value);
                                        setShowCategorySuggestions(true);
                                    }}
                                    onFocus={() =>
                                        setShowCategorySuggestions(true)
                                    }
                                    onBlur={() =>
                                        setTimeout(
                                            () =>
                                                setShowCategorySuggestions(
                                                    false,
                                                ),
                                            200,
                                        )
                                    }
                                    onKeyDown={(e) => {
                                        if (e.key === "Enter") {
                                            e.preventDefault();
                                            setShowCategorySuggestions(false);
                                        }
                                    }}
                                    placeholder="Select or type category..."
                                    className="w-full border-b border-gray-300 p-2 pr-8"
                                    required
                                />
                                <svg
                                    className="absolute right-2 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M19 9l-7 7-7-7"
                                    />
                                </svg>

                                {showCategorySuggestions && (
                                    <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 shadow-lg max-h-60 overflow-auto">
                                        {categories
                                            .filter((c) =>
                                                c.title
                                                    .toLowerCase()
                                                    .includes(
                                                        categoryInput.toLowerCase(),
                                                    ),
                                            )
                                            .map((category) => (
                                                <div
                                                    key={category.id}
                                                    onClick={() => {
                                                        setCategoryInput(
                                                            category.title,
                                                        );
                                                        setShowCategorySuggestions(
                                                            false,
                                                        );
                                                    }}
                                                    className="px-3 py-2 hover:bg-gray-100 cursor-pointer text-sm flex items-center justify-between gap-3"
                                                >
                                                    <span>
                                                        {category.title}
                                                    </span>
                                                    <button
                                                        type="button"
                                                        onClick={(e) => {
                                                            e.preventDefault();
                                                            e.stopPropagation();
                                                            handleDeleteCategory(
                                                                category.id,
                                                            );
                                                        }}
                                                        className="p-1 text-gray-400 hover:text-red-600"
                                                        aria-label={`Delete category ${category.title}`}
                                                        title="Delete category"
                                                    >
                                                        <Trash size={14} />
                                                    </button>
                                                </div>
                                            ))}
                                        {categories.filter((c) =>
                                            c.title
                                                .toLowerCase()
                                                .includes(
                                                    categoryInput.toLowerCase(),
                                                ),
                                        ).length === 0 &&
                                            categoryInput && (
                                                <div className="px-3 py-2 text-sm text-gray-500 italic">
                                                    No matching category. Press
                                                    Enter to add {categoryInput}{" "}
                                                    as new category.
                                                </div>
                                            )}
                                        {!categoryInput && (
                                            <div className="px-3 py-2 text-sm text-gray-400 italic">
                                                Start typing to see suggestions
                                                or add new category
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                            {categoryInput &&
                                !categories.find(
                                    (c) =>
                                        c.title.toLowerCase() ===
                                        categoryInput.toLowerCase(),
                                ) && (
                                    <span className="flex items-center px-3 py-2 bg-green-50 text-green-700 text-sm border border-green-200 whitespace-nowrap">
                                        New: {categoryInput}
                                    </span>
                                )}
                        </div>
                    </div>

                    {/* Fabric Section - Combobox Style */}
                    <div>
                        <label className="block text-sm font-medium mb-1">
                            Fabric / Kain
                        </label>
                        <div className="flex gap-2 items-center">
                            <div className="flex-1 relative">
                                <input
                                    type="text"
                                    value={fabricInput}
                                    onChange={(e) => {
                                        setFabricInput(e.target.value);
                                        setShowFabricSuggestions(true);
                                    }}
                                    onFocus={() =>
                                        setShowFabricSuggestions(true)
                                    }
                                    onBlur={() =>
                                        setTimeout(
                                            () =>
                                                setShowFabricSuggestions(false),
                                            200,
                                        )
                                    }
                                    onKeyDown={(e) => {
                                        if (e.key === "Enter") {
                                            e.preventDefault();
                                            setShowFabricSuggestions(false);
                                        }
                                    }}
                                    placeholder="Select or type fabric name..."
                                    className="w-full border-b border-gray-300 p-2 pr-8"
                                />
                                <svg
                                    className="absolute right-2 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M19 9l-7 7-7-7"
                                    />
                                </svg>

                                {/* Suggestions Dropdown */}
                                {showFabricSuggestions && (
                                    <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 shadow-lg max-h-60 overflow-auto">
                                        {fabrics
                                            .filter((f) =>
                                                f.name
                                                    .toLowerCase()
                                                    .includes(
                                                        fabricInput.toLowerCase(),
                                                    ),
                                            )
                                            .map((fabric) => (
                                                <div
                                                    key={fabric.id}
                                                    onClick={() => {
                                                        setFabricInput(
                                                            fabric.name,
                                                        );
                                                        setShowFabricSuggestions(
                                                            false,
                                                        );
                                                    }}
                                                    className="px-3 py-2 hover:bg-gray-100 cursor-pointer text-sm"
                                                >
                                                    {fabric.name}
                                                </div>
                                            ))}
                                        {fabrics.filter((f) =>
                                            f.name
                                                .toLowerCase()
                                                .includes(
                                                    fabricInput.toLowerCase(),
                                                ),
                                        ).length === 0 &&
                                            fabricInput && (
                                                <div className="px-3 py-2 text-sm text-gray-500 italic">
                                                    No matching fabric. Press
                                                    Enter to add {fabricInput}{" "}
                                                    as new fabric.
                                                </div>
                                            )}
                                        {!fabricInput && (
                                            <div className="px-3 py-2 text-sm text-gray-400 italic">
                                                Start typing to see suggestions
                                                or add new fabric
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                            {fabricInput &&
                                !fabrics.find(
                                    (f) =>
                                        f.name.toLowerCase() ===
                                        fabricInput.toLowerCase(),
                                ) && (
                                    <span className="flex items-center px-3 py-2 bg-green-50 text-green-700 text-sm border border-green-200 whitespace-nowrap">
                                        New: {fabricInput}
                                    </span>
                                )}
                        </div>
                    </div>
                </div>

                {/* Product Name */}
                <div>
                    <label className="block text-sm font-medium mb-1">
                        Product Name*
                    </label>
                    <input
                        name="title"
                        value={form.title}
                        onChange={handleChange}
                        required
                        className="w-full border-b border-gray-300 p-2"
                    />
                </div>

                {/* Description */}
                <div>
                    <label className="block text-sm font-medium mb-1">
                        Short Description
                    </label>
                    <AutoResizeTextarea
                        name="description"
                        value={form.description}
                        onChange={handleChange}
                        rows={2}
                    />
                </div>

                {/* Details */}
                <div>
                    <label className="block text-sm font-medium mb-1">
                        Product Details*
                    </label>
                    <AutoResizeTextarea
                        name="details"
                        value={form.details}
                        onChange={handleChange}
                        rows={3}
                    />
                </div>

                {/* Delivery */}
                <div>
                    <label className="block text-sm font-medium mb-1">
                        Delivery & Return*
                    </label>
                    <AutoResizeTextarea
                        name="delivery"
                        value={form.delivery}
                        onChange={handleChange}
                        rows={2}
                    />
                </div>

                {/* Price */}
                <div>
                    <label className="block text-sm font-medium mb-1">
                        Price (Rp)*
                    </label>
                    <input
                        name="price"
                        type="text"
                        value={
                            form.price
                                ? formatRupiah(form.price.toString())
                                : ""
                        }
                        onChange={(e) => {
                            const raw = e.target.value.replace(/\D/g, "");
                            setForm({ ...form, price: raw });
                        }}
                        required
                        className="w-full border-b border-gray-300 p-2"
                    />
                </div>

                {/* Variants */}
                <div className="space-y-6">
                    {/* Size & Stock Table */}
                    <div>
                        <label className="block text-base font-medium mb-3">
                            Size & Stock*
                        </label>
                        <div className="">
                            {/* Header */}
                            <div className="grid grid-cols-9 gap-4 p-3 bg-white font-normal text-sm text-gray-500 ">
                                <div className="col-span-4">Size</div>
                                <div className="col-span-4">Stock</div>
                                <div className="col-span-1"></div>
                            </div>

                            {/* Rows */}
                            {variants.map((v, i) => (
                                <div
                                    key={i}
                                    className="grid grid-cols-9 gap-4 p-3 items-center "
                                >
                                    <div className="col-span-4">
                                        <input
                                            type="text"
                                            placeholder="Add Size"
                                            value={v.size}
                                            onChange={(e) =>
                                                handleVariantChange(
                                                    i,
                                                    "size",
                                                    e.target.value,
                                                )
                                            }
                                            className="w-full border-b border-gray-300 px-2 py-1 text-sm focus:outline-none focus:border-gray-500"
                                        />
                                    </div>
                                    <div className="col-span-4">
                                        <input
                                            type="number"
                                            placeholder="add stock"
                                            value={v.stock}
                                            onChange={(e) =>
                                                handleVariantChange(
                                                    i,
                                                    "stock",
                                                    e.target.value,
                                                )
                                            }
                                            className="w-full border-b border-gray-300 px-2 py-1 text-sm focus:outline-none focus:border-gray-500"
                                        />
                                    </div>
                                    <div className="col-span-1 flex justify-end">
                                        <button
                                            type="button"
                                            onClick={() => removeVariant(i)}
                                            className="p-2 text-red-600 hover:bg-red-50  rounded transition disabled:text-gray-300 disabled:hover:bg-transparent"
                                        >
                                            <Trash size={18} />
                                        </button>
                                    </div>
                                </div>
                            ))}

                            {/* Add Column Button */}
                            <button
                                type="button"
                                onClick={addVariant}
                                className="w-full p-3 text-sm text-gray-500 bg-gray-200 hover:bg-gray-300 transition border-t border-gray-200"
                            >
                                + add Column
                            </button>
                        </div>
                    </div>

                    <DynamicMeasurementEditor
                        measurementFields={measurementFields}
                        variants={variants}
                        onAddField={handleAddMeasurementField}
                        onRemoveField={handleRemoveMeasurementField}
                        onReorderFields={handleReorderMeasurementFields}
                        onFieldChange={handleMeasurementFieldChange}
                        onMeasurementValueChange={handleMeasurementValueChange}
                    />

                    {/* Model Measurements */}
                    <div className="grid grid-cols-2 gap-4 mt-6">
                        <div>
                            <label className="block text-sm font-medium mb-1">
                                Model Height
                            </label>
                            <input
                                name="modelHeight"
                                type="number"
                                placeholder="in cm"
                                value={form.modelHeight}
                                onChange={handleChange}
                                className="w-full border-b border-gray-300 p-2"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1">
                                Model Weight
                            </label>
                            <input
                                name="modelWeight"
                                type="number"
                                placeholder="in kg"
                                value={form.modelWeight}
                                onChange={handleChange}
                                className="w-full border-b border-gray-300 p-2"
                            />
                        </div>
                    </div>
                </div>

                <button
                    type="submit"
                    disabled={submitting || uploadingImages}
                    className={`w-full py-3 transition text-white ${
                        submitting || uploadingImages
                            ? "bg-gray-400 cursor-not-allowed"
                            : "bg-primary-studio hover:bg-secondary-studio"
                    }`}
                >
                    {uploadingImages
                        ? "Uploading images..."
                        : submitting
                          ? "Updating..."
                          : "Update Product"}
                </button>
            </form>
        </div>
    );
}
