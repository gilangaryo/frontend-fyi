"use client";

import { ChevronDown } from "lucide-react";

type FilterDropdownProps = {
    label: string;
    options: string[];
    selected: string[];
    setSelected: React.Dispatch<React.SetStateAction<string[]>>;
    openFilter: string | null;
    setOpenFilter: (val: string | null) => void;
    filterKey: string;
};

export default function FilterDropdown({
    label,
    options,
    selected,
    setSelected,
    openFilter,
    setOpenFilter,
    filterKey,
}: FilterDropdownProps) {
    const toggleSelection = (value: string) => {
        if (selected.includes(value)) {
            setSelected(selected.filter((v) => v !== value));
        } else {
            setSelected([...selected, value]);
        }
    };

    const isOpen = openFilter === filterKey;

    return (
        <div className="relative w-full">
            <button
                className="flex items-center justify-between w-full border-b border-black pb-1"
                onClick={() => setOpenFilter(isOpen ? null : filterKey)}
            >
                {label} <ChevronDown size={18} />
            </button>

            {isOpen && (
                <>
                    {/* Overlay untuk mobile */}
                    <div
                        className="fixed inset-0 bg-black/40 z-40 md:hidden"
                        onClick={() => setOpenFilter(null)}
                    />

                    {/* MOBILE: Dropdown full width centered */}
                    <div className="md:hidden fixed left-0 right-0 top-[280px] mx-auto max-w-7xl px-6 z-50">
                        <div className="bg-white shadow-lg p-6 border border-gray-200">
                            <h3 className="font-medium text-lg mb-4 text-center">{label}</h3>
                            <div className="grid grid-cols-1 gap-3">
                                {options.map((opt) => (
                                    <label key={opt} className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 p-2 rounded">
                                        <input
                                            type="checkbox"
                                            checked={selected.includes(opt)}
                                            onChange={() => toggleSelection(opt)}
                                            className="
                                                w-4 h-4 border border-gray-400 rounded-sm cursor-pointer appearance-none
                                                checked:bg-secondary checked:border-secondary
                                                checked:before:content-['✓'] checked:before:text-white
                                                checked:before:text-[10px] checked:before:flex checked:before:items-center
                                                checked:before:justify-center
                                            "
                                        />
                                        <span className="text-sm">{opt}</span>
                                    </label>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* DESKTOP: Dropdown di bawah button (seperti semula) */}
                    <div className="hidden md:block absolute top-full left-0 w-full bg-white shadow-md p-4 z-50">
                        {options.map((opt) => (
                            <label key={opt} className="flex items-center gap-2 mb-2 cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={selected.includes(opt)}
                                    onChange={() => toggleSelection(opt)}
                                    className="
                                        w-4 h-4 border border-gray-400 rounded-sm cursor-pointer appearance-none
                                        checked:bg-secondary checked:border-secondary
                                        checked:before:content-['✓'] checked:before:text-white
                                        checked:before:text-[10px] checked:before:flex checked:before:items-center
                                        checked:before:justify-center
                                    "
                                />
                                {opt}
                            </label>
                        ))}
                    </div>
                </>
            )}
        </div>
    );
}