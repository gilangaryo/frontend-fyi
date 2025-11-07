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
        <section className={` ${bg}`}>
            <div
                className={`grid grid-cols-1 md:grid-cols-2  items-center ${reverse ? "md:flex-row-reverse" : ""
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
                        className="object-cover"
                    />
                </div>

                {/* Text */}

                <div
                    className={`flex flex-col  ${subDescription ? "items-start" : "items-center"} justify-start text-left py-20 px-4 space-y-4 text-secondary max-w-md mx-auto ${reverse ? "order-2 md:order-1" : ""
                        }`}
                >
                    {heading && (
                        <h3 className="text-md md:text-xl font-light mb-3">{heading}</h3>
                    )}
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
