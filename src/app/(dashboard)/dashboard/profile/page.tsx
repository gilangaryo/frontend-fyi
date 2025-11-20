"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import ProfileTab from "../../components/profile/ProfileTab";
import BusinessTab from "../../components/profile/BusinessTab";
import ReportsTab from "../../components/profile/ReportsTab";
import RoleTab from "../../components/profile/RoleTab";
import { API_BASE } from "@/lib/constants";

type TabType = "profile" | "business" | "reports" | "role";

interface UserProfile {
    id: string;
    email: string;
    role: string;
}
const hashToTab: Record<string, TabType> = {
    "#profile": "profile",
    "#business": "business",
    "#reports": "reports",
    "#role": "role",
};

export default function ProfilePage() {
    const [activeTab, setActiveTab] = useState<TabType>("profile");
    const [user, setUser] = useState<UserProfile | null>(null);
    const [loading, setLoading] = useState(true);
    const router = useRouter();
    useEffect(() => {
        const hash = window.location.hash;
        if (hash && hashToTab[hash]) {
            setActiveTab(hashToTab[hash]);
        }
    }, [user]);

    useEffect(() => {
        async function fetchUserProfile() {
            try {
                const token = localStorage.getItem("token");
                if (!token) {
                    router.push("/login");
                    return;
                }

                const res = await fetch(`${API_BASE}/auth/me`, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });

                if (!res.ok) throw new Error("Failed to fetch profile");

                const data = await res.json();

                if (data.success) {
                    setUser(data.user);
                } else {
                    throw new Error("Invalid response");
                }
            } catch (error) {
                console.error("❌ Error fetching profile:", error);
                router.push("/login");
            } finally {
                setLoading(false);
            }
        }

        fetchUserProfile();
    }, [router]);

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
            </div>
        );
    }

    if (!user) return null;

    // Extract name from email (before ../..)
    const displayName = user.email.split("../..")[0];

    return (
        <div className="min-h-screen bg-gray-50 p-6 md:p-10">
            {/* Header */}
            <div className="mb-8">
                <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
                    Admin Profile
                </h1>
                <p className="text-gray-600">Welcome back, {displayName}!</p>
            </div>

            {/* Tabs Navigation */}
            <div className="flex gap-8 border-b-2 border-gray-200 mb-8">
                <button
                    onClick={() => setActiveTab("profile")}
                    className={`pb-3 text-lg font-medium transition-colors ${
                        activeTab === "profile"
                            ? "text-primary-studio border-b-2 border-primary-studio"
                            : "text-gray-400 hover:text-gray-600"
                    }`}
                >
                    Profile
                </button>

                {user.role === "ADMIN" && (
                    <>
                        <button
                            onClick={() => setActiveTab("business")}
                            className={`pb-3 text-lg font-medium transition-colors ${
                                activeTab === "business"
                                    ? "text-primary-studio border-b-2 border-primary-studio"
                                    : "text-gray-400 hover:text-gray-600"
                            }`}
                        >
                            Business
                        </button>

                        <button
                            onClick={() => setActiveTab("reports")}
                            className={`pb-3 text-lg font-medium transition-colors ${
                                activeTab === "reports"
                                    ? "text-primary-studio border-b-2 border-primary-studio"
                                    : "text-gray-400 hover:text-gray-600"
                            }`}
                        >
                            Reports
                        </button>

                        <button
                            onClick={() => setActiveTab("role")}
                            className={`pb-3 text-lg font-medium transition-colors ${
                                activeTab === "role"
                                    ? "text-primary-studio border-b-2 border-primary-studio"
                                    : "text-gray-400 hover:text-gray-600"
                            }`}
                        >
                            Role
                        </button>
                    </>
                )}
            </div>

            {/* Tab Content */}
            <div className="bg-white rounded-lg shadow-sm p-6 md:p-8">
                {activeTab === "profile" && <ProfileTab user={user} />}
                {activeTab === "business" && <BusinessTab />}
                {activeTab === "reports" && <ReportsTab />}
                {activeTab === "role" && <RoleTab user={user} />}
            </div>
        </div>
    );
}
