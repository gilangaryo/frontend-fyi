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
    variant?: "default" | "third"
}


export default function BlogSection({
    image,
    heading,
    description,
    subDescription,
    reverse = false,
    bg = "",
    variant = "default",
}: BlogSectionProps) {
    if (!image) return null
    const isThird = variant === "third"
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
                    className={`
                    flex flex-col
                    ${isThird ? " items-start justify-start text-left" : "py-20 px-4 items-center justify-center text-center"}
                    text-secondary max-w-xl mx-auto
                    ${reverse ? "order-2 md:order-1" : ""}
                `}
                >

                    {heading && (
                        <h3 className="text-md md:text-xl font-light mb-2">{heading}</h3>
                    )}
                    {description && (
                        <p className={` ${isThird ? "text-secondary-green italic mb-4" : ""} text-sm font-light leading-relaxed max-w-lg`}>{description}</p>
                    )}
                    {subDescription && (
                        <p className="text-sm font-light opacity-70">{subDescription}</p>
                    )}
                </div>


            </div>
        </section>
    )
}
