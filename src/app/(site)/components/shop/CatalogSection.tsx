"use client";

import Image from "next/image";
import Link from "next/link";
import { useState, useEffect, useCallback, useRef } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import FilterDropdown from "./FilterDropdown";
import type { FilterOption } from "./FilterDropdown";
import ActiveFilters from "./ActiveFilters";
import Pagination from "./Pagination";
import { API_BASE } from "@/lib/constants";
import { Product, Kain, Collection, Category } from "@/types/product";
import { getImageUrl } from "@/lib/utils";

export default function CatalogSection() {
    const router = useRouter();
    const searchParams = useSearchParams();

    const initialCategory = searchParams.get("category");
    const initialCollection = searchParams.get("collection");
    const initialPage = Math.max(1, Number(searchParams.get("page") ?? 1) || 1);

    const [openFilter, setOpenFilter] = useState<string | null>(null);
    const [products, setProducts] = useState<Product[]>([]);
    const [selectedCollections, setSelectedCollections] = useState<string[]>(
        initialCollection ? [initialCollection] : [],
    );
    const [selectedCategories, setSelectedCategories] = useState<string[]>(
        initialCategory ? [initialCategory] : [],
    );
    const [selectedKains, setSelectedKains] = useState<string[]>([]);
    const [collections, setCollections] = useState<FilterOption[]>([]);
    const [categories, setCategories] = useState<FilterOption[]>([]);
    const [kains, setKains] = useState<FilterOption[]>([]);
    const [page, setPageState] = useState(initialPage);
    const [totalPages, setTotalPages] = useState(1);
    const [loading, setLoading] = useState(true);
    const limit = 12;

    // Track previous filter references to detect actual user-driven changes.
    // Comparing by reference is safe because useState only creates a new reference
    // when the setter is called — so this is always false on initial mount,
    // even under React Strict Mode's double-invoke of effects.
    const prevFiltersRef = useRef({
        collections: selectedCollections,
        categories: selectedCategories,
        kains: selectedKains,
    });

    // Sync page state when URL changes (e.g. browser back/forward navigation)
    useEffect(() => {
        const urlPage = Math.max(1, Number(searchParams.get("page")) || 1);
        setPageState(urlPage);
    }, [searchParams]);

    // Sync page to URL without adding to browser history stack
    const setPage = useCallback(
        (newPage: number) => {
            setPageState(newPage);
            const params = new URLSearchParams(searchParams.toString());
            params.set("page", String(newPage));
            router.replace(`?${params.toString()}`, { scroll: false });
        },
        [router, searchParams],
    );

    // Reset page to 1 only when filters actually change — not on mount
    useEffect(() => {
        const prev = prevFiltersRef.current;
        const changed =
            prev.collections !== selectedCollections ||
            prev.categories !== selectedCategories ||
            prev.kains !== selectedKains;

        prevFiltersRef.current = {
            collections: selectedCollections,
            categories: selectedCategories,
            kains: selectedKains,
        };

        if (!changed) return;
        setPage(1);
    }, [selectedCollections, selectedCategories, selectedKains]); // eslint-disable-line react-hooks/exhaustive-deps

    useEffect(() => {
        async function fetchProducts() {
            try {
                setLoading(true);
                const params = new URLSearchParams();
                params.set("status", "true");
                params.set("page", String(page));
                params.set("limit", String(limit));
                if (selectedCollections.length > 0)
                    params.set("collectionSlug", selectedCollections.join(","));
                const isSaleMode = selectedCategories.includes("sale");
                const endpoint = isSaleMode ? "/products/sale" : "/products";

                if (selectedCategories.length > 0) {
                    const filteredCats = selectedCategories.filter(
                        (c) => c !== "sale",
                    );
                    if (filteredCats.length > 0) {
                        params.set("categorySlug", filteredCats.join(","));
                    }
                }
                if (selectedKains.length > 0)
                    params.set("kain", selectedKains.join(","));

                const res = await fetch(
                    `${API_BASE}${endpoint}?${params.toString()}`,
                    { cache: "no-store" },
                );
                const json = await res.json();
                if (json.success) {
                    setProducts(json.data);
                    if (json.pagination) {
                        setTotalPages(json.pagination.totalPages);
                    } else {
                        setTotalPages(1);
                    }
                }
            } catch (error) {
                console.error("❌ Failed to fetch products:", error);
            } finally {
                setLoading(false);
            }
        }

        fetchProducts();
        window.scrollTo({ top: 130, behavior: "smooth" });
    }, [page, selectedCollections, selectedCategories, selectedKains]);

    useEffect(() => {
        async function fetchFilterData() {
            try {
                const [colRes, catRes, kainRes] = await Promise.all([
                    fetch(`${API_BASE}/collections?status=true`, {
                        cache: "no-store",
                    }),
                    fetch(`${API_BASE}/categories`, { cache: "no-store" }),
                    fetch(`${API_BASE}/kain`, { cache: "no-store" }),
                ]);
                const [colJson, catJson, kainJson] = await Promise.all([
                    colRes.json(),
                    catRes.json(),
                    kainRes.json(),
                ]);
                if (colJson.success)
                    setCollections(
                        colJson.data.map((c: Collection) => ({
                            value: c.slug,
                            label: c.title,
                        })),
                    );
                if (catJson.success)
                    setCategories(
                        catJson.data.map((c: Category) => ({
                            value: c.slug,
                            label: c.title,
                        })),
                    );
                if (kainJson.success)
                    setKains(
                        kainJson.data.map((k: Kain) => ({
                            value: k.name,
                            label: k.name,
                        })),
                    );
            } catch (err) {
                console.error("❌ Failed to fetch filter data:", err);
            }
        }
        fetchFilterData();
    }, []);

    const collectionLabelMap = Object.fromEntries(
        collections.map((option) => [option.value, option.label]),
    );
    const categoryLabelMap = Object.fromEntries(
        categories.map((option) => [option.value, option.label]),
    );
    const kainLabelMap = Object.fromEntries(
        kains.map((option) => [option.value, option.label]),
    );

    // Skeleton Loader Component
    const ProductSkeleton = () => (
        <div className="text-center group block mb-8 animate-pulse">
            <div className="aspect-[3/4] relative mb-4 bg-gray-200 rounded-lg"></div>
            <div className="h-4 bg-gray-200 rounded w-3/4 mx-auto"></div>
        </div>
    );

    return (
        <section className="px-6 md:px-10 pb-8">
            {/* Title */}
            <h1 className="text-3xl md:text-5xl font-medium text-center mb-8 leading-normal text-charcoal">
                Wear Your <br />
                Worth
            </h1>

            {/* Filters */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6 gap-10">
                <div className="grid grid-cols-3 md:grid-cols-3 gap-2 md:gap-6 text-lg w-full md:w-auto flex-grow">
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
                    collectionLabelMap={collectionLabelMap}
                    categoryLabelMap={categoryLabelMap}
                    kainLabelMap={kainLabelMap}
                    setCollections={setSelectedCollections}
                    setCategories={setSelectedCategories}
                    setKains={setSelectedKains}
                />
            </div>

            {/* Product Grid */}
            {loading ? (
                // Loading State - Skeleton
                <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                    {Array.from({ length: limit }).map((_, index) => (
                        <ProductSkeleton key={index} />
                    ))}
                </div>
            ) : products.length === 0 ? (
                // Empty State
                <div className="text-center py-16">
                    <div className="text-gray-400 mb-4"></div>
                    <p className="text-xl text-gray-500 mb-2">
                        No products found
                    </p>
                    <p className="text-sm text-gray-400">
                        Try adjusting your filters
                    </p>
                </div>
            ) : (
                // Products Grid
                <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                    {products.map((product) => {
                        const primaryImg = getImageUrl(
                            product.images?.find((img) => img.isPrimary)
                                ?.imageUrl,
                        );

                        const secondaryImage = product.images?.find(
                            (img) => img.isSecondary,
                        );
                        const fallbackImage = product.images?.find(
                            (img) => !img.isPrimary,
                        );
                        const hoverImg = getImageUrl(
                            secondaryImage?.imageUrl || fallbackImage?.imageUrl,
                        );

                        return (
                            <Link
                                key={product.id}
                                href={`/product/${product.slug}`}
                                className="text-center group block mb-8"
                            >
                                <div className="aspect-[3/4] relative mb-4 overflow-hidden group bg-gray-100">
                                    {product.priceBeforeDiscount && (
                                        <div className="absolute top-3 left-3 bg-[#5a4b43] text-white text-xs font-semibold px-3 py-1 z-10">
                                            SALE
                                        </div>
                                    )}
                                    <Image
                                        src={primaryImg}
                                        alt={product.title}
                                        fill
                                        sizes="(max-width: 640px) 50vw, (max-width: 1024px) 50vw, 25vw"
                                        quality={60}
                                        className="object-cover transition-opacity duration-300 group-hover:opacity-0"
                                        loading="lazy"
                                        placeholder="blur"
                                        blurDataURL="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjQwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iNDAwIiBoZWlnaHQ9IjQwMCIgZmlsbD0iI2UwZTBlMCIvPjwvc3ZnPg=="
                                    />
                                    <Image
                                        src={hoverImg}
                                        alt={product.title}
                                        fill
                                        sizes="(max-width: 640px) 50vw, (max-width: 1024px) 50vw, 25vw"
                                        quality={60}
                                        className="object-cover transition-opacity duration-300 opacity-0 group-hover:opacity-100"
                                        loading="lazy"
                                        placeholder="blur"
                                        blurDataURL="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjQwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iNDAwIiBoZWlnaHQ9IjQwMCIgZmlsbD0iI2UwZTBlMCIvPjwvc3ZnPg=="
                                    />
                                    <button
                                        className="absolute top-6 right-6 opacity-0 group-hover:opacity-100 transition duration-300"
                                        onClick={(e) => {
                                            e.preventDefault();
                                            console.log(
                                                "🛒 Add to cart:",
                                                product.title,
                                            );
                                        }}
                                    ></button>
                                </div>

                                <p className="text-sm md:text-base font-light mb-1">
                                    {product.title}
                                </p>
                                {product.priceBeforeDiscount ? (
                                    <div className="flex items-center justify-center gap-2 mt-1">
                                        <p className="text-sm line-through text-gray-400">
                                            IDR{" "}
                                            {Number(
                                                product.priceBeforeDiscount,
                                            ).toLocaleString("id-ID")}
                                        </p>
                                        <p className="text-sm font-medium text-charcoal">
                                            IDR{" "}
                                            {Number(
                                                product.price,
                                            ).toLocaleString("id-ID")}
                                        </p>
                                    </div>
                                ) : (
                                    product.price && (
                                        <p className="text-sm md:text-base font-medium text-center text-charcoal">
                                            IDR{" "}
                                            {Number(
                                                product.price,
                                            ).toLocaleString("id-ID")}
                                        </p>
                                    )
                                )}
                            </Link>
                        );
                    })}
                </div>
            )}

            <Pagination
                currentPage={page}
                totalPages={totalPages}
                onPageChange={setPage}
                isLoading={loading}
                itemsCount={products.length}
            />
        </section>
    );
}
