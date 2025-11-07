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
    giftNote: string;
}

const isClient = typeof window !== "undefined";

function saveCart(cart: CartItem[], giftNote: string) {
    if (!isClient) return;
    localStorage.setItem("cart", JSON.stringify(cart));
    localStorage.setItem("giftNote", giftNote);
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

function loadGiftNote(): string {
    if (!isClient) return "";
    try {
        return localStorage.getItem("giftNote") || "";
    } catch {
        return "";
    }
}

const initialState: CartState = {
    items: loadCart(),
    giftNote: loadGiftNote(),
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
            saveCart(state.items, state.giftNote);
        },

        removeFromCart: (state, action: PayloadAction<{ id: string; variantId?: string }>) => {
            state.items = state.items.filter(
                (i) => !(i.id === action.payload.id && i.variantId === action.payload.variantId)
            );
            saveCart(state.items, state.giftNote);
        },

        updateQuantity: (
            state,
            action: PayloadAction<{ id: string; variantId?: string; quantity: number }>
        ) => {
            const item = state.items.find(
                (i) => i.id === action.payload.id && i.variantId === action.payload.variantId
            );
            if (item) item.quantity = action.payload.quantity;
            saveCart(state.items, state.giftNote);
        },

        setGiftNote: (state, action: PayloadAction<string>) => {
            state.giftNote = action.payload;
            saveCart(state.items, state.giftNote);
        },

        clearCart: (state) => {
            state.items = [];
            state.giftNote = "";
            saveCart(state.items, state.giftNote);
        },
    },
});

export const { addToCart, removeFromCart, updateQuantity, setGiftNote, clearCart } = cartSlice.actions;
export default cartSlice.reducer;