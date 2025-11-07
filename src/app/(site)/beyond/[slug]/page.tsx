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

    imageDivider?: string;
    quote?: string;
    firstFooterImage?: string;
    secondFooterImage?: string;
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
                        <Link href="/beyond" className="text-sm md:text-base mb-6 hover:underline ">
                            ← Back to Beyond
                        </Link>
                        <h2 className="text-4xl md:text-5xl font-extralight  mt-4">
                            {blog.event}:
                        </h2>
                        <h1 className="text-4xl md:text-5xl font-extralight max-w-5xl leading-tight">
                            {blog.title}
                        </h1>
                    </div>

                </div>
            </section>
            <section className="relative w-full py-24 flex flex-col items-center justify-center text-center font-light text-md md:text-2xl">
                <h2 className="mb-2">{blog.event}</h2>
                <h1 className=" ">{blog.title}</h1>
            </section>

            {/* first blog section */}
            <BlogSection
                image={blog.firstHeaderImage}
                heading={blog.firstHeading}
                description={blog.firstDescription}
                subDescription={blog.firstSubDescription}
            />
            {/* second blog section */}
            <BlogSection
                image={blog.secondHeaderImage}
                heading={blog.secondHeading}
                description={blog.secondDescription}
                subDescription={blog.secondSubDescription}
                reverse
                bg="bg-gray-50"
            />

            {/* BARU  */}
            <Image
                src={getImageUrl(blog.imageDivider) || blog.imageDivider || ""}
                alt="dummy"
                width={10}
                height={10}
                sizes="100vw"
                className="w-full aspect-[3/1] object-cover my-30"
            />

            <section >
                <div
                    className={`grid grid-cols-1 md:grid-cols-2  items-center `}
                >
                    {/* Image */}
                    <div
                        className={`relative w-full aspect-[3/4]`}
                    >
                        <Image
                            src={getImageUrl(blog.thirdHeaderImage)}
                            alt={blog.thirdHeading || "Blog section image"}
                            fill
                            className="object-cover"
                        />
                    </div>

                    {/* Text */}


                    <div
                        className={` flex flex-col items-start justify-start text-left text-secondary max-w-xl mx-auto`}
                    >

                        {blog.thirdHeading && (
                            <h3 className="text-md md:text-xl font-light mb-2">{blog.thirdHeading}</h3>
                        )}
                        {blog.thirdDescription && (
                            <p className={` text-secondary-green italic mb-4 text-sm font-light leading-relaxed max-w-lg`}>{blog.thirdDescription}</p>
                        )}
                        {blog.thirdSubDescription && (
                            <p className="text-sm font-light opacity-70">{blog.thirdSubDescription}</p>
                        )}
                    </div>


                </div>
            </section>

            {/* BARUU */}
            <section className="relative max-w-5xl w-full mx-auto py-24 px-6 flex flex-col items-center justify-center text-center font-light text-lg md:text-2xl leading-relaxed text-secondary">
                <h1>{blog.quote}</h1>
            </section>


            {/* BARU  */}
            <div className="grid grid-cols-1 md:grid-cols-2 mb-20">
                <Image
                    src={getImageUrl(blog.firstFooterImage) || getImageUrl(blog.firstFooterImage) || ''}
                    alt="firstFooterImage"
                    width={800}
                    height={400}
                    sizes="100vw"
                    className="w-full aspect-[1/1] object-cover"
                />
                <Image
                    src={getImageUrl(blog.secondFooterImage) || getImageUrl(blog.secondFooterImage) || ''}
                    alt="secondFooterImage"
                    width={800}
                    height={400}
                    sizes="100vw"
                    className="w-full aspect-[1/1] object-cover"
                />
            </div>




        </>
    );
}
