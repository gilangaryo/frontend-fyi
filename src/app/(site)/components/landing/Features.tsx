import Image from "next/image";
import Link from "next/link";

const categories = [
    {
        id: 1,
        name: "Dresses",
        slug: "dresses",
        image: "/categories/dress-new.webp",
    },
    {
        id: 2,
        name: "Bottom",
        slug: "bottom",
        image: "/categories/bottom-new.webp",
    },
    {
        id: 3,
        name: "Outer",
        slug: "outer",
        image: "/categories/outer-new.webp",
    },
];

export default function Features() {
    return (
        <section className="px-4 pb-8 md:px-10 md:pb-12 bg-white">
            <div className="max-w-full mx-auto">
                <div className="grid md:grid-cols-3 gap-2">
                    {categories.map((cat) => (
                        <Link
                            key={cat.id}
                            href={`/shop?category=${encodeURIComponent(cat.slug)}`}
                            className="relative group overflow-hidden block"
                            aria-label={`Shop ${cat.name}`}
                        >
                            <div className="relative aspect-[4/6] w-full">
                                <Image
                                    src={cat.image}
                                    alt={cat.name}
                                    fill
                                    sizes="(max-width: 768px) 100vw, 33vw"
                                    quality={85}
                                    className="object-cover"
                                />
                            </div>

                            <div className="absolute top-2/5 -translate-y-1/2 left-3">
                                <span className="text-white text-4xl font-light tracking-wider [writing-mode:vertical-rl] rotate-180">
                                    {cat.name}
                                </span>
                            </div>
                            <div className="absolute bottom-5 left-1/2 -translate-x-1/2">
                                <span className="text-white text-xl font-medium underline underline-offset-2 transition">
                                    See all
                                </span>
                            </div>
                            <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-50 transition" />
                        </Link>
                    ))}
                </div>
            </div>
        </section>
    );
}
