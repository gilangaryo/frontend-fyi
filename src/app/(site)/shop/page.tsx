"use client";

import { Suspense } from "react";
import CatalogSection from "../components/shop/CatalogSection";

export default function ShopPage() {
    return (
        <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
            <CatalogSection />
        </Suspense>
    );
}
