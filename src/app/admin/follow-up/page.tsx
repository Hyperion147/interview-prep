import { CalendarClock } from "lucide-react";

export default function FollowUpPage() {
    return (
        <main className="min-h-screen bg-slate-50 text-slate-900">
            <header className="border-b border-slate-200 bg-white px-5 py-5 sm:px-8">
                <p className="text-xs font-semibold uppercase tracking-[.18em] text-blue-600">
                    CRM
                </p>
                <h1 className="mt-1 text-2xl font-bold text-slate-950">
                    Follow-ups
                </h1>
            </header>
            <div className="p-5 sm:p-8">
                <section className="rounded-2xl border border-dashed border-slate-200 bg-white py-16 text-center shadow-sm">
                    <CalendarClock className="mx-auto size-9 text-slate-300" />
                    <p className="mt-3 font-semibold text-slate-700">
                        No follow-ups scheduled
                    </p>
                    <p className="mt-1 text-sm text-slate-500">
                        Leads with a next follow-up date will appear here.
                    </p>
                </section>
            </div>
        </main>
    );
}
