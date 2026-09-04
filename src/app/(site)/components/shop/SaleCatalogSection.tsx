"use client";

import Link from "next/link";
import { useState, useEffect, useRef } from "react";
import { API_BASE } from "@/lib/constants";
import { Product } from "@/types/product";
import { getImageUrl } from "@/lib/utils";
import Pagination from "./Pagination";
import ProductImage from "@/app/(site)/components/ProductImage";
import { useLenis } from "lenis/react";

export default function SaleCatalogSection() {
    const [products, setProducts] = useState<Product[]>([]);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [loading, setLoading] = useState(true);
    const limit = 12;
    const lenis = useLenis();
    const lenisRef = useRef(lenis);
    lenisRef.current = lenis;

    useEffect(() => {
        async function fetchSaleProducts() {
            try {
                setLoading(true);
                const params = new URLSearchParams();
                params.set("page", String(page));
                params.set("limit", String(limit));

                const res = await fetch(
                    `${API_BASE}/products/sale?${params.toString()}`,
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
                console.error("❌ Failed to fetch sale products:", error);
            } finally {
                setLoading(false);
            }
        }

        fetchSaleProducts();
        const currentLenis = lenisRef.current;
        if (currentLenis) {
            currentLenis.scrollTo(130);
        } else {
            window.scrollTo({ top: 130, behavior: "smooth" });
        }
    }, [page]);

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
            <h1 className="text-3xl md:text-5xl font-medium text-center mb-4 leading-normal text-charcoal">
                Sale
            </h1>

            {/* Product Grid */}
            {loading ? (
                <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                    {Array.from({ length: limit }).map((_, index) => (
                        <ProductSkeleton key={index} />
                    ))}
                </div>
            ) : products.length === 0 ? (
                <div className="text-center py-24">
                    <p className="text-xl text-gray-500 mb-2">
                        No sale items at the moment
                    </p>
                    <p className="text-sm text-gray-400">
                        Check back soon for new discounts
                    </p>
                </div>
            ) : (
                <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                    {products.map((product) => {
                        const primaryRaw =
                            product.images?.find((img) => img.isPrimary)
                                ?.imageUrl ||
                            product.images?.[0]?.imageUrl ||
                            product.imageUrl;
                        const hoverRaw =
                            product.images?.find((img) => img.isSecondary)
                                ?.imageUrl ||
                            product.images?.find(
                                (img) =>
                                    img.imageUrl &&
                                    img.imageUrl !== primaryRaw &&
                                    !img.isPrimary,
                            )?.imageUrl;

                        return (
                            <Link
                                key={product.id}
                                href={`/product/${product.slug}`}
                                className="text-center group block mb-8"
                            >
                                <div className="aspect-[3/4] relative mb-4 overflow-hidden group bg-gray-100">
                                    {/* SALE Badge */}
                                    <div className="absolute top-3 left-3 bg-[#5a4b43] text-white text-xs font-semibold px-3 py-1 z-10">
                                        SALE
                                    </div>
                                    <ProductImage
                                        src={getImageUrl(primaryRaw)}
                                        alt={product.title}
                                        fill
                                        sizes="(max-width: 640px) 50vw, (max-width: 1024px) 50vw, 25vw"
                                        quality={60}
                                        className={`object-cover transition-opacity duration-300 ${hoverRaw ? "group-hover:opacity-0" : ""}`}
                                        loading="lazy"
                                        placeholder="blur"
                                        blurDataURL="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjQwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iNDAwIiBoZWlnaHQ9IjQwMCIgZmlsbD0iI2UwZTBlMCIvPjwvc3ZnPg=="
                                    />
                                    {hoverRaw && (
                                        <ProductImage
                                            src={getImageUrl(hoverRaw)}
                                            alt=""
                                            fill
                                            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 50vw, 25vw"
                                            quality={60}
                                            className="object-cover transition-opacity duration-300 opacity-0 group-hover:opacity-100"
                                            loading="lazy"
                                            placeholder="blur"
                                            blurDataURL="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjQwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iNDAwIiBoZWlnaHQ9IjQwMCIgZmlsbD0iI2UwZTBlMCIvPjwvc3ZnPg=="
                                        />
                                    )}
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
