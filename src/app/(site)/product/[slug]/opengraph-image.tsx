import { renderOgImage, fetchImageDataUrl, OG_SIZE, OG_CONTENT_TYPE } from "@/lib/og";
import { getImageUrl } from "@/lib/utils";
import { absoluteUrl } from "@/lib/seo";
import { getProductBySlug } from "@/lib/content";

export const alt = "FYI Couture product";
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;

export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = await params;
    const product = await getProductBySlug(slug);
    if (!product) return renderOgImage();

    const primary =
        product.images?.find((i) => i.isPrimary)?.imageUrl ??
        product.images?.[0]?.imageUrl ??
        product.imageUrl;
    const image = await fetchImageDataUrl(absoluteUrl(getImageUrl(primary)));
    const price = product.pricing?.finalPrice ?? product.price;

    return renderOgImage({
        eyebrow: product.collection?.title ?? product.category?.title ?? "FYI Couture",
        title: product.title,
        subtitle: price
            ? `IDR ${Number(price).toLocaleString("id-ID")}`
            : "Shop now at FYI Couture",
        image,
    });
}
