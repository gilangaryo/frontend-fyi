"use client";

import { useState, useRef, useEffect } from "react";
import { Calendar, ChevronDown, Check } from "lucide-react";

export type DateFilterOption =
    | "today"
    | "yesterday"
    | "this_week"
    | "last_week"
    | "last_30_days"
    | "last_60_days";

type DateFilterProps = {
    value: DateFilterOption;
    onChange: (value: DateFilterOption) => void;
};

const options: { label: string; value: DateFilterOption; desc: string }[] = [
    { label: "Today", value: "today", desc: "Current day" },
    { label: "Yesterday", value: "yesterday", desc: "Previous day" },
    { label: "This Week", value: "this_week", desc: "Mon – today" },
    { label: "Last Week", value: "last_week", desc: "Previous 7 days" },
    { label: "Last 30 Days", value: "last_30_days", desc: "Past month" },
    { label: "Last 60 Days", value: "last_60_days", desc: "Past 2 months" },
];

export default function DateFilter({ value, onChange }: DateFilterProps) {
    const [open, setOpen] = useState(false);
    const ref = useRef<HTMLDivElement>(null);

    const selectedLabel =
        options.find((o) => o.value === value)?.label || "Last 30 Days";

    // Close on click outside
    useEffect(() => {
        function handleClickOutside(e: MouseEvent) {
            if (ref.current && !ref.current.contains(e.target as Node)) {
                setOpen(false);
            }
        }
        if (open) document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [open]);

    return (
        <div className="relative inline-block text-left" ref={ref}>
            <button
                onClick={() => setOpen(!open)}
                className={`flex items-center gap-2 bg-white px-3.5 py-2 rounded-lg border text-sm font-medium transition-all duration-200 ${
                    open
                        ? "border-primary-studio ring-2 ring-primary-studio/20 text-primary-studio"
                        : "border-gray-200 text-gray-600 hover:border-gray-300 hover:bg-gray-50 shadow-sm"
                }`}
            >
                <Calendar size={15} className="shrink-0" />
                <span>{selectedLabel}</span>
                <ChevronDown
                    size={15}
                    className={`shrink-0 transition-transform duration-200 ${
                        open ? "rotate-180" : ""
                    }`}
                />
            </button>

            {open && (
                <div className="absolute left-0 mt-2 w-56 bg-white rounded-xl border border-gray-200 shadow-lg z-50 py-1.5 animate-in fade-in slide-in-from-top-1">
                    {options.map((option) => {
                        const isActive = option.value === value;
                        return (
                            <button
                                key={option.value}
                                onClick={() => {
                                    onChange(option.value);
                                    setOpen(false);
                                }}
                                className={`w-full flex items-center justify-between px-3.5 py-2.5 text-left transition-colors ${
                                    isActive
                                        ? "bg-primary-studio/5 text-primary-studio"
                                        : "text-gray-700 hover:bg-gray-50"
                                }`}
                            >
                                <div>
                                    <p className={`text-sm ${isActive ? "font-semibold" : "font-medium"}`}>
                                        {option.label}
                                    </p>
                                    <p className="text-[11px] text-gray-400 mt-0.5">{option.desc}</p>
                                </div>
                                {isActive && (
                                    <Check size={16} className="text-primary-studio shrink-0" />
                                )}
                            </button>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
