"use client";

import { useRef, useState } from "react";
import { Volume2, VolumeX } from "lucide-react";
import { useFadeInVideo } from "@/app/(site)/components/landing/useFadeInVideo";

const CDN = "https://cdn.fyicouture.com/videos";

export default function About() {
    const videoRef = useRef<HTMLVideoElement>(null);
    const [muted, setMuted] = useState(true);
    const visible = useFadeInVideo(videoRef, { threshold: 0.3 });

    const toggleMute = () => {
        const video = videoRef.current;
        if (!video) return;
        const next = !muted;
        video.muted = next;
        if (!next) {
            video.volume = 1;
            // Unmuting is a user gesture, so play() with sound is allowed here.
            video.play().catch(() => {});
        }
        setMuted(next);
    };

    return (
        <section className="bg-white px-4 md:px-10">
            <div className="max-w-full grid lg:grid-cols-2 gap-2">
                <div className="flex flex-col justify-center bg-white p-8 md:p-12 text-gray-700 h-full w-full">
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
                    <h2 className="text-xl md:text-2xl font-medium mt-6">Wear your worth. Day in, day out.</h2>
                </div>

                <div className="flex flex-col justify-between">
                    <div className="relative aspect-[4/5] w-full overflow-hidden contain-paint bg-white">
                        <video
                            ref={videoRef}
                            muted={muted}
                            loop
                            playsInline
                            preload="none"
                            className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-700 ease-out ${visible ? "opacity-100" : "opacity-0"}`}
                        >
                            <source
                                src={`${CDN}/wear-your-worth-v2.av1.mp4`}
                                type='video/mp4; codecs="av01.0.08M.08"'
                            />
                            <source src={`${CDN}/wear-your-worth.mp4`} type="video/mp4" />
                        </video>

                        <button
                            onClick={toggleMute}
                            className="absolute bottom-7 right-7 bg-white/20 backdrop-blur-xs p-2 rounded-full hover:bg-white/40 transition"
                            aria-label={muted ? "Unmute video" : "Mute video"}
                        >
                            {muted ? (
                                <VolumeX size={21} className="text-white hover:text-gray-800" />
                            ) : (
                                <Volume2 size={21} className="text-white hover:text-gray-800" />
                            )}
                        </button>
                    </div>
                </div>
            </div>
        </section>
    );
}
