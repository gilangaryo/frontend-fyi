"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { API_BASE } from "@/lib/constants";
import CollectionTable from "../../components/product/CollectionTable";
import ProductTable from "../../components/product/ProductTable";

type Collection = {
    id: string;
    title: string;
    status: boolean;
};

type Product = {
    id: string;
    title: string;
    collection?: { title: string };
    price: string;
    sold: number;
    stock: number;
    status: boolean;
    imageUrl: string;
};

export default function ProductPage() {
    const [collections, setCollections] = useState<Collection[]>([]);
    const [products, setProducts] = useState<Product[]>([]);
    const [activeTab, setActiveTab] = useState<"product" | "discount">("product");

    useEffect(() => {
        async function fetchData() {
            try {
                const token = localStorage.getItem("token");
                if (!token) throw new Error("Unauthorized");

                const [colRes, prodRes] = await Promise.all([
                    fetch(`${API_BASE}/collections`, {
                        headers: { Authorization: `Bearer ${token}` },
                        credentials: "include",
                    }),
                    fetch(`${API_BASE}/products`, {
                        headers: { Authorization: `Bearer ${token}` },
                        credentials: "include",
                    }),
                ]);

                if (!colRes.ok || !prodRes.ok) {
                    throw new Error("Failed to fetch data");
                }

                const colData = await colRes.json();
                const prodData = await prodRes.json();

                setCollections(colData.data || []);
                setProducts(prodData.data || []);
            } catch (err) {
                console.error("❌ Fetch error:", err);
            }
        }

        fetchData();
    }, []);

    const collectionItems = collections.map((c) => ({
        id: c.id,
        title: c.title,
        isActive: c.status,
    }));

    const productItems = products.map((p) => ({
        id: p.id,
        title: p.title,
        subLabel: p.collection?.title || "-",
        price: `Rp ${Number(p.price).toLocaleString("id-ID")}`,
        sold: p.sold,
        stock: p.stock,
        imageUrl: p.imageUrl,
        isActive: p.status,
    }));

    return (
        <div className="bg-gray-50 min-h-screen p-6">
            <div className="mb-6">
                <h1 className="text-2xl font-semibold text-gray-800">All Product</h1>
                <p className="text-sm text-gray-400 mt-1">
                    Managing Product & Discount
                </p>
            </div>

            <div className="bg-white rounded-lg shadow-sm mb-10 p-6">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="font-semibold text-primary-studio text-lg">
                        Collection
                    </h2>

                    <Link
                        href="/dashboard/product/collection/new"
                        className="flex items-center gap-2 text-gray-600 text-sm hover:text-gray-800 bg-gray-100 rounded-lg px-3 py-2"
                    >
                        <svg
                            className="w-4 h-4"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M12 4v16m8-8H4"
                            />
                        </svg>
                        Add Collection
                    </Link>
                </div>

                <CollectionTable collections={collectionItems} />
            </div>

            <div className="flex border-b justify-between border-primary-studio mb-6">
                <div className="flex gap-9">
                    {["product", "discount"].map((tab) => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab as "product" | "discount")}
                            className={`pb-3 text-2xl font-medium transition-colors relative ${activeTab === tab
                                ? "text-primary-studio"
                                : "text-gray-400 hover:text-gray-600"
                                }`}
                        >
                            {tab[0].toUpperCase() + tab.slice(1)}
                            {activeTab === tab && (
                                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary-studio"></div>
                            )}
                        </button>
                    ))}
                </div>

                <Link
                    href="/dashboard/product/new"
                    className="flex items-center gap-2 text-gray-600 text-sm hover:text-gray-800 bg-gray-100 rounded-lg px-3 py-2"
                >
                    <svg
                        className="w-4 h-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M12 4v16m8-8H4"
                        />
                    </svg>
                    Add Product
                </Link>
            </div>

            {activeTab === "product" && (
                <div className="bg-white rounded-lg shadow-sm p-6">
                    <div className="flex items-center justify-between mb-4">
                        {/* <h2 className="font-semibold text-primary-studio text-lg">
                            Product
                        </h2> */}
                    </div>

                    <ProductTable products={productItems} />
                </div>
            )}

            {activeTab === "discount" && (
                <div className="bg-white rounded-lg shadow-sm p-8 text-center">
                    <p className="text-gray-400">No discount data available</p>
                </div>
            )}
        </div>
    );
}
