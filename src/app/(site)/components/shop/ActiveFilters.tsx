"use client";

type ActiveFiltersProps = {
    collections: string[];
    categories: string[];
    kains: string[];
    setCollections: React.Dispatch<React.SetStateAction<string[]>>;
    setCategories: React.Dispatch<React.SetStateAction<string[]>>;
    setKains: React.Dispatch<React.SetStateAction<string[]>>;
};

export default function ActiveFilters({
    collections,
    categories,
    kains,
    setCollections,
    setCategories,
    setKains,
}: ActiveFiltersProps) {
    const hasFilters = collections.length > 0 || categories.length > 0 || kains.length > 0;

    if (!hasFilters) return null;

    return (
        <div className="flex items-center gap-2 flex-wrap">
            <button
                className="bg-[#6B4F44] text-white px-4 py-2"
                onClick={() => {
                    setCollections([]);
                    setCategories([]);
                    setKains([]);
                }}
            >
                Clear All
            </button>

            {collections.map((col) => (
                <div key={col} className="flex items-center border px-3 py-1 rounded">
                    <span>{col}</span>
                    <button
                        className="ml-2 text-black"
                        onClick={() => setCollections(collections.filter((c) => c !== col))}
                    >
                        ×
                    </button>
                </div>
            ))}

            {categories.map((cat) => (
                <div key={cat} className="flex items-center border px-3 py-1 rounded">
                    <span>{cat}</span>
                    <button
                        className="ml-2 text-black"
                        onClick={() => setCategories(categories.filter((c) => c !== cat))}
                    >
                        ×
                    </button>
                </div>
            ))}

            {kains.map((k) => (
                <div key={k} className="flex items-center border px-3 py-1 rounded">
                    <span>{k}</span>
                    <button
                        className="ml-2 text-black"
                        onClick={() => setKains(kains.filter((c) => c !== k))}
                    >
                        ×
                    </button>
                </div>
            ))}
        </div>
    );
}
