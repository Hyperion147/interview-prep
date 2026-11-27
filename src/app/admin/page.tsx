import Link from "next/link";
import {
    CalendarClock,
    MapPin,
    Package,
    UserCog,
    UsersRound,
} from "lucide-react";
const modules = [
    {
        href: "/admin/leads",
        title: "Leads",
        detail: "Manage customer enquiries and pipeline",
        icon: UsersRound,
        color: "bg-blue-50 text-blue-600",
    },
    {
        href: "/admin/follow-up",
        title: "Follow-ups",
        detail: "Schedule calls, meetings, and next actions",
        icon: CalendarClock,
        color: "bg-amber-50 text-amber-600",
    },
    {
        href: "/admin/visas",
        title: "Visas",
        detail: "Track documents and application progress",
        icon: MapPin,
        color: "bg-violet-50 text-violet-600",
    },
    {
        href: "/admin/packages",
        title: "Packages",
        detail: "Create domestic and international packages",
        icon: Package,
        color: "bg-emerald-50 text-emerald-600",
    },
    {
        href: "/admin/agents",
        title: "Agents",
        detail: "Create staff accounts and permissions",
        icon: UserCog,
        color: "bg-rose-50 text-rose-600",
    },
];
export default function AdminDashboard() {
    return (
        <main className="min-h-screen">
            <header className="border-b bg-white px-5 py-5 sm:px-8">
                <p className="text-xs font-semibold uppercase tracking-[.18em] text-blue-600">
                    Operations
                </p>
                <h1 className="mt-1 text-2xl font-bold">Admin dashboard</h1>
            </header>
            <div className="p-5 sm:p-8">
                <h2 className="text-2xl font-bold">Welcome to TravelDesk</h2>
                <p className="mt-2 text-slate-500">
                    Manage agents and every stage of the customer journey from
                    one protected workspace.
                </p>
                <section className="mt-8 grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
                    {modules.map((item) => (
                        <Link
                            href={item.href}
                            key={item.href}
                            className="group rounded-2xl border bg-white p-6 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
                        >
                            <div
                                className={`grid size-11 place-items-center rounded-xl ${item.color}`}
                            >
                                <item.icon className="size-5" />
                            </div>
                            <h3 className="mt-5 text-lg font-bold group-hover:text-blue-600">
                                {item.title}
                            </h3>
                            <p className="mt-1 text-sm leading-6 text-slate-500">
                                {item.detail}
                            </p>
                        </Link>
                    ))}
                </section>
            </div>
        </main>
    );
}
