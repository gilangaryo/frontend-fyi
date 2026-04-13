"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { useSelector, useDispatch } from "react-redux";
import { RootState } from "@/store";
import { clearCart } from "@/store/cartSlice";
import { API_BASE } from "@/lib/constants";
import { getImageUrl } from "@/lib/utils";
import AddressSelector from "../components/checkout/AddressSelector";
import { Gift, Tag } from "lucide-react";
import toast from "react-hot-toast";
import { Product } from "@/types/product";
import VoucherPicker, {
    EligiblePromotion,
} from "../components/checkout/VoucherPicker";

interface AppliedPromotion {
    id: string;
    code: string;
    title: string;
    kind: string;
    amount: number;
    autoApply?: boolean;
}

interface PricingItem {
    variantId: string;
    baseUnitPrice: number;
    effectiveUnitPrice: number;
}

interface PricingPreview {
    items?: PricingItem[];
    summary?: {
        totalDiscount: number;
        payableSubtotal: number;
    };
    promotions?: {
        applied?: AppliedPromotion[];
        rejected?: Array<{
            title?: string;
            code?: string;
            kind?: string;
            reason?: string;
            autoApply?: boolean;
        }>;
    };
}

const ITEM_LEVEL_KINDS = ["COLLECTION_DISCOUNT"];
const CART_LEVEL_KINDS = ["MINIMUM_PURCHASE_DISCOUNT", "MINIMUM_QTY_DISCOUNT"];

function formatCurrency(amount: number) {
    return `IDR ${amount.toLocaleString("id-ID")}`;
}

function getPromotionKindLabel(kind: string) {
    switch (kind) {
        case "MINIMUM_PURCHASE_DISCOUNT":
            return "Min. Purchase";
        case "MINIMUM_QTY_DISCOUNT":
            return "Min. Quantity";
        case "COLLECTION_DISCOUNT":
            return "Collection";
        case "SPECIFIC_PRODUCT_DISCOUNT":
            return "Product";
        default:
            return kind.toLowerCase().replace(/_/g, " ");
    }
}

function getProductDisplayPrices(product: Product) {
    const pricingBase = Number(product.pricing?.basePrice);
    const pricingFinal = Number(product.pricing?.finalPrice);

    if (
        Number.isFinite(pricingBase) &&
        Number.isFinite(pricingFinal) &&
        pricingBase > pricingFinal
    ) {
        return { displayPrice: pricingFinal, originalPrice: pricingBase };
    }

    const fallbackOriginal = [
        product.originalPrice,
        product.basePrice,
        product.priceBeforeDiscount,
    ]
        .map((value) => Number(value))
        .find(
            (value) => Number.isFinite(value) && value > Number(product.price),
        );

    return {
        displayPrice: Number(product.price),
        originalPrice: fallbackOriginal,
    };
}

