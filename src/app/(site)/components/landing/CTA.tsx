import Link from "next/link";
import { API_BASE } from "@/lib/constants";
import { getImageUrl } from "@/lib/utils";
import ProductImage from "@/app/(site)/components/ProductImage";

interface Product {
    id: string;
    title: string;
    slug: string;
    price?: number | string;
    pricing?: {
        basePrice: number;
        finalPrice: number;
    };
    images: { imageUrl: string; isPrimary: boolean }[];
}

async function getSuggestedProducts(): Promise<Product[]> {
    try {
        const res = await fetch(`${API_BASE}/suggested-products`, {
            next: { revalidate: 300 },
        });
        if (!res.ok) return [];
        const json = await res.json();
        if (json.status !== "success") return [];
        return (json.data as { product: Product }[]).map((s) => s.product);
    } catch (err) {
        console.error("Error fetching suggested products:", err);
        return [];
    }
}

const formatIDR = (v: number | string) => `IDR ${Number(v).toLocaleString("id-ID")}`;

function ProductCard({ product, className = "" }: { product: Product; className?: string }) {
    const primary =
        product.images?.find((img) => img.isPrimary)?.imageUrl ||
        product.images?.[0]?.imageUrl;
    const secondary =
        product.images?.find((img) => !img.isPrimary)?.imageUrl ||
        product.images?.[1]?.imageUrl;
    const onSale =
        !!product.pricing && product.pricing.finalPrice < product.pricing.basePrice;

    // Card is 192px (mobile) / 256px (tablet) / 1/4 of the row (desktop).
    const sizes = "(max-width: 767px) 192px, (max-width: 1023px) 256px, 25vw";

    return (
        <Link
            href={`/product/${product.slug}`}
            className={`group block flex-none w-48 md:w-64 lg:w-auto ${className}`}
        >
            <div className="aspect-[3/4] relative bg-gray-100 mb-4 overflow-hidden">
                {onSale && (
                    <div className="absolute top-3 left-3 bg-[#5a4b43] text-white text-xs font-semibold px-3 py-1 z-10">
                        SALE
                    </div>
                )}
                <ProductImage
                    src={getImageUrl(primary)}
                    alt={product.title}
                    fill
                    sizes={sizes}
                    className={`object-cover transition-opacity duration-500 ${secondary ? "[@media(hover:hover)]:group-hover:opacity-0" : ""}`}
                />
                {/* Hover image: only rendered (and therefore downloaded) on devices that can hover. */}
                {secondary && (
                    <div className="hidden [@media(hover:hover)]:block">
                        <ProductImage
                            src={getImageUrl(secondary)}
                            alt=""
                            fill
                            sizes={sizes}
                            className="object-cover opacity-0 transition-opacity duration-500 group-hover:opacity-100"
                        />
                    </div>
                )}
            </div>
            <p className="text-xs lg:text-sm text-charcoal font-light text-center leading-relaxed lg:tracking-wide px-1 mb-1">
                {product.title}
            </p>
            {onSale ? (
                <div className="flex items-center justify-center gap-1 lg:gap-2 flex-wrap">
                    <p className="text-xs lg:text-sm line-through text-gray-400">
                        {formatIDR(product.pricing!.basePrice)}
                    </p>
                    <p className="text-xs lg:text-sm font-medium text-charcoal">
                        {formatIDR(product.pricing!.finalPrice)}
                    </p>
                </div>
            ) : (
                product.price && (
                    <p className="text-xs lg:text-sm font-medium text-charcoal text-center">
                        {formatIDR(product.price)}
                    </p>
                )
            )}
        </Link>
    );
}

export default async function CTA() {
    const products = await getSuggestedProducts();
    if (!products.length) return null;

    return (
        <div className="bg-white">
            <div className="px-4 md:px-10 py-8 md:py-12">
                {/* Horizontal scroll below lg, 4-column grid (first 4 products) on lg+. */}
                <div className="flex gap-4 md:gap-6 overflow-x-auto pb-4 scrollbar-hide lg:grid lg:grid-cols-4 lg:gap-8 lg:overflow-visible lg:pb-0">
                    {products.map((product, i) => (
                        <ProductCard
                            key={product.id}
                            product={product}
                            className={i >= 4 ? "lg:hidden" : ""}
                        />
                    ))}
                </div>
            </div>
        </div>
    );
}
