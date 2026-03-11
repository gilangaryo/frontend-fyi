export default function ProductDetailLoading() {
    return (
        <section className="grid grid-cols-1 lg:grid-cols-2 gap-20 px-6 md:px-10 py-10 animate-pulse">
            <div className="flex flex-col md:flex-row gap-4">
                <div className="grid grid-cols-5 md:grid-cols-1 md:grid-rows-5 gap-4 w-full md:w-24">
                    {Array.from({ length: 5 }).map((_, idx) => (
                        <div
                            key={idx}
                            className="aspect-[3/4] w-full bg-gray-200"
                        />
                    ))}
                </div>
                <div className="flex-1 aspect-[3/4] bg-gray-200" />
            </div>

            <div className="flex flex-col">
                <div className="h-5 w-40 bg-gray-200 mb-4" />
                <div className="h-8 w-72 bg-gray-200 mb-3" />
                <div className="h-7 w-44 bg-gray-200 mb-6" />

                <div className="h-px w-full bg-gray-200 mb-6" />

                <div className="h-5 w-36 bg-gray-200 mb-4" />
                <div className="flex gap-2 mb-6">
                    {Array.from({ length: 4 }).map((_, idx) => (
                        <div key={idx} className="h-10 w-16 bg-gray-200" />
                    ))}
                </div>

                <div className="h-12 w-full bg-gray-200 mb-6" />

                <div className="space-y-2 mb-6">
                    <div className="h-4 w-full bg-gray-200" />
                    <div className="h-4 w-[90%] bg-gray-200" />
                    <div className="h-4 w-[75%] bg-gray-200" />
                </div>

                <div className="space-y-3">
                    <div className="h-5 w-full bg-gray-200" />
                    <div className="h-5 w-full bg-gray-200" />
                </div>
            </div>
        </section>
    );
}