export default function CheckoutPage() {
    const dispatch = useDispatch();
    const [mounted, setMounted] = useState(false);
    const [loading, setLoading] = useState(false);
    const [storeOpen, setStoreOpen] = useState<boolean | null>(null);

    // Voucher picker state
    const [availablePromos, setAvailablePromos] = useState<EligiblePromotion[]>(
        [],
    );
    const [availableLoading, setAvailableLoading] = useState(false);

    // Selected voucher IDs (max 1 per group)
    const [selectedItemLevelId, setSelectedItemLevelId] = useState<
        string | null
    >(null);
    const [selectedCartLevelId, setSelectedCartLevelId] = useState<
        string | null
    >(null);

    // Pricing preview based on selections
    const [activePricing, setActivePricing] = useState<PricingPreview | null>(
        null,
    );
    const [pricingLoading, setPricingLoading] = useState(false);

    const [productPricingMap, setProductPricingMap] = useState<
        Record<string, { displayPrice: number; originalPrice?: number }>
    >({});

    const cartItems = useSelector((state: RootState) => state.cart.items);
    const giftNote = useSelector((state: RootState) => state.cart.giftNote);

    // Fetch live product pricing to reflect auto-applied specific-product discounts
    useEffect(() => {
        if (cartItems.length === 0) {
            setProductPricingMap({});
            return;
        }
        const uniqueProductIds = [...new Set(cartItems.map((item) => item.id))];
        const map: Record<
            string,
            { displayPrice: number; originalPrice?: number }
        > = {};
        Promise.all(
            uniqueProductIds.map(async (productId) => {
                try {
                    const res = await fetch(
                        `${API_BASE}/products/${productId}`,
                    );
                    const json = await res.json();
                    if (json.success && json.data) {
                        map[productId] = getProductDisplayPrices(
                            json.data as Product,
                        );
                    }
                } catch {
                    // ignore
                }
            }),
        ).then(() => setProductPricingMap(map));
    }, [cartItems]);

    // Full product price subtotal (before any discount, for strikethrough when voucher active)
    const baseSubtotal = cartItems.reduce(
        (sum, item) =>
            sum +
            (productPricingMap[item.id]?.originalPrice ??
                productPricingMap[item.id]?.displayPrice ??
                item.price) *
                item.quantity,
        0,
    );
    // Specific-product-discount-aware subtotal (baseline when no explicit voucher)
    const subtotal = cartItems.reduce(
        (sum, item) =>
            sum +
            (productPricingMap[item.id]?.displayPrice ?? item.price) *
                item.quantity,
        0,
    );

    const discountAmount = activePricing?.summary?.totalDiscount ?? 0;
    const total = activePricing?.summary?.payableSubtotal ?? subtotal;
    const pricedItems = Object.fromEntries(
        (activePricing?.items || []).map((item) => [item.variantId, item]),
    );
    const appliedDiscounts = activePricing?.promotions?.applied ?? [];

    const estimatePromoAmount = (p: EligiblePromotion) =>
        p.type === "PERCENT" ? (p.value / 100) * subtotal : p.value;

    const itemLevelPromos = availablePromos
        .filter((p) => ITEM_LEVEL_KINDS.includes(p.kind))
        .sort((a, b) => estimatePromoAmount(b) - estimatePromoAmount(a));
    const cartLevelPromos = availablePromos
        .filter((p) => CART_LEVEL_KINDS.includes(p.kind))
        .sort((a, b) => estimatePromoAmount(b) - estimatePromoAmount(a));

    const selectedIds = [selectedItemLevelId, selectedCartLevelId].filter(
        Boolean,
    ) as string[];

    // Fetch available (eligible) promos when cart changes
    useEffect(() => {
        if (cartItems.length === 0) {
            setAvailablePromos([]);
            setActivePricing(null);
            setSelectedItemLevelId(null);
            setSelectedCartLevelId(null);
            return;
        }
        let cancelled = false;
        setAvailableLoading(true);
        fetch(`${API_BASE}/discounts/available`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                items: cartItems.map((item) => ({
                    productId: item.id,
                    variantId: item.variantId,
                    quantity: item.quantity,
                })),
            }),
        })
            .then((res) => res.json())
            .then((data) => {
                if (!cancelled) {
                    setAvailablePromos(
                        data.success
                            ? (data.data as EligiblePromotion[]).filter(
                                  (promo) =>
                                      promo.kind !==
                                      "SPECIFIC_PRODUCT_DISCOUNT",
                              )
                            : [],
                    );
                }
            })
            .catch(() => {
                if (!cancelled) setAvailablePromos([]);
            })
            .finally(() => {
                if (!cancelled) setAvailableLoading(false);
            });
        return () => {
            cancelled = true;
        };
    }, [cartItems]);

    // Re-validate pricing whenever selected IDs change
    useEffect(() => {
        if (cartItems.length === 0) return;
        if (selectedIds.length === 0) {
            setActivePricing(null);
            return;
        }
        let cancelled = false;
        setPricingLoading(true);
        fetch(`${API_BASE}/discounts/validate`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                discountIds: selectedIds,
                items: cartItems.map((item) => ({
                    productId: item.id,
                    variantId: item.variantId,
                    quantity: item.quantity,
                })),
            }),
        })
            .then((res) => res.json())
            .then((data) => {
                if (!cancelled) {
                    setActivePricing(
                        data.success ? (data.data as PricingPreview) : null,
                    );
                }
            })
            .catch(() => {
                if (!cancelled) setActivePricing(null);
            })
            .finally(() => {
                if (!cancelled) setPricingLoading(false);
            });
        return () => {
            cancelled = true;
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [selectedItemLevelId, selectedCartLevelId, cartItems]);

    // Reset voucher selections when cart changes
    useEffect(() => {
        setSelectedItemLevelId(null);
        setSelectedCartLevelId(null);
        setActivePricing(null);
    }, [cartItems]);

    useEffect(() => setMounted(true), []);

    useEffect(() => {
        (async () => {
            try {
                const res = await fetch(`${API_BASE}/setting/store-status`);
                const json = await res.json();
                if (json.success) {
                    setStoreOpen(json.data.isOpen);
                } else {
                    setStoreOpen(true);
                }
            } catch (err) {
                console.error("Failed to fetch store status:", err);
                setStoreOpen(true);
            }
        })();
    }, []);

    const [form, setForm] = useState({
        email: "",
        firstName: "",
        lastName: "",
        address: "",
        apartment: "",
        province: "",
        city: "",
        district: "",
        village: "",
        postalCode: "",
        phone: "",
        country: "Indonesia",
        paymentMethod: "",
    });

    const isFormValid =
        form.email &&
        form.firstName &&
        form.lastName &&
        form.address &&
        form.province &&
        form.city &&
        form.district &&
        form.village &&
        form.postalCode &&
        form.phone &&
        cartItems.length > 0;

    const handleChange = (
        e: React.ChangeEvent<
            HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
        >,
    ) => {
        const { name, value } = e.target;
        setForm((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!isFormValid) {
            toast.error("Please complete all required fields before checkout.");
            // alert('⚠️ Please complete all required fields before checkout.')
            return;
        }
        if (storeOpen === false) {
            toast.error(
                "The store is currently closed. You cannot place an order right now.",
            );
            return;
        }

        setLoading(true);
        try {
            const basePayload = {
                email: form.email,
                name: `${form.firstName} ${form.lastName}`.trim(),
                phone: form.phone,
                items: cartItems.map((item) => ({
                    productId: item.id,
                    variantId: item.variantId,
                    quantity: item.quantity,
                })),
                shipping: {
                    courier_company: null,
                    courier_type: null,
                    delivery_type: null,
                    order_note: null,
                },
                giftNote: giftNote || null,
                discountId: selectedIds[0] || null,
                discountIds: selectedIds,
                promoCodes: [],
            };

            let payload: unknown;
            if (form.country === "Indonesia") {
                payload = {
                    ...basePayload,
                    address: {
                        country: form.country,
                        address: form.address,
                        apartment: form.apartment,
                        province: form.province,
                        city: form.city,
                        district: form.district,
                        village: form.village,
                        postalCode: form.postalCode,
                    },
                };
            } else {
                payload = {
                    ...basePayload,
                    address: {
                        country: form.country,
                        city: form.city,
                        postalCode: form.postalCode,
                        address: form.address,
                        apartment: form.apartment,
                    },
                };
            }

            const endpoint =
                form.country === "Indonesia"
                    ? `${API_BASE}/orders`
                    : `${API_BASE}/orders/international`;

            const res = await fetch(endpoint, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            });

            const data = await res.json();

            if (!res.ok)
                throw new Error(data.message || "Failed to create order");

            if (data.data?.payment_link) {
                window.location.href = data.data.payment_link;
            } else {
                toast.error("Error creating order. Please try again.");
            }

            dispatch(clearCart());
        } catch (err) {
            const message =
                err instanceof Error
                    ? err.message
                    : typeof err === "string"
                      ? err
                      : "Failed to checkout";

            toast.error(message);
        } finally {
            setLoading(false);
        }
    };

    if (!mounted)
        return (
            <div className="min-h-screen flex items-center justify-center text-gray-500">
                Loading checkout...
            </div>
        );

    if (storeOpen === null)
        return (
            <div className="min-h-screen flex items-center justify-center text-gray-500">
                Checking store status...
            </div>
        );

    return (
        <div className="min-h-screen bg-white">
            <div className="max-w-full mx-auto px-6 py-4 md:px-15 md:py-10 grid grid-cols-1 lg:grid-cols-2 gap-10 ">
                {/* LEFT SIDE */}
                <form onSubmit={handleSubmit} className="space-y-8">
                    {/* Contact */}
                    <div>
                        <h2 className="text-lg font-semibold mb-3">Contact</h2>
                        <input
                            type="email"
                            name="email"
                            placeholder="Email address"
                            value={form.email}
                            onChange={handleChange}
                            required
                            className="w-full border border-gray-300 rounded-md p-3 focus:ring-1 focus:ring-black"
                        />
                    </div>

                    {/* Delivery */}
                    <div>
                        <h2 className="text-lg font-semibold mb-3">Delivery</h2>

                        <select
                            name="country"
                            value={form.country}
                            onChange={handleChange}
                            className="w-full border border-gray-300 rounded-md p-3 mb-3"
                        >
                            <option value="Indonesia">Indonesia</option>
                            <option value="Singapore">Singapore</option>
                            <option value="Malaysia">Malaysia</option>
                            <option value="Other">Other</option>
                        </select>

                        <div className="grid grid-cols-2 gap-3 mb-3">
                            <input
                                type="text"
                                name="firstName"
                                placeholder="First Name"
                                value={form.firstName}
                                onChange={handleChange}
                                className="border border-gray-300 rounded-md p-3"
                            />
                            <input
                                type="text"
                                name="lastName"
                                placeholder="Last Name"
                                value={form.lastName}
                                onChange={handleChange}
                                className="border border-gray-300 rounded-md p-3"
                            />
                        </div>

                        <input
                            type="text"
                            name="address"
                            placeholder="Street Address"
                            value={form.address}
                            onChange={handleChange}
                            className="w-full border border-gray-300 rounded-md p-3 mb-3"
                        />
                        <input
                            type="text"
                            name="apartment"
                            placeholder="Apartment, suite, etc. (optional)"
                            value={form.apartment}
                            onChange={handleChange}
                            className="w-full border border-gray-300 rounded-md p-3 mb-3"
                        />

                        {form.country === "Indonesia" ? (
                            <AddressSelector form={form} setForm={setForm} />
                        ) : (
                            <>
                                <input
                                    type="text"
                                    name="city"
                                    placeholder="City / Region"
                                    value={form.city}
                                    onChange={handleChange}
                                    className="w-full border border-gray-300 rounded-md p-3 mb-3"
                                />
                                <input
                                    type="text"
                                    name="postalCode"
                                    placeholder="Postal Code"
                                    value={form.postalCode}
                                    onChange={handleChange}
                                    className="w-full border border-gray-300 rounded-md p-3 mb-3"
                                />
                            </>
                        )}

                        <input
                            type="tel"
                            name="phone"
                            placeholder="Phone"
                            value={form.phone}
                            onChange={handleChange}
                            className="w-full border border-gray-300 rounded-md p-3 mt-3"
                        />
                    </div>

                    {/* Payment */}
                    {/* <div>
                        <h2 className="text-lg font-semibold mb-3">Payment</h2>
                        <p className="text-sm text-gray-500 mb-2">
                            All transactions are secure and encrypted.
                        </p>
                        <label className="flex items-center gap-2 border border-gray-300 rounded-md p-3 cursor-pointer hover:bg-gray-50">
                            <input type="radio" name="paymentMethod" value="Xendit" checked readOnly />
                            Pay with Xendit
                        </label>
                    </div> */}

                    <button
                        type="submit"
                        disabled={loading || !isFormValid || !storeOpen}
                        className={`w-full py-3 font-medium transition rounded-md ${
                            loading || !isFormValid || !storeOpen
                                ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                                : "bg-secondary text-white hover:bg-gray-700"
                        }`}
                    >
                        {storeOpen
                            ? loading
                                ? "Processing..."
                                : "Complete Order"
                            : "Store Closed"}
                    </button>
                </form>

                {/* RIGHT SIDE (order summary) */}
                <div className="border-t lg:border-t-0 lg:border-l border-gray-200 pt-8 lg:pt-0 lg:pl-8 order-first md:order-last">
                    <div className="space-y-6">
                        {cartItems.map((item) => (
                            <div
                                key={`${item.id}-${item.variantId}`}
                                className="flex justify-between items-start gap-4"
                            >
                                <div className="flex gap-4">
                                    <div className="relative w-20 h-24">
                                        <Image
                                            src={getImageUrl(item.imageUrl)}
                                            alt={item.title}
                                            fill
                                            className="object-cover rounded"
                                        />
                                    </div>
                                    <div>
                                        <p className="font-medium text-sm">
                                            {item.title}
                                        </p>
                                        <p className="text-gray-500 text-sm">
                                            {item.size || "All Size"}
                                        </p>
                                        {item.variantId &&
                                        pricedItems[item.variantId] &&
                                        pricedItems[item.variantId]
                                            .effectiveUnitPrice <
                                            pricedItems[item.variantId]
                                                .baseUnitPrice ? (
                                            <div className="flex items-center gap-2">
                                                <p className="font-semibold text-gra-700">
                                                    {formatCurrency(
                                                        pricedItems[
                                                            item.variantId
                                                        ].effectiveUnitPrice,
                                                    )}
                                                </p>
                                                <p className="text-xs text-gray-400 line-through">
                                                    {formatCurrency(
                                                        pricedItems[
                                                            item.variantId
                                                        ].baseUnitPrice,
                                                    )}
                                                </p>
                                            </div>
                                        ) : productPricingMap[item.id]
                                              ?.originalPrice !== undefined &&
                                          productPricingMap[item.id]
                                              .originalPrice! >
                                              productPricingMap[item.id]
                                                  .displayPrice ? (
                                            <div className="flex items-center gap-2">
                                                <p className="font-semibold text-emerald-700">
                                                    {formatCurrency(
                                                        productPricingMap[
                                                            item.id
                                                        ].displayPrice,
                                                    )}
                                                </p>
                                                <p className="text-xs text-gray-400 line-through">
                                                    {formatCurrency(
                                                        productPricingMap[
                                                            item.id
                                                        ].originalPrice!,
                                                    )}
                                                </p>
                                            </div>
                                        ) : typeof item.originalPrice ===
                                              "number" &&
                                          item.originalPrice > item.price ? (
                                            <div className="flex items-center gap-2">
                                                <p className="font-semibold text-emerald-700">
                                                    {formatCurrency(item.price)}
                                                </p>
                                                <p className="text-xs text-gray-400 line-through">
                                                    {formatCurrency(
                                                        item.originalPrice,
                                                    )}
                                                </p>
                                            </div>
                                        ) : (
                                            <p className="font-semibold text-gray-800">
                                                {formatCurrency(
                                                    productPricingMap[item.id]
                                                        ?.displayPrice ??
                                                        item.price,
                                                )}
                                            </p>
                                        )}
                                    </div>
                                </div>
                                <p className="text-gray-600 text-sm">
                                    x{item.quantity}
                                </p>
                            </div>
                        ))}
                        {/* Gift Note Display */}
                        {giftNote && (
                            <div className="border border-gray-200 rounded-md p-4 bg-gray-50">
                                <div className="flex items-start gap-2">
                                    <Gift
                                        size={18}
                                        className="text-gray-600 flex-shrink-0 mt-0.5"
                                    />
                                    <div className="flex-1">
                                        <p className="text-sm font-medium text-gray-700 mb-1">
                                            Gift Note:
                                        </p>
                                        <p className="text-sm text-gray-600 italic">
                                            &quot;{giftNote}&quot;
                                        </p>
                                    </div>
                                </div>
                            </div>
                        )}

                        <div className="space-y-4 text-sm text-gray-700">
                            <VoucherPicker
                                itemLevelPromos={itemLevelPromos}
                                cartLevelPromos={cartLevelPromos}
                                availableLoading={availableLoading}
                                availablePromos={availablePromos}
                                selectedItemLevelId={selectedItemLevelId}
                                selectedCartLevelId={selectedCartLevelId}
                                onSelectItemLevel={setSelectedItemLevelId}
                                onSelectCartLevel={setSelectedCartLevelId}
                            />

                            {/* Price summary */}
                            <div className="space-y-2 pt-2 text-gray-500">
                                <div className="flex justify-between">
                                    <span>
                                        Subtotal -{" "}
                                        {cartItems.reduce(
                                            (s, i) => s + i.quantity,
                                            0,
                                        )}{" "}
                                        item
                                    </span>
                                    {pricingLoading ? (
                                        <span className="text-gray-400 animate-pulse">
                                            ...
                                        </span>
                                    ) : discountAmount > 0 ? (
                                        <span className="flex gap-2 items-center">
                                            <span className="line-through text-gray-400">
                                                {formatCurrency(baseSubtotal)}
                                            </span>
                                            <span className="text-gray-900">
                                                {formatCurrency(total)}
                                            </span>
                                        </span>
                                    ) : (
                                        <span className="text-gray-900">
                                            {formatCurrency(subtotal)}
                                        </span>
                                    )}
                                </div>
                                <div className="flex justify-between">
                                    <span>Shipping</span>
                                    <span>Free</span>
                                </div>

                                {/* Item-level discounts */}
                                {appliedDiscounts
                                    .filter((p) =>
                                        ITEM_LEVEL_KINDS.includes(p.kind),
                                    )
                                    .map((promo) => (
                                        <div
                                            key={promo.id}
                                            className="flex justify-between "
                                        >
                                            <span>
                                                Discount (Voucher{" "}
                                                {getPromotionKindLabel(
                                                    promo.kind,
                                                )}
                                                )
                                            </span>
                                            <span className="text-orange-600">
                                                -{formatCurrency(promo.amount)}
                                            </span>
                                        </div>
                                    ))}

                                {/* Cart-level discounts */}
                                {appliedDiscounts
                                    .filter((p) =>
                                        CART_LEVEL_KINDS.includes(p.kind),
                                    )
                                    .map((promo) => (
                                        <div
                                            key={promo.id}
                                            className="flex justify-between "
                                        >
                                            <span>
                                                Discount (Min.Spend/qty)
                                            </span>
                                            <span className="text-orange-600">
                                                -{formatCurrency(promo.amount)}
                                            </span>
                                        </div>
                                    ))}

                                {/* No selection yet */}
                                {selectedIds.length === 0 && (
                                    <>
                                        <div className="flex justify-between text-gray-400">
                                            <span>
                                                Discount (Voucher Collection)
                                            </span>
                                            <span>-</span>
                                        </div>
                                        <div className="flex justify-between text-gray-400">
                                            <span>
                                                Discount (Min.Spend/qty)
                                            </span>
                                            <span>-</span>
                                        </div>
                                    </>
                                )}

                                <div className="flex justify-between font-semibold pt-2 border-t border-gray-200 text-gray-900">
                                    <span>Total</span>
                                    <span>{formatCurrency(total)}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
