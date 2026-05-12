"use client";

import { useEffect, useState } from "react";
import { API_BASE } from "@/lib/constants";

const DEFAULT_OPEN_ANNOUNCEMENT = "Free shipping all over Indonesia";
const DEFAULT_CLOSED_MESSAGE =
    "Our store is currently closed — orders are temporarily unavailable.";

function getAnnouncementValue(payload: unknown) {
    if (!payload || typeof payload !== "object") return null;

    const directValue = "value" in payload ? payload.value : undefined;
    if (typeof directValue === "string") {
        return directValue;
    }

    const nestedData = "data" in payload ? payload.data : undefined;
    if (nestedData && typeof nestedData === "object" && "value" in nestedData) {
        return typeof nestedData.value === "string" ? nestedData.value : null;
    }

    return null;
}

const COURIER_OPTIONS = [
    { label: "JNE", value: "jne" },
    { label: "SiCepat", value: "sicepat" },
    { label: "J&T", value: "jnt" },
];

export default function SettingsPage() {
    const [storeOpen, setStoreOpen] = useState(true);
    const [announcement, setAnnouncement] = useState("");
    const [closedMessage, setClosedMessage] = useState("");
    const [defaultCourier, setDefaultCourier] = useState("");
    const [originAddress, setOriginAddress] = useState("");
    const [originNote, setOriginNote] = useState("");
    const [originPostalCode, setOriginPostalCode] = useState("");
    const [loading, setLoading] = useState(false);
    const [savingStore, setSavingStore] = useState(false);
    const [savingCourier, setSavingCourier] = useState(false);
    const [savingOrigin, setSavingOrigin] = useState(false);
    const [message, setMessage] = useState("");
    const [messageType, setMessageType] = useState<"success" | "error" | null>(
        null,
    );

    function showMessage(nextMessage: string, type: "success" | "error") {
        setMessage(nextMessage);
        setMessageType(type);
        setTimeout(() => {
            setMessage("");
            setMessageType(null);
        }, 3000);
    }

    useEffect(() => {
        (async () => {
            try {
                const [
                    storeRes,
                    courierRes,
                    announcementRes,
                    originAddrRes,
                    originNoteRes,
                    originPostalRes,
                ] = await Promise.all([
                    fetch(`${API_BASE}/setting/store-status`),
                    fetch(`${API_BASE}/setting/default-courier`),
                    fetch(`${API_BASE}/setting/announcement/announcement`),
                    fetch(`${API_BASE}/setting/origin_address`),
                    fetch(`${API_BASE}/setting/origin_note`),
                    fetch(`${API_BASE}/setting/origin_postal_code`),
                ]);

                const storeJson = await storeRes.json();
                const courierJson = await courierRes.json();
                const announcementJson = await announcementRes.json();
                const originAddrJson = await originAddrRes.json();
                const originNoteJson = await originNoteRes.json();
                const originPostalJson = await originPostalRes.json();

                if (storeJson.success) {
                    setStoreOpen(storeJson.data.isOpen);
                    setClosedMessage(
                        storeJson.data.closedMessage || DEFAULT_CLOSED_MESSAGE,
                    );
                }
                if (courierJson.success) {
                    setDefaultCourier(courierJson.data.value || "");
                }
                const announcementValue =
                    getAnnouncementValue(announcementJson);
                setAnnouncement(announcementValue || DEFAULT_OPEN_ANNOUNCEMENT);
                if (originAddrJson.success)
                    setOriginAddress(originAddrJson.data.value || "");
                if (originNoteJson.success)
                    setOriginNote(originNoteJson.data.value || "");
                if (originPostalJson.success)
                    setOriginPostalCode(originPostalJson.data.value || "");
            } catch (err) {
                console.error("Failed to fetch settings:", err);
                setAnnouncement(DEFAULT_OPEN_ANNOUNCEMENT);
            } finally {
                setLoading(false);
            }
        })();
    }, []);

    async function updateStoreStatus() {
        if (!storeOpen && !closedMessage.trim()) {
            return alert("Please enter a closed message.");
        }
        if (!announcement.trim()) {
            return alert("Please enter an announcement message.");
        }

        setSavingStore(true);
        try {
            const token = localStorage.getItem("token");
            const headers = {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
            };
            const [storeRes, announcementRes] = await Promise.all([
                fetch(`${API_BASE}/setting/store-status`, {
                    method: "PUT",
                    headers,
                    body: JSON.stringify({
                        isOpen: storeOpen,
                        closedMessage: closedMessage.trim(),
                    }),
                }),
                fetch(`${API_BASE}/setting/announcement/announcement`, {
                    method: "PUT",
                    headers,
                    body: JSON.stringify({
                        value: announcement.trim(),
                        isActive: true,
                    }),
                }),
            ]);
            const storeJson = await storeRes.json();
            const announcementJson = await announcementRes.json();

            const announcementSaved =
                announcementRes.ok &&
                (announcementJson?.key === "announcement" ||
                    typeof getAnnouncementValue(announcementJson) ===
                        "string" ||
                    announcementJson?.success === true);

            if (storeRes.ok && storeJson.success && announcementSaved) {
                setAnnouncement((current) => current.trim());
                showMessage("Store settings saved successfully!", "success");
            } else {
                showMessage("Failed to update store settings.", "error");
            }
        } catch (err) {
            console.error("Failed to update store status:", err);
            showMessage("Failed to update store settings.", "error");
        } finally {
            setSavingStore(false);
        }
    }

    async function updateOriginAddress() {
        if (!originAddress.trim())
            return alert("Please enter an origin address.");
        if (!originPostalCode.trim())
            return alert("Please enter an origin postal code.");
        setSavingOrigin(true);
        try {
            const token = localStorage.getItem("token");
            const headers = {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
            };
            const [addrRes, noteRes, postalRes] = await Promise.all([
                fetch(`${API_BASE}/setting/origin_address`, {
                    method: "PUT",
                    headers,
                    body: JSON.stringify({ value: originAddress.trim() }),
                }),
                fetch(`${API_BASE}/setting/origin_note`, {
                    method: "PUT",
                    headers,
                    body: JSON.stringify({ value: originNote.trim() }),
                }),
                fetch(`${API_BASE}/setting/origin_postal_code`, {
                    method: "PUT",
                    headers,
                    body: JSON.stringify({ value: originPostalCode.trim() }),
                }),
            ]);
            const [addrJson, noteJson, postalJson] = await Promise.all([
                addrRes.json(),
                noteRes.json(),
                postalRes.json(),
            ]);
            if (addrJson.success && noteJson.success && postalJson.success) {
                showMessage("Origin address saved successfully!", "success");
            } else {
                showMessage("Failed to save origin address.", "error");
            }
        } catch (err) {
            console.error("Failed to update origin address:", err);
            showMessage("Failed to save origin address.", "error");
        } finally {
            setSavingOrigin(false);
        }
    }

    async function updateCourier() {
        if (!defaultCourier) return alert("Please select a courier.");
        setSavingCourier(true);
        try {
            const token = localStorage.getItem("token");
            const res = await fetch(`${API_BASE}/setting/default-courier`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                    courier: defaultCourier,
                }),
            });
            const json = await res.json();
            if (json.success) {
                showMessage(
                    `Default courier set to ${defaultCourier.toUpperCase()}.`,
                    "success",
                );
            } else {
                showMessage("Failed to update default courier.", "error");
            }
        } catch (err) {
            console.error("Failed to update courier:", err);
            showMessage("Failed to update courier.", "error");
        } finally {
            setSavingCourier(false);
        }
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <p className="text-gray-500">Loading settings...</p>
            </div>
        );
    }

    return (
        <div className="max-w-full mx-auto  bg-white shadow-lg p-8 rounded-xl space-y-8">
            <div>
                <h1 className="text-2xl font-semibold text-gray-800">
                    Store Settings
                </h1>
                <p className="text-sm text-gray-500 mt-1">
                    Manage your store status, announcements, and shipping
                    settings
                </p>
            </div>

            {/* Store Status Section */}
            <div className="border border-gray-200 rounded-lg p-6 space-y-4">
                <div className="flex items-center justify-between">
                    <div>
                        <p className="text-gray-800 font-semibold text-lg">
                            Store Status
                        </p>
                        <p className="text-sm text-gray-500 mt-1">
                            Control whether customers can place orders
                        </p>
                    </div>

                    <div
                        onClick={() => setStoreOpen(!storeOpen)}
                        className={`relative inline-flex h-7 w-14 items-center rounded-full transition cursor-pointer ${
                            storeOpen ? "bg-green-500" : "bg-gray-300"
                        }`}
                    >
                        <span
                            className={`inline-block h-6 w-6 transform rounded-full bg-white transition shadow-md ${
                                storeOpen ? "translate-x-7" : "translate-x-1"
                            }`}
                        />
                    </div>
                </div>

                {/* Status Indicator */}
                <div
                    className={`px-4 py-2 rounded-lg ${
                        storeOpen
                            ? "bg-green-50 text-green-700 border border-green-200"
                            : "bg-red-50 text-red-700 border border-red-200"
                    }`}
                >
                    <p className="text-sm font-medium">
                        {storeOpen
                            ? "Store is OPEN - Customers can place orders"
                            : "Store is CLOSED - Orders are disabled"}
                    </p>
                </div>

                <div className="space-y-3 pt-4 border-t border-gray-200">
                    <div>
                        <label className="block text-gray-700 font-medium mb-2">
                            Open Announcement
                        </label>
                        <p className="text-sm text-gray-500 mb-3">
                            This message will appear in the announcement bar
                            when store is open
                        </p>
                        <textarea
                            value={announcement}
                            onChange={(e) => setAnnouncement(e.target.value)}
                            rows={3}
                            placeholder="e.g., Free shipping all over Indonesia"
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-studio focus:border-transparent focus:outline-none resize-none"
                        />
                        <p className="text-xs text-gray-400 mt-2">
                            {announcement.length} characters
                        </p>
                    </div>
                </div>

                {/* Custom Closed Message */}
                {!storeOpen && (
                    <div className="space-y-3 pt-4 border-t border-gray-200">
                        <div>
                            <label className="block text-gray-700 font-medium mb-2">
                                Custom Closed Message
                            </label>
                            <p className="text-sm text-gray-500 mb-3">
                                This message will appear in the announcement bar
                                when store is closed
                            </p>
                            <textarea
                                value={closedMessage}
                                onChange={(e) =>
                                    setClosedMessage(e.target.value)
                                }
                                rows={3}
                                placeholder="e.g., Our store is temporarily closed for maintenance. We'll be back soon!"
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-studio focus:border-transparent focus:outline-none resize-none"
                            />
                            <p className="text-xs text-gray-400 mt-2">
                                {closedMessage.length} characters
                            </p>
                        </div>

                        {/* Preview */}
                        {/* {closedMessage.trim() && (
                            <div>
                                <label className="block text-gray-700 font-medium mb-2">Preview</label>
                                <div className="bg-red-600 text-white text-center py-3 rounded-lg text-sm font-medium">
                                    {closedMessage}
                                </div>
                            </div>
                        )} */}
                    </div>
                )}

                {/* Save Store Settings Button */}
                <button
                    onClick={updateStoreStatus}
                    disabled={savingStore}
                    className={`w-full mt-4 px-4 py-3 rounded-lg font-medium text-white transition ${
                        savingStore
                            ? "bg-gray-400 cursor-not-allowed"
                            : "bg-primary-studio hover:bg-secondary-studio"
                    }`}
                >
                    {savingStore ? "Saving..." : "Save Store Settings"}
                </button>
            </div>

            {/* Store Origin Address Section */}
            <div className="border border-gray-200 rounded-lg p-6 space-y-4">
                <div>
                    <p className="text-gray-800 font-semibold text-lg">
                        Store Origin Address
                    </p>
                    <p className="text-sm text-gray-500 mt-1">
                        Origin address used for Biteship shipping calculations
                    </p>
                </div>

                <div>
                    <label className="block text-gray-700 font-medium mb-2">
                        Origin Address
                    </label>
                    <textarea
                        value={originAddress}
                        onChange={(e) => setOriginAddress(e.target.value)}
                        rows={3}
                        placeholder="e.g., Jl. Tanah Barak No.15, Canggu, Kec. Kuta Utara, Kabupaten Badung, Bali 80351"
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-studio focus:border-transparent focus:outline-none resize-none"
                    />
                </div>

                <div>
                    <label className="block text-gray-700 font-medium mb-2">
                        Origin Note / Store Name
                    </label>
                    <input
                        type="text"
                        value={originNote}
                        onChange={(e) => setOriginNote(e.target.value)}
                        placeholder="e.g., FYI Couture Store"
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-studio focus:border-transparent focus:outline-none"
                    />
                </div>

                <div>
                    <label className="block text-gray-700 font-medium mb-2">
                        Origin Postal Code
                    </label>
                    <input
                        type="text"
                        value={originPostalCode}
                        onChange={(e) => setOriginPostalCode(e.target.value)}
                        placeholder="e.g., 80351"
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-studio focus:border-transparent focus:outline-none"
                    />
                </div>

                <button
                    onClick={updateOriginAddress}
                    disabled={savingOrigin}
                    className={`w-full mt-4 px-4 py-3 rounded-lg font-medium text-white transition ${
                        savingOrigin
                            ? "bg-gray-400 cursor-not-allowed"
                            : "bg-primary-studio hover:bg-secondary-studio"
                    }`}
                >
                    {savingOrigin ? "Saving..." : "Save Origin Address"}
                </button>
            </div>

            {/* Default Courier Section */}
            <div className="border border-gray-200 rounded-lg p-6 space-y-4">
                <div>
                    <p className="text-gray-800 font-semibold text-lg">
                        Default Courier
                    </p>
                    <p className="text-sm text-gray-500 mt-1">
                        Set the default shipping courier for orders
                    </p>
                </div>

                <div className="flex gap-3">
                    <select
                        className="border border-gray-300 rounded-lg px-4 py-3 flex-1 text-gray-700 focus:outline-none focus:ring-2 focus:ring-primary-studio focus:border-transparent"
                        value={defaultCourier}
                        onChange={(e) => setDefaultCourier(e.target.value)}
                    >
                        <option value="">Select Courier</option>
                        {COURIER_OPTIONS.map((opt) => (
                            <option key={opt.value} value={opt.value}>
                                {opt.label}
                            </option>
                        ))}
                    </select>

                    <button
                        onClick={updateCourier}
                        disabled={savingCourier || !defaultCourier}
                        className={`px-6 py-3 rounded-lg font-medium text-white transition ${
                            savingCourier || !defaultCourier
                                ? "bg-gray-400 cursor-not-allowed"
                                : "bg-primary-studio hover:bg-secondary-studio"
                        }`}
                    >
                        {savingCourier ? "Saving..." : "Save Courier"}
                    </button>
                </div>

                {defaultCourier && (
                    <div className="px-4 py-2 rounded-lg bg-primary-studio/10 text-primary-studio border border-blue-200">
                        <p className="text-sm">
                            Current default courier:{" "}
                            <span className="font-semibold">
                                {defaultCourier.toUpperCase()}
                            </span>
                        </p>
                    </div>
                )}
            </div>

            {/* Success/Error Message */}
            {message && (
                <div
                    className={`p-4 rounded-lg border ${
                        messageType === "success"
                            ? "bg-green-50 text-green-700 border-green-200"
                            : "bg-red-50 text-red-700 border-red-200"
                    }`}
                >
                    <p className="text-sm font-medium">{message}</p>
                </div>
            )}
        </div>
    );
}
