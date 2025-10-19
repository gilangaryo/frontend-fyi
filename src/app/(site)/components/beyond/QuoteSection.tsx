type QuoteSectionProps = {
    text: string;
    className?: string;
};

export default function QuoteSection({ text, className = "" }: QuoteSectionProps) {
    return (
        <section
            className={`flex items-center justify-center py-30 px-4 text-center `}
        >
            <h1 className={`text-xl md:text-2xl font-light text-secondary ${className}`}>{text}</h1>
        </section>
    );
}
