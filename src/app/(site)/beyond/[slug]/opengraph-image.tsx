import { renderOgImage, fetchImageDataUrl, OG_SIZE, OG_CONTENT_TYPE } from "@/lib/og";
import { getImageUrl } from "@/lib/utils";
import { absoluteUrl } from "@/lib/seo";
import { getBlogDetail } from "@/lib/content";

export const alt = "FYI Couture — Beyond";
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;

export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = await params;
    const blog = await getBlogDetail<{ title: string; event?: string; heroImage?: string }>(slug);
    if (!blog) return renderOgImage();

    const image = await fetchImageDataUrl(absoluteUrl(getImageUrl(blog.heroImage)));
    return renderOgImage({
        eyebrow: blog.event || "Beyond",
        title: blog.title,
        subtitle: "Read the story on FYI Couture Beyond",
        image,
    });
}
