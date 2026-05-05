"use client";

import { useState, useEffect } from "react";
import { Search, Menu, X, ChevronDown } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useSelector } from "react-redux";
import type { RootState } from "@/store";
import CartModal from "@/app/(site)/components/cart/CartModal";
import { API_BASE } from "@/lib/constants";
import { getImageUrl } from "@/lib/utils";

interface ProductImage {
    id: string;
    imageUrl: string;
    isPrimary: boolean;
}

interface Product {
    id: string;
    slug: string;
    title: string;
    imageUrl?: string | null;
    price?: number | string;
    images?: ProductImage[];
}
interface CollectionSlug {
    id: string;
    slug: string;
}

const DEFAULT_OPEN_ANNOUNCEMENT = "Free shipping all over Indonesia";
const DEFAULT_CLOSED_MESSAGE =
    "Our store is currently closed — orders are temporarily unavailable.";

export default function Navbar() {
    const [search, setSearch] = useState("");
    const [searchResults, setSearchResults] = useState<Product[]>([]);
    const [showResults, setShowResults] = useState(false);
    const [loadingSearch, setLoadingSearch] = useState(false);
    const [collections, setCollections] = useState<CollectionSlug[]>([]);
    const [showMobileSearch, setShowMobileSearch] = useState(false);

    const [openCart, setOpenCart] = useState(false);
    const [openMenu, setOpenMenu] = useState(false);
    const [isClient, setIsClient] = useState(false);
    const [announcement, setAnnouncement] = useState<string | null>(null);
    const [, setStoreOpen] = useState<boolean>(true);
    const [dropdownOpen, setDropdownOpen] = useState(false);

    const pathname = usePathname();
    const router = useRouter();

    const totalItems = useSelector((state: RootState) =>
        state.cart.items.reduce((sum, item) => sum + item.quantity, 0),
    );

    const [lastScrollY, setLastScrollY] = useState(0);
    const [showNavbar, setShowNavbar] = useState(true);

    useEffect(() => {
        const handleScroll = () => {
            const currentScrollY = window.scrollY;

            if (currentScrollY < 150) {
                setShowNavbar(true);
                setLastScrollY(currentScrollY);
                return;
            }

            if (currentScrollY > lastScrollY && currentScrollY > 100) {
                setShowNavbar(false);
            } else if (currentScrollY < lastScrollY - 10) {
                setShowNavbar(true);
            }

            setLastScrollY(currentScrollY);
        };

        window.addEventListener("scroll", handleScroll, { passive: true });
        return () => window.removeEventListener("scroll", handleScroll);
    }, [lastScrollY]);

    // ✅ Updated: Fetch announcement with custom closed message
    useEffect(() => {
        async function fetchData() {
            try {
                const [announcementRes, storeRes] = await Promise.all([
                    fetch(`${API_BASE}/setting/announcement/announcement`),
                    fetch(`${API_BASE}/setting/store-status`),
                ]);

                const ann = await announcementRes.json();
                const store = await storeRes.json();

                const isOpen = store?.data?.isOpen ?? true;
                const closedMessage =
                    store?.data?.closedMessage || DEFAULT_CLOSED_MESSAGE;
                const announcementValue =
                    ann?.success && typeof ann?.data?.value === "string"
                        ? ann.data.value
                        : null;

                setStoreOpen(isOpen);

                if (!isOpen) {
                    // ✅ Use custom closed message
                    setAnnouncement(closedMessage);
                } else if (announcementValue) {
                    setAnnouncement(announcementValue);
                } else {
                    setAnnouncement(DEFAULT_OPEN_ANNOUNCEMENT);
                }
            } catch (err) {
                console.error(
                    "Failed to fetch announcement or store status:",
                    err,
                );
                setAnnouncement(DEFAULT_OPEN_ANNOUNCEMENT);
            }
        }

        fetchData();
    }, []);

    useEffect(() => setIsClient(true), []);
    useEffect(() => {
        document.body.style.overflow = openMenu ? "hidden" : "";
    }, [openMenu]);

    // Listen for open-cart event from AddToCart
    useEffect(() => {
        const handleOpenCart = () => setOpenCart(true);
        window.addEventListener("open-cart", handleOpenCart);
        return () => window.removeEventListener("open-cart", handleOpenCart);
    }, []);

    useEffect(() => {
        async function fetchCollections() {
            try {
                const res = await fetch(`${API_BASE}/collections/slugs`);
                const json = await res.json();
                if (json.success) setCollections(json.data);
            } catch (err) {
                console.error("Failed to fetch collection slugs:", err);
            }
        }
        fetchCollections();
    }, []);

    // === Debounced search ===
    useEffect(() => {
        if (!search.trim()) {
            setSearchResults([]);
            setShowResults(false);
            return;
        }

        const timeout = setTimeout(async () => {
            try {
                setLoadingSearch(true);
                const res = await fetch(
                    `${API_BASE}/products?search=${encodeURIComponent(
                        search,
                    )}&limit=5`,
                );
                const data = await res.json();

                if (data?.success) {
                    setSearchResults(data.data);
                    setShowResults(true);
                } else {
                    setSearchResults([]);
                    setShowResults(false);
                }
            } catch (err) {
                console.error("Search error:", err);
                setSearchResults([]);
            } finally {
                setLoadingSearch(false);
            }
        }, 500);

        return () => clearTimeout(timeout);
    }, [search]);

    const handleSelectProduct = (slug: string) => {
        setSearch("");
        setShowResults(false);
        setShowMobileSearch(false);
        router.push(`/product/${slug}`);
    };

    const navItems = [
        { name: "Shop", href: "/shop" },
        { name: "Collection", href: "/collection" },
        { name: "Story", href: "/story" },
        { name: "Beyond", href: "/beyond" },
        { name: "Sale", href: "/sale" },
    ];

    return (
        <>
            <header
                className={`w-full sticky top-0 bg-white shadow-sm transition-transform duration-300 
    ${showNavbar ? "translate-y-0" : "-translate-y-full"} 
    ${openMenu ? "z-[10000]" : "z-50"}`}
            >
                {/* Announcement Bar */}
                <div className="py-4 flex items-center justify-center text-center text-sm font-medium bg-primary-muted text-secondary z-50">
                    {announcement ? (
                        <h2>{announcement}</h2>
                    ) : (
                        <span className="opacity-0 select-none">
                            Loading...
                        </span>
                    )}
                </div>

                {/* Navbar */}
                <nav className="flex items-center justify-between px-6 md:px-15 py-8 relative text-xl">
                    <div className="flex items-center">
                        <ul className="hidden lg:flex gap-8 text-charcoal font-light">
                            {navItems.map((item) => (
                                <li key={item.href} className="relative group">
                                    {item.name === "Collection" ? (
                                        <>
                                            <button
                                                onMouseEnter={() =>
                                                    setDropdownOpen(true)
                                                }
                                                onMouseLeave={() =>
                                                    setDropdownOpen(false)
                                                }
                                                onClick={() =>
                                                    router.push(item.href)
                                                }
                                                className={`pb-1 flex items-center gap-1 transition hover:opacity-70 ${
                                                    pathname === item.href
                                                        ? "text-secondary underline underline-offset-2 decoration-1"
                                                        : ""
                                                }`}
                                            >
                                                {item.name}
                                                <ChevronDown
                                                    size={18}
                                                    className={`ml-1 transition-transform duration-200 ${
                                                        dropdownOpen
                                                            ? "rotate-180"
                                                            : "rotate-0"
                                                    }`}
                                                />
                                            </button>

                                            {/* Dropdown menu */}
                                            <div
                                                onMouseEnter={() =>
                                                    setDropdownOpen(true)
                                                }
                                                onMouseLeave={() =>
                                                    setDropdownOpen(false)
                                                }
                                                className={`absolute left-0 mt-2 bg-white border border-gray-200 shadow-lg rounded-md transition-all duration-200 ${
                                                    dropdownOpen
                                                        ? "opacity-100 visible translate-y-0"
                                                        : "opacity-0 invisible -translate-y-2"
                                                }`}
                                            >
                                                <ul className="py-2 min-w-[180px]">
                                                    {collections.length > 0 ? (
                                                        collections.map(
                                                            (col) => (
                                                                <li
                                                                    key={col.id}
                                                                >
                                                                    <Link
                                                                        href={`/collection/#${col.slug}`}
                                                                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                                                    >
                                                                        {col.slug
                                                                            .replace(
                                                                                /-/g,
                                                                                " ",
                                                                            )
                                                                            .replace(
                                                                                /\b\w/g,
                                                                                (
                                                                                    l,
                                                                                ) =>
                                                                                    l.toUpperCase(),
                                                                            )}
                                                                    </Link>
                                                                </li>
                                                            ),
                                                        )
                                                    ) : (
                                                        <li className="px-4 py-2 text-sm text-gray-400">
                                                            Loading...
                                                        </li>
                                                    )}
                                                </ul>
                                            </div>
                                        </>
                                    ) : (
                                        <Link
                                            href={item.href}
                                            className={`pb-1 transition hover:opacity-70 ${
                                                pathname === item.href
                                                    ? "text-secondary underline underline-offset-2 decoration-1"
                                                    : ""
                                            }`}
                                        >
                                            {item.name}
                                        </Link>
                                    )}
                                </li>
                            ))}
                        </ul>

                        {/* Mobile Menu Button */}
                        <button
                            onClick={() => setOpenMenu((prev) => !prev)}
                            className="lg:hidden relative w-7 h-7"
                        >
                            <Menu
                                className={`absolute w-7 h-7 bottom-0 text-charcoal transition-all ${
                                    openMenu
                                        ? "opacity-0 scale-50 rotate-90"
                                        : "opacity-100 scale-100 rotate-0"
                                }`}
                            />
                            <X
                                className={`absolute w-7 h-7 bottom-0 text-charcoal transition-all ${
                                    openMenu
                                        ? "opacity-100 scale-100 rotate-0"
                                        : "opacity-0 scale-50 -rotate-90"
                                }`}
                            />
                        </button>
                    </div>
                    {/* Center Logo */}
                    <div className="absolute left-1/2 transform -translate-x-1/2">
                        <Link href="/">
                            <Image
                                src="/logo-fyi.png"
                                alt="FYI Logo"
                                width={80}
                                height={60}
                            />
                        </Link>
                    </div>

                    {/* Right Actions */}
                    <div className="flex items-center gap-8 relative">
                        {/* Desktop Search */}
                        <div className="relative hidden lg:block">
                            <input
                                type="text"
                                placeholder="Search"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="border-b border-charcoal focus:outline-none pr-8 pb-2 pl-3"
                            />
                            <Search className="absolute right-0 top-2/5 -translate-y-1/2 w-6 h-8 text-charcoal" />

                            {/* Dropdown results */}
                            {showResults && searchResults.length > 0 && (
                                <div className="absolute left-0 mt-2 w-80 bg-white border border-gray-200 shadow-lg z-50 rounded-md overflow-hidden">
                                    {loadingSearch && (
                                        <div className="px-4 py-2 text-sm text-gray-500">
                                            Searching...
                                        </div>
                                    )}

                                    {!loadingSearch &&
                                        searchResults.map((p) => {
                                            const primaryImage = p.images?.find(
                                                (img) => img.isPrimary,
                                            )?.imageUrl;
                                            const imageSrc = primaryImage
                                                ? `${API_BASE}${primaryImage}`
                                                : `${API_BASE}${p.imageUrl}`;

                                            return (
                                                <button
                                                    key={p.id}
                                                    onClick={() =>
                                                        handleSelectProduct(
                                                            p.slug,
                                                        )
                                                    }
                                                    className="flex items-center gap-3 w-full text-left px-4 py-2 hover:bg-gray-100"
                                                >
                                                    <Image
                                                        src={getImageUrl(
                                                            imageSrc,
                                                        )}
                                                        alt={p.title}
                                                        width={40}
                                                        height={40}
                                                        className="object-cover rounded"
                                                    />
                                                    <span className="text-sm text-gray-700 line-clamp-1">
                                                        {p.title}
                                                    </span>
                                                </button>
                                            );
                                        })}
                                </div>
                            )}
                        </div>

                        {/* Mobile Search Icon */}
                        <button
                            className="lg:hidden"
                            onClick={() => setShowMobileSearch(true)}
                        >
                            <Search className="w-6 h-6 text-charcoal" />
                        </button>

                        {/* Cart */}
                        <button
                            onClick={() => setOpenCart(true)}
                            className="relative"
                        >
                            <Image
                                src="/cart.png"
                                alt="Cart"
                                width={32}
                                height={32}
                            />
                            {isClient && totalItems > 0 && (
                                <span className="absolute -top-2 -right-2 bg-red-600 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center">
                                    {totalItems}
                                </span>
                            )}
                        </button>
                    </div>
                </nav>
            </header>

            {/* Mobile Search Overlay */}
            {showMobileSearch && (
                <div className="fixed inset-0 bg-white z-[9999] flex flex-col">
                    <div className="flex items-center justify-center p-4">
                        <Image
                            src="/logo-fyi.png"
                            alt="FYI Logo"
                            width={80}
                            height={60}
                            className=""
                        />
                    </div>
                    <div className="flex items-center justify-between p-4 border-b border-gray-200">
                        <input
                            type="text"
                            placeholder="Search products..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            autoFocus
                            className="w-full text-lg outline-none"
                        />
                        <button onClick={() => setShowMobileSearch(false)}>
                            <X className="w-6 h-6 text-gray-600" />
                        </button>
                    </div>

                    <div className="flex-1 overflow-y-auto">
                        {loadingSearch && (
                            <div className="p-4 text-gray-500 text-sm">
                                Searching...
                            </div>
                        )}

                        {!loadingSearch && searchResults.length > 0 ? (
                            <div className="divide-y divide-gray-200">
                                {searchResults.map((p) => {
                                    const primaryImage = p.images?.find(
                                        (img) => img.isPrimary,
                                    )?.imageUrl;
                                    const imageSrc = primaryImage
                                        ? `${API_BASE}${primaryImage}`
                                        : `${API_BASE}${p.imageUrl}`;

                                    return (
                                        <button
                                            key={p.id}
                                            onClick={() =>
                                                handleSelectProduct(p.slug)
                                            }
                                            className="w-full flex items-center gap-3 p-4 text-left hover:bg-gray-50"
                                        >
                                            <Image
                                                src={getImageUrl(imageSrc)}
                                                alt={p.title}
                                                width={60}
                                                height={60}
                                                className="object-cover"
                                            />
                                            <div className="flex flex-col">
                                                <span className="text-gray-800 text-base">
                                                    {p.title}
                                                </span>
                                                {p.price && (
                                                    <span className="text-gray-500 text-sm">
                                                        Rp{" "}
                                                        {Number(
                                                            p.price,
                                                        ).toLocaleString(
                                                            "id-ID",
                                                        )}
                                                    </span>
                                                )}
                                            </div>
                                        </button>
                                    );
                                })}
                            </div>
                        ) : (
                            !loadingSearch &&
                            search && (
                                <div className="p-4 text-gray-500 text-sm">
                                    No results found.
                                </div>
                            )
                        )}
                    </div>
                </div>
            )}

            {/* Mobile Menu */}
            <div
                className={`lg:hidden fixed inset-0 z-[9998] bg-white flex flex-col items-center justify-center gap-8 text-2xl text-charcoal font-light transition-all duration-500 ${
                    openMenu
                        ? "opacity-100 translate-y-0"
                        : "opacity-0 translate-y-[-100%] pointer-events-none"
                }`}
            >
                {navItems.map((item, index) => (
                    <Link
                        key={item.href}
                        href={item.href}
                        onClick={() => setOpenMenu(false)}
                        className={`transition-all duration-500 hover:text-secondary hover:scale-110 ${
                            pathname === item.href
                                ? "text-secondary underline"
                                : ""
                        } ${
                            openMenu
                                ? "opacity-100 translate-x-0"
                                : "opacity-0 -translate-x-8"
                        }`}
                        style={{
                            transitionDelay: openMenu
                                ? `${index * 100}ms`
                                : "0ms",
                        }}
                    >
                        {item.name}
                    </Link>
                ))}
            </div>

            <CartModal open={openCart} onClose={() => setOpenCart(false)} />
        </>
    );
}
