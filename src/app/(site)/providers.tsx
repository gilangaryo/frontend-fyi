"use client";

import { useEffect, useRef } from "react";
import { Provider } from "react-redux";
import { makeStore, type AppStore } from "@/store";
import { hydrateCart } from "@/store/cartSlice";

export default function ReduxProvider({
    children,
}: {
    children: React.ReactNode;
}) {
    const storeRef = useRef<AppStore | null>(null);
    if (!storeRef.current) storeRef.current = makeStore();

    // Load persisted cart after mount so server and client render the same initial state.
    useEffect(() => {
        storeRef.current!.dispatch(hydrateCart());
    }, []);

    return <Provider store={storeRef.current}>{children}</Provider>;
}
