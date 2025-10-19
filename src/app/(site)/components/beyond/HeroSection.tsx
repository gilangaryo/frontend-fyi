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

            {/* Overlay optional */}
            <div className="absolute inset-0 bg-black/20" />

            {/* Texts positioned */}
            <div className="absolute inset-0 text-white font-light text-5xl">
                <p className="absolute bottom-[55%]  left-[5%] ">Every</p>
                <p className="absolute bottom-[45%]  left-[13%] ">Kain</p>
                <p className="absolute bottom-[30%]  left-[16%] ">Carries</p>
                <p className="absolute bottom-[19%] left-[27%] ">A Story</p>
                <p className="absolute bottom-[19%] right-[5%] ">
                    woven with history
                </p>
            </div>
        </section>
    );
}
