import type { Metadata } from "next";
import { Poppins } from "next/font/google";
import "./globals.css";
import Providers from "./(site)/providers";
import { Toaster } from "react-hot-toast";
import Script from "next/script";

const siteUrl = "https://fyicouture.com";

const navigationLinks = [
    { name: "Shop", url: `${siteUrl}/shop` },
    { name: "Collection", url: `${siteUrl}/collection` },
    { name: "Story", url: `${siteUrl}/story` },
    { name: "Beyond", url: `${siteUrl}/beyond` },
];

const structuredData = {
    "@context": "https://schema.org",
    "@graph": [
        {
            "@type": "Organization",
            name: "FYI Couture",
            url: siteUrl,
            logo: `${siteUrl}/homepage/logo.png`,
        },
        {
            "@type": "WebSite",
            name: "FYI Couture",
            url: siteUrl,
            potentialAction: {
                "@type": "SearchAction",
                target: `${siteUrl}/shop?search={search_term_string}`,
                "query-input": "required name=search_term_string",
            },
        },
        ...navigationLinks.map((link) => ({
            "@type": "SiteNavigationElement",
            name: link.name,
            url: link.url,
        })),
    ],
};

const poppins = Poppins({
    variable: "--font-poppins",
    subsets: ["latin"],
    weight: ["100", "200", "300", "400", "500", "600", "700", "800", "900"],
});

export const metadata: Metadata = {
    metadataBase: new URL(siteUrl),
    title: {
        default: "FYI Couture",
        template: "%s | FYI Couture",
    },
    description:
        "FYI Couture official website. Explore shop, collections, stories, and beyond.",
    alternates: {
        canonical: "/",
    },
    openGraph: {
        title: "FYI Couture",
        description:
            "Explore shop, collections, stories, and beyond from FYI Couture.",
        url: siteUrl,
        siteName: "FYI Couture",
        type: "website",
    },
    twitter: {
        card: "summary_large_image",
        title: "FYI Couture",
        description:
            "Explore shop, collections, stories, and beyond from FYI Couture.",
    },
    robots: {
        index: true,
        follow: true,
        googleBot: {
            index: true,
            follow: true,
            "max-image-preview": "large",
            "max-snippet": -1,
            "max-video-preview": -1,
        },
    },
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en">
            <body className={`${poppins.variable} antialiased`}>
                <script
                    type="application/ld+json"
                    dangerouslySetInnerHTML={{
                        __html: JSON.stringify(structuredData),
                    }}
                />
                <Script
                    id="fb-pixel"
                    strategy="afterInteractive"
                    dangerouslySetInnerHTML={{
                        __html: `
                            !function(f,b,e,v,n,t,s)
                            {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
                            n.callMethod.apply(n,arguments):n.queue.push(arguments)};
                            if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
                            n.queue=[];t=b.createElement(e);t.async=!0;
                            t.src=v;s=b.getElementsByTagName(e)[0];
                            s.parentNode.insertBefore(t,s)}(window, document,'script',
                            'https://connect.facebook.net/en_US/fbevents.js');
                            fbq('init', '2778931615806540');
                            fbq('track', 'PageView');
                        `,
                    }}
                />
                <Providers>
                    <Toaster
                        position="top-center"
                        toastOptions={{
                            style: {
                                background: "#705A4F",
                                color: "#fff",
                                borderRadius: "8px",
                                padding: "12px 16px",
                            },
                        }}
                    />
                    {children}
                </Providers>
            </body>
        </html>
    );
}
