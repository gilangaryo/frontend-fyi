
export interface User {
    id: string
    name: string
    email: string
    phone?: string | null
    role: string
}


export interface Product {
    id: string
    slug: string
    title: string
    description?: string | null
    price: string
    stock: number
    sku?: string | null
    imageUrl?: string | null
    categoryId?: string | null
    collectionId?: string | null
}


export interface OrderItem {
    id: string
    orderId: string
    productId: string
    quantity: number
    priceAtPurchase: string
    variantId?: string | null
    product: Product
}


export interface Payment {
    status: string
}


export interface Order {
    id: string
    userId: string
    status: string
    total: string
    shippingCost: string
    subTotal: string
    courierCompany?: string | null
    createdAt: string
    user: User
    items: OrderItem[]
    payments: Payment[]
    shippingAddress?: {
        address?: string
        addressDetail?: string
        country?: string
        province?: string
        city?: string
        district?: string
        village?: string
        postalCode?: string
    } | null
}


export interface OrderApi {
    id: string
    userId?: string
    user: {
        name: string
        email: string
        phone?: string | null
        city?: string | null
    }
    giftNote?: string | null
    bytestepShipmentId: string
    status: string
    subTotal?: string
    shippingCost?: string
    total?: string
    courierCompany?: string
    createdAt: string
    items: {
        id: string
        quantity: number
        priceAtPurchase: string
        product: {
            title: string
            imageUrl: string
        }
    }[]
    payments: { status: string }[]
    shippingAddress: {
        address: string
        addressDetails: string
        country: string
        province: string
        city: string
        district?: string
        village?: string
        postalCode?: string
    }
    discount: {
        id: string
        code: string
        type: string
        value: number
    }
    tracking: {
        id: string
        trackingLink: string
        trackingId: string
        courier: string
        estimatedDelivery: string
    }
}


export interface OrderCardData {
    id: string
    customer: string
    product: string
    productImage: string
    location: string
    shipping: string
    createdAt: string
    status: string
    paymentStatus: string
    trackingLink: string
}
