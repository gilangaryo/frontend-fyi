'use client';

import Link from 'next/link';

export default function NotFound() {
    return (
        <div className="min-h-screen flex flex-col items-center justify-center px-6 py-12 bg-white text-center">
            <div className="relative w-full max-w-sm h-18 mb-8">

            </div>

            <h1 className="text-xl font-semibold text-black mb-2">OOPS!</h1>
            <p className="text-gray-600 mb-6">Page not found</p>

            <Link
                href="/"
                className="px-6 py-3 bg-secondary text-white rounded-md hover:opacity-90 transition"
            >
                Back to Home
            </Link>
        </div>
    );
}
