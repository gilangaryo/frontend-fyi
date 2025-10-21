"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { API_BASE } from "@/lib/constants";
import { getImageUrl } from "@/lib/utils";

interface Product {
    id: string;
    title: string;
    slug: string;
    images: { imageUrl: string; isPrimary: boolean }[];
}

export default function CTA() {
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchSuggested() {
            try {
                const res = await fetch(`${API_BASE}/products/suggested?limit=12`, {
                    cache: "no-store",
                });
                const json = await res.json();
                if (json.success) {
                    setProducts(json.data);
                }
            } catch (err) {
                console.error("Error fetching suggested products:", err);
            } finally {
                setLoading(false);
            }
        }
        fetchSuggested();
    }, []);

    if (loading) {
        return (
            <div className="px-4 md:px-10 py-8 md:py-12">
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                    {Array.from({ length: 4 }).map((_, i) => (
                        <div key={i} className="animate-pulse">
                            <div className="aspect-[3/4] bg-gray-200 rounded-md mb-3" />
                            <div className="h-3 bg-gray-200 w-3/4 mx-auto rounded" />
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    if (!products.length) {
        return (
            <div className="text-center text-gray-500 py-10">
                No suggested products available.
            </div>
        );
    }

    return (
        <div className="bg-white">
            <div className="px-4 md:px-10 py-8 md:py-12">
                <div className="max-w-full mx-auto">
                    {/* Desktop grid */}
                    <div className="hidden lg:grid lg:grid-cols-4 gap-8">
                        {products.slice(0, 4).map((product) => {
                            const primary =
                                product.images?.find((img) => img.isPrimary)?.imageUrl ||
                                product.images?.[0]?.imageUrl;
                            const secondary =
                                product.images?.find((img) => !img.isPrimary)?.imageUrl ||
                                product.images?.[1]?.imageUrl;

                            return (
                                <Link
                                    href={`/product/${product.slug}`}
                                    key={product.id}
                                    className="group block"
                                >
                                    <div className="aspect-[3/4] relative bg-gray-100 mb-4 overflow-hidden">
                                        {/* Image utama */}
                                        <Image
                                            src={getImageUrl(primary || "/placeholder.jpg")}
                                            alt={product.title}
                                            fill
                                            className="object-cover transition-opacity duration-500 group-hover:opacity-0"
                                        />
                                        {/* Gambar hover */}
                                        {secondary && (
                                            <Image
                                                src={getImageUrl(secondary)}
                                                alt={product.title}
                                                fill
                                                className="object-cover absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100"
                                            />
                                        )}
                                    </div>
                                    <p className="text-sm text-charcoal font-light text-center leading-relaxed tracking-wide px-1">
                                        {product.title}
                                    </p>
                                </Link>
                            );
                        })}
                    </div>

                    {/* Tablet: Scroll horizontal */}
                    <div className="hidden md:flex lg:hidden gap-6 overflow-x-auto pb-4 scrollbar-hide">
                        {products.map((product) => {
                            const primary =
                                product.images?.find((img) => img.isPrimary)?.imageUrl ||
                                product.images?.[0]?.imageUrl;
                            const secondary =
                                product.images?.find((img) => !img.isPrimary)?.imageUrl ||
                                product.images?.[1]?.imageUrl;

                            return (
                                <Link
                                    href={`/product/${product.slug}`}
                                    key={product.id}
                                    className="flex-none w-64 group"
                                >
                                    <div className="aspect-[3/4] relative bg-gray-100 mb-4 overflow-hidden">
                                        <Image
                                            src={getImageUrl(primary || "/placeholder.jpg")}
                                            alt={product.title}
                                            fill
                                            className="object-cover transition-opacity duration-500 group-hover:opacity-0"
                                        />
                                        {secondary && (
                                            <Image
                                                src={getImageUrl(secondary)}
                                                alt={product.title}
                                                fill
                                                className="object-cover absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100"
                                            />
                                        )}
                                    </div>
                                    <p className="text-xs text-gray-700 font-light text-center leading-relaxed">
                                        {product.title}
                                    </p>
                                </Link>
                            );
                        })}
                    </div>

                    {/* Mobile: Scroll horizontal */}
                    <div className="flex md:hidden gap-4 overflow-x-auto pb-4 scrollbar-hide">
                        {products.map((product) => {
                            const primary =
                                product.images?.find((img) => img.isPrimary)?.imageUrl ||
                                product.images?.[0]?.imageUrl;
                            const secondary =
                                product.images?.find((img) => !img.isPrimary)?.imageUrl ||
                                product.images?.[1]?.imageUrl;

                            return (
                                <Link
                                    href={`/product/${product.slug}`}
                                    key={product.id}
                                    className="flex-none w-48 group"
                                >
                                    <div className="aspect-[3/4] relative bg-gray-100 mb-4 overflow-hidden">
                                        <Image
                                            src={getImageUrl(primary || "/placeholder.jpg")}
                                            alt={product.title}
                                            fill
                                            className="object-cover transition-opacity duration-500 group-hover:opacity-0"
                                        />
                                        {secondary && (
                                            <Image
                                                src={getImageUrl(secondary)}
                                                alt={product.title}
                                                fill
                                                className="object-cover absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100"
                                            />
                                        )}
                                    </div>
                                    <p className="text-xs text-gray-700 font-light text-center leading-relaxed px-1">
                                        {product.title}
                                    </p>
                                </Link>
                            );
                        })}
                    </div>
                </div>
            </div>
        </div>
    );
}
