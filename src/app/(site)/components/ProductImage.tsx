"use client";

import { useEffect, useState } from "react";
import Image, { type ImageProps } from "next/image";
import { DUMMY_PRODUCT_IMAGE } from "@/lib/utils";

type ProductImageProps = Omit<ImageProps, "src" | "onError"> & {
    src?: string | null;
};

export default function ProductImage({
    src,
    alt,
    ...props
}: ProductImageProps) {
    const [imgSrc, setImgSrc] = useState(src || DUMMY_PRODUCT_IMAGE);

    useEffect(() => {
        setImgSrc(src || DUMMY_PRODUCT_IMAGE);
    }, [src]);

    return (
        <Image
            {...props}
            src={imgSrc}
            alt={alt}
            onError={() => {
                setImgSrc((current) =>
                    current === DUMMY_PRODUCT_IMAGE
                        ? current
                        : DUMMY_PRODUCT_IMAGE,
                );
            }}
        />
    );
}
