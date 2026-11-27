import Link from "next/link";
import type { ReactNode } from "react";

const stats = [
    {
        label: "Total leads",
        value: "1,284",
        change: "+12.5%",
        accent: "bg-blue-50 text-blue-600",
    },
    {
        label: "Follow-ups due",
        value: "38",
        change: "Today",
        accent: "bg-amber-50 text-amber-600",
    },
    {
        label: "Active visas",
        value: "164",
        change: "+8.2%",
        accent: "bg-violet-50 text-violet-600",
    },
    {
        label: "Packages sold",
        value: "96",
        change: "+6.4%",
        accent: "bg-emerald-50 text-emerald-600",
    },
];

const recentLeads = [
    {
        name: "Arjun Mehta",
        email: "arjun@example.com",
        destination: "Canada",
        status: "New",
        initials: "AM",
    },
    {
        name: "Priya Sharma",
        email: "priya@example.com",
        destination: "Australia",
        status: "Contacted",
        initials: "PS",
    },
    {
        name: "Rohan Kapoor",
        email: "rohan@example.com",
        destination: "United Kingdom",
        status: "Qualified",
        initials: "RK",
    },
    {
        name: "Neha Verma",
        email: "neha@example.com",
        destination: "Germany",
        status: "New",
        initials: "NV",
    },
];

function Icon({ children }: { children: ReactNode }) {
    return (
        <svg
            aria-hidden="true"
            className="size-5 shrink-0"
            fill="none"
            stroke="currentColor"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="1.8"
            viewBox="0 0 24 24"
        >
            {children}
        </svg>
    );
}

export default function Home() {
    return (
        <main className="min-h-screen bg-slate-50 text-slate-900">
            <header className="flex h-20 items-center justify-between border-b border-slate-200 bg-white px-5 sm:px-8">
                    <div>
                        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-blue-600">
                            Overview
                        </p>
                        <h1 className="text-xl font-bold text-slate-950 sm:text-2xl">
                            Dashboard
                        </h1>
                    </div>
                    <div className="flex items-center gap-3">
                        <button
                            aria-label="View notifications"
                            className="relative grid size-10 place-items-center rounded-full border border-slate-200 text-slate-500 transition hover:bg-slate-50"
                            type="button"
                        >
                            <Icon>
                                <path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9M10 21h4" />
                            </Icon>
                            <span className="absolute right-2 top-2 size-2 rounded-full bg-red-500 ring-2 ring-white" />
                        </button>
                        <div className="hidden text-right sm:block">
                            <p className="text-sm font-semibold">Admin User</p>
                            <p className="text-xs text-slate-500">
                                Administrator
                            </p>
                        </div>
                        <div className="grid size-10 place-items-center rounded-full bg-blue-100 text-sm font-bold text-blue-700">
                            AU
                        </div>
                    </div>
                </header>

                <div className="p-5 sm:p-8">
                    <section className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
                        <div>
                            <h2 className="text-2xl font-bold tracking-tight text-slate-950">
                                Good morning, Admin
                            </h2>
                            <p className="mt-1 text-sm text-slate-500">
                                Here is what is happening with your travel
                                business today.
                            </p>
                        </div>
                        <Link
                            className="inline-flex w-fit items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700"
                            href="/admin/leads"
                        >
                            <span className="text-lg leading-none">+</span> Add
                            new lead
                        </Link>
                    </section>
                    <section
                        aria-label="Business statistics"
                        className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4"
                    >
                        {stats.map((stat) => (
                            <article
                                className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
                                key={stat.label}
                            >
                                <div className="flex items-center justify-between">
                                    <p className="text-sm font-medium text-slate-500">
                                        {stat.label}
                                    </p>
                                    <span
                                        className={`rounded-lg px-2 py-1 text-xs font-semibold ${stat.accent}`}
                                    >
                                        {stat.change}
                                    </span>
                                </div>
                                <p className="mt-4 text-3xl font-bold tracking-tight text-slate-950">
                                    {stat.value}
                                </p>
                                <p className="mt-1 text-xs text-slate-400">
                                    Compared with last month
                                </p>
                            </article>
                        ))}
                    </section>
                    <section className="mt-8 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                        <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4 sm:px-6">
                            <div>
                                <h2 className="font-bold text-slate-950">
                                    Recent leads
                                </h2>
                                <p className="mt-0.5 text-xs text-slate-500">
                                    The latest enquiries added to your pipeline
                                </p>
                            </div>
                            <Link
                                className="text-sm font-semibold text-blue-600 hover:text-blue-700"
                                href="/admin/leads"
                            >
                                View all
                            </Link>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full min-w-[680px] text-left text-sm">
                                <thead className="bg-slate-50 text-xs uppercase tracking-wider text-slate-500">
                                    <tr>
                                        <th className="px-6 py-3 font-semibold">
                                            Lead
                                        </th>
                                        <th className="px-6 py-3 font-semibold">
                                            Destination
                                        </th>
                                        <th className="px-6 py-3 font-semibold">
                                            Status
                                        </th>
                                        <th className="px-6 py-3 font-semibold">
                                            Action
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {recentLeads.map((lead) => (
                                        <tr
                                            className="transition hover:bg-slate-50/70"
                                            key={lead.email}
                                        >
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="grid size-9 place-items-center rounded-full bg-slate-100 text-xs font-bold text-slate-600">
                                                        {lead.initials}
                                                    </div>
                                                    <div>
                                                        <p className="font-semibold text-slate-900">
                                                            {lead.name}
                                                        </p>
                                                        <p className="text-xs text-slate-500">
                                                            {lead.email}
                                                        </p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-slate-600">
                                                {lead.destination}
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className="rounded-full bg-blue-50 px-2.5 py-1 text-xs font-semibold text-blue-700">
                                                    {lead.status}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <Link
                                                    className="font-semibold text-slate-500 hover:text-blue-600"
                                                    href="/admin/leads"
                                                >
                                                    View details
                                                </Link>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </section>
                </div>
        </main>
    );
}
