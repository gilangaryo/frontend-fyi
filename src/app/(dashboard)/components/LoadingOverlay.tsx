'use client'

export default function LoadingOverlay({
    show = false,
    message = "Processing, please wait...",
}: {
    show?: boolean;
    message?: string;
}) {
    if (!show) return null

    return (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex flex-col items-center justify-center z-[9999]">
            <div className="w-12 h-12 border-4 border-white/30 border-t-white rounded-full animate-spin"></div>

            {message && (
                <p className="text-white mt-4 text-sm animate-pulse">
                    {message}
                </p>
            )}
        </div>
    )
}
