import { cache } from "react";
import { API_BASE } from "@/lib/constants";
import type { Product } from "@/types/product";

/** Deduplicated per request (page + generateMetadata + opengraph-image). */
export const getProductBySlug = cache(async (slug: string): Promise<Product | null> => {
    try {
        const res = await fetch(`${API_BASE}/products/slug/${slug}`, { cache: "no-store" });
        if (!res.ok) {
            console.error("❌ Failed to fetch product:", res.status);
            return null;
        }
        const json: { data: Product } = await res.json();
        return json.data;
    } catch (err) {
        console.error("❌ Network error while fetching product:", err);
        return null;
    }
});

export const getBlogDetail = cache(async <T = Record<string, string | undefined>>(
    slug: string,
): Promise<T | null> => {
    try {
        const res = await fetch(`${API_BASE}/blog/slug/${slug}`, { cache: "no-store" });
        if (!res.ok) return null;
        const json = await res.json();
        return json.data as T;
    } catch {
        return null;
    }
});
