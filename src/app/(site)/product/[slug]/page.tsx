import ProductDetail from "@/app/(site)/components/product/ProductDetail";
import { Product } from "@/types/product";
import type { Metadata } from "next";
import { buildPageMetadata } from "@/lib/seo";
import { getProductBySlug } from "@/lib/content";

type PageProps = {
    params: Promise<{ slug: string }> | { slug: string };
};

const stripHtml = (s?: string) =>
    (s ?? "").replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
    const { slug } = await Promise.resolve(params);
    const product = await getProductBySlug(slug);
    if (!product) return { title: "Product not found", robots: { index: false } };

    const path = `/product/${slug}`;
    return buildPageMetadata({
        title: product.title,
        description:
            stripHtml(product.description).slice(0, 160) ||
            `Shop ${product.title} at FYI Couture.`,
        path,
        image: false, // provided by ./opengraph-image.tsx
    });
}

export default async function ProductPage({ params }: PageProps) {
    const resolvedParams = await Promise.resolve(params);
    const { slug } = resolvedParams;

    const product = await getProductBySlug(slug);

    if (!product) {
        return (
            <>
                <main className="p-10 text-center text-gray-600">
                    Product not found.
                </main>
            </>
        );
    }

    return (
        <>
            <main>
                <ProductDetail product={product} />
            </main>
        </>
    );
}
