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

export default function CheckoutPage() {
    const dispatch = useDispatch();
    const [mounted, setMounted] = useState(false);
    const [loading, setLoading] = useState(false);
    const [storeOpen, setStoreOpen] = useState<boolean | null>(null);
    const [discountCode, setDiscountCode] = useState("");
    const [discountAmount, setDiscountAmount] = useState(0);
    const [discountId, setDiscountId] = useState<string | null>(null);
    const [appliedCode, setAppliedCode] = useState<string | null>(null);
    const [discountTried, setDiscountTried] = useState(false);
    const [discountLoading, setDiscountLoading] = useState(false);

    const cartItems = useSelector((state: RootState) => state.cart.items);
    const giftNote = useSelector((state: RootState) => state.cart.giftNote);
    const subtotal = cartItems.reduce(
        (sum, item) => sum + item.price * item.quantity,
        0
    );
    const total = Math.max(subtotal - discountAmount, 0);

    // Handle apply discount dengan API
    const handleApplyDiscount = async () => {
        if (!discountCode.trim()) {
            return;
        }

        setDiscountTried(true);
        setDiscountLoading(true);

        try {
            const res = await fetch(`${API_BASE}/discounts/validate`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    code: discountCode,
                    orderTotal: subtotal,
                }),
            });

            const data = await res.json();

            if (data.success) {
                setDiscountAmount(data.data.discountAmount);
                setDiscountId(data.data.discountId);
                setAppliedCode(discountCode.toUpperCase());
            } else {
                // Reset jika tidak valid
                setDiscountAmount(0);
                setDiscountId(null);
                setAppliedCode(null);
            }
        } catch (err) {
            console.error("❌ Discount validation error:", err);
            setDiscountAmount(0);
            setDiscountId(null);
            setAppliedCode(null);
        } finally {
            setDiscountLoading(false);
        }
    };

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
        >
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
                "The store is currently closed. You cannot place an order right now."
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
                discountId: discountId || null, // Tambahkan discountId
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
                                        <p className="font-semibold text-gray-800">
                                            IDR{" "}
                                            {item.price.toLocaleString("id-ID")}
                                        </p>
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
                            {/* Discount Input */}
                            <div className="space-y-1">
                                <div className="flex items-center gap-4">
                                    <input
                                        type="text"
                                        placeholder="Discount code"
                                        value={discountCode}
                                        onChange={(e) =>
                                            setDiscountCode(e.target.value)
                                        }
                                        className="flex-1 border rounded-md px-4 py-3 text-sm focus:outline-none focus:ring-1 focus:ring-gray-200 uppercase"
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

                                {discountTried && !appliedCode && (
                                    <p className="text-xs text-red-500 mt-1">
                                        ⚠️ Invalid or expired discount code.
                                    </p>
                                )}
                                {discountTried && appliedCode && (
                                    <p className="text-xs text-green-600 mt-2">
                                        ✅ Discount code &quot;{appliedCode}
                                        &quot; applied successfully!
                                    </p>
                                )}
                            </div>

                            {/* Price Summary */}
                            <div className="space-y-2">
                                <div className="flex justify-between">
                                    <span>Subtotal</span>
                                    <span>
                                        IDR {subtotal.toLocaleString("id-ID")}
                                    </span>
                                </div>

                                {appliedCode && discountAmount > 0 && (
                                    <div className="flex justify-between text-green-600">
                                        <span>Discount ({appliedCode})</span>
                                        <span>
                                            -IDR{" "}
                                            {discountAmount.toLocaleString(
                                                "id-ID"
                                            )}
                                        </span>
                                    </div>
                                )}

                                <div className="flex justify-between font-semibold pt-2 border-t">
                                    <span>Total</span>
                                    <span>
                                        IDR {total.toLocaleString("id-ID")}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
