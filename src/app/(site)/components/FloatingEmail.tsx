'use client'

import { useState, useEffect } from 'react'
import { X } from 'lucide-react'

export default function FloatingEmail() {
    const [open, setOpen] = useState(false)
    const [email, setEmail] = useState('')
    const [loading, setLoading] = useState(false)
    const [modalMessage, setModalMessage] = useState<{
        type: 'success' | 'error'
        message: string
    } | null>(null)
    const [isClosing, setIsClosing] = useState(false)


    useEffect(() => {
        if (typeof window === "undefined") return;

        const hasClosed = sessionStorage.getItem("email_popup_closed");
        if (hasClosed) return;

        const timer = setTimeout(() => setOpen(true), 1000);
        return () => clearTimeout(timer);
    }, []);


    const handleClose = () => {
        sessionStorage.setItem("email_popup_closed", "true");
        setOpen(false);
    };


    const closeModal = () => {
        setIsClosing(true)
        setTimeout(() => {
            setModalMessage(null)
            setIsClosing(false)
        }, 500)
    }

    async function handleSubscribe(e: React.FormEvent) {
        e.preventDefault()
        if (!email || !email.includes('@')) {
            setModalMessage({
                type: 'error',
                message: 'Please enter a valid email address.'
            })
            return
        }

        try {
            setLoading(true)
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/subscribe`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    email,
                    source: 'homepage',
                }),
            })

            const data = await res.json()
            if (data.success) {
                setModalMessage({
                    type: 'success',
                    message: data.message || '🎉 Thank you for subscribing!'
                })
                // localStorage.setItem('email_popup_closed', 'true')
                // localStorage.setItem('has_subscribed', 'true')
                sessionStorage.setItem("email_popup_closed", "true");
                sessionStorage.setItem("has_subscribed", "true");

                setEmail('')
                setTimeout(() => {
                    setOpen(false)
                    closeModal()
                }, 2000)
            } else {
                setModalMessage({
                    type: 'error',
                    message: data.error || data.message || 'Subscription failed.'
                })
            }
        } catch (err) {
            console.error('❌ Subscribe error:', err)
            setModalMessage({
                type: 'error',
                message: 'Something went wrong. Please try again later.'
            })
        } finally {
            setLoading(false)
        }
    }

    if (!open) return null

    return (
        <>
            {/* Floating Email Form */}
            <div className="fixed inset-0 z-[9998] flex items-center justify-center bg-black/50 backdrop-blur-sm">
                <div className="relative bg-secondary/50 text-white p-10 w-[90vw] max-w-md shadow-2xl animate-slideUp flex flex-col items-center">
                    {/* Close button */}
                    <button
                        onClick={handleClose}
                        className="absolute top-6 right-6 text-white/80 hover:text-white"
                    >
                        <X size={24} />
                    </button>


                    {/* Heading */}
                    <h2 className="text-2xl font-light text-center mb-4">
                        Be an Exclusive Member
                    </h2>
                    <p className="text-center text-sm text-gray-200 font-light leading-relaxed">
                        Enjoy your 10% sales for your first Purchase when you sign up to our newsletter for our exclusive content & more.
                    </p>

                    {/* Form */}
                    <form className="w-full mt-10 space-y-8" onSubmit={handleSubscribe}>
                        <div className="relative">
                            <input
                                type="email"
                                required
                                placeholder="Email Address"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full bg-transparent border-b border-white/40 text-white py-3 focus:outline-none focus:border-white placeholder:text-white/60 transition-colors"
                            />
                        </div>
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full py-3 bg-white text-secondary font-medium tracking-wide hover:bg-white/90 transition disabled:opacity-70 text-sm"
                        >
                            {loading ? 'Subscribing...' : 'Subscribe'}
                        </button>
                    </form>
                </div>

                {/* Animation */}
                <style jsx>{`
                    @keyframes slideUp {
                        from {
                            opacity: 0;
                            transform: translateY(30px);
                        }
                        to {
                            opacity: 1;
                            transform: translateY(0);
                        }
                    }
                    .animate-slideUp {
                        animation: slideUp 0.6s ease-out forwards;
                    }
                `}</style>
            </div>

            {/* Modal Message */}
            {modalMessage && (
                <div
                    className={`fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 backdrop-blur-sm ${isClosing ? 'animate-fadeOut' : 'animate-fadeIn'
                        }`}
                    onClick={closeModal}
                >
                    <div
                        className={`bg-secondary/80 rounded-lg shadow-xl p-7 w-[90vw] max-w-sm mx-4 ${isClosing ? 'animate-scaleOut' : 'animate-scaleIn'
                            }`}
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="flex items-start gap-3">
                            <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${modalMessage.type === 'success'
                                ? 'bg-secondary-green text-white'
                                : 'bg-red-100 text-red-600'
                                }`}>
                                {modalMessage.type === 'success' ? (
                                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                    </svg>
                                ) : (
                                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                )}
                            </div>
                            <div className="flex-1">
                                <h3 className={`font-semibold mb-1 ${modalMessage.type === 'success' ? 'text-primary' : 'text-red-300'
                                    }`}>
                                    {modalMessage.type === 'success' ? 'Success!' : 'Error'}
                                </h3>
                                <p className="text-sm text-white/90">
                                    {modalMessage.message}
                                </p>
                            </div>
                            <button
                                onClick={closeModal}
                                className="flex-shrink-0 text-secondary-green hover:text-secondary-green transition"
                            >
                                <X size={20} />
                            </button>
                        </div>
                    </div>

                    <style jsx>{`
                        @keyframes fadeIn {
                            from {
                                opacity: 0;
                            }
                            to {
                                opacity: 1;
                            }
                        }
                        @keyframes fadeOut {
                            from {
                                opacity: 1;
                            }
                            to {
                                opacity: 0;
                            }
                        }
                        @keyframes scaleIn {
                            from {
                                opacity: 0;
                                transform: scale(0.9);
                            }
                            to {
                                opacity: 1;
                                transform: scale(1);
                            }
                        }
                        @keyframes scaleOut {
                            from {
                                opacity: 1;
                                transform: scale(1);
                            }
                            to {
                                opacity: 0;
                                transform: scale(0.9);
                            }
                        }
                        .animate-fadeIn {
                            animation: fadeIn 0.2s ease-out;
                        }
                        .animate-fadeOut {
                            animation: fadeOut 0.7s ease-out;
                        }
                        .animate-scaleIn {
                            animation: scaleIn 0.3s ease-out;
                        }
                        .animate-scaleOut {
                            animation: scaleOut 0.7s ease-out;
                        }
                    `}</style>
                </div>
            )}
        </>
    )
}