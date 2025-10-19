"use client";

import Link from "next/link";

type ButtonFullProps = {
    label: string;
    href: string;
};

export default function ButtonFull({ label, href }: ButtonFullProps) {
    return (
        <Link
            href={href}
            className="block w-full bg-secondary text-white text-center py-3 md:py-4 font-medium hover:opacity-90 transition"
        >
            {label}
        </Link>
    );
}
