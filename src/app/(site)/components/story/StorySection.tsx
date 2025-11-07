"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { Volume2, VolumeX } from "lucide-react";
import ScrollReveal from "../ScrollReveal";

export default function StorySection() {
    const videoRefs = useRef<HTMLVideoElement[]>([]);
    const [, setUserInteracted] = useState(false);
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
        <section>
            <ScrollReveal>
                <h2 className="text-secondary text-base md:text-xl font-light text-center mx-auto px-4 md:px-0 py-30 leading-relaxed my-0">
                    We reimagine these fabrics into timeless <br /> couture pieces you can wear and treasure
                </h2>
            </ScrollReveal>

            <ScrollReveal>
                {/* Grid 1 */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-0 md:gap-15 items-center bg-primary ">
                    <div className="relative w-full aspect-[3/4]">
                        <video
                            ref={setVideoRef}
                            loop
                            muted={muted}
                            playsInline
                            className="absolute top-0 left-0 w-full h-full object-cover"
                        >
                            <source
                                src="https://cdn.fyicouture.com/videos/interview-cila-streamable.mp4"
                                type="video/mp4"
                            />
                        </video>

                        {/* Tombol Mute */}
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

                    <div className="flex flex-col justify-center text-center md:text-center space-y-4 max-w-sm md:max-w-md mx-auto text-secondary py-8 px-4">
                        <h3 className="text-2xl md:text-4xl font-light italic mb-2">
                            Self Worth is an Art
                        </h3>
                        <p className="text-lg md:text-xl font-light">We could either neglect it or scream for validation</p>
                        <p className="text-sm leading-normal font-light">
                            FYI believes that self worth is what we can embody everyday. An Indonesian wearable daily couture that highlight our self worth.
                            <br /><br />
                            Wear your worth. Day in day out.
                            <br />
                            FYI. For your Infinity
                        </p>
                    </div>
                </div>
            </ScrollReveal>

            <ScrollReveal>
                {/* Tagline */}
                <h2 className="text-secondary text-base md:text-xl font-light text-center mx-auto py-20 leading-relaxed my-0 max-w-xl px-4 md:px-0">
                    The journey of becoming a woman is a dance of strength and softness, of holding heritage while embracing change
                </h2>
            </ScrollReveal>

            <ScrollReveal>
                {/* Grid 2: Two Images */}
                <div className="grid grid-cols-1 md:grid-cols-2">
                    <div className="relative w-full aspect-[7/6]">
                        <Image src="/story/container1.webp" alt="fyi story 1.1" fill className="object-cover" />
                    </div>
                    <div className="relative w-full aspect-[7/6]">
                        <Image src="/story/container2.webp" alt="fyi story 1.2" fill className="object-cover" />
                    </div>
                </div>

                {/* Tagline */}
                <h2 className="text-secondary text-base md:text-xl font-light text-center mx-auto py-20 leading-relaxed my-0 max-w-xl px-4 md:px-0">
                    The journey of becoming a woman is a dance of strength and softness, of holding heritage while embracing change
                </h2>
            </ScrollReveal>

            <ScrollReveal>
                {/* Grid 3 */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-0 md:gap-15 items-center bg-primary">
                    <div className="flex flex-col justify-center text-center md:text-center space-y-4  max-w-sm md:max-w-md  mx-auto text-secondary py-8 px-4">
                        <h3 className="text-2xl md:text-4xl font-light italic mb-2">Story About FYI &apos; s</h3>
                        <p className="text-lg md:text-xl  font-light">
                            Every woman carries her own journey of becoming, shaped by stories,
                        </p>
                        <p className="text-sm leading-normal font-light">
                            Becoming a woman is not about perfection, but about unfolding. FYI x Kendra Art Space tells the story of women who rise, evolve, and inspire.
                        </p>
                    </div>

                    <div className="relative w-full aspect-[3/4]">
                        <video
                            ref={setVideoRef}
                            loop
                            muted={muted}
                            playsInline
                            className="absolute top-0 left-0 w-full h-full object-cover"
                        >
                            <source src="https://cdn.fyicouture.com/videos/interview-fiona-streamable.mp4" type="video/mp4" />
                        </video>

                        {/* Tombol Mute */}
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
                </div>
            </ScrollReveal>
        </section>
    );
}