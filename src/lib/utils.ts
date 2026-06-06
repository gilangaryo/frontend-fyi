import { API_BASE } from "@/lib/constants";

export function getImageUrl(path?: string | null): string {
    if (!path) return "/product/dummy.jpg";
    if (path.startsWith("http")) return path;

    let fixedPath = path
        .trim()
        .replace(/^\/+/, "")
        .replace(/^api\//, "");

    if (!fixedPath.startsWith("uploads/")) {
        const knownFolders = [
            "product",
            "collection",
            "category",
            "banner",
            "blog",
            "hero",
        ];
        const folder = knownFolders.find((f) => fixedPath.startsWith(`${f}/`));
        if (folder) fixedPath = `uploads/${fixedPath}`;
        else fixedPath = `uploads/product/${fixedPath}`;
    }

    const cleanUrl = `${API_BASE!.replace(/\/+$/, "")}/${fixedPath.replace(/\/{2,}/g, "/")}`;

    return cleanUrl;
}

export function formatRupiah(value: string | number): string {
    const numStr = String(value).replace(/\D/g, "");
    return numStr.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
}

export function formatPaymentExpiry(
    dateStr: string,
    locale = "id-ID",
): string {
    return new Date(dateStr).toLocaleString(locale, {
        day: "numeric",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
    });
}

export function isPaymentExpired(dateStr: string): boolean {
    return new Date(dateStr).getTime() <= Date.now();
}
