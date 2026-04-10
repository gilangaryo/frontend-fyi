"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { ChevronDown } from "lucide-react";

export type ProductFilterOption = {
    label: string;
    value: string;
};

type ProductFilterDropdownProps = {
    label: string;
    options: ProductFilterOption[];
    selected: string[];
    onChange: (value: string[]) => void;
    emptyLabel?: string;
};

export default function ProductFilterDropdown({
    label,
    options,
    selected,
    onChange,
    emptyLabel,
}: ProductFilterDropdownProps) {
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

    const selectedLabel = useMemo(() => {
        if (selected.length === 0) {
            return emptyLabel || label;
        }

        const selectedOptions = options.filter((option) =>
            selected.includes(option.value),
        );

        if (selectedOptions.length === 1) {
            return selectedOptions[0].label;
        }

        return `${selectedOptions.length} selected`;
    }, [emptyLabel, label, options, selected]);

    function toggleSelection(value: string) {
        if (selected.includes(value)) {
            onChange(selected.filter((item) => item !== value));
            return;
        }

        onChange([...selected, value]);
    }

    return (
        <div className="relative min-w-[180px]" ref={dropdownRef}>
            <button
                type="button"
                onClick={() => setOpen((prev) => !prev)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-white hover:bg-gray-50 transition flex items-center justify-between gap-3 focus:ring-2 focus:ring-primary-studio focus:outline-none"
            >
                <div className="min-w-0 text-left">
                    <p className="text-[11px] uppercase tracking-[0.18em] text-gray-400">
                        {label}
                    </p>
                    <p className="text-sm text-gray-700 truncate">
                        {selectedLabel}
                    </p>
                </div>
                <ChevronDown
                    className={`w-4 h-4 shrink-0 text-gray-400 transition-transform ${open ? "rotate-180" : ""}`}
                />
            </button>

            {open && (
                <div className="absolute left-0 z-20 mt-1 w-full min-w-[240px] rounded-lg border border-gray-200 bg-white shadow-lg overflow-hidden">
                    <div className="flex items-center justify-between border-b border-gray-100 px-4 py-2">
                        <span className="text-xs font-medium uppercase tracking-[0.18em] text-gray-400">
                            {label}
                        </span>
                        {selected.length > 0 && (
                            <button
                                type="button"
                                onClick={() => onChange([])}
                                className="text-xs font-medium text-primary-studio hover:opacity-80"
                            >
                                Clear
                            </button>
                        )}
                    </div>

                    <div className="max-h-64 overflow-y-auto py-1">
                        {options.length === 0 ? (
                            <div className="px-4 py-3 text-sm text-gray-400">
                                No options available.
                            </div>
                        ) : (
                            options.map((option) => {
                                const isChecked = selected.includes(
                                    option.value,
                                );

                                return (
                                    <label
                                        key={option.value}
                                        className={`flex cursor-pointer items-center gap-3 px-4 py-2.5 text-sm transition ${
                                            isChecked
                                                ? "bg-primary-studio/5 text-primary-studio"
                                                : "text-gray-700 hover:bg-gray-50"
                                        }`}
                                    >
                                        <input
                                            type="checkbox"
                                            checked={isChecked}
                                            onChange={() =>
                                                toggleSelection(option.value)
                                            }
                                            className="h-4 w-4 rounded border-gray-300 text-primary-studio focus:ring-primary-studio"
                                        />
                                        <span className="truncate">
                                            {option.label}
                                        </span>
                                    </label>
                                );
                            })
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
