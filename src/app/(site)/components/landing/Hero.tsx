"use client";

export default function Hero() {
    return (
        <section className="relative w-full h-[80vh] md:h-[100vh] flex items-center justify-center overflow-hidden bg-black">
            {/* Background video */}
            <video
                autoPlay
                loop
                muted
                playsInline
                className="absolute top-0 left-0 w-full h-full object-cover"
            >
                <source
                    src="https://cdn.fyicouture.com/videos/fyi-cover.mp4"
                    type="video/mp4"
                />
            </video>
        </section>
    );
}
