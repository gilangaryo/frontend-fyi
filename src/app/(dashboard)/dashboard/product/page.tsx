"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import Link from "next/link";
import { API_BASE } from "@/lib/constants";
import CollectionTable from "../../components/product/CollectionTable";
import ProductTable from "../../components/product/ProductTable";
import DiscountTab from "../../components/product/DiscountTab";
import SuggestedProductTab from "../../components/SuggestedProductTab";
import { ChevronLeft, ChevronRight, ChevronDown, Search } from "lucide-react";

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
    createdAt?: string;
};

type StatusFilterType = "all" | "active" | "inactive";
type SortByType = "name" | "price" | "stock" | "createdAt";

export default function ProductPage() {
    const [collections, setCollections] = useState<Collection[]>([]);
    const [products, setProducts] = useState<Product[]>([]);
    const [totalProducts, setTotalProducts] = useState(0);
    const [totalPages, setTotalPages] = useState(0);
    const [activeTab, setActiveTab] = useState<"product" | "discount" | "suggested">("product");
    const [discountModalOpen, setDiscountModalOpen] = useState(false);

    // Search & filter
    const [searchQuery, setSearchQuery] = useState("");
    const [debouncedSearch, setDebouncedSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState<StatusFilterType>("all");
    const [sortBy, setSortBy] = useState<SortByType>("createdAt");

    // Dropdown states
    const [isStatusDropdownOpen, setIsStatusDropdownOpen] = useState(false);
    const [isSortDropdownOpen, setIsSortDropdownOpen] = useState(false);

    // Refs for click outside detection
    const statusDropdownRef = useRef<HTMLDivElement>(null);
    const sortDropdownRef = useRef<HTMLDivElement>(null);

    // Pagination
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;

    // Loading state
    const [isLoading, setIsLoading] = useState(true);

    // Click outside to close dropdowns
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (statusDropdownRef.current && !statusDropdownRef.current.contains(event.target as Node)) {
                setIsStatusDropdownOpen(false);
            }
            if (sortDropdownRef.current && !sortDropdownRef.current.contains(event.target as Node)) {
                setIsSortDropdownOpen(false);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    // Debounce search input (300ms)
    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearch(searchQuery);
        }, 300);
        return () => clearTimeout(timer);
    }, [searchQuery]);

    // Reset to page 1 when filters change
    useEffect(() => {
        setCurrentPage(1);
    }, [debouncedSearch, statusFilter, sortBy]);

    // Fetch collections once
    useEffect(() => {
        async function fetchCollections() {
            try {
                const token = localStorage.getItem("token");
                if (!token) return;

                const res = await fetch(`${API_BASE}/collections`, {
                    headers: { Authorization: `Bearer ${token}` },
                    credentials: "include",
                });
                if (!res.ok) throw new Error("Failed to fetch collections");

                const data = await res.json();
                setCollections(data.data || []);
            } catch (err) {
                console.error("Fetch collections error:", err);
            }
        }
        fetchCollections();
    }, []);

    // Fetch products with server-side pagination, search, filter, sort
    const fetchProducts = useCallback(async () => {
        try {
            setIsLoading(true);
            const token = localStorage.getItem("token");
            if (!token) throw new Error("Unauthorized");

            const params = new URLSearchParams();
            params.set("page", String(currentPage));
            params.set("limit", String(itemsPerPage));

            if (debouncedSearch) {
                params.set("search", debouncedSearch);
            }

            if (statusFilter === "active") {
                params.set("status", "true");
            } else if (statusFilter === "inactive") {
                params.set("status", "false");
            }

            // Map frontend sortBy to backend sortBy
            const sortByMap: Record<string, string> = {
                name: "title",
                price: "price",
                stock: "stock",
                createdAt: "createdAt",
            };
            params.set("sortBy", sortByMap[sortBy] || "createdAt");
            params.set("sortOrder", sortBy === "createdAt" ? "desc" : "asc");

            const res = await fetch(`${API_BASE}/products?${params.toString()}`, {
                headers: { Authorization: `Bearer ${token}` },
                credentials: "include",
            });

            if (!res.ok) throw new Error("Failed to fetch products");

            const data = await res.json();
            setProducts(data.data || []);
            setTotalProducts(data.pagination?.total ?? data.total ?? 0);
            setTotalPages(data.pagination?.totalPages ?? 1);
        } catch (err) {
            console.error("Fetch products error:", err);
        } finally {
            setIsLoading(false);
        }
    }, [currentPage, debouncedSearch, statusFilter, sortBy]);

    useEffect(() => {
        fetchProducts();
    }, [fetchProducts]);

    // Called from ProductTable after a successful delete
    const handleProductDeleted = useCallback(() => {
        fetchProducts();
    }, [fetchProducts]);

    const getPageNumbers = () => {
        const windowSize = 10;
        const half = Math.floor(windowSize / 2);
        let start = Math.max(1, currentPage - half);
        let end = Math.min(totalPages, start + windowSize - 1);
        // Shift window left if we're near the end
        if (end - start < windowSize - 1) {
            start = Math.max(1, end - windowSize + 1);
        }
        const pages: number[] = [];
        for (let i = start; i <= end; i++) {
            pages.push(i);
        }
        return pages;
    };

    // Dropdown options
    const statusOptions = [
        { value: "all", label: "All Status" },
        { value: "active", label: "Active" },
        { value: "inactive", label: "Inactive" },
    ];

    const sortOptions = [
        { value: "createdAt", label: "Sort by Latest" },
        { value: "name", label: "Sort by Name" },
        { value: "price", label: "Sort by Price" },
        { value: "stock", label: "Sort by Stock" },
    ];

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

    const showingFrom = totalProducts === 0 ? 0 : ((currentPage - 1) * itemsPerPage) + 1;
    const showingTo = Math.min(currentPage * itemsPerPage, totalProducts);

    return (
        <div className="bg-gray-50 min-h-screen p-2">
            <div className="mb-6">
                <h1 className="text-2xl font-semibold text-gray-800">All Product</h1>
                <p className="text-sm text-gray-400 mt-1">
                    Managing Product & Discount ({totalProducts} total products)
                </p>
            </div>

            <div className="bg-white rounded-lg shadow-sm mb-10 p-6">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="font-semibold text-primary-studio text-lg">
                        Collection
                    </h2>

                    <Link
                        href="/dashboard/product/collection/new"
                        className="flex items-center gap-2 text-gray-600 text-sm hover:text-gray-800 bg-gray-100 hover:bg-gray-200 rounded-lg px-3 py-2"
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                        </svg>
                        Add Collection
                    </Link>
                </div>

                <CollectionTable collections={collectionItems} />
            </div>

            <div className="flex border-b justify-between border-primary-studio mb-6">
                <div className="flex gap-9">
                    {["product", "discount", "suggested"].map((tab) => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab as "product" | "discount" | "suggested")}
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

                <div>
                    {activeTab === "product" && (
                        <Link
                            href="/dashboard/product/new"
                            className="flex items-center gap-2 bg-gray-100 text-gray-700 text-sm hover:bg-gray-200 rounded-lg px-3 py-2"
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                            </svg>
                            Add Product
                        </Link>
                    )}

                    {activeTab === "discount" && (
                        <button
                            onClick={() => setDiscountModalOpen(true)}
                            className="flex items-center gap-2 bg-gray-100 text-gray-700 text-sm hover:bg-gray-200 rounded-lg px-3 py-2"
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                            </svg>
                            Add Discount
                        </button>
                    )}
                </div>
            </div>

            {activeTab === "product" && (
                <div className="bg-white rounded-lg shadow-sm p-6">
                    {/* Search & Filter Controls */}
                    <div className="flex gap-4 mb-6">
                        {/* Search Input */}
                        <div className="flex-1 relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Search products..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-studio focus:border-transparent focus:outline-none"
                            />
                        </div>

                        {/* Status Filter Dropdown */}
                        <div className="relative min-w-[140px]" ref={statusDropdownRef}>
                            <button
                                onClick={() => setIsStatusDropdownOpen(!isStatusDropdownOpen)}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-white hover:bg-gray-50 transition flex items-center justify-between focus:ring-2 focus:ring-primary-studio focus:outline-none"
                            >
                                <span className="text-gray-700 pr-2">
                                    {statusOptions.find(opt => opt.value === statusFilter)?.label}
                                </span>
                                <ChevronDown
                                    className={`w-4 h-4 text-gray-400 transition-transform ${isStatusDropdownOpen ? 'rotate-180' : ''}`}
                                />
                            </button>

                            {isStatusDropdownOpen && (
                                <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg overflow-hidden">
                                    {statusOptions.map((option) => (
                                        <button
                                            key={option.value}
                                            onClick={() => {
                                                setStatusFilter(option.value as StatusFilterType);
                                                setIsStatusDropdownOpen(false);
                                            }}
                                            className={`w-full px-4 py-2.5 text-left hover:bg-gray-50 transition ${statusFilter === option.value
                                                ? 'bg-primary-studio/10 text-primary-studio font-medium'
                                                : 'text-gray-700'
                                                }`}
                                        >
                                            {option.label}
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Sort Dropdown */}
                        <div className="relative min-w-[160px]" ref={sortDropdownRef}>
                            <button
                                onClick={() => setIsSortDropdownOpen(!isSortDropdownOpen)}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-white hover:bg-gray-50 transition flex items-center justify-between focus:ring-2 focus:ring-primary-studio focus:outline-none"
                            >
                                <span className="text-gray-700 pr-2">
                                    {sortOptions.find(opt => opt.value === sortBy)?.label}
                                </span>
                                <ChevronDown
                                    className={`w-4 h-4 text-gray-400 transition-transform ${isSortDropdownOpen ? 'rotate-180' : ''}`}
                                />
                            </button>

                            {isSortDropdownOpen && (
                                <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg overflow-hidden">
                                    {sortOptions.map((option) => (
                                        <button
                                            key={option.value}
                                            onClick={() => {
                                                setSortBy(option.value as SortByType);
                                                setIsSortDropdownOpen(false);
                                            }}
                                            className={`w-full px-4 py-2.5 text-left hover:bg-gray-50 transition ${sortBy === option.value
                                                ? 'bg-primary-studio/10 text-primary-studio font-medium'
                                                : 'text-gray-700'
                                                }`}
                                        >
                                            {option.label}
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>

                    <p className="text-sm text-gray-500 mb-4">
                        Showing {showingFrom}-{showingTo} of {totalProducts} products
                    </p>

                    {isLoading ? (
                        <div className="rounded-lg bg-white overflow-hidden">
                            <div className="min-w-[900px]">
                                {/* Header */}
                                <div className="grid grid-cols-[1fr_15rem_15rem_15rem_8rem] bg-sky-500 text-white font-medium text-sm rounded-t-md">
                                    <div className="px-4 py-2 text-left">Product</div>
                                    <div className="px-4 py-2 text-center">Price</div>
                                    <div className="px-4 py-2 text-center">Stock</div>
                                    <div className="px-4 py-2 text-center">Status</div>
                                    <div className="px-4 py-2 text-center">Action</div>
                                </div>
                                {/* Skeleton rows */}
                                {Array.from({ length: itemsPerPage }).map((_, i) => (
                                    <div
                                        key={i}
                                        className="grid grid-cols-[1fr_15rem_15rem_15rem_8rem] border-t border-gray-100 items-center"
                                    >
                                        {/* Product info */}
                                        <div className="flex items-center gap-3 px-4 py-3">
                                            <div className="w-10 h-10 rounded bg-gray-200 animate-pulse shrink-0" />
                                            <div className="flex flex-col gap-1.5">
                                                <div className="h-3.5 w-36 bg-gray-200 animate-pulse rounded" />
                                                <div className="h-2.5 w-20 bg-gray-100 animate-pulse rounded" />
                                            </div>
                                        </div>
                                        {/* Price */}
                                        <div className="flex justify-center">
                                            <div className="h-3.5 w-24 bg-gray-200 animate-pulse rounded" />
                                        </div>
                                        {/* Stock */}
                                        <div className="flex justify-center">
                                            <div className="h-3.5 w-10 bg-gray-200 animate-pulse rounded" />
                                        </div>
                                        {/* Status */}
                                        <div className="flex justify-center">
                                            <div className="h-7 w-24 bg-gray-200 animate-pulse rounded" />
                                        </div>
                                        {/* Action */}
                                        <div className="flex justify-center gap-2 py-3">
                                            <div className="h-7 w-12 bg-gray-200 animate-pulse rounded" />
                                            <div className="h-7 w-8 bg-gray-200 animate-pulse rounded" />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ) : (
                        <ProductTable products={productItems} onDelete={handleProductDeleted} />
                    )}

                    {/* Pagination Controls */}
                    {!isLoading && totalPages > 1 && (
                        <div className="flex items-center justify-between mt-6 pt-4 border-t border-gray-200">
                            {/* Prev group */}
                            <div className="flex items-center gap-1">
                                <button
                                    onClick={() => setCurrentPage(1)}
                                    disabled={currentPage === 1}
                                    className="px-3 py-2 rounded-lg text-sm bg-gray-100 text-gray-700 hover:bg-gray-200 disabled:opacity-40 disabled:cursor-not-allowed transition"
                                >
                                    First
                                </button>
                                <button
                                    onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                                    disabled={currentPage === 1}
                                    className="flex items-center gap-1 px-3 py-2 rounded-lg text-sm bg-gray-100 text-gray-700 hover:bg-gray-200 disabled:opacity-40 disabled:cursor-not-allowed transition"
                                >
                                    <ChevronLeft size={16} />
                                    Prev
                                </button>
                            </div>

                            {/* Sliding window */}
                            <div className="flex items-center gap-1">
                                {getPageNumbers().map((page) => (
                                    <button
                                        key={page}
                                        onClick={() => setCurrentPage(page)}
                                        className={`min-w-[38px] h-9 rounded-lg text-sm transition ${currentPage === page
                                            ? 'bg-primary-studio text-white font-medium'
                                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                        }`}
                                    >
                                        {page}
                                    </button>
                                ))}
                            </div>

                            {/* Next group */}
                            <div className="flex items-center gap-1">
                                <button
                                    onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                                    disabled={currentPage === totalPages}
                                    className="flex items-center gap-1 px-3 py-2 rounded-lg text-sm bg-gray-100 text-gray-700 hover:bg-gray-200 disabled:opacity-40 disabled:cursor-not-allowed transition"
                                >
                                    Next
                                    <ChevronRight size={16} />
                                </button>
                                <button
                                    onClick={() => setCurrentPage(totalPages)}
                                    disabled={currentPage === totalPages}
                                    className="px-3 py-2 rounded-lg text-sm bg-gray-100 text-gray-700 hover:bg-gray-200 disabled:opacity-40 disabled:cursor-not-allowed transition"
                                >
                                    Last
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            )}

            {activeTab === "discount" && (
                <DiscountTab externalOpen={discountModalOpen} onExternalOpenChange={setDiscountModalOpen} />
            )}

            {activeTab === "suggested" && <SuggestedProductTab />}
        </div>
    );
}
