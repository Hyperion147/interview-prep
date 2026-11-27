"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  CalendarClock,
  LayoutDashboard,
  MapPin,
  Package,
  UsersRound,
} from "lucide-react";

const nav = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/leads", label: "Leads", icon: UsersRound },
  { href: "/admin/follow-up", label: "Follow-ups", icon: CalendarClock },
  { href: "/admin/visas", label: "Visas", icon: MapPin },
  { href: "/admin/packages", label: "Packages", icon: Package },
];

export function AdminSidebar() {
  const pathname = usePathname();

  return (
    <aside className="border-b border-slate-800 bg-slate-950 text-slate-300 lg:fixed lg:inset-y-0 lg:w-64 lg:border-b-0 lg:border-r">
      <div className="flex h-20 items-center gap-3 px-5 lg:px-7">
        <div className="grid size-10 place-items-center rounded-xl bg-blue-600 font-bold text-white shadow-lg shadow-blue-950/40">
          T
        </div>
        <div>
          <p className="font-semibold tracking-wide text-white">TravelDesk</p>
          <p className="text-xs text-slate-500">Admin portal</p>
        </div>
      </div>
      <nav
        aria-label="Admin navigation"
        className="flex gap-2 overflow-x-auto px-4 pb-4 lg:block lg:space-y-1 lg:overflow-visible lg:pb-0"
      >
        {nav.map((item) => {
          const active =
            item.href === "/"
              ? pathname === "/"
              : pathname.startsWith(item.href);
          return (
            <Link
              aria-current={active ? "page" : undefined}
              className={`flex min-w-max items-center gap-3 rounded-xl px-3.5 py-3 text-sm font-medium transition-colors ${
                active
                  ? "bg-blue-600 text-white shadow-lg shadow-blue-950/30"
                  : "hover:bg-slate-900 hover:text-white"
              }`}
              href={item.href}
              key={item.href}
            >
              <item.icon className="size-5 shrink-0" />
              {item.label}
            </Link>
          );
        })}
      </nav>
      <div className="absolute bottom-6 left-5 right-5 hidden rounded-2xl border border-slate-800 bg-slate-900 p-4 lg:block">
        <p className="text-sm font-medium text-white">Need help?</p>
        <p className="mt-1 text-xs leading-5 text-slate-400">
          Contact your system administrator.
        </p>
        <button
          className="mt-3 w-full rounded-lg bg-slate-800 px-3 py-2 text-xs font-semibold text-white transition hover:bg-slate-700"
          type="button"
        >
          Get support
        </button>
      </div>
    </aside>
  );
}
