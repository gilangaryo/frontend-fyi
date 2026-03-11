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

                    {/* MOBILE: Bottom sheet */}
                    <div className="md:hidden fixed inset-x-0 bottom-0 z-50 flex flex-col max-h-[70vh] bg-white shadow-2xl rounded-t-2xl border-t border-gray-200">
                        {/* Handle bar */}
                        <div className="flex justify-center pt-3 pb-1 flex-shrink-0">
                            <div className="w-10 h-1 rounded-full bg-gray-300" />
                        </div>
                        {/* Header */}
                        <div className="flex items-center justify-between px-6 py-3 flex-shrink-0 border-b border-gray-100">
                            <h3 className="font-medium text-lg">{label}</h3>
                            <button
                                onClick={() => setOpenFilter(null)}
                                className="text-gray-400 hover:text-gray-600 text-2xl leading-none"
                            >
                                ×
                            </button>
                        </div>
                        {/* Scrollable options */}
                        <div className="overflow-y-auto flex-1 px-6 py-4">
                            <div className="grid grid-cols-2 gap-2 mb-6">
                                {options.map((opt) => (
                                    <label
                                        key={opt}
                                        className="relative block cursor-pointer rounded border border-gray-200 bg-white p-3 pr-9 hover:bg-gray-50"
                                    >
                                        <input
                                            type="checkbox"
                                            checked={selected.includes(opt)}
                                            onChange={() =>
                                                toggleSelection(opt)
                                            }
                                            className="
                                                absolute right-3 top-3 h-4 w-4 appearance-none rounded-sm border border-gray-400 cursor-pointer
                                                checked:bg-secondary checked:border-secondary
                                                checked:before:content-['✓'] checked:before:text-white
                                                checked:before:text-[10px] checked:before:flex checked:before:items-center
                                                checked:before:justify-center
                                            "
                                        />
                                        <span className="block text-sm leading-snug capitalize break-words">
                                            {opt}
                                        </span>
                                    </label>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* DESKTOP: Dropdown di bawah button */}
                    <div className="hidden md:block absolute top-full left-0 w-full bg-white shadow-md p-4 z-50 max-h-64 overflow-y-auto">
                        {options.map((opt) => (
                            <label
                                key={opt}
                                className="flex items-center gap-2 mb-2 cursor-pointer"
                            >
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
