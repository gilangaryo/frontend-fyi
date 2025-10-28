'use client'

import { useState, useEffect } from 'react'
import { X } from 'lucide-react'

export default function FloatingEmail() {
    const [open, setOpen] = useState(false)

    useEffect(() => {
        const timer = setTimeout(() => setOpen(true), 1000)
        return () => clearTimeout(timer)
    }, [])

    if (!open) return null

    return (
        <div className="fixed bottom-25 right-6 z-[9998] animate-slideUp backdrop-blur-xs">
            <div
                className="relative  bg-secondary/60   text-white p-10 w-[100vw] max-w-md  shadow-2xl"
            >
                <button
                    onClick={() => setOpen(false)}
                    className="absolute top-5 right-5 text-white/80 hover:text-white"
                >
                    <X size={20} />
                </button>

                <h2 className="text-[28px] font-light text-center mb-3">Be an Exclusive Member</h2>
                <p className="text-center text-sm mb-6 text-gray-200 font-light">
                    Letters that speak to the soul, inspiration that lingers, and special things we keep just for you.
                </p>

                <form className="space-y-4">
                    <div>
                        <input
                            type="email"
                            required
                            placeholder="you@example.com"
                            className="w-full bg-transparent border-b border-white/60 text-white py-2 focus:outline-none"
                        />
                    </div>
                    <button
                        type="submit"
                        className="w-full py-2.5 bg-white/90 text-[#5a4638] font-medium rounded-sm hover:bg-white transition"
                    >
                        Subscribe
                    </button>
                </form>

                <p className="text-[11px] text-center mt-4 text-gray-300 leading-snug">
                    By signing up you agree to receive emails from FYI Couture and agree to our{' '}
                    <a href="/privacy-policy" className="underline hover:text-white">
                        Privacy Policy
                    </a>.
                </p>
            </div>

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
    )
}
