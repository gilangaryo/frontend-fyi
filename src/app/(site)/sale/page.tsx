"use client";

import { Suspense } from "react";
import SaleCatalogSection from "../components/shop/SaleCatalogSection";

export default function SalePage() {
    return (
        <Suspense
            fallback={
                <div className="min-h-screen flex items-center justify-center">
                    Loading...
                </div>
            }
        >
            <SaleCatalogSection />
        </Suspense>
    );
}
