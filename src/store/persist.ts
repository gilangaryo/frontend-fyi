export function saveCartToStorage(cart: unknown) {
    if (typeof window === "undefined") return
    localStorage.setItem("cart", JSON.stringify(cart))
}

export function loadCartFromStorage() {
    if (typeof window === "undefined") return []
    const data = localStorage.getItem("cart")
    return data ? JSON.parse(data) : []
}
