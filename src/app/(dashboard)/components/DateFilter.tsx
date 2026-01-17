"use client";

import { useState } from "react";

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

const options: { label: string; value: DateFilterOption }[] = [
    { label: "Today", value: "today" },
    { label: "Yesterday", value: "yesterday" },
    { label: "This Week", value: "this_week" },
    { label: "Last Week", value: "last_week" },
    { label: "Last 30 Days", value: "last_30_days" },
    { label: "Last 60 Days", value: "last_60_days" },
];

export default function DateFilter({ value, onChange }: DateFilterProps) {
    const [open, setOpen] = useState(false);

    const selectedLabel =
        options.find((o) => o.value === value)?.label || "Last 30 Days";

    return (
        <div className="relative inline-block text-left">
            <div
                onClick={() => setOpen(!open)}
                className="bg-white px-4 py-3 rounded-lg shadow w-40 cursor-pointer flex justify-between items-center text-gray-700"
            >
                <span className="text-sm">{selectedLabel}</span>
                <svg
                    className={`w-4 h-4 transition-transform ${
                        open ? "rotate-180" : ""
                    }`}
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={2}
                    viewBox="0 0 24 24"
                >
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M19 9l-7 7-7-7"
                    />
                </svg>
            </div>

            {open && (
                <div className="absolute mt-1 w-40 bg-white rounded-lg shadow z-10">
                    {options.map((option) => (
                        <div
                            key={option.value}
                            onClick={() => {
                                onChange(option.value);
                                setOpen(false);
                            }}
                            className={`px-4 py-2 text-sm cursor-pointer hover:bg-gray-100 ${
                                option.value === value
                                    ? "bg-gray-50 font-medium"
                                    : ""
                            }`}
                        >
                            {option.label}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
