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
                <p className="absolute bottom-[55%] left-[5%]">Every</p>
                <p className="absolute bottom-[45%] left-[13%]">Kain</p>
                <p className="absolute bottom-[30%] left-[16%]">Carries</p>
                <p className="absolute bottom-[19%] left-[27%]">A Story</p>
                <p className="absolute bottom-[19%] right-[5%]">
                    woven with history
                </p>
            </div>

            {/* Mobile Texts */}
            <div className="absolute inset-0 flex flex-col justify-center items-center text-white font-light text-3xl gap-1 px-4 text-center md:hidden">
                <p>Every</p>
                <p>Kain</p>
                <p>Carries</p>
                <p>A Story</p>
                <p className="text-sm uppercase tracking-wider mt-3 opacity-80">
                    woven with history
                </p>
            </div>
        </section>
    );
}
