import Link from "next/link";
import { connection } from "next/server";
import { asc, desc, eq } from "drizzle-orm";
import type { LucideIcon } from "lucide-react";
import {
    ArrowUpRight,
    CalendarClock,
    CheckCircle2,
    Clock3,
    MapPin,
    Package,
    TrendingUp,
    UsersRound,
    Wallet,
} from "lucide-react";
import { db } from "@/db";
import { followUps } from "@/db/schema/follow-ups";
import { leads } from "@/db/schema/leads";
import { travelPackages } from "@/db/schema/packages";
import { visaApplications } from "@/db/schema/visas";

const leadStatusOrder = [
    "new",
    "contacted",
    "qualified",
    "proposal_sent",
    "won",
    "lost",
] as const;
type LeadStatus = (typeof leadStatusOrder)[number];

const leadLabels: Record<LeadStatus, string> = {
    new: "New",
    contacted: "Contacted",
    qualified: "Qualified",
    proposal_sent: "Proposal sent",
    won: "Won",
    lost: "Lost",
};

const leadStyles: Record<LeadStatus, string> = {
    new: "bg-blue-50 text-blue-700 ring-blue-600/20",
    contacted: "bg-amber-50 text-amber-700 ring-amber-600/20",
    qualified: "bg-violet-50 text-violet-700 ring-violet-600/20",
    proposal_sent: "bg-cyan-50 text-cyan-700 ring-cyan-600/20",
    won: "bg-emerald-50 text-emerald-700 ring-emerald-600/20",
    lost: "bg-rose-50 text-rose-700 ring-rose-600/20",
};

const leadBars: Record<LeadStatus, string> = {
    new: "bg-blue-500",
    contacted: "bg-amber-500",
    qualified: "bg-violet-500",
    proposal_sent: "bg-cyan-500",
    won: "bg-emerald-500",
    lost: "bg-rose-500",
};

const visaStatusOrder = ["draft", "processed", "published"] as const;

const currency = new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
});

const shortDate = new Intl.DateTimeFormat("en-IN", {
    day: "numeric",
    month: "short",
});

const longDate = new Intl.DateTimeFormat("en-IN", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
});

function StatCard({
    label,
    value,
    detail,
    icon: Icon,
    accent,
}: {
    label: string;
    value: string;
    detail: string;
    icon: LucideIcon;
    accent: string;
}) {
    return (
        <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-start justify-between gap-3">
                <p className="text-sm font-medium text-slate-500">{label}</p>
                <span
                    className={`grid size-9 shrink-0 place-items-center rounded-xl ${accent}`}
                >
                    <Icon className="size-4.5" />
                </span>
            </div>
            <p className="mt-4 text-3xl font-bold tracking-tight text-slate-950">
                {value}
            </p>
            <p className="mt-1 text-xs text-slate-400">{detail}</p>
        </article>
    );
}

function SectionHeading({
    title,
    subtitle,
    href,
    linkLabel,
}: {
    title: string;
    subtitle: string;
    href: string;
    linkLabel: string;
}) {
    return (
        <div className="flex items-start justify-between gap-3">
            <div>
                <h2 className="font-bold text-slate-950">{title}</h2>
                <p className="mt-0.5 text-xs text-slate-500">{subtitle}</p>
            </div>
            <Link
                className="inline-flex shrink-0 items-center gap-1 text-sm font-semibold text-blue-600 hover:text-blue-700"
                href={href}
            >
                {linkLabel}
                <ArrowUpRight className="size-3.5" />
            </Link>
        </div>
    );
}

