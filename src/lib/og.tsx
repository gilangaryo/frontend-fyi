import { ImageResponse } from "next/og";
import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { SITE_TAGLINE } from "./seo";

export const OG_SIZE = { width: 1200, height: 630 };
export const OG_CONTENT_TYPE = "image/png";

const BRAND = {
    cream: "#F8F5F2",
    muted: "#E8E2D6",
    brown: "#705A4F",
    charcoal: "#2F2F2F",
};

let logoCache: string | null = null;
async function getLogo() {
    if (!logoCache) {
        const buf = await readFile(join(process.cwd(), "public", "logo-fyi.png"));
        logoCache = `data:image/png;base64,${buf.toString("base64")}`;
    }
    return logoCache;
}

/** Fetch a remote image as a data URL. Satori can't render webp/avif, so those are skipped. */
export async function fetchImageDataUrl(url?: string | null) {
    if (!url) return null;
    try {
        const res = await fetch(url, { signal: AbortSignal.timeout(5000) });
        if (!res.ok) return null;
        const type = res.headers.get("content-type") ?? "";
        if (!/image\/(png|jpe?g|gif)/i.test(type)) return null;
        const buf = Buffer.from(await res.arrayBuffer());
        return `data:${type};base64,${buf.toString("base64")}`;
    } catch {
        return null;
    }
}

type OgOptions = {
    eyebrow?: string;
    title?: string;
    subtitle?: string;
    image?: string | null;
};

export async function renderOgImage({
    eyebrow = "FYI COUTURE",
    title = "Couture, made personal.",
    subtitle = SITE_TAGLINE,
    image,
}: OgOptions = {}) {
    const logo = await getLogo();
    const clamp = (s: string, n: number) =>
        s.length > n ? `${s.slice(0, n - 1).trimEnd()}…` : s;

    return new ImageResponse(
        (
            <div
                style={{
                    width: "100%",
                    height: "100%",
                    display: "flex",
                    background: BRAND.cream,
                    fontFamily: "sans-serif",
                }}
            >
                <div
                    style={{
                        flex: 1,
                        display: "flex",
                        flexDirection: "column",
                        justifyContent: "space-between",
                        padding: "64px 72px",
                        borderLeft: `16px solid ${BRAND.brown}`,
                    }}
                >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={logo} width={155} height={110} alt="" />
                    <div style={{ display: "flex", flexDirection: "column" }}>
                        <div
                            style={{
                                fontSize: 24,
                                letterSpacing: 6,
                                color: BRAND.brown,
                                marginBottom: 20,
                            }}
                        >
                            {eyebrow.toUpperCase()}
                        </div>
                        <div
                            style={{
                                fontSize: image ? 58 : 76,
                                lineHeight: 1.1,
                                color: BRAND.charcoal,
                                fontWeight: 300,
                            }}
                        >
                            {clamp(title, 70)}
                        </div>
                        <div
                            style={{
                                fontSize: 28,
                                lineHeight: 1.4,
                                color: BRAND.brown,
                                marginTop: 24,
                            }}
                        >
                            {clamp(subtitle, 110)}
                        </div>
                    </div>
                    <div
                        style={{
                            display: "flex",
                            fontSize: 24,
                            color: BRAND.charcoal,
                            letterSpacing: 2,
                        }}
                    >
                        fyicouture.com
                    </div>
                </div>
                {image ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                        src={image}
                        width={460}
                        height={630}
                        alt=""
                        style={{ objectFit: "cover" }}
                    />
                ) : (
                    <div
                        style={{
                            width: 360,
                            display: "flex",
                            background: BRAND.brown,
                            alignItems: "center",
                            justifyContent: "center",
                        }}
                    >
                        <div
                            style={{
                                width: 220,
                                height: 380,
                                border: `2px solid ${BRAND.muted}`,
                                display: "flex",
                            }}
                        />
                    </div>
                )}
            </div>
        ),
        { ...OG_SIZE },
    );
}
