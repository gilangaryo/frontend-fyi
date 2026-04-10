"use client";

import DiscountManager from "@/app/(dashboard)/components/discount/DiscountManager";

interface DiscountTabProps {
    externalOpen?: boolean;
    onExternalOpenChange?: (open: boolean) => void;
}

export default function DiscountTab({
    externalOpen,
    onExternalOpenChange,
}: DiscountTabProps) {
    return (
        <DiscountManager
            embedded
            title="Discount Rules"
            description="Create and edit discount rules directly from the product tab"
            externalOpen={externalOpen}
            onExternalOpenChange={onExternalOpenChange}
        />
    );
}
