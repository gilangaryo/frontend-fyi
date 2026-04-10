"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { useSelector, useDispatch } from "react-redux";
import { RootState } from "@/store";
import { clearCart } from "@/store/cartSlice";
import { API_BASE } from "@/lib/constants";
import { getImageUrl } from "@/lib/utils";
import AddressSelector from "../components/checkout/AddressSelector";
import { Gift } from "lucide-react";
import toast from "react-hot-toast";

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

export default function CheckoutPage() {
    const dispatch = useDispatch();
    const [mounted, setMounted] = useState(false);
    const [loading, setLoading] = useState(false);
    const [storeOpen, setStoreOpen] = useState<boolean | null>(null);
    const [discountCode, setDiscountCode] = useState("");
    const [pricingPreview, setPricingPreview] = useState<PricingPreview | null>(
        null,
    );
    const [appliedPromotionIds, setAppliedPromotionIds] = useState<string[]>(
        [],
    );
    const [appliedCode, setAppliedCode] = useState<string | null>(null);
    const [discountTried, setDiscountTried] = useState(false);
    const [discountLoading, setDiscountLoading] = useState(false);
    const [discountMessage, setDiscountMessage] = useState<string | null>(null);
    const [autoPreview, setAutoPreview] = useState<PricingPreview | null>(null);
    const [autoLoading, setAutoLoading] = useState(false);

    const cartItems = useSelector((state: RootState) => state.cart.items);
    const giftNote = useSelector((state: RootState) => state.cart.giftNote);
    const subtotal = cartItems.reduce(
        (sum, item) => sum + item.price * item.quantity,
        0,
    );

    // pricingPreview = combined preview when a code is checked; autoPreview = auto-only fallback
    const activePreview = pricingPreview ?? autoPreview;
    const discountAmount = activePreview?.summary?.totalDiscount ?? 0;
    const total =
        activePreview?.summary?.payableSubtotal ??
        Math.max(subtotal - discountAmount, 0);
    const pricedItems = Object.fromEntries(
        (activePreview?.items || []).map((item) => [item.variantId, item]),
    );
    const promotionDisplaySource = pricingPreview ?? autoPreview;
    const isAutomaticPromotion = (promotion: { autoApply?: boolean }) =>
        Boolean(promotion.autoApply);

    // When a code is applied, automatic promotions must come from the combined preview
    // so cart-level promos are evaluated after item-level discounts.
    const autoDiscounts =
        promotionDisplaySource?.promotions?.applied?.filter(
            isAutomaticPromotion,
        ) ?? [];
    const codeDiscounts =
        pricingPreview?.promotions?.applied?.filter(
            (promotion) => !isAutomaticPromotion(promotion),
        ) ?? [];
    const totalSavings = autoDiscounts
        .concat(codeDiscounts)
        .reduce((sum, promotion) => sum + promotion.amount, 0);

    const handleApplyDiscount = async () => {
        if (!discountCode.trim()) {
            setDiscountTried(false);
            setDiscountMessage(null);
            setPricingPreview(null);
            setAppliedPromotionIds([]);
            setAppliedCode(null);
            return;
        }

        setDiscountTried(true);
        setDiscountLoading(true);
        setDiscountMessage(null);

        try {
            const res = await fetch(`${API_BASE}/discounts/validate`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    code: discountCode.trim().toUpperCase(),
                    autoApply: true,
                    items: cartItems.map((item) => ({
                        productId: item.id,
                        variantId: item.variantId,
                        quantity: item.quantity,
                    })),
                }),
            });

            const data = await res.json();

            if (data.success) {
                const preview = data.data as PricingPreview;
                const appliedPromotions = preview.promotions?.applied || [];

                setPricingPreview(preview);
                setAppliedPromotionIds(
                    appliedPromotions.map((promotion) => promotion.id),
                );
                setAppliedCode(discountCode.trim().toUpperCase());
                setDiscountMessage(
                    appliedPromotions.length > 0
                        ? `${appliedPromotions.length} promotion applied to this cart.`
                        : "Code checked, but no eligible promotion was applied.",
                );
            } else {
                setPricingPreview(null);
                setAppliedPromotionIds([]);
                setAppliedCode(null);
                setDiscountMessage(
                    data.message || "Invalid or expired discount code.",
                );
            }
        } catch (err) {
            console.error("❌ Discount validation error:", err);
            setPricingPreview(null);
            setAppliedPromotionIds([]);
            setAppliedCode(null);
            setDiscountMessage("Failed to validate discount code.");
        } finally {
            setDiscountLoading(false);
        }
    };

    // Auto-fetch qualifying discounts (min purchase / min qty) on cart change
    useEffect(() => {
        if (cartItems.length === 0) {
            setAutoPreview(null);
            return;
        }
        let cancelled = false;
        setAutoLoading(true);
        fetch(`${API_BASE}/discounts/validate`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                autoApply: true,
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
                    setAutoPreview(
                        data.success ? (data.data as PricingPreview) : null,
                    );
                }
            })
            .catch(() => {
                if (!cancelled) setAutoPreview(null);
            })
            .finally(() => {
                if (!cancelled) setAutoLoading(false);
            });
        return () => {
            cancelled = true;
        };
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

    useEffect(() => {
        setDiscountTried(false);
        setDiscountMessage(null);
        setPricingPreview(null);
        setAppliedPromotionIds([]);
        setAppliedCode(null);
    }, [discountCode, cartItems]);

    // All applied IDs: from combined (code) preview, or auto-only preview
    const allAppliedIds =
        activePreview?.promotions?.applied?.map((p) => p.id) ?? [];

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
                discountId: allAppliedIds[0] || null,
                discountIds: allAppliedIds,
                promoCodes: appliedCode ? [appliedCode] : [],
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
                                            <div className="space-y-1">
                                                <p className="text-xs text-gray-400 line-through">
                                                    {formatCurrency(
                                                        pricedItems[
                                                            item.variantId
                                                        ].baseUnitPrice,
                                                    )}
                                                </p>
                                                <p className="font-semibold text-emerald-700">
                                                    {formatCurrency(
                                                        pricedItems[
                                                            item.variantId
                                                        ].effectiveUnitPrice,
                                                    )}
                                                </p>
                                            </div>
                                        ) : (
                                            <p className="font-semibold text-gray-800">
                                                {formatCurrency(item.price)}
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
                            {/* Discount code input */}
                            <div className="space-y-1">
                                <div className="flex items-center gap-2">
                                    <input
                                        type="text"
                                        placeholder="Discount code"
                                        value={discountCode}
                                        onChange={(e) =>
                                            setDiscountCode(
                                                e.target.value.toUpperCase(),
                                            )
                                        }
                                        className="flex-1 border border-gray-300 rounded-md px-4 py-3 text-sm focus:outline-none focus:ring-1 focus:ring-gray-300 uppercase"
                                    />
                                    <button
                                        type="button"
                                        onClick={handleApplyDiscount}
                                        disabled={discountLoading}
                                        className="px-4 py-3 bg-gray-100 rounded-md text-gray-700 font-medium hover:bg-gray-200 transition disabled:opacity-50"
                                    >
                                        {discountLoading
                                            ? "Checking..."
                                            : "Apply"}
                                    </button>
                                </div>

                                {discountTried &&
                                    !appliedCode &&
                                    discountMessage && (
                                        <p className="text-xs text-red-500">
                                            {discountMessage}
                                        </p>
                                    )}
                                {discountTried &&
                                    appliedCode &&
                                    discountMessage && (
                                        <p className="text-xs text-green-600">
                                            {discountMessage}
                                        </p>
                                    )}
                            </div>
                            {codeDiscounts.length > 0 && (
                                <div className="border border-gray-200 rounded-md p-3 bg-gray-50 space-y-2">
                                    <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                                        Applied promotions
                                    </p>
                                    {codeDiscounts.map((promo) => (
                                        <div
                                            key={promo.id}
                                            className="flex justify-between items-start text-sm"
                                        >
                                            <div>
                                                <p className="font-medium text-gray-800">
                                                    {promo.title}
                                                </p>
                                                <p className="text-xs text-gray-400">
                                                    {promo.code && (
                                                        <span className="mr-1">
                                                            {promo.code} ·
                                                        </span>
                                                    )}
                                                    {getPromotionKindLabel(
                                                        promo.kind,
                                                    )}
                                                </p>
                                            </div>
                                            <span className="text-green-600 font-medium shrink-0">
                                                -{formatCurrency(promo.amount)}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            )}

                            {/* Auto promo banner */}
                            {autoLoading && (
                                <p className="text-xs text-gray-400 animate-pulse">
                                    Checking discounts...
                                </p>
                            )}
                            {!autoLoading && autoDiscounts.length > 0 && (
                                <div className="border border-gray-200 rounded-md p-3 bg-gray-50 space-y-2">
                                    <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                                        discount
                                    </p>
                                    {autoDiscounts.map((promo) => (
                                        <div
                                            key={promo.id}
                                            className="flex justify-between items-start text-sm"
                                        >
                                            <div>
                                                <p className="font-medium text-gray-800">
                                                    {promo.title}
                                                </p>
                                                <p className="text-xs text-gray-400">
                                                    {getPromotionKindLabel(
                                                        promo.kind,
                                                    )}
                                                </p>
                                            </div>
                                            <span className="text-green-600 font-medium shrink-0">
                                                -{formatCurrency(promo.amount)}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            )}

                            {/* Code-based promotions */}

                            {/* Rejected promotions — hide auto-discount conflicts, only show user-relevant rejections */}
                            {(() => {
                                const visibleRejected = (
                                    activePreview?.promotions?.rejected ?? []
                                ).filter(
                                    (promo) =>
                                        !(
                                            isAutomaticPromotion(promo) &&
                                            promo.reason ===
                                                "Conflicts with a higher value non-combinable promotion"
                                        ),
                                );
                                return visibleRejected.length > 0 ? (
                                    <div className="border border-gray-200 rounded-md p-3 bg-gray-50 space-y-1">
                                        <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                                            Not applied
                                        </p>
                                        {visibleRejected.map((promo, index) => (
                                            <p
                                                key={`${promo.code || promo.title || "promo"}-${index}`}
                                                className="text-xs text-gray-500"
                                            >
                                                <span className="text-gray-700">
                                                    {promo.title ||
                                                        promo.code ||
                                                        "Promotion"}
                                                </span>
                                                {" · "}
                                                {promo.reason ||
                                                    "Not eligible for this cart."}
                                            </p>
                                        ))}
                                    </div>
                                ) : null;
                            })()}

                            {/* Price summary */}
                            <div className="space-y-2 pt-2">
                                <div className="flex justify-between">
                                    <span>Subtotal</span>
                                    <span>{formatCurrency(subtotal)}</span>
                                </div>

                                {codeDiscounts.map((promo) => (
                                    <div
                                        key={promo.id}
                                        className="flex justify-between text-green-600"
                                    >
                                        <span>
                                            {promo.code
                                                ? `Discount (${promo.code})`
                                                : promo.title}
                                        </span>
                                        <span>
                                            -{formatCurrency(promo.amount)}
                                        </span>
                                    </div>
                                ))}
                                {autoDiscounts.map((promo) => (
                                    <div
                                        key={promo.id}
                                        className="flex justify-between text-green-600"
                                    >
                                        <span>{promo.title}</span>
                                        <span>
                                            -{formatCurrency(promo.amount)}
                                        </span>
                                    </div>
                                ))}
                                {autoDiscounts.length === 0 &&
                                    codeDiscounts.length === 0 &&
                                    discountAmount > 0 && (
                                        <div className="flex justify-between text-green-600">
                                            <span>
                                                {appliedCode
                                                    ? `Discount (${appliedCode})`
                                                    : "Automatic discount"}
                                            </span>
                                            <span>
                                                -
                                                {formatCurrency(discountAmount)}
                                            </span>
                                        </div>
                                    )}
                                <div className="flex justify-between font-semibold pt-2 border-t border-gray-200">
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
