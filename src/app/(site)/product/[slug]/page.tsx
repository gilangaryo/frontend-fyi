import ProductDetail from "@/app/(site)/components/product/ProductDetail";
import { Product } from "@/types/product";
import { API_BASE } from "@/lib/constants";

type PageProps = {
    params: Promise<{ slug: string }> | { slug: string };
};

type ApiResponse<T> = {
    success: boolean;
    status: number;
    message: string;
    data: T;
};

async function getProductBySlug(slug: string): Promise<Product | null> {
    try {
        const res = await fetch(`${API_BASE}/products/slug/${slug}`, {
            cache: "no-store",
        });

        if (!res.ok) {
            console.error("❌ Failed to fetch product:", res.status);
            return null;
        }

        const json: ApiResponse<Product> = await res.json();
        return json.data;
    } catch (err) {
        console.error("❌ Network error while fetching product:", err);
        return null;
    }
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
