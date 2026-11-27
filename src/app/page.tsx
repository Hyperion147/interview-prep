import Link from "next/link";
export default function HomePage() {
    return (
        <main className="min-h-screen bg-white">
            <header className="mx-auto flex max-w-6xl items-center justify-between px-6 py-5">
                <p className="text-lg font-bold text-slate-950">TravelDesk</p>
                <div className="flex items-center gap-3">
                    <Link
                        className="text-sm font-semibold text-slate-600"
                        href="/auth/login"
                    >
                        Sign in
                    </Link>
                    <Link
                        className="rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white"
                        href="/admin"
                    >
                        Staff portal
                    </Link>
                </div>
            </header>
            <section className="mx-auto grid min-h-[70vh] max-w-6xl place-items-center px-6 text-center">
                <div>
                    <p className="text-sm font-semibold uppercase tracking-[.2em] text-blue-600">
                        Customer website
                    </p>
                    <h1 className="mx-auto mt-5 max-w-3xl text-5xl font-bold tracking-tight text-slate-950">
                        Your travel landing page starts here.
                    </h1>
                    <p className="mx-auto mt-5 max-w-2xl text-lg leading-8 text-slate-500">
                        This public route is now separate from the protected
                        operations portal, ready for your customer-facing
                        package and destination showcase.
                    </p>
                </div>
            </section>
        </main>
    );
}
