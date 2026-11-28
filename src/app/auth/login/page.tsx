import Link from "next/link";
import { ArrowLeft, Check, LockKeyhole, Plane, UsersRound } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { hasSupabaseAuthConfig } from "@/lib/supabase/config";
import { signInCustomer, signInStaff, signInWithGoogle } from "../actions";

export const instant = false;

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ error?: string; notice?: string; next?: string; audience?: string }> }) {
    const { error, notice, next, audience } = await searchParams;
    const configured = hasSupabaseAuthConfig();
    const staff = audience === "staff";
    const destination = next && ["/", "/enquire", "/trips", "/portal"].includes(next) ? next : "/portal";
    return <main className="min-h-screen bg-slate-50 text-slate-950 lg:grid lg:grid-cols-[minmax(0,1fr)_minmax(480px,0.8fr)]">
        <section className="relative hidden overflow-hidden bg-slate-950 p-12 text-white lg:flex lg:flex-col lg:justify-between">
            <div className="absolute -right-36 -top-36 size-[430px] rounded-full bg-indigo-500/20 blur-3xl"/><div className="absolute -bottom-48 -left-24 size-[500px] rounded-full bg-violet-500/15 blur-3xl"/>
            <Link href="/" className="relative inline-flex items-center gap-2 text-lg font-bold"><span className="grid size-9 place-items-center rounded-xl bg-indigo-500"><Plane className="size-4"/></span>TravelDesk</Link>
            <div className="relative max-w-xl"><p className="text-xs font-semibold uppercase tracking-[.2em] text-indigo-300">Travel relationship workspace</p><h1 className="mt-5 text-5xl font-semibold leading-[1.08] tracking-tight">Turn every enquiry into a journey worth remembering.</h1><p className="mt-5 max-w-lg text-base leading-7 text-slate-300">A focused workspace for conversations, traveler documents, trip proposals and visa progress.</p><div className="mt-10 grid gap-3 text-sm text-slate-300">{["One customer timeline across every channel","Clear next actions for agents and travelers","Secure role-based access for your team"].map(item=><p className="flex items-center gap-3" key={item}><span className="grid size-6 place-items-center rounded-full bg-emerald-400/15 text-emerald-300"><Check className="size-3.5"/></span>{item}</p>)}</div></div>
            <p className="relative text-xs text-slate-500">Built for modern travel teams.</p>
        </section>
        <section className="flex min-h-screen items-center justify-center px-5 py-10 sm:px-10"><div className="w-full max-w-md"><Link href="/" className="mb-10 inline-flex items-center gap-2 text-sm text-slate-500 hover:text-slate-950"><ArrowLeft className="size-4"/>Back to website</Link>
            <div className="mb-7"><p className="text-xs font-semibold uppercase tracking-[.16em] text-indigo-600">{staff?"Team access":"Welcome back"}</p><h2 className="mt-2 text-3xl font-bold tracking-tight">{staff?"Sign in to your workspace":"Sign in to TravelDesk"}</h2><p className="mt-2 text-sm leading-6 text-slate-500">{staff?"Use the account created by your administrator.":"Access your trips, documents and advisor updates."}</p></div>
            <div className="mb-6 grid grid-cols-2 rounded-xl bg-slate-100 p-1 text-sm font-medium"><Link href={`/auth/login?next=${encodeURIComponent(destination)}`} className={`rounded-lg px-3 py-2 text-center transition ${!staff?"bg-white text-slate-950 shadow-sm":"text-slate-500"}`}>Traveler</Link><Link href={`/auth/login?audience=staff&next=${encodeURIComponent(destination)}`} className={`rounded-lg px-3 py-2 text-center transition ${staff?"bg-white text-slate-950 shadow-sm":"text-slate-500"}`}>Admin / agent</Link></div>
            {error&&<p role="alert" className="mb-5 rounded-xl border border-rose-100 bg-rose-50 p-3 text-sm text-rose-700">{error}</p>}{notice&&<p className="mb-5 rounded-xl border border-emerald-100 bg-emerald-50 p-3 text-sm text-emerald-700">{notice}</p>}{!configured&&<p className="mb-5 rounded-xl bg-amber-50 p-3 text-sm text-amber-800">Add the Supabase URL and publishable key to enable authentication.</p>}
            {!staff&&<><form action={signInWithGoogle}><input type="hidden" name="next" value={destination}/><Button disabled={!configured} variant="outline" className="h-11 w-full bg-white"><GoogleMark/>Continue with Google</Button></form><div className="my-6 flex items-center gap-3"><span className="h-px flex-1 bg-slate-200"/><span className="text-[11px] font-medium uppercase tracking-wider text-slate-400">or email</span><span className="h-px flex-1 bg-slate-200"/></div></>}
            <form action={staff?signInStaff:signInCustomer} className="space-y-4"><input type="hidden" name="next" value={destination}/><Field label="Email address" name="email" type="email" autoComplete="email" placeholder={staff?"you@agency.com":"you@example.com"}/><Field label="Password" name="password" type="password" autoComplete="current-password" placeholder="At least 8 characters" minLength={8}/><Button disabled={!configured} className="h-11 w-full bg-indigo-600 text-white hover:bg-indigo-700">{staff?<><LockKeyhole className="size-4"/>Sign in to dashboard</>:"Sign in"}</Button></form>
            {!staff?<p className="mt-7 text-center text-sm text-slate-500">New to TravelDesk? <Link className="font-semibold text-indigo-600 hover:text-indigo-700" href="/auth/signup">Create an account</Link></p>:<div className="mt-7 flex items-start gap-3 rounded-xl border bg-white p-4"><UsersRound className="mt-0.5 size-4 text-slate-400"/><p className="text-xs leading-5 text-slate-500">Agents cannot self-register. Ask an administrator to create or resend your invitation.</p></div>}
        </div></section>
    </main>;
}

function Field(props:React.ComponentProps<typeof Input>&{label:string}){const {label,...inputProps}=props;return <label className="block space-y-1.5"><span className="text-sm font-medium">{label}</span><Input required className="h-11 bg-white" {...inputProps}/></label>}
function GoogleMark(){return <svg viewBox="0 0 24 24" className="size-4" aria-hidden="true"><path fill="#4285F4" d="M21.6 12.2c0-.7-.1-1.4-.2-2H12v3.9h5.4a4.6 4.6 0 0 1-2 3v2.5h3.3c1.9-1.8 2.9-4.4 2.9-7.4Z"/><path fill="#34A853" d="M12 22c2.7 0 5-.9 6.7-2.4l-3.3-2.5c-.9.6-2.1 1-3.4 1-2.6 0-4.8-1.8-5.6-4.1H3v2.6A10 10 0 0 0 12 22Z"/><path fill="#FBBC05" d="M6.4 14a6 6 0 0 1 0-3.9V7.5H3A10 10 0 0 0 3 16.6L6.4 14Z"/><path fill="#EA4335" d="M12 5.9c1.5 0 2.8.5 3.8 1.5l2.9-2.8A9.7 9.7 0 0 0 3 7.5l3.4 2.6C7.2 7.7 9.4 6 12 6Z"/></svg>}
