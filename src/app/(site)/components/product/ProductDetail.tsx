"use client";

import { useState } from "react";
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

export default function ProductDetail({ product }: ProductDetailProps) {
    const dispatch = useDispatch<AppDispatch>();

    const [mainImage, setMainImage] = useState(() => {
        const primary = product.images?.find((img) => img.isPrimary)?.imageUrl
        const fallback = product.imageUrl || product.images?.[0]?.imageUrl
        return getImageUrl(primary || fallback)
    })


    const [selectedVariantId, setSelectedVariantId] = useState<string>(
        product.variants?.[0]?.id
    );

    const [isSizeModalOpen, setIsSizeModalOpen] = useState(false);
    // const [isAddCartModalOpen, setIsAddCartModalOpen] = useState(false);

    const handleAddToCart = () => {
        const selectedVariant = product.variants?.find(
            (v) => v.id === selectedVariantId
        );
        const primary = product.images?.find((img) => img.isPrimary)?.imageUrl
        const fallback = product.imageUrl || product.images?.[0]?.imageUrl
        const finalImage = getImageUrl(primary || fallback)
        dispatch(
            addToCart({
                id: product.id,
                variantId: selectedVariantId,
                title: product.title,
                price: Number(product.price),
                quantity: 1,
                imageUrl: finalImage,
                size: selectedVariant?.size,
                color: selectedVariant?.color,
            })
        );
        window.dispatchEvent(new Event("open-cart"));
        // setIsAddCartModalOpen(true);
    };

    return (
        <>
            <section className="grid grid-cols-1 lg:grid-cols-2 gap-20 px-6 md:px-10 py-10">
                {/* Left - Images */}
                <div className="flex gap-4">
                    {/* Thumbnail List */}
                    <div className="flex flex-col gap-4 w-24">
                        {(product.images ?? []).map((img, i) => {
                            const imgUrl = getImageUrl(img.imageUrl);
                            return (
                                <button
                                    key={img.id || i}
                                    onClick={() => setMainImage(imgUrl)}
                                    className={`relative aspect-[3/4] w-full border ${mainImage === imgUrl
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
                            );
                        })}
                    </div>

                    {/* Main Image */}
                    <div className="flex-1 relative aspect-[3/4]">
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
                    <p className="text-lg mb-4">
                        Shop &gt; {product.category?.title || "Category"}
                    </p>

                    <h3 className="text-2xl md:text-[28px] font-medium mb-2">
                        {product.title}
                    </h3>
                    <p className="text-2xl font-light mb-4">
                        IDR {Number(product.price).toLocaleString("id-ID")}
                    </p>

                    <hr className="mb-6" />

                    {/* Size Options */}
                    <div className="mb-6">
                        <div className="flex items-center justify-between mb-4 text-lg">
                            <span>What my size?</span>
                            <button
                                className="flex items-center gap-2 text-secondary hover:underline underline-offset-2"
                                onClick={() => setIsSizeModalOpen(true)}
                            >
                                <Ruler size={16} /> Size & Fit Guide
                            </button>
                        </div>

                        <div className="flex gap-2 flex-wrap">
                            {(product.variants ?? []).map((v) => (
                                <button
                                    key={v.id}
                                    onClick={() => setSelectedVariantId(v.id)}
                                    className={`border px-5 py-2 text-base transition ${selectedVariantId === v.id
                                        ? "bg-primary-muted text-black border-secondary"
                                        : "hover:border-secondary"
                                        }`}
                                >
                                    {v.size}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Add to Cart */}
                    <button
                        onClick={handleAddToCart}
                        className="py-3 font-medium mb-6 bg-secondary text-white transition hover:bg-secondary/80"
                    >
                        Add to Bag
                    </button>

                    <p className="text-sm text-charcoal leading-relaxed mb-6">
                        {product.description}
                    </p>

                    <div className="divide-y text-sm">
                        <Accordion title="Details">{product.details || "-"}</Accordion>
                        <Accordion title="Delivery & Returns">
                            {product.delivery || "-"}
                        </Accordion>
                    </div>
                </div>
            </section>

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
                                <span className="text-xl font-medium">Size Chart</span>
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
                                    Wrap the tape measure around the widest part of your chest,
                                    including shoulders, with arms straight.
                                </p>
                                <p className="text-sm mb-4">
                                    <strong>Waist:</strong> <br />
                                    Wrap the tape around the narrowest point of your waist, close
                                    to the body without pulling tight.
                                </p>
                            </div>
                        </div>

                        <div className="text-xl font-light">
                            <div className="p-6 overflow-x-auto">
                                <table className="min-w-full text-sm border border-gray-200">
                                    <thead className="bg-gray-100 text-gray-700 font-medium">
                                        <tr>
                                            <th className="px-4 py-2 border">Size</th>
                                            <th className="px-4 py-2 border">Bust</th>
                                            <th className="px-4 py-2 border">Waist</th>
                                            <th className="px-4 py-2 border">Length</th>
                                            <th className="px-4 py-2 border">Sleeve</th>
                                            <th className="px-4 py-2 border">Height</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {(product.variants ?? []).map((v) => (
                                            <tr key={v.id} className="text-center border-t">
                                                <td className="px-4 py-2 border font-medium">{v.size || "-"}</td>
                                                <td className="px-4 py-2 border">{v.bust || "-"}</td>
                                                <td className="px-4 py-2 border">{v.waist || "-"}</td>
                                                <td className="px-4 py-2 border">{v.length || "-"}</td>
                                                <td className="px-4 py-2 border">{v.sleeve || "-"}</td>
                                                <td className="px-4 py-2 border">{v.height || "-"}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>

                            {/* Optional: Tips bawah */}
                            <div className="p-6 text-sm text-gray-600">
                                <p><strong>Tips:</strong> Measurements are taken flat. Allow 1–2 cm difference.</p>
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
                className={`transition-all duration-500 overflow-hidden ${open ? "max-h-40 mt-2" : "max-h-0"
                    }`}
            >
                <p className="text-gray-600">{children}</p>
            </div>
        </div>
    );
}
