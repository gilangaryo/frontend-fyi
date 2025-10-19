"use client";

import Image from "next/image";

export default function HeroSection() {
    return (
        <section className="relative h-[calc(100vh-100px)] flex items-center bg-black/25">

            {/* Background image */}
            <Image
                src="/story/header.webp"
                alt="Hero background"
                fill
                priority
                className="-z-10 object-cover object-[center_20%]"
            />


            {/* Content */}
            <div className="relative w-full h-full items-center text-center flex flex-col justify-center px-4 md:px-0 font-light text-white">
                <p className="text-lg mb-6">
                    our story
                </p>
                <h2 className="text-5xl">
                    Wear your Worth
                </h2>
            </div>
        </section>
    );
}
