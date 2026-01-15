"use client";

import { useState, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import NavItem from "../components/NavItem";
import HelpCard from "../components/HelpCard";
// import AvatarImage from "../components/AvatarImage";

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const [collapsed, setCollapsed] = useState(false);
    const [mobileOpen, setMobileOpen] = useState(false);
    const [user, setUser] = useState<{ name?: string; role?: string } | null>(
        null
    );

    const [checkingAuth, setCheckingAuth] = useState(true);

    const pathname = usePathname();
    const router = useRouter();

    useEffect(() => {
        const token = localStorage.getItem("token");
        const storedUser = localStorage.getItem("user");

        if (!token) {
            router.replace("/login");
            return;
        }

        if (storedUser) {
            try {
                setUser(JSON.parse(storedUser));
            } catch {
                console.error("Invalid user data in localStorage");
            }
        }

        setCheckingAuth(false);
    }, [router]);
    useEffect(() => {
        if (!checkingAuth && user?.role === "EMPLOYEE") {
            if (pathname === "/dashboard") {
                router.replace("/dashboard/product");
            }
        }
    }, [checkingAuth, user, pathname, router]);

    useEffect(() => {
        const handleResize = () => {
            if (window.innerWidth < 768) setCollapsed(true);
        };

        handleResize();
        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    }, []);

    if (checkingAuth) {
        return (
            <div className="h-screen w-full flex items-center justify-center text-gray-500">
                Checking session...
            </div>
        );
    }

    // MENU ADMIN
    const navItemsAdmin = [
        {
            name: "Dashboard",
            href: "/dashboard",
            iconDefault: "/dashboard/icons/dashboard-black.svg",
            iconActive: "/dashboard/icons/dashboard-white.svg",
        },
        {
            name: "Product",
            href: "/dashboard/product",
            iconDefault: "/dashboard/icons/product-black.svg",
            iconActive: "/dashboard/icons/product-white.svg",
        },
        {
            name: "Manage Sales",
            href: "/dashboard/manage-sales",
            iconDefault: "/dashboard/icons/beyond-black.svg",
            iconActive: "/dashboard/icons/beyond-white.svg",
        },
        {
            name: "Beyond",
            href: "/dashboard/beyond",
            iconDefault: "/dashboard/icons/beyond-black.svg",
            iconActive: "/dashboard/icons/beyond-white.svg",
        },
        {
            name: "Store Settings",
            href: "/dashboard/settings",
            iconDefault: "/dashboard/icons/beyond-black.svg",
            iconActive: "/dashboard/icons/beyond-white.svg",
        },
        {
            name: "Discount",
            href: "/dashboard/discount",
            iconDefault: "/dashboard/icons/beyond-black.svg",
            iconActive: "/dashboard/icons/beyond-white.svg",
        },
    ];

    // MENU EMPLOYEE (lebih sedikit)
    const navItemsEmployee = [
        {
            name: "Product",
            href: "/dashboard/product",
            iconDefault: "/dashboard/icons/product-black.svg",
            iconActive: "/dashboard/icons/product-white.svg",
        },
        {
            name: "Manage Sales",
            href: "/dashboard/manage-sales",
            iconDefault: "/dashboard/icons/beyond-black.svg",
            iconActive: "/dashboard/icons/beyond-white.svg",
        },
        {
            name: "Beyond",
            href: "/dashboard/beyond",
            iconDefault: "/dashboard/icons/beyond-black.svg",
            iconActive: "/dashboard/icons/beyond-white.svg",
        },
    ];

    // PILIH MENU DARI ROLE
    const navItems =
        user?.role === "EMPLOYEE" ? navItemsEmployee : navItemsAdmin;

    const closeMobileMenu = () => {
        if (window.innerWidth < 768) setMobileOpen(false);
    };

    function handleLogout() {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        document.cookie = "token=; path=/; max-age=0;";
        router.replace("/login");
    }

    return (
        <div className="flex min-h-screen">
            <button
                onClick={() => setMobileOpen(!mobileOpen)}
                className="md:hidden fixed top-4 left-4 z-50 bg-white p-2 shadow-lg"
            >
                <svg
                    className="w-6 h-6"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                >
                    {mobileOpen ? (
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M6 18L18 6M6 6l12 12"
                        />
                    ) : (
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M4 6h16M4 12h16M4 18h16"
                        />
                    )}
                </svg>
            </button>

            {mobileOpen && (
                <div
                    className="md:hidden fixed inset-0 bg-black bg-opacity-50 z-30"
                    onClick={() => setMobileOpen(false)}
                />
            )}

            <aside
                className={`fixed left-0 top-0 h-screen bg-white border-r border-gray-200 shadow-sm transition-all duration-300 z-40
          flex flex-col overflow-y-auto
          ${collapsed ? "w-16 md:w-20" : "w-64 md:w-70"}
          ${mobileOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"}
        `}
            >
                <div className="flex flex-col justify-between h-full p-4">
                    <div
                        className={`flex flex-col space-y-4 ${
                            collapsed ? "items-center" : ""
                        }`}
                    >
                        <div
                            className={`flex ${
                                collapsed ? "justify-center" : "justify-between"
                            } items-center w-full`}
                        >
                            {!collapsed && (
                                <div className="flex items-center gap-1 text-primary-studio font-medium text-sm">
                                    <Image
                                        src="/dashboard/logo-tumbuhin.svg"
                                        alt="Logo"
                                        width={45}
                                        height={45}
                                    />
                                    <span className="leading-normal">
                                        Tumbuhin
                                        <br /> E-commerce
                                    </span>
                                </div>
                            )}
                            <button
                                onClick={() => setCollapsed(!collapsed)}
                                className="cursor-pointer hidden md:block"
                            >
                                <Image
                                    src={
                                        collapsed
                                            ? "/dashboard/icons/arrow-right.svg"
                                            : "/dashboard/icons/arrow-left.svg"
                                    }
                                    alt="toggle"
                                    width={28}
                                    height={28}
                                />
                            </button>
                        </div>

                        {!collapsed && (
                            <h2 className="text-base text-gray-500 mb-2">
                                Operations
                            </h2>
                        )}

                        {/* Nav */}
                        <nav
                            className={`flex flex-col ${
                                collapsed ? "items-center" : ""
                            }`}
                        >
                            {navItems.map((item) => {
                                const active =
                                    item.href === "/dashboard"
                                        ? pathname === "/dashboard"
                                        : pathname.startsWith(item.href);

                                return (
                                    <NavItem
                                        key={item.href}
                                        {...item}
                                        active={active}
                                        collapsed={collapsed}
                                        onClick={closeMobileMenu}
                                    />
                                );
                            })}
                        </nav>
                    </div>

                    {/* Account Section */}
                    <div
                        className={`flex flex-col ${
                            collapsed ? "items-center" : ""
                        }`}
                    >
                        {!collapsed && (
                            <>
                                <hr className="my-4 border-gray-300" />
                                <h2 className="text-base text-gray-500 mb-2">
                                    Account
                                </h2>
                            </>
                        )}

                        {/* Profile Link */}
                        <Link
                            href="/dashboard/profile"
                            onClick={closeMobileMenu}
                            className={`flex items-center gap-3 p-3 transition ${
                                pathname.startsWith("/dashboard/profile")
                                    ? "bg-primary-studio text-white hover:bg-primary-studio/90 border-l-4 border-secondary-studio"
                                    : "hover:bg-gray-100"
                            } ${collapsed ? "justify-center" : ""}`}
                        >
                            {!collapsed && (
                                <div className="flex-1">
                                    <p className="text-sm font-medium">
                                        {user?.name || "Admin User"}
                                    </p>
                                    <p className="text-xs opacity-70">
                                        {user?.role || "Admin"}
                                    </p>
                                </div>
                            )}
                        </Link>

                        {/* Logout Button */}
                        <button
                            onClick={handleLogout}
                            className={`flex items-center gap-3 text-sm hover:underline w-full p-3 hover:bg-gray-100 transition  mt-2
                    ${collapsed ? "justify-center" : ""}`}
                        >
                            <Image
                                src="/dashboard/icons/logout.svg"
                                alt="logout"
                                width={16}
                                height={16}
                            />
                            {!collapsed && "Log Out"}
                        </button>

                        {!collapsed && <HelpCard />}
                    </div>
                </div>
            </aside>

            <main
                className={`flex-1 transition-all duration-300 bg-gray-50 min-h-screen p-4 md:p-6
          ${collapsed ? "md:ml-20" : "md:ml-70"}
          pt-16 md:pt-6`}
            >
                {children}
            </main>
        </div>
    );
}
