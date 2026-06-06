"use client";

import { useEffect, useMemo, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { API_BASE } from "@/lib/constants";

type ProductImage = {
    id: string;
    imageUrl: string;
    isPrimary: boolean;
    isSecondary: boolean;
};

type Product = {
    id: string;
    title: string;
    imageUrl: string;
    images: ProductImage[];
};

type Card = {
    title: string;
    rawPath: string;
    badge: "utama" | "galeri";
};

// API_BASE biasanya ".../api". File statis ada di /api/uploads/product/...
function buildImageUrl(rawPath: string, version: number) {
    if (!rawPath) return "";
    const origin = API_BASE.replace(/\/api\/?$/, "");
    const path = rawPath.startsWith("/api") ? rawPath : `/api${rawPath}`;
    return `${origin}${path}?v=${version}`;
}

const LIMIT = 32;

export default function CekOrientasiPage() {
    const [products, setProducts] = useState<Product[]>([]);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [total, setTotal] = useState(0);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [mode, setMode] = useState<"primary" | "all">("primary");

    const version = useMemo(() => Date.now(), []);

    useEffect(() => {
        let cancelled = false;

        async function fetchPage() {
            setLoading(true);
            setError("");
            try {
                const res = await fetch(
                    `${API_BASE}/products?page=${page}&limit=${LIMIT}`,
                );
                if (!res.ok) throw new Error(`HTTP ${res.status}`);
                const json = await res.json();
                if (cancelled) return;
                setProducts(json.data || []);
                setTotalPages(json.pagination?.totalPages ?? 1);
                setTotal(json.pagination?.total ?? 0);
            } catch (err) {
                if (!cancelled)
                    setError(
                        err instanceof Error ? err.message : "Gagal memuat",
                    );
            } finally {
                if (!cancelled) setLoading(false);
            }
        }

        fetchPage();
        return () => {
            cancelled = true;
        };
    }, [page]);

    const cards: Card[] = useMemo(() => {
        const out: Card[] = [];
        for (const p of products) {
            if (mode === "primary") {
                const primary =
                    p.images?.find((i) => i.isPrimary) ??
                    ({ imageUrl: p.imageUrl } as ProductImage);
                out.push({
                    title: p.title,
                    rawPath: primary.imageUrl || p.imageUrl || "",
                    badge: "utama",
                });
            } else {
                for (const img of p.images || []) {
                    out.push({
                        title: p.title,
                        rawPath: img.imageUrl,
                        badge: img.isPrimary ? "utama" : "galeri",
                    });
                }
            }
        }
        return out;
    }, [products, mode]);

    const pageNumbers = useMemo(() => {
        const windowSize = 10;
        const half = Math.floor(windowSize / 2);
        let start = Math.max(1, page - half);
        const end = Math.min(totalPages, start + windowSize - 1);
        if (end - start < windowSize - 1) {
            start = Math.max(1, end - windowSize + 1);
        }
        const arr: number[] = [];
        for (let i = start; i <= end; i++) arr.push(i);
        return arr;
    }, [page, totalPages]);

    const btn: React.CSSProperties = {
        padding: "6px 12px",
        borderRadius: 8,
        fontSize: 13,
        background: "#1c1c1c",
        color: "#ccc",
        border: "1px solid #333",
        cursor: "pointer",
    };

    return (
        <div style={{ background: "#111", color: "#eee", minHeight: "100vh" }}>
            <header
                style={{
                    position: "sticky",
                    top: 0,
                    background: "#000",
                    padding: "12px 16px",
                    borderBottom: "1px solid #333",
                    zIndex: 10,
                }}
            >
                <h1 style={{ fontSize: 16, margin: 0 }}>
                    Cek Orientasi Foto Produk
                </h1>
                <p style={{ fontSize: 13, color: "#aaa", margin: "4px 0 0" }}>
                    {total} produk total · halaman {page}/{totalPages} ·{" "}
                    {cards.length} foto di halaman ini. Model harus berdiri
                    tegak.
                </p>
                {error && (
                    <div style={{ fontSize: 13, color: "#f66", marginTop: 6 }}>
                        {error}
                    </div>
                )}
                <div style={{ marginTop: 8, display: "flex", gap: 16 }}>
                    <label style={{ fontSize: 13, cursor: "pointer" }}>
                        <input
                            type="radio"
                            name="mode"
                            checked={mode === "primary"}
                            onChange={() => setMode("primary")}
                        />{" "}
                        Foto utama saja
                    </label>
                    <label style={{ fontSize: 13, cursor: "pointer" }}>
                        <input
                            type="radio"
                            name="mode"
                            checked={mode === "all"}
                            onChange={() => setMode("all")}
                        />{" "}
                        Semua foto (galeri)
                    </label>
                </div>
            </header>

            <div
                style={{
                    display: "grid",
                    gridTemplateColumns:
                        "repeat(auto-fill, minmax(220px, 1fr))",
                    gap: 12,
                    padding: 16,
                    opacity: loading ? 0.4 : 1,
                    transition: "opacity 0.15s",
                }}
            >
                {cards.map((c, i) => (
                    <div
                        key={`${c.rawPath}-${i}`}
                        style={{
                            background: "#1c1c1c",
                            border: "1px solid #333",
                            borderRadius: 8,
                            overflow: "hidden",
                            position: "relative",
                        }}
                    >
                        <span
                            style={{
                                position: "absolute",
                                top: 4,
                                left: 4,
                                background: "#000a",
                                color: "#fff",
                                fontSize: 10,
                                padding: "2px 6px",
                                borderRadius: 4,
                            }}
                        >
                            {c.badge}
                        </span>
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                            loading="lazy"
                            src={buildImageUrl(c.rawPath, version)}
                            alt={c.title}
                            style={{
                                width: "100%",
                                height: 280,
                                objectFit: "contain",
                                background: "#000",
                                display: "block",
                            }}
                        />
                        <div
                            style={{
                                padding: 8,
                                fontSize: 11,
                                color: "#ccc",
                                wordBreak: "break-all",
                            }}
                        >
                            <b style={{ color: "#6cf", display: "block" }}>
                                {c.title}
                            </b>
                            {c.rawPath.replace("/uploads/product/", "")}
                        </div>
                    </div>
                ))}
            </div>

            {totalPages > 1 && (
                <div
                    style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: 6,
                        padding: "16px",
                        flexWrap: "wrap",
                    }}
                >
                    <button
                        style={btn}
                        onClick={() => setPage(1)}
                        disabled={page === 1}
                    >
                        First
                    </button>
                    <button
                        style={btn}
                        onClick={() => setPage((p) => Math.max(1, p - 1))}
                        disabled={page === 1}
                    >
                        <ChevronLeft
                            size={14}
                            style={{ verticalAlign: "middle" }}
                        />
                    </button>

                    {pageNumbers.map((n) => (
                        <button
                            key={n}
                            onClick={() => setPage(n)}
                            style={{
                                ...btn,
                                minWidth: 36,
                                background: n === page ? "#2563eb" : "#1c1c1c",
                                color: n === page ? "#fff" : "#ccc",
                                fontWeight: n === page ? 600 : 400,
                            }}
                        >
                            {n}
                        </button>
                    ))}

                    <button
                        style={btn}
                        onClick={() =>
                            setPage((p) => Math.min(totalPages, p + 1))
                        }
                        disabled={page === totalPages}
                    >
                        <ChevronRight
                            size={14}
                            style={{ verticalAlign: "middle" }}
                        />
                    </button>
                    <button
                        style={btn}
                        onClick={() => setPage(totalPages)}
                        disabled={page === totalPages}
                    >
                        Last
                    </button>
                </div>
            )}
        </div>
    );
}
