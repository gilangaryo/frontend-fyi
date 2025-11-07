"use client";

import { useState } from "react";

export default function DateFilter() {
    const [open, setOpen] = useState(false);
    const [selected, setSelected] = useState("Last 30 days");

    const options = [
        "Yesterday",
        "This Week",
        "Last Week",
        "Last 30 Days",
        "Last 60 Days",
    ];

    return (
        <div className="relative inline-block text-left">
            {/* Button */}
            <div
                onClick={() => setOpen(!open)}
                className="bg-white px-4 py-3 rounded-lg shadow w-40 cursor-pointer flex justify-between items-center text-gray-700"
            >
                <span className="text-sm">{selected}</span>
                <svg
                    className={`w-4 h-4 transition-transform ${open ? "rotate-180" : ""
                        }`}
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={2}
                    viewBox="0 0 24 24"
                >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                </svg>
            </div>

            {/* Dropdown */}
            {open && (
                <div className="absolute mt-1 w-40  bg-white rounded-lg shadow z-10">
                    {options.map((option, i) => (
                        <div
                            key={i}
                            onClick={() => {
                                setSelected(option);
                                setOpen(false);
                            }}
                            className={`px-4 py-2 text-sm cursor-pointer hover:bg-gray-100 ${option === "Custom" ? "border-b border-gray-200" : ""
                                }`}
                        >
                            {option}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
