"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { Ruler, X } from "lucide-react";
import { useDispatch } from "react-redux";
import { AppDispatch } from "@/store";
import { addToCart } from "@/store/cartSlice";
import { Product } from "@/types/product";
import { getImageUrl } from "@/lib/utils";
// import AddToCartModal from "@/app/(site)/components/AddToCartModal";
type ProductDetailProps = {
    product: Product;
};

function getDisplayPrices(product: Product) {
    const pricingBase = Number(product.pricing?.basePrice);
    const pricingFinal = Number(product.pricing?.finalPrice);

    if (
        Number.isFinite(pricingBase) &&
        Number.isFinite(pricingFinal) &&
        pricingBase > pricingFinal
    ) {
        return {
            displayPrice: pricingFinal,
            originalPrice: pricingBase,
        };
    }

    const candidates = [
        product.originalPrice,
        product.basePrice,
        product.priceBeforeDiscount,
    ]
        .map((value) => Number(value))
        .filter(
            (value) => Number.isFinite(value) && value > Number(product.price),
        );

    return {
        displayPrice: Number(product.price),
        originalPrice: candidates[0],
    };
}

export default function ProductDetail({ product }: ProductDetailProps) {
    const dispatch = useDispatch<AppDispatch>();

    const [mainImage, setMainImage] = useState(() => {
        const primary = product.images?.find((img) => img.isPrimary)?.imageUrl;
        const fallback = product.imageUrl || product.images?.[0]?.imageUrl;
        return getImageUrl(primary || fallback);
    });

    const [selectedVariantId, setSelectedVariantId] = useState<
        string | undefined
    >(() => {
        const firstInStock = product.variants?.find((v) => v.stock > 0);
        return firstInStock?.id || product.variants?.[0]?.id;
    });

    useEffect(() => {
        // Kalau varian yang dipilih habis, ganti ke varian lain yang masih ada stok
        const selectedVariant = product.variants?.find(
            (v) => v.id === selectedVariantId,
        );

        if (selectedVariant?.stock === 0) {
            const nextInStock = product.variants?.find((v) => v.stock > 0);
            if (nextInStock) {
                setSelectedVariantId(nextInStock.id);
            } else {
                // Kalau semua habis, kosongkan
                setSelectedVariantId(undefined);
            }
        }
    }, [product.variants, selectedVariantId]);

    const [isSizeModalOpen, setIsSizeModalOpen] = useState(false);
    const [isZoomed, setIsZoomed] = useState(false);
    // const [isAddCartModalOpen, setIsAddCartModalOpen] = useState(false);

    const handleAddToCart = () => {
        const selectedVariant = product.variants?.find(
            (v) => v.id === selectedVariantId,
        );
        const primary = product.images?.find((img) => img.isPrimary)?.imageUrl;
        const fallback = product.imageUrl || product.images?.[0]?.imageUrl;
        const finalImage = getImageUrl(primary || fallback);
        const { displayPrice, originalPrice } = getDisplayPrices(product);

        dispatch(
            addToCart({
                id: product.id,
                variantId: selectedVariantId,
                title: product.title,
                price: displayPrice,
                originalPrice,
                quantity: 1,
                imageUrl: finalImage,
                size: selectedVariant?.size,
                color: selectedVariant?.color,
            }),
        );
        window.dispatchEvent(new Event("open-cart"));
        // setIsAddCartModalOpen(true);
    };
    const hasStock = product.variants?.some((v) => v.stock > 0);
    const selectedVariant = product.variants?.find(
        (v) => v.id === selectedVariantId,
    );
    const isSelectedOutOfStock = selectedVariant?.stock === 0;
    const { displayPrice, originalPrice } = getDisplayPrices(product);

    return (
        <>
            <section className="grid grid-cols-1 lg:grid-cols-2 gap-20 px-6 md:px-10 py-10">
                {/* Left - Images */}
                <div className="flex flex-col md:flex-row gap-4">
                    {/* Thumbnail List */}
                    <div
                        className="
                    grid 
                    grid-cols-5 md:grid-cols-1 
                    md:grid-rows-5 
                    gap-4 
                    w-full md:w-24
                "
                    >
                        {(product.images ?? []).slice(0, 5).map((img, i) => {
                            const imgUrl = getImageUrl(img.imageUrl);
                            return (
                                <div
                                    key={img.id || i}
                                    className="flex items-center"
                                >
                                    <button
                                        onClick={() => setMainImage(imgUrl)}
                                        className={`relative w-full h-full border ${
                                            mainImage === imgUrl
                                                ? "border-secondary"
                                                : "border-gray-200"
                                        }`}
                                    >
                                        <Image
                                            src={imgUrl}
                                            alt={`${product.title} ${i + 1}`}
                                            fill
                                            className="object-cover"
                                        />
                                    </button>
                                </div>
                            );
                        })}
                    </div>

                    {/* Main Image */}
                    <div 
                        className="flex-1 relative aspect-[3/4] cursor-zoom-in"
                        onClick={() => setIsZoomed(true)}
                    >
                        <Image
                            src={mainImage}
                            alt={product.title}
                            fill
                            className="object-cover"
                        />
                    </div>
                </div>

                {/* Right - Info */}
                <div className="flex flex-col text-charcoal font-light">
                    <p className="text-sm md:text-lg mb-4">
                        Shop &gt; {product.category?.title || "Category"}
                    </p>

                    <h3 className="text-lg md:text-2xl  md:text-[28px] font-medium mb-2">
                        {product.title}
                    </h3>
                    {typeof originalPrice === "number" &&
                    originalPrice > displayPrice ? (
                        <div className="flex items-center gap-3 text-lg md:text-2xl font-light mb-4">
                            <p className="text-charcoal">
                                IDR {displayPrice.toLocaleString("id-ID")}
                            </p>
                            <p className="text-gray-400 line-through text-base md:text-xl">
                                IDR {originalPrice.toLocaleString("id-ID")}
                            </p>
                        </div>
                    ) : (
                        <p className="text-lg md:text-2xl font-light mb-4">
                            IDR {displayPrice.toLocaleString("id-ID")}
                        </p>
                    )}

                    <hr className="mb-6" />

                    {/* Size Options */}
                    <div className="mb-6">
                        <div className="flex items-center justify-between mb-4 text-sm md:text-lg">
                            <span>What my size?</span>
                            <button
                                className="flex items-center gap-2 text-secondary hover:underline underline-offset-2"
                                onClick={() => setIsSizeModalOpen(true)}
                            >
                                <Ruler size={16} /> Size & Fit Guide
                            </button>
                        </div>

                        <div className="flex gap-2 flex-wrap">
                            {(product.variants ?? []).map((v) => {
                                const isOutOfStock = v.stock === 0;
                                const isSelected = selectedVariantId === v.id;

                                return (
                                    <button
                                        key={v.id}
                                        onClick={() =>
                                            !isOutOfStock &&
                                            setSelectedVariantId(v.id)
                                        }
                                        disabled={isOutOfStock}
                                        className={`
                border px-5 py-2 text-sm md:text-base transition
                ${
                    isOutOfStock
                        ? "opacity-40 cursor-not-allowed bg-gray-100 text-gray-400"
                        : isSelected
                          ? "bg-primary-muted text-black border-secondary"
                          : "hover:border-secondary"
                }
            `}
                                        title={
                                            isOutOfStock ? "Out of stock" : ""
                                        }
                                    >
                                        {v.size}
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    {/* Add to Cart */}
                    <button
                        onClick={handleAddToCart}
                        disabled={!hasStock || isSelectedOutOfStock}
                        className={`
    py-3 font-medium mb-6 transition
    ${
        !hasStock || isSelectedOutOfStock
            ? "bg-gray-300 text-gray-500 cursor-not-allowed"
            : "bg-secondary text-white hover:bg-secondary/80"
    }
  `}
                    >
                        {!hasStock
                            ? "Out of Stock"
                            : isSelectedOutOfStock
                              ? "Selected Size Out of Stock"
                              : "Add to Bag"}
                    </button>

                    <div className="divide-y text-sm">
                        <Accordion title="Details">
                            <p className="mb-4 leading-relaxed">{product.description}</p>
                            {product.details || "-"}
                        </Accordion>
                        <Accordion title="Delivery & Returns">
                            {product.delivery || "-"}
                        </Accordion>
                    </div>
                </div>
            </section>

            {/* Modal Image Zoom */}
            {isZoomed && (
                <div 
                    className="fixed inset-0 bg-black/90 z-[9999] flex items-center justify-center cursor-zoom-out"
                    onClick={() => setIsZoomed(false)}
                >
                    <button 
                        className="absolute top-6 right-6 text-white hover:text-gray-300 z-50"
                        onClick={() => setIsZoomed(false)}
                    >
                        <X size={32} />
                    </button>
                    <div className="relative w-full h-full max-w-5xl max-h-[90vh] mx-auto p-4 flex items-center justify-center">
                        <Image
                            src={mainImage}
                            alt={product.title}
                            fill
                            className="object-contain"
                            quality={100}
                        />
                    </div>
                </div>
            )}

            {/*  Modal Add to Cart */}
            {/* <AddToCartModal
                isOpen={isAddCartModalOpen}
                onClose={() => setIsAddCartModalOpen(false)}
                productTitle={product.title}
                productImage={getImageUrl(product.images[0]?.imageUrl)}
            /> */}

            {/*  Modal Size & Fit Guide */}
            {isSizeModalOpen && (
                <div
                    className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
                    onClick={() => setIsSizeModalOpen(false)}
                >
                    <div
                        className="bg-white w-[90%] max-w-4xl shadow-lg overflow-hidden relative"
                        onClick={(e: React.MouseEvent<HTMLDivElement>) =>
                            e.stopPropagation()
                        }
                    >
                        <div className="bg-primary-muted px-6 py-4 flex justify-center items-center relative">
                            <h2 className="text-[28px] font-medium text-charcoal text-center">
                                {product.title}
                                <br />
                                <span className="text-xl font-medium">
                                    Size Chart
                                </span>
                            </h2>
                            <button
                                onClick={() => setIsSizeModalOpen(false)}
                                className="absolute right-5 top-1/2 -translate-y-1/2"
                            >
                                <X size={30} />
                            </button>
                        </div>

                        <div className="p-6 flex gap-6">
                            <div className="w-1/4 flex justify-center">
                                <Image
                                    src="/product/size-chart.png"
                                    alt="Size chart"
                                    width={120}
                                    height={220}
                                    className="object-contain"
                                />
                            </div>
                            <div className="flex-1 font-light">
                                <h3 className="mb-2">How to Measure</h3>
                                <p className="text-sm mb-2">
                                    <strong>Chest:</strong> <br />
                                    Wrap the tape measure around the widest part
                                    of your chest, including shoulders, with
                                    arms straight.
                                </p>
                                <p className="text-sm mb-4">
                                    <strong>Waist:</strong> <br />
                                    Wrap the tape around the narrowest point of
                                    your waist, close to the body without
                                    pulling tight.
                                </p>
                            </div>
                        </div>

                        <div className="text-xl font-light">
                            {(product.modelHeight || product.modelWeight) && (
                                <div className="px-6 pt-2 pb-0 text-sm text-gray-600 bg-primary-muted/50 py-2 mx-6 mb-4">
                                    <span className="font-medium">Model info:</span>{" "}
                                    {product.modelHeight && <span>Height: {product.modelHeight}</span>}
                                    {product.modelHeight && product.modelWeight && <span> &middot; </span>}
                                    {product.modelWeight && <span>Weight: {product.modelWeight}</span>}
                                </div>
                            )}
                            <div className="px-6 pb-6 overflow-x-auto">
                                <table className="min-w-full text-sm border border-gray-200">
                                    <thead className="bg-gray-100 text-gray-700 font-medium">
                                        <tr>
                                            <th className="px-4 py-2 border">
                                                Size
                                            </th>
                                            <th className="px-4 py-2 border">
                                                Bust
                                            </th>
                                            <th className="px-4 py-2 border">
                                                Waist
                                            </th>
                                            <th className="px-4 py-2 border">
                                                Length
                                            </th>
                                            <th className="px-4 py-2 border">
                                                Sleeve
                                            </th>
                                            <th className="px-4 py-2 border">
                                                Hip
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {(product.variants ?? []).map((v) => (
                                            <tr
                                                key={v.id}
                                                className="text-center border-t"
                                            >
                                                <td className="px-4 py-2 border font-medium">
                                                    {v.size || "-"}
                                                </td>
                                                <td className="px-4 py-2 border">
                                                    {v.bust || "-"}
                                                </td>
                                                <td className="px-4 py-2 border">
                                                    {v.waist || "-"}
                                                </td>
                                                <td className="px-4 py-2 border">
                                                    {v.length || "-"}
                                                </td>
                                                <td className="px-4 py-2 border">
                                                    {v.sleeve || "-"}
                                                </td>
                                                <td className="px-4 py-2 border">
                                                    {v.height || "-"}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>

                            {/* Optional: Tips bawah */}
                            <div className="p-6 text-sm text-gray-600">
                                <p>
                                    <strong>Tips:</strong> Measurements are
                                    taken flat. Allow 1–2 cm difference.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}

function Accordion({
    title,
    children,
}: {
    title: string;
    children: React.ReactNode;
}) {
    const [open, setOpen] = useState(false);
    return (
        <div className="py-3">
            <button
                className="flex justify-between items-center w-full text-left"
                onClick={() => setOpen(!open)}
            >
                {title} <span>{open ? "−" : "+"}</span>
            </button>
            <div
                className={`transition-all duration-400 overflow-hidden ${
                    open ? "max-h-50 mt-2" : "max-h-0"
                }`}
            >
                <p className="text-gray-600">{children}</p>
            </div>
        </div>
    );
}
