"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
    CalendarClock,
    LayoutDashboard,
    MapPin,
    Package,
    Briefcase,
    UserCog,
    UsersRound,
    Plane,
    ExternalLink,
} from "lucide-react";

const workspace = [
    { href: "/admin", label: "Overview", icon: LayoutDashboard },
    { href: "/admin/leads", label: "Leads", icon: UsersRound },
    { href: "/admin/follow-up", label: "Follow-ups", icon: CalendarClock },
    { href: "/admin/trips", label: "Trips", icon: Briefcase },
];
const operations = [
    { href: "/admin/visas", label: "Visas", icon: MapPin },
    { href: "/admin/packages", label: "Packages", icon: Package },
    { href: "/admin/agents", label: "Agents", icon: UserCog },
];

export function AdminSidebar({ role }: { role: "admin" | "agent" }) {
    const pathname = usePathname();

    return (
        <aside className="flex flex-col border-b border-slate-200 bg-white lg:sticky lg:top-0 lg:h-dvh lg:border-r lg:border-b-0">
            <Link href="/admin" className="flex h-16 shrink-0 items-center gap-3 px-5">
                <div className="grid size-9 place-items-center rounded-lg bg-indigo-600 text-white">
                    <Plane className="size-4" aria-hidden="true" />
                </div>
                <div>
                    <p className="text-sm font-bold tracking-tight text-slate-950">
                        TravelDesk
                    </p>
                    <p className="text-xs capitalize text-slate-500">{role} workspace</p>
                </div>
            </Link>
            <nav
                aria-label="Admin navigation"
                className="flex gap-3 overflow-x-auto px-3 pb-3 lg:flex-1 lg:flex-col lg:gap-5 lg:pt-4"
            >
                {[{ label: "Workspace", items: workspace }, { label: "Operations", items: operations }].map((group) => (
                    <div key={group.label} className="flex gap-1 lg:block lg:space-y-1">
                    <p className="hidden px-3 pb-1 text-xs font-semibold text-slate-500 lg:block">{group.label}</p>
                    {group.items
                    .filter(
                        (item) =>
                            role === "admin" || item.href !== "/admin/agents",
                    )
                    .map((item) => {
                        const active =
                            item.href === "/admin"
                                ? pathname === "/admin"
                                : pathname === item.href || pathname.startsWith(item.href + "/");
                        return (
                            <Link
                                aria-current={active ? "page" : undefined}
                                className={`flex min-w-max items-center gap-2.5 rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                                    active
                                        ? "bg-indigo-50 text-indigo-700"
                                        : "text-slate-600 hover:bg-slate-100 hover:text-slate-950"
                                }`}
                                href={item.href}
                                key={item.href}
                            >
                                <item.icon className="size-4 shrink-0" aria-hidden="true" />
                                {item.label}
                            </Link>
                        );
                    })}
                    </div>
                ))}
            </nav>
            <Link href="/" className="m-3 hidden items-center gap-2 rounded-md border border-slate-200 px-3 py-2 text-sm text-slate-600 hover:bg-slate-50 lg:flex">
                <ExternalLink className="size-4" aria-hidden="true" /> Customer site
            </Link>
        </aside>
    );
}