export default async function AdminDashboard() {
    await connection();

    const [leadRows, visaRows, packageRows, followUpRows] = await Promise.all([
        db.select().from(leads).orderBy(desc(leads.createdAt)),
        db.select().from(visaApplications),
        db.select().from(travelPackages),
        db
            .select({
                id: followUps.id,
                title: followUps.title,
                scheduledAt: followUps.scheduledAt,
                status: followUps.status,
                channel: followUps.channel,
                priority: followUps.priority,
                leadName: leads.fullName,
            })
            .from(followUps)
            .leftJoin(leads, eq(followUps.leadId, leads.id))
            .orderBy(asc(followUps.scheduledAt)),
    ]);

    const now = new Date();
    const startOfToday = new Date(now);
    startOfToday.setHours(0, 0, 0, 0);
    const endOfToday = new Date(startOfToday);
    endOfToday.setDate(endOfToday.getDate() + 1);
    const weekAhead = new Date(startOfToday);
    weekAhead.setDate(weekAhead.getDate() + 7);

    const pipelineValue = leadRows.reduce(
        (sum, lead) => sum + Number(lead.estimatedValue),
        0,
    );
    const openLeads = leadRows.filter(
        (lead) => lead.status !== "won" && lead.status !== "lost",
    );
    const qualifiedLeads = leadRows.filter(
        (lead) => lead.status === "qualified",
    ).length;
    const wonLeads = leadRows.filter((lead) => lead.status === "won").length;
    const conversionRate = leadRows.length
        ? Math.round((wonLeads / leadRows.length) * 100)
        : 0;
    const newThisMonth = leadRows.filter(
        (lead) =>
            lead.createdAt.getMonth() === now.getMonth() &&
            lead.createdAt.getFullYear() === now.getFullYear(),
    ).length;

    const pipelineByStatus = leadStatusOrder.map((status) => {
        const rows = leadRows.filter((lead) => lead.status === status);
        return {
            status,
            count: rows.length,
            value: rows.reduce(
                (sum, lead) => sum + Number(lead.estimatedValue),
                0,
            ),
        };
    });
    const highestStatusValue = Math.max(
        ...pipelineByStatus.map((item) => item.value),
        1,
    );

    const scheduledFollowUps = followUpRows.filter(
        (followUp) => followUp.status === "scheduled",
    );
    const overdueFollowUps = scheduledFollowUps.filter(
        (followUp) => followUp.scheduledAt < startOfToday,
    );
    const dueTodayFollowUps = scheduledFollowUps.filter(
        (followUp) =>
            followUp.scheduledAt >= startOfToday &&
            followUp.scheduledAt < endOfToday,
    );
    const dueThisWeek = scheduledFollowUps.filter(
        (followUp) => followUp.scheduledAt < weekAhead,
    ).length;
    const upcomingFollowUps = scheduledFollowUps.slice(0, 5);

    const visaBreakdown = visaStatusOrder.map((status) => ({
        status,
        count: visaRows.filter((visa) => visa.status === status).length,
    }));
    const activeVisas = visaRows.filter(
        (visa) => visa.status === "processed" || visa.status === "published",
    ).length;
    const verifiedDocuments = visaRows.filter(
        (visa) => visa.documentStatus === "verified",
    ).length;
    const averageVisaProgress = visaRows.length
        ? Math.round(
              visaRows.reduce((sum, visa) => sum + visa.progress, 0) /
                  visaRows.length,
          )
        : 0;

    const activePackages = packageRows.filter(
        (item) => item.status === "active",
    ).length;
    const domesticPackages = packageRows.filter(
        (item) => item.category === "domestic",
    ).length;
    const internationalPackages = packageRows.filter(
        (item) => item.category === "international",
    ).length;
    const averagePackagePrice = packageRows.length
        ? packageRows.reduce((sum, item) => sum + Number(item.price), 0) /
          packageRows.length
        : 0;

    const recentLeads = leadRows.slice(0, 5);

    return (
        <main className="min-h-screen">
            <header className="flex flex-col justify-between gap-4 border-b border-slate-200 bg-white px-5 py-5 sm:flex-row sm:items-center sm:px-8">
                <div>
                    <p className="text-xs font-semibold uppercase tracking-[.18em] text-blue-600">
                        Operations
                    </p>
                    <h1 className="mt-1 text-2xl font-bold text-slate-950">
                        Dashboard
                    </h1>
                    <p className="mt-1 text-sm text-slate-500">
                        {longDate.format(now)}
                    </p>
                </div>
                <Link
                    className="inline-flex w-fit items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700"
                    href="/admin/leads"
                >
                    <span className="text-lg leading-none">+</span> Add new lead
                </Link>
            </header>

            <div className="p-5 sm:p-8">
                <section className="mb-6">
                    <h2 className="text-2xl font-bold tracking-tight text-slate-950">
                        Welcome back
                    </h2>
                    <p className="mt-1 text-sm text-slate-500">
                        Here is how your travel business is performing today.
                    </p>
                </section>

                <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                    <StatCard
                        accent="bg-blue-50 text-blue-600"
                        detail={`${openLeads.length} open leads · ${conversionRate}% conversion`}
                        icon={Wallet}
                        label="Pipeline value"
                        value={currency.format(pipelineValue)}
                    />
                    <StatCard
                        accent="bg-violet-50 text-violet-600"
                        detail={`${qualifiedLeads} qualified · ${newThisMonth} added this month`}
                        icon={UsersRound}
                        label="Total leads"
                        value={String(leadRows.length)}
                    />
                    <StatCard
                        accent="bg-amber-50 text-amber-600"
                        detail={`${overdueFollowUps.length} overdue · ${dueTodayFollowUps.length} due today`}
                        icon={CalendarClock}
                        label="Follow-ups due"
                        value={String(dueThisWeek)}
                    />
                    <StatCard
                        accent="bg-emerald-50 text-emerald-600"
                        detail={`${verifiedDocuments} verified documents`}
                        icon={MapPin}
                        label="Active visas"
                        value={String(activeVisas)}
                    />
                </section>

                <section className="mt-6 grid gap-5 xl:grid-cols-3">
                    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm xl:col-span-2">
                        <SectionHeading
                            href="/admin/leads"
                            linkLabel="View leads"
                            subtitle="Lead count and value at every stage of your pipeline"
                            title="Pipeline by status"
                        />
                        <div className="mt-6 space-y-4">
                            {pipelineByStatus.map((item) => (
                                <div
                                    className="grid grid-cols-[100px_1fr_auto] items-center gap-3"
                                    key={item.status}
                                >
                                    <span
                                        className={`w-fit rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ring-inset ${leadStyles[item.status]}`}
                                    >
                                        {leadLabels[item.status]}
                                    </span>
                                    <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                                        <div
                                            className={`h-full rounded-full ${leadBars[item.status]}`}
                                            style={{
                                                width: `${
                                                    item.value
                                                        ? Math.max(
                                                              (item.value /
                                                                  highestStatusValue) *
                                                                  100,
                                                              4,
                                                          )
                                                        : 0
                                                }%`,
                                            }}
                                        />
                                    </div>
                                    <div className="min-w-24 text-right">
                                        <p className="text-sm font-semibold text-slate-900">
                                            {currency.format(item.value)}
                                        </p>
                                        <p className="text-xs text-slate-400">
                                            {item.count}{" "}
                                            {item.count === 1
                                                ? "lead"
                                                : "leads"}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                        <SectionHeading
                            href="/admin/follow-up"
                            linkLabel="View all"
                            subtitle={`${dueTodayFollowUps.length} due today · ${overdueFollowUps.length} overdue`}
                            title="Upcoming follow-ups"
                        />
                        <div className="mt-4">
                            {upcomingFollowUps.length === 0 && (
                                <div className="rounded-xl border border-dashed border-slate-200 py-10 text-center">
                                    <CheckCircle2 className="mx-auto size-8 text-slate-300" />
                                    <p className="mt-2 text-sm font-medium text-slate-600">
                                        No follow-ups scheduled
                                    </p>
                                </div>
                            )}
                            {upcomingFollowUps.map((followUp) => {
                                const overdue =
                                    followUp.scheduledAt < startOfToday;
                                return (
                                    <div
                                        className="flex gap-3 border-b border-slate-100 py-3 last:border-0 last:pb-0 first:pt-0"
                                        key={followUp.id}
                                    >
                                        <span
                                            className={`grid size-9 shrink-0 place-items-center rounded-xl ${
                                                overdue
                                                    ? "bg-rose-50 text-rose-600"
                                                    : "bg-amber-50 text-amber-600"
                                            }`}
                                        >
                                            <CalendarClock className="size-4" />
                                        </span>
                                        <div className="min-w-0 flex-1">
                                            <p className="truncate text-sm font-semibold text-slate-900">
                                                {followUp.title}
                                            </p>
                                            <p className="truncate text-xs text-slate-500">
                                                {followUp.leadName ??
                                                    "No linked lead"}{" "}
                                                · {followUp.channel}
                                            </p>
                                        </div>
                                        <div className="shrink-0 text-right">
                                            <p
                                                className={`text-xs font-semibold ${
                                                    overdue
                                                        ? "text-rose-600"
                                                        : "text-slate-700"
                                                }`}
                                            >
                                                {overdue
                                                    ? "Overdue"
                                                    : shortDate.format(
                                                          followUp.scheduledAt,
                                                      )}
                                            </p>
                                            <p className="text-[11px] capitalize text-slate-400">
                                                {followUp.priority}
                                            </p>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </section>

                <section className="mt-6 grid gap-5 xl:grid-cols-3">
                    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm xl:col-span-2">
                        <div className="border-b border-slate-100 p-5">
                            <SectionHeading
                                href="/admin/leads"
                                linkLabel="View all"
                                subtitle="The latest enquiries added to your pipeline"
                                title="Recent leads"
                            />
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full min-w-[680px] text-left text-sm">
                                <thead className="bg-slate-50 text-xs uppercase tracking-wider text-slate-500">
                                    <tr>
                                        <th className="px-5 py-3 font-semibold">
                                            Lead
                                        </th>
                                        <th className="px-5 py-3 font-semibold">
                                            Destination
                                        </th>
                                        <th className="px-5 py-3 font-semibold">
                                            Status
                                        </th>
                                        <th className="px-5 py-3 font-semibold">
                                            Value
                                        </th>
                                        <th className="px-5 py-3 font-semibold">
                                            Added
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {recentLeads.map((lead) => (
                                        <tr
                                            className="transition hover:bg-slate-50/70"
                                            key={lead.id}
                                        >
                                            <td className="px-5 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="grid size-9 place-items-center rounded-full bg-blue-50 text-xs font-bold text-blue-700">
                                                        {lead.fullName
                                                            .split(" ")
                                                            .map(
                                                                (part) =>
                                                                    part[0],
                                                            )
                                                            .slice(0, 2)
                                                            .join("")}
                                                    </div>
                                                    <div>
                                                        <p className="font-semibold text-slate-900">
                                                            {lead.fullName}
                                                        </p>
                                                        <p className="text-xs text-slate-500">
                                                            {lead.email}
                                                        </p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-5 py-4 text-slate-600">
                                                {lead.destination}
                                            </td>
                                            <td className="px-5 py-4">
                                                <span
                                                    className={`rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ring-inset ${leadStyles[lead.status]}`}
                                                >
                                                    {leadLabels[lead.status]}
                                                </span>
                                            </td>
                                            <td className="px-5 py-4 font-semibold text-slate-900">
                                                {currency.format(
                                                    Number(lead.estimatedValue),
                                                )}
                                            </td>
                                            <td className="px-5 py-4 text-slate-500">
                                                {shortDate.format(
                                                    lead.createdAt,
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                    {recentLeads.length === 0 && (
                                        <tr>
                                            <td
                                                className="px-5 py-12 text-center text-slate-500"
                                                colSpan={5}
                                            >
                                                No leads yet. Add your first
                                                enquiry to start tracking.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    <div className="space-y-5">
                        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                            <SectionHeading
                                href="/admin/visas"
                                linkLabel="View visas"
                                subtitle={`${visaRows.length} applications · ${averageVisaProgress}% average progress`}
                                title="Visa processing"
                            />
                            <div className="mt-5 space-y-3">
                                {visaBreakdown.map((item) => (
                                    <div
                                        className="flex items-center justify-between text-sm"
                                        key={item.status}
                                    >
                                        <span className="capitalize text-slate-600">
                                            {item.status}
                                        </span>
                                        <span className="font-semibold text-slate-900">
                                            {item.count}
                                        </span>
                                    </div>
                                ))}
                            </div>
                            <div className="mt-5 border-t border-slate-100 pt-4">
                                <div className="flex items-center justify-between text-xs text-slate-500">
                                    <span>Average progress</span>
                                    <span className="font-semibold text-slate-700">
                                        {averageVisaProgress}%
                                    </span>
                                </div>
                                <div className="mt-2 h-2 overflow-hidden rounded-full bg-slate-100">
                                    <div
                                        className="h-full rounded-full bg-violet-500"
                                        style={{
                                            width: `${averageVisaProgress}%`,
                                        }}
                                    />
                                </div>
                                <p className="mt-3 flex items-center gap-1.5 text-xs text-slate-500">
                                    <CheckCircle2 className="size-3.5 text-emerald-500" />
                                    {verifiedDocuments} document
                                    {verifiedDocuments === 1 ? "" : "s"}{" "}
                                    verified
                                </p>
                            </div>
                        </div>

                        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                            <SectionHeading
                                href="/admin/packages"
                                linkLabel="View packages"
                                subtitle={`${activePackages} active · avg ${currency.format(averagePackagePrice)}`}
                                title="Package catalogue"
                            />
                            <div className="mt-5 grid grid-cols-2 gap-3">
                                <div className="rounded-xl bg-emerald-50 p-3">
                                    <p className="text-xs font-medium text-emerald-700">
                                        Domestic
                                    </p>
                                    <p className="mt-1 text-2xl font-bold text-emerald-900">
                                        {domesticPackages}
                                    </p>
                                </div>
                                <div className="rounded-xl bg-blue-50 p-3">
                                    <p className="text-xs font-medium text-blue-700">
                                        International
                                    </p>
                                    <p className="mt-1 text-2xl font-bold text-blue-900">
                                        {internationalPackages}
                                    </p>
                                </div>
                            </div>
                            <p className="mt-4 flex items-center gap-1.5 text-xs text-slate-500">
                                <Package className="size-3.5 text-slate-400" />
                                {packageRows.length} package
                                {packageRows.length === 1 ? "" : "s"} in
                                catalogue
                            </p>
                        </div>
                    </div>
                </section>

                <section className="mt-6 grid gap-4 sm:grid-cols-3">
                    <Link
                        className="group flex items-center gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
                        href="/admin/leads"
                    >
                        <span className="grid size-10 place-items-center rounded-xl bg-blue-50 text-blue-600">
                            <UsersRound className="size-5" />
                        </span>
                        <span>
                            <span className="block text-sm font-semibold text-slate-900 group-hover:text-blue-600">
                                Manage leads
                            </span>
                            <span className="text-xs text-slate-500">
                                {leadRows.length} in pipeline
                            </span>
                        </span>
                    </Link>
                    <Link
                        className="group flex items-center gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
                        href="/admin/follow-up"
                    >
                        <span className="grid size-10 place-items-center rounded-xl bg-amber-50 text-amber-600">
                            <Clock3 className="size-5" />
                        </span>
                        <span>
                            <span className="block text-sm font-semibold text-slate-900 group-hover:text-amber-600">
                                Schedule follow-ups
                            </span>
                            <span className="text-xs text-slate-500">
                                {scheduledFollowUps.length} scheduled
                            </span>
                        </span>
                    </Link>
                    <Link
                        className="group flex items-center gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
                        href="/admin/visas"
                    >
                        <span className="grid size-10 place-items-center rounded-xl bg-violet-50 text-violet-600">
                            <TrendingUp className="size-5" />
                        </span>
                        <span>
                            <span className="block text-sm font-semibold text-slate-900 group-hover:text-violet-600">
                                Track visas
                            </span>
                            <span className="text-xs text-slate-500">
                                {activeVisas} active applications
                            </span>
                        </span>
                    </Link>
                </section>
            </div>
        </main>
    );
}
