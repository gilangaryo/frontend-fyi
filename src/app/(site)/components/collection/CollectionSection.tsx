'use client'

import Image from 'next/image'
// import { useRef } from 'react'
// import { Swiper, SwiperSlide } from 'swiper/react'
// import { Pagination } from 'swiper/modules'
// import type { Swiper as SwiperType } from 'swiper'
import ButtonFull from '../ButtonFull'

// Import Swiper styles
import 'swiper/css'
import 'swiper/css/pagination'
import { getImageUrl } from '@/lib/utils'

interface ProductImage {
    imageUrl: string
    isPrimary: boolean
}

interface Product {
    id: string
    title: string
    imageUrl: string
    slug: string
    status: boolean
    images?: ProductImage[]
}

interface CollectionData {
    id: string
    heroImage: string
    title: string
    description: string
    subDescription: string
    quote: string
    slug: string
    products: Product[]
}

export default function CollectionSection({
    data,
    index,
}: {
    data: CollectionData
    index: number
}) {
    // const swiperRef = useRef<SwiperType | null>(null)
    // const activeProducts = data.products?.filter((p) => p.status) || []

    const isReversed = index % 2 === 1
    const heroHeightClass =
        index === 0
            ? 'min-h-[60vh] md:min-h-[calc(100vh-140px)]'
            : 'min-h-[60vh] md:min-h-screen'
    const scrollMarginTop = index === 0 ? 'scroll-mt-50' : 'scroll-mt-0'
    return (
        <section
            id={data.slug}
            className={` ${scrollMarginTop} grid grid-cols-1 lg:grid-cols-2 ${isReversed ? 'lg:[&>*:first-child]:order-2' : ''
                }`}
        >

            {/* LEFT (hero text) */}
            <div
                className={`relative ${heroHeightClass} text-white flex flex-col justify-center px-8 md:px-16 lg:px-20 text-center bg-gray-100`}
            >
                <Image
                    src={getImageUrl(data.heroImage)}
                    alt={data.title}
                    fill
                    className="object-cover "
                />
                {/* 
                <div className="relative z-10 font-thin">
                    <h2 className="text-3xl md:text-[64px] font-extralight mb-6">
                        {data.title}
                    </h2>
                    <p className="text-sm leading-relaxed max-w-md mx-auto">
                        {data.description}
                    </p>
                    {data.subDescription && (
                        <p className="text-sm leading-relaxed mt-4 max-w-md mx-auto">
                            {data.subDescription}
                        </p>
                    )}
                </div> */}
            </div>

            {/* RIGHT (carousel + button) */}
            <div className="flex flex-col justify-between bg-white p-6 md:mb-0">
                <div className="flex-1 flex flex-col justify-center items-center relative mb-10">
                    <div className="relative z-10 font-light text-secondary text-center">
                        <h2 className="text-3xl md:text-[48px] font-extralight mb-6">
                            {data.title}
                        </h2>
                        <p className="text-xs leading-relaxed max-w-xl  md:mx-auto">
                            {data.description}
                        </p>
                        {data.subDescription && (
                            <p className="text-xs leading-relaxed mt-4 max-w-xl mx-auto">
                                {data.subDescription}
                            </p>
                        )}
                    </div>
                </div>

                {/* Button */}
                <div>
                    <ButtonFull
                        label="Go to Collection"
                        href={`/shop?collection=${data.slug}`}
                    />
                </div>
            </div>
        </section>
    )
}
