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

    return (
        <div className="relative w-full">
            <button
                className="flex items-center justify-between w-full border-b border-black pb-1"
                onClick={() => setOpenFilter(openFilter === filterKey ? null : filterKey)}
            >
                {label} <ChevronDown size={18} />
            </button>
            {openFilter === filterKey && (
                <div className="absolute mt-2 bg-white shadow-md p-4 z-10 w-full">
                    {options.map((opt) => (
                        <label key={opt} className="flex items-center gap-2 mb-2 cursor-pointer">
                            <input
                                type="checkbox"
                                checked={selected.includes(opt)}
                                onChange={() => toggleSelection(opt)}
                                className="
                                            w-4 h-4
                                            border border-gray-400 rounded-sm
                                            cursor-pointer
                                            appearance-none
                                            checked:bg-[#6B4F44]
                                            checked:border-[#6B4F44]
                                            checked:before:content-['✓']
                                            checked:before:text-white
                                            checked:before:text-[10px]
                                            checked:before:flex
                                            checked:before:items-center
                                            checked:before:justify-center
                                        "
                            />
                            {opt}
                        </label>
                    ))}
                </div>
            )}
        </div>
    );
}
