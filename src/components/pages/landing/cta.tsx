import Link from "next/link";

const Cta = () => {
    return (
        <section
            id="cta"
            className="py-32 bg-background text-center relative overflow-hidden flex flex-col items-center justify-center"
        >
            <div className="absolute inset-0 w-full h-full pointer-events-none z-10 opacity-20">
                <svg
                    className="w-full h-full max-w-8xl mx-auto"
                    viewBox="0 0 100 100"
                    preserveAspectRatio="none"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                >
                    {/* Left Pair 4 (Outer) */}
                    <path
                        className="grid-line"
                        d="M 5 0 Q -10 50 5 100"
                        stroke="black"
                        strokeWidth="0.5"
                        strokeOpacity="0.6"
                        vectorEffect="non-scaling-stroke"
                    />

                    {/* Left Pair 3 */}
                    <path
                        className="grid-line"
                        d="M 16 0 Q 8 50 16 100"
                        stroke="black"
                        strokeWidth="0.5"
                        strokeOpacity="0.6"
                        vectorEffect="non-scaling-stroke"
                    />

                    {/* Left Pair 2 */}
                    <path
                        className="grid-line"
                        d="M 27 0 Q 22 50 27 100"
                        stroke="black"
                        strokeWidth="0.5"
                        strokeOpacity="0.6"
                        vectorEffect="non-scaling-stroke"
                    />

                    {/* Left Pair 1 (Inner) */}
                    <path
                        className="grid-line"
                        d="M 39 0 Q 36 50 39 100"
                        stroke="black"
                        strokeWidth="0.5"
                        strokeOpacity="0.6"
                        vectorEffect="non-scaling-stroke"
                    />

                    {/* Center - Straight */}
                    <line
                        className="grid-line"
                        x1="50"
                        y1="0"
                        x2="50"
                        y2="100"
                        stroke="black"
                        strokeWidth="0.5"
                        strokeOpacity="0.6"
                        vectorEffect="non-scaling-stroke"
                    />

                    {/* Right Pair 1 (Inner) */}
                    <path
                        className="grid-line"
                        d="M 61 0 Q 64 50 61 100"
                        stroke="black"
                        strokeWidth="0.5"
                        strokeOpacity="0.6"
                        vectorEffect="non-scaling-stroke"
                    />

                    {/* Right Pair 2 */}
                    <path
                        className="grid-line"
                        d="M 73 0 Q 78 50 73 100"
                        stroke="black"
                        strokeWidth="0.5"
                        strokeOpacity="0.6"
                        vectorEffect="non-scaling-stroke"
                    />

                    {/* Right Pair 3 */}
                    <path
                        className="grid-line"
                        d="M 84 0 Q 92 50 84 100"
                        stroke="black"
                        strokeWidth="0.5"
                        strokeOpacity="0.6"
                        vectorEffect="non-scaling-stroke"
                    />

                    {/* Right Pair 4 (Outer) */}
                    <path
                        className="grid-line"
                        d="M 95 0 Q 110 50 95 100"
                        stroke="black"
                        strokeWidth="0.5"
                        strokeOpacity="0.6"
                        vectorEffect="non-scaling-stroke"
                    />
                </svg>
            </div>
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[600px] rounded-full pointer-events-none bg-secondary/10 blur-3xl"></div>
            <div className="relative z-10 w-full max-w-4xl mx-auto px-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center border border-foreground/10 p-8 rounded-sm bg-secondary/20 backdrop-blur-sm">
                    <div className="text-left">
                        <h2 className="text-4xl md:text-5xl font-bold mb-4 tracking-tighter">
                            Ready to Go?
                        </h2>
                        <p className="text-lg text-foreground/70 mb-0">
                            The world is waiting. Book your next adventure with
                            us.
                        </p>
                    </div>
                    <div className="flex flex-col gap-4">
                        <input
                            type="email"
                            placeholder="Enter your email"
                            className="px-6 py-3 rounded-sm bg-background border border-foreground/10 focus:outline-none focus:border-primary text-foreground w-full transition-colors"
                        />
                        <Link
                            href="/auth/login"
                            className="px-8 py-3 rounded-sm bg-primary text-background font-bold hover:bg-foreground hover:text-background transition-all whitespace-nowrap shadow-[0_0_10px_rgba(163,176,135,0.3)] hover:shadow-[0_0_20px_rgba(255,248,212,0.5)]"
                        >
                            Continue to Sign Up
                        </Link>
                        <p className="text-xs text-foreground/40 text-center">
                            No spam, just adventures.
                        </p>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default Cta;
