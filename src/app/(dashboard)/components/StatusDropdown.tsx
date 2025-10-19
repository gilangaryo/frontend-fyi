"use client";

import { useState, useRef, useEffect } from "react";

type StatusOption = {
    value: "Active" | "Inactive";
    label: string;
    color: string;
};

const options: StatusOption[] = [
    { value: "Active", label: "Active", color: "bg-green-500" },
    { value: "Inactive", label: "Inactive", color: "bg-red-500" },
];

export default function StatusDropdown({
    initial = "Active",
    onChange,
}: {
    initial?: "Active" | "Inactive";
    onChange?: (value: "Active" | "Inactive") => void;
}) {
    const [open, setOpen] = useState(false);
    const [selected, setSelected] = useState<StatusOption>(
        options.find((o) => o.value === initial) || options[0]
    );

    const dropdownRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        function handleClickOutside(e: MouseEvent) {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
                setOpen(false);
            }
        }

        if (open) document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [open]);

    const handleSelect = (option: StatusOption) => {
        setSelected(option);
        setOpen(false);
        onChange?.(option.value);
    };

    return (
        <div className="relative w-max " ref={dropdownRef}>
            {/* Selected value */}
            <button
                onClick={() => setOpen((prev) => !prev)}
                className="flex items-center gap-2 border border-gray-300 rounded px-3 py-1.5 text-sm text-gray-700 bg-white shadow-sm hover:bg-gray-50"
            >
                <span className={`w-2.5 h-2.5 rounded-full ${selected.color}`} />
                {selected.label}
                <svg
                    className={`w-4 h-4 text-gray-500 transition-transform duration-200 ${open ? "rotate-180" : ""
                        }`}
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={2}
                    viewBox="0 0 24 24"
                >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                </svg>
            </button>

            {/* Dropdown menu */}
            {open && (
                <div
                    className="absolute top-full left-0 mt-1 w-full bg-white border border-gray-200 rounded shadow-lg z-[9999]"
                    style={{
                        transformOrigin: "top",
                        animation: "fadeIn 0.12s ease-out",
                    }}
                >
                    {options.map((option) => (
                        <div
                            key={option.value}
                            onClick={() => handleSelect(option)}
                            className={`flex items-center gap-2 px-3 py-2 text-sm cursor-pointer hover:bg-sky-100 ${option.value === selected.value ? "bg-sky-100" : ""
                                }`}
                        >
                            <span className={`w-2.5 h-2.5 rounded-full ${option.color}`} />
                            {option.label}
                        </div>
                    ))}
                </div>
            )}

            {/* Small animation style */}
            <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: scaleY(0.95);
          }
          to {
            opacity: 1;
            transform: scaleY(1);
          }
        }
      `}</style>
        </div>
    );
}
