"use client";

import { useEffect, useState } from "react";

import HeroSection from "../components/beyond/HeroSection";
import Image from "next/image";
import Link from "next/link";
import { API_BASE } from "@/lib/constants";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination, Autoplay } from "swiper/modules";
import type { Swiper as SwiperType } from "swiper";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import { getImageUrl } from "@/lib/utils";
import Loading from '@/app/(site)/components/Loading'
import { ArrowLeft, ArrowRight } from "lucide-react";

interface Blog {
    id: number;
    slug: string;
    event: string;
    title: string;
    heroImage: string;
    description: string;
    firstDescription: string;
    firstSubDescription: string;
    firstParagraph: string;
    firstQuote: string;

    secondDescription: string;
    secondSubDescription: string;
    secondQuote: string;
    thirdDescription: string;
    thirdSubDescription: string;
    thirdQuote: string;
}

export default function Beyond() {
    const [blogs, setBlogs] = useState<Blog[]>([]);
    const [loading, setLoading] = useState(true);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [swiperInstance, setSwiperInstance] = useState<SwiperType | null>(null);

    useEffect(() => {
        async function fetchBlogs() {
            try {
                const res = await fetch(`${API_BASE}/blog`, { cache: "no-store" });
                const json = await res.json();
                if (json.success) setBlogs(json.data);
            } catch (err) {
                console.error("Error fetching blogs:", err);
            } finally {
                setLoading(false);
            }
        }
        fetchBlogs();
    }, []);

    const handlePrev = () => {
        if (swiperInstance) {
            swiperInstance.slidePrev();
        }
    };

    const handleNext = () => {
        if (swiperInstance) {
            swiperInstance.slideNext();
        }
    };

    return (
        <>
            <HeroSection />

            {loading && (
                <div className="py-20 text-center text-gray-400"><Loading /></div>
            )}

            {!loading && blogs.length > 0 && (
                <section className="bg-white pl-0 md:px-0 py-6 pr-0 md:pr-6 overflow-hidden">
                    <div className="max-w-full mx-auto">
                        <Swiper
                            modules={[Navigation, Pagination, Autoplay]}
                            spaceBetween={50}
                            slidesPerView={1}
                            onSlideChange={(swiper) => {
                                const realIndex = swiper.realIndex;
                                setCurrentIndex(realIndex);
                            }}
                            onSwiper={(swiper) => setSwiperInstance(swiper)}
                            loop={true}
                            speed={700}
                            autoplay={false}
                            pagination={{
                                clickable: true,
                                el: ".swiper-custom-pagination",
                                bulletClass: "swiper-bullet-custom",
                                bulletActiveClass: "swiper-bullet-active-custom",
                                renderBullet: (index, className) => {
                                    return `<span class="${className}"></span>`;
                                },
                            }}
                            breakpoints={{
                                1024: {
                                    spaceBetween: 60,
                                },
                            }}
                        >
                            {blogs.map((blog) => (
                                <SwiperSlide key={blog.id}>
                                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-stretch h-full">
                                        {/* Left: Image */}
                                        <div className="relative w-full aspect-[3/2] lg:aspect-[4/3] overflow-hidden h-full">
                                            <Image
                                                src={getImageUrl(blog.heroImage)}
                                                alt={blog.title}
                                                fill
                                                priority
                                                className="object-cover"
                                            />
                                        </div>

                                        <div className="flex flex-col justify-between h-full mx-6 md:mx-0">
                                            <p className="text-3xl tracking-wider text-secondary mt-4 mb-6 italic font-light">
                                                {blog.event}
                                            </p>
                                            <h2 className=" text-4xl md:text-5xl lg:text-6xl font-light text-secondary leading-tight tracking-tight">
                                                {blog.title}
                                            </h2>
                                            <div className="flex-grow" />
                                            <p className=" text-secondary leading-relaxed mb-20 text-base lg:text-lg font-light text-justify  mt-20 md:mt-0">
                                                {blog.description}
                                            </p>

                                            {/* navigation buttons */}
                                            <div className="mt-auto w-full">
                                                <div className="flex flex-col md:flex-row w-full items-stretch justify-between gap-4">
                                                    {/* Left: navigation arrows + index (centered) */}
                                                    <div className="flex items-center justify-center border-2 border-secondary text-secondary px-6 py-3 md:w-1/2 lg:w-2/7">
                                                        <button
                                                            onClick={handlePrev}
                                                            className="opacity-60 hover:opacity-100 transition cursor-pointer mr-5"
                                                        >
                                                            <ArrowLeft />
                                                        </button>

                                                        <span className="text-sm md:text-base lg:text-xl font-light min-w-[80px] text-center">
                                                            {currentIndex + 1} – {blogs.length}
                                                        </span>

                                                        <button
                                                            onClick={handleNext}
                                                            className="opacity-60 hover:opacity-100 transition cursor-pointer ml-5"
                                                        >
                                                            <ArrowRight />
                                                        </button>
                                                    </div>


                                                    {/* Right: link button */}
                                                    <Link
                                                        href={`/beyond/${blog.slug}`}
                                                        className="flex items-center justify-between bg-secondary text-white px-6 py-4 text-sm leading-relaxed tracking-wide font-light hover:bg-secondary/90 transition w-full md:w-1/2 lg:w-5/7"
                                                    >
                                                        <span>
                                                            See What’s New in Our <br /> Beyond Gallery
                                                        </span>
                                                        <ArrowRight size={50} />
                                                    </Link>
                                                </div>
                                            </div>

                                        </div>

                                    </div>
                                </SwiperSlide>
                            ))}
                        </Swiper>

                        {/* Custom pagination dots */}
                        <style jsx>{`
                            .swiper-custom-pagination {
                                display: flex;
                                justify-content: center;
                                gap: 8px;
                                margin-top: 48px;
                            }

                            .swiper-bullet-custom {
                                width: 8px;
                                height: 8px;
                                background-color: #d1d5db;
                                border-radius: 50%;
                                cursor: pointer;
                                transition: all 0.3s ease;
                            }

                            .swiper-bullet-active-custom {
                                background-color: #78350f;
                                width: 32px;
                                border-radius: 4px;
                            }

                            :global(.swiper-button-prev-custom::before),
                            :global(.swiper-button-next-custom::before) {
                                content: none;
                            }
                        `}</style>

                        <div className="swiper-custom-pagination"></div>
                    </div>
                </section>
            )}

            {!loading && blogs.length === 0 && (
                <div className="py-20 text-center text-gray-500">
                    No blog stories found.
                </div>
            )}

        </>
    );
}