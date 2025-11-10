"use client";

import { useEffect, useState, useMemo, useRef } from "react";
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
type SortByType = "name" | "price" | "stock" | "sold" | "createdAt";

export default function ProductPage() {
    const [collections, setCollections] = useState<Collection[]>([]);
    const [products, setProducts] = useState<Product[]>([]);
    const [activeTab, setActiveTab] = useState<"product" | "discount" | "suggested">("product");
    const [discountModalOpen, setDiscountModalOpen] = useState(false);

    // ✅ Client-side filtering & search
    const [searchQuery, setSearchQuery] = useState("");
    const [statusFilter, setStatusFilter] = useState<StatusFilterType>("all");
    const [sortBy, setSortBy] = useState<SortByType>("createdAt");

    // ✅ Dropdown states
    const [isStatusDropdownOpen, setIsStatusDropdownOpen] = useState(false);
    const [isSortDropdownOpen, setIsSortDropdownOpen] = useState(false);

    // ✅ Refs for click outside detection
    const statusDropdownRef = useRef<HTMLDivElement>(null);
    const sortDropdownRef = useRef<HTMLDivElement>(null);

    // ✅ Pagination
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;

    // ✅ Click outside to close dropdowns
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
                    fetch(`${API_BASE}/products?all=true`, {
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

    // ✅ Reset to page 1 when filters change
    useEffect(() => {
        setCurrentPage(1);
    }, [searchQuery, statusFilter, sortBy]);

    const filteredAndSortedProducts = useMemo(() => {
        let filtered = [...products];

        if (searchQuery) {
            filtered = filtered.filter(p =>
                p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                p.collection?.title?.toLowerCase().includes(searchQuery.toLowerCase())
            );
        }

        if (statusFilter === "active") {
            filtered = filtered.filter(p => p.status === true);
        } else if (statusFilter === "inactive") {
            filtered = filtered.filter(p => p.status === false);
        }

        filtered.sort((a, b) => {
            switch (sortBy) {
                case "name":
                    return a.title.localeCompare(b.title);
                case "price":
                    return Number(a.price) - Number(b.price);
                case "stock":
                    return a.stock - b.stock;
                // case "sold":
                //     return b.sold - a.sold;
                case "createdAt":
                    return new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime();
                default:
                    return 0;
            }
        });

        return filtered;
    }, [products, searchQuery, statusFilter, sortBy]);

    const paginatedProducts = useMemo(() => {
        const startIndex = (currentPage - 1) * itemsPerPage;
        const endIndex = startIndex + itemsPerPage;
        return filteredAndSortedProducts.slice(startIndex, endIndex);
    }, [filteredAndSortedProducts, currentPage]);

    const totalPages = Math.ceil(filteredAndSortedProducts.length / itemsPerPage);

    const getPageNumbers = () => {
        const pages: (number | string)[] = [];
        const maxVisible = 5;

        if (totalPages <= maxVisible) {
            for (let i = 1; i <= totalPages; i++) {
                pages.push(i);
            }
        } else {
            pages.push(1);
            if (currentPage > 3) pages.push('...');
            const start = Math.max(2, currentPage - 1);
            const end = Math.min(totalPages - 1, currentPage + 1);
            for (let i = start; i <= end; i++) {
                pages.push(i);
            }
            if (currentPage < totalPages - 2) pages.push('...');
            pages.push(totalPages);
        }
        return pages;
    };

    // ✅ Dropdown options
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
        // { value: "sold", label: "Sort by Sold" },
    ];

    const collectionItems = collections.map((c) => ({
        id: c.id,
        title: c.title,
        isActive: c.status,
    }));

    const productItems = paginatedProducts.map((p) => ({
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
        <div className="bg-gray-50 min-h-screen p-2">
            <div className="mb-6">
                <h1 className="text-2xl font-semibold text-gray-800">All Product</h1>
                <p className="text-sm text-gray-400 mt-1">
                    Managing Product & Discount ({products.length} total products)
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
                    {/* ✅ Custom Search & Filter Controls */}
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

                        {/* ✅ Custom Status Filter Dropdown */}
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
                        Showing {((currentPage - 1) * itemsPerPage) + 1}-{Math.min(currentPage * itemsPerPage, filteredAndSortedProducts.length)} of {filteredAndSortedProducts.length} products
                    </p>

                    <ProductTable products={productItems} />

                    {/* Pagination Controls */}
                    {totalPages > 1 && (
                        <div className="flex items-center justify-between mt-6 pt-4 border-t border-gray-200">
                            <button
                                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                                disabled={currentPage === 1}
                                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition ${currentPage === 1
                                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                    }`}
                            >
                                <ChevronLeft size={18} />
                                Previous
                            </button>

                            <div className="flex items-center gap-2">
                                {getPageNumbers().map((page, index) => (
                                    page === '...' ? (
                                        <span key={`ellipsis-${index}`} className="px-2 text-gray-400">
                                            ...
                                        </span>
                                    ) : (
                                        <button
                                            key={page}
                                            onClick={() => setCurrentPage(page as number)}
                                            className={`min-w-[40px] h-10 rounded-lg transition ${currentPage === page
                                                ? 'bg-primary-studio text-white font-medium'
                                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                                }`}
                                        >
                                            {page}
                                        </button>
                                    )
                                ))}
                            </div>

                            <button
                                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                                disabled={currentPage === totalPages}
                                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition ${currentPage === totalPages
                                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                    }`}
                            >
                                Next
                                <ChevronRight size={18} />
                            </button>
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