'use client'

import Image from "next/image"
import { getImageUrl } from "@/lib/utils"

interface BlogSectionProps {
    image?: string
    heading?: string
    description?: string
    subDescription?: string
    reverse?: boolean
    bg?: string
}

export default function BlogSection({
    image,
    heading,
    description,
    subDescription,
    reverse = false,
    bg = "",
}: BlogSectionProps) {
    if (!image) return null

    return (
        <section className={`py-20 px-6 md:px-16 ${bg}`}>
            <div
                className={`grid grid-cols-1 md:grid-cols-2 gap-10 items-center ${reverse ? "md:flex-row-reverse" : ""
                    }`}
            >
                {/* Image */}
                <div
                    className={`relative w-full aspect-[3/4] ${reverse ? "order-1 md:order-2" : ""
                        }`}
                >
                    <Image
                        src={getImageUrl(image)}
                        alt={heading || "Blog section image"}
                        fill
                        className="object-cover rounded-lg"
                    />
                </div>

                {/* Text */}
                <div
                    className={`flex flex-col text-center md:text-left space-y-4 text-secondary ${reverse ? "order-2 md:order-1" : ""
                        }`}
                >
                    {/* {heading && (
                        <h3 className="text-2xl md:text-3xl font-semibold mb-3">
                            {heading}
                        </h3>
                    )} */}
                    {description && (
                        <p className="text-sm font-light leading-relaxed">{description}</p>
                    )}
                    {subDescription && (
                        <p className="text-sm italic opacity-70">{subDescription}</p>
                    )}
                </div>
            </div>
        </section>
    )
}
