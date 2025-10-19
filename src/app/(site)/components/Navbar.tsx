'use client'

import { useState, useEffect } from "react"
import { Search, Menu, X } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useSelector } from "react-redux"
import type { RootState } from "@/store"
import CartModal from "@/app/(site)/components/cart/CartModal"
import { API_BASE } from "@/lib/constants"
export default function Navbar() {
    const [search, setSearch] = useState("")
    const [openCart, setOpenCart] = useState(false)
    const [openMenu, setOpenMenu] = useState(false)
    const [isClient, setIsClient] = useState(false)
    const [announcement, setAnnouncement] = useState<string | null>(null)

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const [loadingAnnouncement, setLoadingAnnouncement] = useState(true)


    const pathname = usePathname()

    const totalItems = useSelector((state: RootState) =>
        state.cart.items.reduce((sum, item) => sum + item.quantity, 0)
    )

    useEffect(() => {
        async function fetchAnnouncement() {
            try {
                const res = await fetch(`${API_BASE}/setting/announcement`)
                const data = await res.json()
                const defaultText = "Free shipping all over Indonesia"
                if (data?.isActive) setAnnouncement(data.value || defaultText)
                else setAnnouncement(null)
            } catch (err) {
                console.error("Failed to fetch announcement:", err)
                setAnnouncement("Free shipping all over Indonesia")
            } finally {
                setLoadingAnnouncement(false)
            }
        }

        fetchAnnouncement()
        const interval = setInterval(fetchAnnouncement, 10 * 60 * 1000)
        return () => clearInterval(interval)
    }, [])


    useEffect(() => setIsClient(true), [])
    useEffect(() => {
        const openHandler = () => setOpenCart(true)
        window.addEventListener("open-cart", openHandler)
        return () => window.removeEventListener("open-cart", openHandler)
    }, [])

    useEffect(() => {
        document.body.style.overflow = openMenu ? "hidden" : ""
    }, [openMenu])

    const navItems = [
        { name: "Shop", href: "/shop" },
        { name: "Collection", href: "/collection" },
        { name: "Story", href: "/story" },
        { name: "Beyond", href: "/beyond" },
    ]

    return (
        <>
            <header
                className={`w-full sticky top-0 shadow-sm bg-white ${openMenu ? "z-[10000]" : "z-50"}`}
            >
                <div className="h-[40px] bg-primary-muted flex items-center justify-center text-center text-sm text-secondary font-light transition-opacity duration-500">
                    {announcement ? (
                        <h2 className={`font-medium transition-opacity duration-500 ${announcement ? "opacity-100" : "opacity-0"}`}>
                            {announcement || "Free shipping all over Indonesia"}
                        </h2>
                    ) : (
                        <span className="opacity-0 select-none">Free shipping all over Indonesia</span>
                    )}
                </div>


                <nav className="flex items-center justify-between px-6 md:px-15 py-8 relative text-xl">
                    <div className="flex items-center">
                        <ul className="hidden lg:flex gap-8 text-charcoal font-light">
                            {navItems.map((item) => (
                                <li key={item.href}>
                                    <Link
                                        href={item.href}
                                        className={`pb-1 transition hover:opacity-70 ${pathname === item.href
                                            ? " text-secondary underline underline-offset-2 decoration-1"
                                            : ""
                                            }`}
                                    >
                                        {item.name}
                                    </Link>
                                </li>
                            ))}
                        </ul>

                        <button
                            onClick={() => setOpenMenu((prev) => !prev)}
                            className="lg:hidden relative w-7 h-7"
                        >
                            <span className="sr-only">Toggle menu</span>
                            <div className="relative w-full h-full">
                                <Menu
                                    className={`w-7 h-7 text-charcoal absolute inset-0 transition-all duration-300 ${openMenu ? "rotate-90 opacity-0 scale-50" : "rotate-0 opacity-100 scale-100"
                                        }`}
                                />
                                <X
                                    className={`w-7 h-7 text-charcoal absolute inset-0 transition-all duration-300 ${openMenu ? "rotate-0 opacity-100 scale-100" : "-rotate-90 opacity-0 scale-50"
                                        }`}
                                />
                            </div>
                        </button>
                    </div>

                    <div className="absolute left-1/2 transform -translate-x-1/2">
                        <Link href="/">
                            <Image src="/logo-fyi.png" alt="FYI Logo" width={80} height={60} />
                        </Link>
                    </div>

                    <div className="flex items-center gap-8">
                        <div className="relative hidden lg:block">
                            <input
                                type="text"
                                placeholder="Search"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="border-b border-charcoal focus:outline-none pr-8 pb-2 pl-3"
                            />
                            <Search className="absolute right-0 top-2/5 -translate-y-1/2 w-6 h-8 text-charcoal" />
                        </div>
                        <button className="lg:hidden">
                            <Search className="w-6 h-6 text-charcoal" />
                        </button>

                        <button onClick={() => setOpenCart(true)} className="relative">
                            <Image src="/cart.png" alt="Cart" width={32} height={32} />
                            {isClient && totalItems > 0 && (
                                <span className="absolute -top-2 -right-2 bg-red-600 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center">
                                    {totalItems}
                                </span>
                            )}
                        </button>
                    </div>
                </nav>
            </header>

            <div
                className={`lg:hidden fixed inset-0 z-[9999] bg-white flex flex-col items-center justify-center gap-8 text-2xl text-charcoal font-light transition-all duration-500 ${openMenu
                    ? "opacity-100 translate-y-0"
                    : "opacity-0 translate-y-[-100%] pointer-events-none"
                    }`}
            >
                {navItems.map((item, index) => (
                    <Link
                        key={item.href}
                        href={item.href}
                        onClick={() => setOpenMenu(false)}
                        className={`transition-all duration-500 hover:text-secondary hover:scale-110 ${pathname === item.href ? "text-secondary underline" : ""
                            } ${openMenu
                                ? "opacity-100 translate-x-0"
                                : "opacity-0 -translate-x-8"
                            }`}
                        style={{
                            transitionDelay: openMenu ? `${index * 100}ms` : "0ms"
                        }}
                    >
                        {item.name}
                    </Link>
                ))}
            </div>

            <CartModal open={openCart} onClose={() => setOpenCart(false)} />
        </>
    )
}
