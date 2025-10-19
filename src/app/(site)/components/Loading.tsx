export default function Loading() {
    return (
        <div
            role="status"
            aria-label="Loading"
            className="flex items-center justify-center min-h-screen bg-[var(--color-white)]"
        >
            <div
                className="animate-spin rounded-full h-16 w-16 border-4 border-[var(--color-gray-200)] border-t-primary"
            />
        </div>
    );
}
