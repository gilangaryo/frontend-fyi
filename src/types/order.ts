
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
        addressLine?: string
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
    shippingAddress?: {
        addressLine?: string
    } | null
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
}
