"use client";

import Image from "next/image";

export default function WearYourWorthSection() {
    return (
        <section className="px-10 ">
            <div className="grid grid-cols-1 md:grid-cols-2 ">
                {/* Left - Title, short text, small image */}
                <div className="grid grid-cols-1 gap-6 md:gap-10 mb-10 md:mb-0 ">
                    <div className="col-span-1 items-center">
                        <h1 className="text-3xl md:text-5xl font-medium leading-snug mt-20">
                            Wear Your <br /> Worth
                        </h1>
                    </div>

                    <div className="col-span-1">
                        <p className="text-sm font-light leading-relaxed text-secondary max-w-md">
                            True self-worth doesn’t scream for attention, demand validation, or seek approval.
                            It moves with quiet certainty. Graceful, unshaken, at ease.
                        </p>
                    </div>
                    <div className="flex justify-start col-span-1 ">
                        <div className="relative aspect-[3/4] w-120 bottom-0">
                            <Image
                                src="/beyond/worth-small.png"
                                alt="Story small"
                                fill
                                className="object-cover rounded"
                            />
                        </div>
                    </div>
                </div>

                {/* Right - Big image + long paragraph */}
                <div className="grid grid-cols-1 ">
                    {/* Big Image */}
                    <div className="relative aspect-[5/4] w-full mb-0">
                        <Image
                            src="/beyond/worth-big.png"
                            alt="Story big"
                            fill
                            className="object-cover "
                        />
                    </div>

                    {/* Paragraphs */}
                    <div className="text-sm font-light leading-relaxed text-secondary space-y-3 mt-2">
                        <p>
                            The world tells that self-worth is something to prove. That it needs to be louder,
                            bolder, more. Real self-worth isn’t about proving, it’s about owning it gracefully.
                        </p>
                        <p>
                            We create daily couture carrying that presence: intentional, refined, versatile.
                            Pieces that move with you, elevating your worth without crying for validation.
                            Because self-worth isn’t something you perform. It’s something you embody.
                        </p>
                        <p className="font-medium">
                            Wear your worth. Day in, day out.
                        </p>
                    </div>
                </div>
            </div>
        </section>
    );
}
