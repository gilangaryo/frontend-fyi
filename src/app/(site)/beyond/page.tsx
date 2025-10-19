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
interface Blog {
    id: number;
    slug: string;
    event: string;
    title: string;
    heroImage: string;
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
                <div className="py-20 text-center text-gray-400">Loading stories...</div>
            )}

            {!loading && blogs.length > 0 && (
                <section className="bg-white py-6 px-4 md:px-6 overflow-hidden">
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
                                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-stretch">
                                        {/* Left: Image */}
                                        <div className="relative w-full aspect-[3/2] lg:aspect-[4/3] overflow-hidden ">
                                            <Image
                                                src={getImageUrl(blog.heroImage)}
                                                alt={blog.title}
                                                fill
                                                priority
                                                className="object-cover"
                                            />
                                        </div>

                                        <div className="flex flex-col justify-between h-full">
                                            <p className="text-3xl tracking-wider text-secondary mt-4 mb-6 italic font-light">
                                                {blog.event}
                                            </p>

                                            <h2 className="text-4xl md:text-5xl lg:text-6xl font-light text-secondary mb-22 leading-tight tracking-tight">
                                                {blog.title}
                                            </h2>

                                            <p className="text-secondary leading-relaxed mb-8 text-base lg:text-lg font-light text-justify indent-33">
                                                {blog.firstDescription}
                                            </p>

                                            <div className="mt-auto flex flex-col sm:flex-row items-start sm:items-center gap-6">
                                                <div className="flex w-5/15 items-center border-2 border-secondary text-secondary h-full justify-center">
                                                    <button
                                                        onClick={handlePrev}
                                                        className="mr-5 opacity-60 hover:opacity-100 transition cursor-pointer"
                                                    >
                                                        <Image
                                                            src="/beyond/arrow-left.svg"
                                                            alt="left arrow"
                                                            width={36}
                                                            height={36}
                                                        />
                                                    </button>
                                                    <div className="text-sm lg:text-xl font-light">
                                                        {currentIndex + 1} – {blogs.length}
                                                    </div>

                                                    <button
                                                        onClick={handleNext}
                                                        className="ml-5 opacity-60 hover:opacity-100 transition cursor-pointer "
                                                    >
                                                        <Image
                                                            src="/beyond/arrow-right.svg"
                                                            alt="left arrow"
                                                            width={36}
                                                            height={36}
                                                        />
                                                    </button>
                                                </div>

                                                <Link
                                                    href={`/beyond/${blog.slug}`}
                                                    className="flex w-10/15 h-full items-center bg-secondary text-white px-5 py-4 text-sm leading-relaxed tracking-wide font-light hover:bg-secondary/90 transition"
                                                >
                                                    See Whats New in Our <br /> Beyond Gallery
                                                    <span className="text-right ml-auto text-lg">
                                                        <Image src="/beyond/arrow-right-white.svg" alt="left arrow" width={36} height={36} />
                                                    </span>
                                                </Link>
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