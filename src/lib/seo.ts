import type { Metadata } from "next";

export const SITE_URL = "https://fyicouture.com";
export const SITE_NAME = "FYI Couture";
export const SITE_TAGLINE = "Explore shop, collections, stories, and beyond.";

export const DEFAULT_OG_IMAGE = "/opengraph-image";

export const absoluteUrl = (path = "/") =>
    new URL(path, SITE_URL).toString();

type PageMetaInput = {
    title: string;
    description: string;
    /** Canonical path, e.g. "/shop" */
    path: string;
    /**
     * OG image path/URL. Defaults to the site-wide /opengraph-image.
     * Pass `false` when the route has its own opengraph-image file
     * (Next.js injects that URL, which includes a generated hash suffix).
     */
    image?: string | false;
    type?: "website" | "article";
};

/**
 * Builds consistent canonical + Open Graph + Twitter metadata for a page.
 * og:url always equals the canonical URL (absolute).
 */
export function buildPageMetadata({
    title,
    description,
    path,
    image,
    type = "website",
}: PageMetaInput): Metadata {
    const url = absoluteUrl(path);
    const images =
        image === false
            ? undefined
            : [
                  {
                      url: absoluteUrl(image ?? DEFAULT_OG_IMAGE),
                      width: 1200,
                      height: 630,
                      alt: title,
                  },
              ];

    return {
        title,
        description,
        alternates: { canonical: url },
        openGraph: {
            title: `${title} | ${SITE_NAME}`,
            description,
            url,
            siteName: SITE_NAME,
            type,
            locale: "en_US",
            ...(images && { images }),
        },
        twitter: {
            card: "summary_large_image",
            title: `${title} | ${SITE_NAME}`,
            description,
            ...(images && { images: images.map((i) => i.url) }),
        },
    };
}
