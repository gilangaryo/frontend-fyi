"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { Volume2, VolumeX } from "lucide-react";

export default function About() {
    const videoRefs = useRef<HTMLVideoElement[]>([]);
    const [, setUserInteracted] = useState(false);
    const [hovered, setHovered] = useState(false);
    const [muted, setMuted] = useState(true);

    useEffect(() => {
        const handleInteraction = () => {
            setUserInteracted(true);
            window.removeEventListener("click", handleInteraction);
            window.removeEventListener("touchstart", handleInteraction);
            window.removeEventListener("scroll", handleInteraction);
        };

        window.addEventListener("click", handleInteraction);
        window.addEventListener("touchstart", handleInteraction);
        window.addEventListener("scroll", handleInteraction);

        return () => {
            window.removeEventListener("click", handleInteraction);
            window.removeEventListener("touchstart", handleInteraction);
            window.removeEventListener("scroll", handleInteraction);
        };
    }, []);

    useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach(async (entry) => {
                    const video = entry.target as HTMLVideoElement;

                    if (entry.isIntersecting) {
                        try {
                            video.muted = muted;
                            await video.play();
                        } catch (err) {
                            console.warn("Autoplay blocked:", err);
                            video.muted = true;
                            await video.play().catch(() => { });
                        }
                    } else {
                        video.pause();
                    }
                });
            },
            { threshold: 0.3 }
        );

        videoRefs.current.forEach((video) => {
            if (video) observer.observe(video);
        });

        return () => observer.disconnect();
    }, [muted]);

    const setVideoRef = (el: HTMLVideoElement | null) => {
        if (el && !videoRefs.current.includes(el)) {
            videoRefs.current.push(el);
        }
    };

    const toggleMute = () => {
        const newMuted = !muted;
        setMuted(newMuted);
        videoRefs.current.forEach((video) => {
            video.muted = newMuted;
            if (!newMuted) {
                video.volume = 1;
            }
        });
    };

    return (
        <section className="bg-white px-4 md:px-10">
            <div className="max-w-full grid md:grid-cols-2 gap-2">
                {/* 🖼️ LEFT COLUMN — Image + Overlay Hover */}
                <div className="flex flex-col justify-between">
                    <div
                        className="relative aspect-[4/5] w-full overflow-hidden group cursor-pointer"
                        onMouseEnter={() => setHovered(true)}
                        onMouseLeave={() => setHovered(false)}
                    >
                        <Image
                            src="/homepage/wear.webp"
                            alt="Wear Your Worth Left"
                            fill
                            className="object-cover transition-transform duration-700"
                        />

                        <div
                            className={`absolute inset-0 flex flex-col items-start justify-center bg-white text-gray-700 text-left px-6 transition-opacity duration-400 ${hovered ? "opacity-100" : "opacity-0"
                                }`}
                        >
                            <h2 className="text-2xl font-medium mb-6">Wear Your Worth</h2>

                            <p className="text-sm md:text-base font-light max-w-full leading-relaxed">
                                True self-worth doesn’t scream for attention, demand validation, or seek approval. It moves with quiet certainty. Graceful, unshaken, at ease.
                                <br />
                                <br />
                                The world tells that self-worth is something to prove. That it needs to be louder, bolder, more. Real self-worth isn’t about proving. It’s about owning it gracefully.
                                <br />
                                <br />

                                We create daily couture carrying that presence: intentional, refined, versatile. Pieces that move with you, elevating your worth without crying for validation. Because self-worth isn’t something you perform. It’s something you embody.
                            </p>
                            <h2 className="text-2xl font-medium mt-6">Wear your worth. Day in, day out.</h2>

                        </div>
                    </div>

                    <h2 className="text-2xl font-medium mb-4 mt-6">Wear Your Worth</h2>
                    <div className="text-gray-600 font-light text-sm leading-relaxed max-w-[90%]">
                        <p className="mb-6">
                            True self-worth doesn’t scream for attention, demand validation, or
                            seek approval. It moves with quiet certainty. Graceful, unshaken, at
                            ease.
                        </p>
                        <p>
                            The world tells that self-worth is something to prove. That it needs to
                            be louder, bolder, more. Real self-worth isn’t about proving. It’s about
                            owning it gracefully.
                        </p>
                    </div>
                </div>

                <div className="flex flex-col justify-between">
                    <div className="relative aspect-[4/5] w-full overflow-hidden">
                        <video
                            ref={setVideoRef}
                            muted={muted}
                            loop
                            playsInline
                            autoPlay
                            className="absolute inset-0 w-full h-full object-cover"
                        >
                            <source
                                src="https://cdn.fyicouture.com/videos/wear-your-worth.mp4"
                                type="video/mp4"
                            />
                        </video>

                        <button
                            onClick={toggleMute}
                            className="absolute bottom-7 right-7 bg-white/20 backdrop-blur-xs p-2 rounded-full hover:bg-white/40 transition"
                            aria-label="Toggle sound"
                        >
                            {muted ? (
                                <VolumeX size={21} className="text-white hover:text-gray-800" />
                            ) : (
                                <Volume2 size={21} className="text-white hover:text-gray-800" />
                            )}
                        </button>
                    </div>

                    <div className="text-gray-600 font-light text-sm leading-relaxed">
                        <p className="mb-6 mt-6 md:mt-0">
                            We create daily couture carrying that presence: intentional, refined,
                            versatile. Pieces that move with you, elevating your worth without
                            crying for validation. Because self-worth isn’t something you perform.
                            It’s something you embody.
                        </p>
                        <p className="text-xl md:text-2xl font-semibold">
                            Wear your worth. Day in, day out.
                        </p>
                    </div>
                </div>
            </div>
        </section>
    );
}
