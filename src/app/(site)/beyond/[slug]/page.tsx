import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import BlogSection from "@/app/(site)/components/beyond/BlogSection";
import { API_BASE } from "@/lib/constants";
import { getImageUrl } from "@/lib/utils";

interface BlogDetail {
    id: string;
    event: string;
    title: string;
    description: string;
    slug: string;
    date?: string;
    heroImage?: string;
    firstHeaderImage?: string;
    firstHeading?: string;
    firstDescription?: string;
    firstSubDescription?: string;
    secondHeaderImage?: string;
    secondHeading?: string;
    secondDescription?: string;
    secondSubDescription?: string;
    thirdHeaderImage?: string;
    thirdHeading?: string;
    thirdDescription?: string;
    thirdSubDescription?: string;
    fourthHeaderImage?: string;
    fourthHeading?: string;
    fourthDescription?: string;
    fourthSubDescription?: string;
}

async function getBlogDetail(slug: string): Promise<BlogDetail | null> {
    try {
        const res = await fetch(`${API_BASE}/blog/slug/${slug}`, { cache: "no-store" });
        if (!res.ok) return null;
        const json = await res.json();
        return json.data;
    } catch {
        return null;
    }
}

export default async function BeyondDetailPage(props: { params: Promise<{ slug: string }> }) {
    const { slug } = await props.params;
    const blog = await getBlogDetail(slug);
    if (!blog) return notFound();

    return (
        <>

            <section className="relative w-full h-[80vh] md:h-[90vh] overflow-hidden">
                <Image
                    src={getImageUrl(blog.heroImage)}
                    alt={blog.title}
                    fill
                    priority
                    className="object-cover"
                />
                <div className="absolute inset-0 bg-black/20 flex flex-col justify-center items-center text-center text-white px-6 ">
                    <div className="-translate-y-8">
                        <Link href="/beyond" className="text-sm md:text-base mb-4 hover:underline">
                            ← Back to Beyond
                        </Link>
                        <h2 className="text-2xl md:text-4xl font-extralight mb-2">{blog.event}</h2>
                        <h1 className="text-4xl md:text-6xl font-extralight max-w-5xl leading-tight">
                            {blog.title}
                        </h1>
                    </div>

                </div>
            </section>

            <BlogSection
                image={blog.firstHeaderImage}
                heading={blog.firstHeading}
                description={blog.firstDescription}
                subDescription={blog.firstSubDescription}
            />
            <BlogSection
                image={blog.secondHeaderImage}
                heading={blog.secondHeading}
                description={blog.secondDescription}
                subDescription={blog.secondSubDescription}
                reverse
                bg="bg-gray-50"
            />
            <BlogSection
                image={blog.thirdHeaderImage}
                heading={blog.thirdHeading}
                description={blog.thirdDescription}
                subDescription={blog.thirdSubDescription}
            />
            <BlogSection
                image={blog.fourthHeaderImage}
                heading={blog.fourthHeading}
                description={blog.fourthDescription}
                subDescription={blog.fourthSubDescription}
                reverse
                bg="bg-gray-50"
            />

        </>
    );
}
