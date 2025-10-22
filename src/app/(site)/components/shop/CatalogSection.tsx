"use client";

import Image from "next/image";
import Link from "next/link";
import { useState, useEffect, useMemo } from "react";
import { useSearchParams } from "next/navigation";
import FilterDropdown from "./FilterDropdown";
import ActiveFilters from "./ActiveFilters";
import { API_BASE } from "@/lib/constants";
import { Product } from "@/types/product";
import { getImageUrl } from "@/lib/utils";

export default function CatalogSection() {
    const [openFilter, setOpenFilter] = useState<string | null>(null);
    const [products, setProducts] = useState<Product[]>([]);
    const [selectedCollections, setSelectedCollections] = useState<string[]>([]);
    const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
    const [selectedKains, setSelectedKains] = useState<string[]>([]);
    const kains = ["Newest", "Best Seller"];

    const searchParams = useSearchParams();
    const initialCategory = searchParams.get("category");
    const initialCollection = searchParams.get("collection");

    useEffect(() => {
        if (initialCategory) setSelectedCategories([initialCategory]);
        if (initialCollection) setSelectedCollections([initialCollection]);
    }, [initialCategory, initialCollection]);

    useEffect(() => {
        async function fetchProducts() {
            try {
                const res = await fetch(`${API_BASE}/products?status=true`, { cache: "no-store" });
                const json = await res.json();
                if (json.success) {
                    setProducts(json.data);
                }
            } catch (error) {
                console.error("❌ Failed to fetch products:", error);
            }
        }
        fetchProducts();
    }, []);

    const getUniqueValues = (items: Product[], key: "collection" | "category") =>
        Array.from(
            new Set(
                items
                    .map((item) =>
                        key === "collection" ? item.collection?.slug : item.category?.slug
                    )
                    .filter((v): v is string => Boolean(v))
            )
        );

    const collections = useMemo(() => getUniqueValues(products, "collection"), [products]);
    const categories = useMemo(() => getUniqueValues(products, "category"), [products]);

    const filteredProducts = useMemo(() => {
        return products.filter((product) => {
            return (
                (selectedCollections.length === 0 ||
                    selectedCollections.includes(product.collection?.slug ?? "")) &&
                (selectedCategories.length === 0 ||
                    selectedCategories.includes(product.category?.slug ?? ""))
            );
        });
    }, [products, selectedCollections, selectedCategories]);

    return (
        <section className="px-6 md:px-10 pb-8">
            {/* Title */}
            <h1 className="text-3xl md:text-5xl font-medium text-center mb-8 leading-normal text-charcoal">
                Wear Your <br />
                Worth
            </h1>

            {/* Filters */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6 gap-10">
                <div className="grid grid-cols-1 sm:grid-cols-3 md:grid-cols-3 gap-6 text-lg w-full md:w-auto flex-grow">
                    <FilterDropdown
                        label="Collection"
                        options={collections}
                        selected={selectedCollections}
                        setSelected={setSelectedCollections}
                        openFilter={openFilter}
                        setOpenFilter={setOpenFilter}
                        filterKey="collection"
                    />
                    <FilterDropdown
                        label="Category"
                        options={categories}
                        selected={selectedCategories}
                        setSelected={setSelectedCategories}
                        openFilter={openFilter}
                        setOpenFilter={setOpenFilter}
                        filterKey="category"
                    />
                    <FilterDropdown
                        label="Kain"
                        options={kains}
                        selected={selectedKains}
                        setSelected={setSelectedKains}
                        openFilter={openFilter}
                        setOpenFilter={setOpenFilter}
                        filterKey="kain"
                    />
                </div>

                <ActiveFilters
                    collections={selectedCollections}
                    categories={selectedCategories}
                    kains={selectedKains}
                    setCollections={setSelectedCollections}
                    setCategories={setSelectedCategories}
                    setKains={setSelectedKains}
                />
            </div>

            {/* Product Grid */}
            {filteredProducts.length === 0 ? (
                <p className="text-center text-gray-500">No products found.</p>
            ) : (
                <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                    {filteredProducts.map((product) => {
                        const primaryImg = getImageUrl(
                            product.images?.find((img) => img.isPrimary)?.imageUrl
                        );
                        const hoverImg = getImageUrl(
                            product.images?.find((img) => !img.isPrimary)?.imageUrl
                        );

                        return (
                            <Link
                                key={product.id}
                                href={`/product/${product.slug}`}
                                className="text-center group block mb-8"
                            >
                                <div className="aspect-[3/4] relative mb-4 overflow-hidden group">
                                    <Image
                                        src={primaryImg}
                                        alt={product.title}
                                        fill
                                        className="object-cover transition-opacity duration-300 group-hover:opacity-0"
                                    />
                                    <Image
                                        src={hoverImg}
                                        alt={product.title}
                                        fill
                                        className="object-cover transition-opacity duration-300 opacity-0 group-hover:opacity-100"
                                    />
                                    <button
                                        className="absolute top-6 right-6 opacity-0 group-hover:opacity-100 transition duration-300"
                                        onClick={(e) => {
                                            e.preventDefault();
                                            console.log("🛒 Add to cart:", product.title);
                                        }}
                                    >
                                    </button>
                                </div>

                                <p className="text-sm md:text-base font-light">{product.title}</p>

                            </Link>
                        );
                    })}
                </div>
            )}
        </section>
    );
}
