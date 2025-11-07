"use client";

import Image from "next/image";

export default function HeroSection() {
    return (
        <section className="relative h-[calc(100vh-90px)]">
            {/* Background image */}
            <Image
                src="/beyond/hero-beyond.webp"
                alt="Hero background"
                fill
                priority
                className="-z-10 object-cover"
            />

            {/* Overlay */}
            <div className="absolute inset-0 bg-black/20" />

            {/* Desktop Texts */}
            <div className="absolute inset-0 text-white font-light text-5xl hidden md:block">
                <p className="absolute bottom md:bottom-[55%] md:left-[5%]">Where</p>
                <p className="absolute md:bottom-[45%] md:left-[13%]">Couture</p>
                <p className="absolute md:bottom-[30%] md:left-[24%]">Meets</p>
                <p className="absolute md:bottom-[19%] md:left-[34%]">Art</p>
                <p className="absolute md:bottom-[19%] md:right-[5%]">
                    Beyond Fashion
                </p>
            </div>

            {/* Mobile Texts */}
            <div className="absolute inset-0 text-white font-light text-3xl gap-1 px-4 text-center md:hidden">
                <p className="absolute bottom-[66%] left-[10%]">Where</p>
                <p className="absolute bottom-[57%] left-[18%]">Couture</p>
                <p className="absolute bottom-[48%] left-[64%]">Meets</p>
                <p className="absolute bottom-[37%] left-[10%]">Art</p>
                <p className="absolute bottom-[25%] left-[16%]">
                    Beyond Fashion
                </p>
            </div>
        </section>
    );
}
