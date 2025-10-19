export default function HelpCard() {
    return (
        <div className="p-5 bg-primary-studio rounded-2xl text-white relative overflow-hidden mt-4">
            <div className="flex flex-col items-start text-left gap-4">
                <div className="bg-white rounded-2xl p-3 flex items-center justify-center">
                    <span className="bg-primary-studio rounded-full w-5 h-5 flex items-center justify-center text-white text-xs">
                        ?
                    </span>
                </div>

                <div>
                    <h2 className="font-semibold text-lg">Need help?</h2>
                    <p className="text-white/90 text-sm">Email Our Support Team!</p>
                </div>

                <button className="bg-secondary-studio hover:bg-secondary-studio/70 text-white px-6 py-3 rounded-lg font-medium w-full transition">
                    Email us
                </button>
            </div>
        </div>
    );
}
