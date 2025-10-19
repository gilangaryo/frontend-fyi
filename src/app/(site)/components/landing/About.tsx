import Image from "next/image";

export default function About() {
    return (
        <section className="bg-white px-4 md:px-10">
            <div className="max-w-full grid md:grid-cols-2 gap-2">
                {/* Left Column */}
                <div className="flex flex-col justify-between">
                    <div className="relative aspect-[6/7] w-full">
                        <Image
                            src="/homepage/wear.webp"
                            alt="Wear Your Worth Left"
                            fill
                            className="object-cover"
                        />
                    </div>


                    <h2 className="text-2xl font-medium mb-4 mt-6">Wear Your Worth</h2>
                    <div className="text-gray-600 font-light text-sm max-w-10/12 leading-relaxed">
                        <p className="mb-6">
                            True self-worth doesn’t scream for attention, demand validation, or seek approval. It moves with quiet certainty. Graceful, unshaken, at ease.
                        </p>
                        <p >
                            The world tells that self-worth is something to prove. That it needs to be louder, bolder, more. Real self-worth isn’t about proving. It’s about owning it gracefully.
                        </p>
                    </div>

                </div>

                {/* Right Column */}
                <div className="flex flex-col justify-between">
                    <div className="relative aspect-[6/7] w-full overflow-hidden">
                        <video
                            autoPlay
                            loop
                            muted
                            playsInline
                            className="absolute inset-0 w-full h-full object-cover"
                        >
                            <source src="https://cdn.fyicouture.com/videos/wear-your-worth.mp4" type="video/mp4" />
                        </video>
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
