export interface Category {
    id: string;
    title: string;
    slug: string;
    createdAt: string;
    updatedAt: string;
}

export interface Collection {
    id: string;
    title: string;
    slug: string;
    createdAt: string;
    updatedAt: string;
}

export interface Variant {
    id: string;
    size: string;
    color: string | null;
    stock: number;
    sku: string | null;

    measurements?: VariantMeasurement[];

    createdAt: string;
    updatedAt: string;
}

export interface MeasurementField {
    id?: string;
    productId?: string;
    name: string;
    displayName?: string;
    unit?: string | null;
    position?: number;
    createdAt?: string;
    updatedAt?: string;
}

export interface VariantMeasurement {
    id?: string;
    variantId?: string;
    fieldId?: string;
    value: string;
    createdAt?: string;
    updatedAt?: string;
    field?: MeasurementField;
}

export interface ProductImage {
    id: string;
    imageUrl: string;
    isPrimary: boolean;
    isSecondary: boolean;
    createdAt: string;
    updatedAt: string;
}

export interface Product {
    id: string;
    slug: string;
    title: string;
    description: string;
    price: number;
    originalPrice?: number;
    basePrice?: number;
    priceBeforeDiscount?: number;
    discountPercent?: number;
    modelHeight?: number | null;
    modelWeight?: number | null;
    stock: number;
    sku: string | null;
    imageUrl: string;
    details: string;
    delivery: string;
    status: boolean;
    createdAt: string;
    updatedAt: string;
    categoryId: string;
    collectionId: string;
    kainId?: string | null;
    variants: Variant[];
    measurementFields?: MeasurementField[];
    images: ProductImage[];
    category: Category;
    collection: Collection;
    kain?: Kain;
    pricing?: {
        basePrice: number;
        finalPrice: number;
        discountAmount: number;
        appliedPromotions?: Array<{
            id: string;
            kind: string;
            amount: number;
        }>;
    };
}

export interface Kain {
    id: string;
    name: string;
}
