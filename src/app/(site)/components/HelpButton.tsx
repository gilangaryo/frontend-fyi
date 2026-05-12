"use client";

import { useState } from "react";
import { MessageCircle, X, Mail, Phone, MessageSquare } from "lucide-react";

export default function HelpButton() {
    const [open, setOpen] = useState(false);

    return (
        <>
            <button
                onClick={() => setOpen(!open)}
                className="fixed bottom-6 right-6 z-[9999] bg-secondary text-white p-4 rounded-full shadow-lg hover:bg-[#6B5435] transition-all"
                aria-label="Help"
            >
                {open ? <X size={22} /> : <MessageCircle size={24} />}
            </button>

            {open && (
                <div className="fixed bottom-20 right-6 z-[9999] w-72 bg-white shadow-xl rounded-lg border border-gray-200 overflow-hidden">
                    <div className="bg-secondary text-white px-4 py-3 text-sm font-medium">
                        Welcome to FYI Couture
                    </div>
                    <div className="p-4 space-y-4 text-gray-700 text-sm">
                        <div className="flex items-center gap-3">
                            <Mail size={18} className="text-secondary" />
                            <div>
                                <p className="font-medium">Our Email</p>
                                <a
                                    href="mailto:foryourinfinity@gmail.com"
                                    className="text-xs text-gray-500 hover:underline"
                                >
                                    foryourinfinity@gmail.com
                                </a>
                            </div>
                        </div>

                        <div className="flex items-center gap-3">
                            <MessageSquare
                                size={18}
                                className="text-secondary"
                            />
                            <div>
                                <p className="font-medium">Chat via WhatsApp</p>
                                <a
                                    href="https://wa.me/+628132883889"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-xs text-gray-500 hover:underline"
                                >
                                    FYI Couture (Admin)
                                </a>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
