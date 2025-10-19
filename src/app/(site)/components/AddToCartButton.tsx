"use client";

import { useDispatch } from "react-redux";
import { addToCart } from "@/store/cartSlice";
import type { Product } from "@/types/product";

export default function AddToCartButton({ product }: { product: Product }) {
    const dispatch = useDispatch();

    return (
        <button
            onClick={() =>
                dispatch(addToCart({
                    id: product.slug,
                    title: product.title,
                    price: product.price,
                    quantity: 1,
                    imageUrl: product.imageUrl
                }))
            }
            className="bg-black text-white px-4 py-2 rounded"
        >
            Add to Cart
        </button>
    );
}
