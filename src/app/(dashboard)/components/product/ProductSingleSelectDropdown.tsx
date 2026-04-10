"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { ChevronDown } from "lucide-react";

export type ProductSingleSelectOption<T extends string> = {
    value: T;
    label: string;
};

type ProductSingleSelectDropdownProps<T extends string> = {
    value: T;
    options: ProductSingleSelectOption<T>[];
    onChange: (value: T) => void;
    minWidthClassName?: string;
};

export default function ProductSingleSelectDropdown<T extends string>({
    value,
    options,
    onChange,
    minWidthClassName = "min-w-[160px]",
}: ProductSingleSelectDropdownProps<T>) {
    const [open, setOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (
                dropdownRef.current &&
                !dropdownRef.current.contains(event.target as Node)
            ) {
                setOpen(false);
            }
        }

        if (open) {
            document.addEventListener("mousedown", handleClickOutside);
        }

        return () =>
            document.removeEventListener("mousedown", handleClickOutside);
    }, [open]);

    const selectedLabel = useMemo(
        () => options.find((option) => option.value === value)?.label || "-",
        [options, value],
    );

    return (
        <div className={`relative ${minWidthClassName}`} ref={dropdownRef}>
            <button
                type="button"
                onClick={() => setOpen((prev) => !prev)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-white hover:bg-gray-50 transition flex items-center justify-between focus:ring-2 focus:ring-primary-studio focus:outline-none"
            >
                <span className="text-gray-700 pr-2">{selectedLabel}</span>
                <ChevronDown
                    className={`w-4 h-4 text-gray-400 transition-transform ${open ? "rotate-180" : ""}`}
                />
            </button>

            {open && (
                <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg overflow-hidden">
                    {options.map((option) => (
                        <button
                            key={option.value}
                            type="button"
                            onClick={() => {
                                onChange(option.value);
                                setOpen(false);
                            }}
                            className={`w-full px-4 py-2.5 text-left hover:bg-gray-50 transition ${
                                value === option.value
                                    ? "bg-primary-studio/10 text-primary-studio font-medium"
                                    : "text-gray-700"
                            }`}
                        >
                            {option.label}
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
}
