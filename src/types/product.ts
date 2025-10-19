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

    bust: string | null;
    waist: string | null;
    length: string | null;
    sleeve: string | null;
    height: string | null;

    createdAt: string;
    updatedAt: string;
}

export interface ProductImage {
    id: string;
    imageUrl: string;
    isPrimary: boolean;
    createdAt: string;
    updatedAt: string;
}

export interface Product {
    id: string;
    slug: string;
    title: string;
    description: string;
    price: number;
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
    variants: Variant[];
    images: ProductImage[];
    category: Category;
    collection: Collection;
}

