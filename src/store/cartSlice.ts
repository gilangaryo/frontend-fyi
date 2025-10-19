"use client";

import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export interface CartItem {
    id: string;
    title: string;
    variantId?: string;
    price: number;
    quantity: number;
    imageUrl: string;
    size?: string;
    color?: string | null;
}

interface CartState {
    items: CartItem[];
}

const isClient = typeof window !== "undefined";

function saveCart(cart: CartItem[]) {
    if (!isClient) return;
    localStorage.setItem("cart", JSON.stringify(cart));
}

function loadCart(): CartItem[] {
    if (!isClient) return [];
    try {
        const data = localStorage.getItem("cart");
        return data ? JSON.parse(data) : [];
    } catch {
        return [];
    }
}

const initialState: CartState = {
    items: loadCart(),
};

const cartSlice = createSlice({
    name: "cart",
    initialState,
    reducers: {
        addToCart: (state, action: PayloadAction<CartItem>) => {
            const existing = state.items.find(
                (i) => i.id === action.payload.id && i.variantId === action.payload.variantId
            );
            if (existing) {
                existing.quantity += action.payload.quantity;
            } else {
                state.items.push(action.payload);
            }
            saveCart(state.items);
        },

        removeFromCart: (state, action: PayloadAction<{ id: string; variantId?: string }>) => {
            state.items = state.items.filter(
                (i) => !(i.id === action.payload.id && i.variantId === action.payload.variantId)
            );
            saveCart(state.items);
        },

        updateQuantity: (
            state,
            action: PayloadAction<{ id: string; variantId?: string; quantity: number }>
        ) => {
            const item = state.items.find(
                (i) => i.id === action.payload.id && i.variantId === action.payload.variantId
            );
            if (item) item.quantity = action.payload.quantity;
            saveCart(state.items);
        },

        clearCart: (state) => {
            state.items = [];
            saveCart(state.items);
        },
    },
});

export const { addToCart, removeFromCart, updateQuantity, clearCart } = cartSlice.actions;
export default cartSlice.reducer;
