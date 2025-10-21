'use client'

import Image from 'next/image'
import { useRef } from 'react'
import { Swiper, SwiperSlide } from 'swiper/react'
import { Pagination } from 'swiper/modules'
import type { Swiper as SwiperType } from 'swiper'
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
    const swiperRef = useRef<SwiperType | null>(null)
    const isReversed = index % 2 === 1

    const activeProducts = data.products?.filter((p) => p.status) || []

    return (
        <section
            className={`grid grid-cols-1 lg:grid-cols-2 ${isReversed ? 'lg:[&>*:first-child]:order-2' : ''
                }`}
        >
            {/* LEFT (hero text) */}
            <div className="relative h-svh md:h-[700px] text-white flex flex-col justify-center px-8 md:px-16 lg:px-20 text-center">
                <Image
                    src={getImageUrl(data.heroImage)}
                    alt={data.title}
                    fill
                    className="object-cover "
                />

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
                </div>
            </div>

            {/* RIGHT (carousel + button) */}
            <div className="flex flex-col justify-between bg-white p-4 md:p-6">
                <div className="flex-1 flex flex-col justify-center items-center relative">
                    <div className="flex flex-col items-center text-center mb-6">
                        <p className="font-light text-lg text-secondary max-w-md leading-relaxed">
                            {data.quote}
                        </p>
                    </div>

                    <div className="w-full max-w-[230px] relative">
                        {/* Arrows */}
                        <button
                            onClick={() => swiperRef.current?.slidePrev()}
                            className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-12 text-secondary hover:text-[#6B5435] transition-colors z-10 hidden md:block"
                            aria-label="Previous image"
                        >
                            <Image
                                src="/arrow-left.svg"
                                alt="left arrow"
                                width={36}
                                height={36}
                            />
                        </button>
                        <button
                            onClick={() => swiperRef.current?.slideNext()}
                            className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-12 text-secondary hover:text-[#6B5435] transition-colors z-10 hidden md:block"
                            aria-label="Next image"
                        >
                            <Image
                                src="/arrow-right.svg"
                                alt="left arrow"
                                width={36}
                                height={36}
                            />
                        </button>

                        {/* Swiper */}
                        <Swiper
                            modules={[Pagination]}
                            spaceBetween={0}
                            slidesPerView={1}
                            onSwiper={(swiper) => {
                                swiperRef.current = swiper
                            }}
                            pagination={{
                                clickable: true,
                                el: `#pagination-${data.id || index}`,
                                bulletClass:
                                    'inline-block w-6 h-[4px] rounded-sm bg-gray-400 mx-[1px] cursor-pointer transition-colors',
                                bulletActiveClass: '!bg-secondary',
                            }}
                            loop={activeProducts.length > 1}
                            className="aspect-[3/4] w-full relative overflow-hidden"
                        >
                            {activeProducts.length > 0 ? (
                                activeProducts.flatMap((product) =>
                                    (product.images?.length
                                        ? product.images
                                        : [{ imageUrl: product.imageUrl || '/placeholder.jpg' }]
                                    ).map((img, j) => (
                                        <SwiperSlide key={`${product.id}-${j}`}>
                                            <div className="relative w-full h-full">
                                                <Image
                                                    src={getImageUrl(img.imageUrl)}
                                                    alt={product.title}
                                                    fill
                                                    className="object-cover pointer-events-none"
                                                />
                                            </div>
                                        </SwiperSlide>
                                    ))
                                )
                            ) : (
                                <SwiperSlide>
                                    <div className="relative w-full h-full flex items-center justify-center bg-gray-200 text-gray-500 text-sm">
                                        No product image
                                    </div>
                                </SwiperSlide>
                            )}

                        </Swiper>

                        {/* Pagination dots */}
                        <div
                            id={`pagination-${data.id || index}`}
                            className="flex justify-center gap-2 mt-6"
                        >

                        </div>
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
