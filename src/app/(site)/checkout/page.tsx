'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'
import { useSelector, useDispatch } from 'react-redux'
import { RootState } from '@/store'
import { clearCart } from '@/store/cartSlice'
import { API_BASE } from '@/lib/constants'
import { getImageUrl } from '@/lib/utils'
import AddressSelector from '../components/checkout/AddressSelector'

export default function CheckoutPage() {
    const dispatch = useDispatch()
    const [mounted, setMounted] = useState(false)
    const [loading, setLoading] = useState(false)

    const cartItems = useSelector((state: RootState) => state.cart.items)
    const subtotal = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0)

    useEffect(() => setMounted(true), [])

    const [form, setForm] = useState({
        email: '',
        firstName: '',
        lastName: '',
        address: '',
        apartment: '',
        province: '',
        city: '',
        district: '',
        village: '',
        postalCode: '',
        phone: '',
        country: 'Indonesia',
        paymentMethod: '',
    })
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
        cartItems.length > 0
    const handleChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
    ) => {
        const { name, value } = e.target
        setForm((prev) => ({ ...prev, [name]: value }))
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        if (!isFormValid) {
            alert('⚠️ Please complete all required fields before checkout.')
            return
        }

        setLoading(true)

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
                    order_note: 'tolong hati-hati ya paketnya',
                },
            }

            let payload: unknown
            if (form.country === 'Indonesia') {
                payload = {
                    ...basePayload,
                    address: {
                        country: form.country,
                        province: form.province,
                        city: form.city,
                        district: form.district,
                        village: form.village,
                        postalCode: form.postalCode,
                        address: form.address,
                        apartment: form.apartment,
                    },
                }
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
                }
            }


            const endpoint =
                form.country === 'Indonesia'
                    ? `${API_BASE}/orders`
                    : `${API_BASE}/orders/international`

            const res = await fetch(endpoint, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            })

            const data = await res.json()
            console.log('✅ Order Response:', data)

            if (!res.ok) throw new Error(data.message || 'Failed to create order')

            if (data.data?.payment_link) {
                window.location.href = data.data.payment_link
            } else {
                alert('Order berhasil dibuat, tetapi tidak ada payment link.')
            }

            dispatch(clearCart())
        } catch (err) {
            console.error('❌ Checkout error:', err)
        } finally {
            setLoading(false)
        }
    }


    if (!mounted) return <div className="min-h-screen flex items-center justify-center text-gray-500">Loading checkout...</div>

    return (
        <div className="min-h-screen bg-white">

            <div className="max-w-7xl mx-auto px-4 py-10 grid grid-cols-1 lg:grid-cols-2 gap-10">
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
                        {/* <label className="flex items-center gap-2 mt-2 text-sm text-gray-600">
                            <input type="checkbox" className="border-gray-300 rounded" />
                            Email me with news & offers
                        </label> */}
                    </div>

                    {/* Delivery */}
                    <div>
                        <h2 className="text-lg font-semibold mb-3">Delivery</h2>

                        {/* Country selector */}
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
                            <input type="text" name="firstName" placeholder="First Name" value={form.firstName} onChange={handleChange} className="border border-gray-300 rounded-md p-3" />
                            <input type="text" name="lastName" placeholder="Last Name" value={form.lastName} onChange={handleChange} className="border border-gray-300 rounded-md p-3" />
                        </div>

                        <input type="text" name="address" placeholder="Street Address" value={form.address} onChange={handleChange} className="w-full border border-gray-300 rounded-md p-3 mb-3" />
                        <input type="text" name="apartment" placeholder="Apartment, suite, etc. (optional)" value={form.apartment} onChange={handleChange} className="w-full border border-gray-300 rounded-md p-3 mb-3" />

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

                        <input type="tel" name="phone" placeholder="Phone" value={form.phone} onChange={handleChange} className="w-full border border-gray-300 rounded-md p-3 mt-3" />
                    </div>


                    {/* Payment */}
                    <div>
                        <h2 className="text-lg font-semibold mb-3">Payment</h2>
                        <p className="text-sm text-gray-500 mb-2">All transactions are secure and encrypted.</p>
                        <label className="flex items-center gap-2 border border-gray-300 rounded-md p-3 cursor-pointer hover:bg-gray-50">
                            <input type="radio" name="paymentMethod" value="Xendit" checked readOnly />
                            Pay with Xendit
                        </label>
                    </div>

                    <button
                        type="submit"
                        disabled={loading || !isFormValid}
                        className={`w-full py-3 font-medium transition rounded-md ${loading || !isFormValid
                            ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                            : 'bg-secondary text-white hover:bg-gray-700'
                            }`}
                    >
                        {loading ? 'Processing...' : 'Complete Order'}
                    </button>
                </form>

                {/* RIGHT SIDE */}
                <div className="border-t lg:border-t-0 lg:border-l border-gray-200 pt-8 lg:pt-0 lg:pl-8">
                    <div className="space-y-6">
                        {cartItems.map((item) => (
                            <div key={`${item.id}-${item.variantId}`} className="flex justify-between items-start gap-4">
                                <div className="flex gap-4">
                                    <div className="relative w-20 h-24">
                                        <Image src={getImageUrl(item.imageUrl)} alt={item.title} fill className="object-cover rounded" />
                                    </div>
                                    <div>
                                        <p className="font-medium text-sm">{item.title} </p>
                                        <p className="text-gray-500 text-sm">{item.size || 'All Size'}</p>
                                        <p className="font-semibold text-gray-800">
                                            IDR {item.price.toLocaleString('id-ID')}
                                        </p>
                                    </div>
                                </div>
                                <p className="text-gray-600 text-sm">x{item.quantity}</p>
                            </div>
                        ))}

                        <div className="space-y-2 text-sm text-gray-700">
                            <div className="flex justify-between">
                                <span>Subtotal</span>
                                <span>IDR {subtotal.toLocaleString('id-ID')}</span>
                            </div>
                            <div className="flex justify-between font-semibold pt-2 border-t">
                                <span>Total</span>
                                <span>IDR {subtotal.toLocaleString('id-ID')}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
