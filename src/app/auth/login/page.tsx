import { hasSupabaseAuthConfig } from "@/lib/supabase/config";
import { signInStaff, signInWithGoogle } from "../actions";

export const instant = false;

export default async function LoginPage({
    searchParams,
}: {
    searchParams: Promise<{ error?: string; next?: string }>;
}) {
    const { error, next } = await searchParams;
    const configured = hasSupabaseAuthConfig();
    return (
        <main className="grid min-h-screen place-items-center bg-slate-950 p-5 text-slate-900">
            <div className="w-full max-w-4xl overflow-hidden rounded-3xl bg-white shadow-2xl md:grid md:grid-cols-2">
                <section className="bg-blue-600 p-8 text-white sm:p-12">
                    <p className="text-sm font-semibold uppercase tracking-[.2em] text-blue-100">
                        TravelDesk
                    </p>
                    <h1 className="mt-4 text-3xl font-bold">
                        Travel made personal.
                    </h1>
                    <p className="mt-3 leading-7 text-blue-100">
                        Customers can use Google to access saved trips and
                        enquiries.
                    </p>
                    <form action={signInWithGoogle} className="mt-10">
                        <input type="hidden" name="next" value={next === "/enquire" || next === "/trips" ? next : "/"} />
                        <button
                            disabled={!configured}
                            className="w-full rounded-xl bg-white px-4 py-3 font-semibold text-slate-900 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                            Continue with Google
                        </button>
                    </form>
                </section>
                <section className="p-8 sm:p-12">
                    <p className="text-sm font-semibold text-blue-600">
                        Staff portal
                    </p>
                    <h2 className="mt-2 text-2xl font-bold">
                        Admin or agent sign in
                    </h2>
                    <p className="mt-2 text-sm text-slate-500">
                        Use the credentials authorized by your administrator.
                    </p>
                    {error && (
                        <p className="mt-5 rounded-lg bg-rose-50 p-3 text-sm text-rose-700">
                            {error}
                        </p>
                    )}
                    {!configured && (
                        <p className="mt-5 rounded-lg bg-amber-50 p-3 text-sm text-amber-800">
                            Authentication tables are ready. Add the Supabase
                            URL and publishable key to enable sign-in.
                        </p>
                    )}
                    <form action={signInStaff} className="mt-7 space-y-4">
                        <label className="block">
                            <span className="mb-1.5 block text-sm font-medium">
                                Email
                            </span>
                            <input
                                name="email"
                                type="email"
                                required
                                className="h-11 w-full rounded-xl border px-3 outline-none focus:border-blue-500"
                            />
                        </label>
                        <label className="block">
                            <span className="mb-1.5 block text-sm font-medium">
                                Password
                            </span>
                            <input
                                name="password"
                                type="password"
                                required
                                minLength={8}
                                className="h-11 w-full rounded-xl border px-3 outline-none focus:border-blue-500"
                            />
                        </label>
                        <button
                            disabled={!configured}
                            className="w-full rounded-xl bg-slate-950 px-4 py-3 font-semibold text-white disabled:cursor-not-allowed disabled:opacity-50"
                        >
                            Sign in to admin
                        </button>
                    </form>
                </section>
            </div>
        </main>
    );
}
