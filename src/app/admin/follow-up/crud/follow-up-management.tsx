"use client";

import { FormEvent, useCallback, useEffect, useMemo, useState } from "react";
import {
    CalendarClock,
    CheckCircle2,
    Mail,
    MessageCircle,
    Pencil,
    Phone,
    Plus,
    Search,
    Trash2,
    Users,
    Video,
    X,
} from "lucide-react";
import {
    followUpChannels,
    followUpPriorities,
    followUpStatuses,
    type FollowUp,
    type FollowUpDraft,
    type LeadOption,
} from "./types";

const blank: FollowUpDraft = {
    leadId: null,
    title: "",
    scheduledAt: "",
    status: "scheduled",
    channel: "call",
    priority: "medium",
    notes: "",
    outcome: "",
    completedAt: null,
};
const input =
    "h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/15";
const statusStyle = {
    scheduled: "bg-blue-50 text-blue-700",
    completed: "bg-emerald-50 text-emerald-700",
    cancelled: "bg-slate-100 text-slate-600",
    missed: "bg-rose-50 text-rose-700",
};
const channelIcon = {
    call: Phone,
    email: Mail,
    whatsapp: MessageCircle,
    meeting: Video,
};
function Field({
    label,
    children,
}: {
    label: string;
    children: React.ReactNode;
}) {
    return (
        <label>
            <span className="mb-1.5 block text-sm font-medium text-slate-700">
                {label}
            </span>
            {children}
        </label>
    );
}
function toLocalInput(value: string) {
    const date = new Date(value);
    const offset = date.getTimezoneOffset();
    return new Date(date.getTime() - offset * 60000).toISOString().slice(0, 16);
}

function FollowUpForm({
    item,
    leads,
    onClose,
    onSaved,
}: {
    item: FollowUp | null;
    leads: LeadOption[];
    onClose: () => void;
    onSaved: () => void;
}) {
    const [draft, setDraft] = useState<FollowUpDraft>(
        item
            ? {
                  leadId: item.leadId,
                  title: item.title,
                  scheduledAt: toLocalInput(item.scheduledAt),
                  status: item.status,
                  channel: item.channel,
                  priority: item.priority,
                  notes: item.notes,
                  outcome: item.outcome,
                  completedAt: item.completedAt,
              }
            : blank,
    );
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");
    const set = <K extends keyof FollowUpDraft>(
        key: K,
        value: FollowUpDraft[K],
    ) => setDraft((old) => ({ ...old, [key]: value }));
    async function submit(event: FormEvent) {
        event.preventDefault();
        setSaving(true);
        setError("");
        try {
            const response = await fetch(
                item ? `/api/follow-ups/${item.id}` : "/api/follow-ups",
                {
                    method: item ? "PATCH" : "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(draft),
                },
            );
            const data = await response.json();
            if (!response.ok)
                throw new Error(data.error ?? "Unable to save follow-up");
            onSaved();
        } catch (cause) {
            setError(
                cause instanceof Error
                    ? cause.message
                    : "Unable to save follow-up",
            );
        } finally {
            setSaving(false);
        }
    }
    return (
        <form onSubmit={submit}>
            <div className="grid gap-4 p-6 sm:grid-cols-2">
                <div className="sm:col-span-2">
                    <Field label="Follow-up title">
                        <input
                            className={input}
                            required
                            value={draft.title}
                            onChange={(e) => set("title", e.target.value)}
                            placeholder="e.g. Review package proposal"
                        />
                    </Field>
                </div>
                <Field label="Lead">
                    <select
                        className={input}
                        value={draft.leadId ?? ""}
                        onChange={(e) => set("leadId", e.target.value || null)}
                    >
                        <option value="">Unassigned</option>
                        {leads.map((lead) => (
                            <option key={lead.id} value={lead.id}>
                                {lead.fullName} · {lead.email}
                            </option>
                        ))}
                    </select>
                </Field>
                <Field label="Schedule">
                    <input
                        className={input}
                        type="datetime-local"
                        required
                        value={draft.scheduledAt}
                        onChange={(e) => set("scheduledAt", e.target.value)}
                    />
                </Field>
                <Field label="Channel">
                    <select
                        className={`${input} capitalize`}
                        value={draft.channel}
                        onChange={(e) =>
                            set(
                                "channel",
                                e.target.value as FollowUpDraft["channel"],
                            )
                        }
                    >
                        {followUpChannels.map((value) => (
                            <option key={value}>{value}</option>
                        ))}
                    </select>
                </Field>
                <Field label="Priority">
                    <select
                        className={`${input} capitalize`}
                        value={draft.priority}
                        onChange={(e) =>
                            set(
                                "priority",
                                e.target.value as FollowUpDraft["priority"],
                            )
                        }
                    >
                        {followUpPriorities.map((value) => (
                            <option key={value}>{value}</option>
                        ))}
                    </select>
                </Field>
                <Field label="Status">
                    <select
                        className={`${input} capitalize`}
                        value={draft.status}
                        onChange={(e) =>
                            set(
                                "status",
                                e.target.value as FollowUpDraft["status"],
                            )
                        }
                    >
                        {followUpStatuses.map((value) => (
                            <option key={value}>{value}</option>
                        ))}
                    </select>
                </Field>
                <div className="sm:col-span-2">
                    <Field label="Notes">
                        <textarea
                            className={`${input} h-20 py-2`}
                            value={draft.notes ?? ""}
                            onChange={(e) => set("notes", e.target.value)}
                            placeholder="What needs to be discussed?"
                        />
                    </Field>
                </div>
                {draft.status === "completed" && (
                    <div className="sm:col-span-2">
                        <Field label="Outcome">
                            <textarea
                                className={`${input} h-20 py-2`}
                                value={draft.outcome ?? ""}
                                onChange={(e) => set("outcome", e.target.value)}
                                placeholder="Record the result of this follow-up"
                            />
                        </Field>
                    </div>
                )}
            </div>
            {error && (
                <p className="mx-6 mb-4 rounded-lg bg-rose-50 p-3 text-sm text-rose-700">
                    {error}
                </p>
            )}
            <div className="flex justify-end gap-3 border-t bg-slate-50 px-6 py-4">
                <button
                    type="button"
                    onClick={onClose}
                    className="rounded-lg border bg-white px-4 py-2 text-sm font-semibold"
                >
                    Cancel
                </button>
                <button
                    disabled={saving}
                    className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white disabled:opacity-60"
                >
                    {saving
                        ? "Saving…"
                        : item
                          ? "Save changes"
                          : "Schedule follow-up"}
                </button>
            </div>
        </form>
    );
}

export function FollowUpManagement() {
    const [items, setItems] = useState<FollowUp[]>([]);
    const [leads, setLeads] = useState<LeadOption[]>([]);
    const [editing, setEditing] = useState<FollowUp | "new" | null>(null);
    const [search, setSearch] = useState("");
    const [status, setStatus] = useState("all");
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const load = useCallback(async () => {
        try {
            const [followResponse, leadResponse] = await Promise.all([
                fetch("/api/follow-ups", { cache: "no-store" }),
                fetch("/api/leads", { cache: "no-store" }),
            ]);
            const followData = await followResponse.json();
            const leadData = await leadResponse.json();
            if (!followResponse.ok)
                throw new Error(
                    followData.error ?? "Unable to load follow-ups",
                );
            if (!leadResponse.ok) throw new Error("Unable to load leads");
            setItems(followData);
            setLeads(
                leadData.map((lead: LeadOption) => ({
                    id: lead.id,
                    fullName: lead.fullName,
                    email: lead.email,
                })),
            );
        } catch (cause) {
            setError(
                cause instanceof Error ? cause.message : "Unable to load data",
            );
        } finally {
            setLoading(false);
        }
    }, []);
    useEffect(() => {
        const timer = window.setTimeout(() => {
            void load();
        }, 0);
        return () => window.clearTimeout(timer);
    }, [load]);
    const shown = useMemo(
        () =>
            items.filter(
                (item) =>
                    (status === "all" || item.status === status) &&
                    [
                        item.title,
                        item.leadName ?? "",
                        item.leadEmail ?? "",
                    ].some((value) =>
                        value.toLowerCase().includes(search.toLowerCase()),
                    ),
            ),
        [items, search, status],
    );
    async function remove(item: FollowUp) {
        if (!window.confirm(`Delete “${item.title}”?`)) return;
        const response = await fetch(`/api/follow-ups/${item.id}`, {
            method: "DELETE",
        });
        if (response.ok)
            setItems((old) => old.filter((row) => row.id !== item.id));
        else setError("Unable to delete follow-up");
    }
    if (loading)
        return (
            <main className="grid min-h-screen place-items-center text-sm text-slate-500">
                Loading follow-ups from Supabase…
            </main>
        );

    return (
        <main className="min-h-screen bg-slate-50 text-slate-900">
            <header className="border-b bg-white px-5 py-5 sm:px-8">
                <p className="text-xs font-semibold uppercase tracking-[.18em] text-blue-600">
                    CRM
                </p>
                <h1 className="mt-1 text-2xl font-bold">
                    Follow-up management
                </h1>
            </header>
            <div className="p-5 sm:p-8">
                <div className="mb-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
                    <div>
                        <h2 className="text-xl font-bold">
                            Scheduled activity
                        </h2>
                        <p className="mt-1 text-sm text-slate-500">
                            Plan conversations and keep every lead moving
                            forward.
                        </p>
                    </div>
                    <button
                        onClick={() => setEditing("new")}
                        className="flex w-fit items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white"
                    >
                        <Plus className="size-4" />
                        New follow-up
                    </button>
                </div>
                <section className="mb-6 grid gap-4 sm:grid-cols-3">
                    <div className="rounded-2xl border bg-white p-5 shadow-sm">
                        <p className="text-sm text-slate-500">Scheduled</p>
                        <p className="mt-2 text-3xl font-bold">
                            {
                                items.filter((x) => x.status === "scheduled")
                                    .length
                            }
                        </p>
                    </div>
                    <div className="rounded-2xl border bg-white p-5 shadow-sm">
                        <p className="text-sm text-slate-500">Completed</p>
                        <p className="mt-2 text-3xl font-bold">
                            {
                                items.filter((x) => x.status === "completed")
                                    .length
                            }
                        </p>
                    </div>
                    <div className="rounded-2xl border bg-white p-5 shadow-sm">
                        <p className="text-sm text-slate-500">High priority</p>
                        <p className="mt-2 text-3xl font-bold">
                            {
                                items.filter(
                                    (x) =>
                                        x.priority === "high" &&
                                        x.status === "scheduled",
                                ).length
                            }
                        </p>
                    </div>
                </section>
                {error && (
                    <p className="mb-5 rounded-xl bg-rose-50 p-3 text-sm text-rose-700">
                        {error}
                    </p>
                )}
                <section className="overflow-hidden rounded-2xl border bg-white shadow-sm">
                    <div className="flex flex-col gap-3 border-b p-4 sm:flex-row">
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-3 size-4 text-slate-400" />
                            <input
                                className={`${input} pl-9`}
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                placeholder="Search follow-up or lead…"
                            />
                        </div>
                        <select
                            className={`${input} w-auto min-w-40 capitalize`}
                            value={status}
                            onChange={(e) => setStatus(e.target.value)}
                        >
                            <option value="all">All statuses</option>
                            {followUpStatuses.map((value) => (
                                <option key={value}>{value}</option>
                            ))}
                        </select>
                    </div>
                    <div className="divide-y">
                        {shown.map((item) => {
                            const Icon = channelIcon[item.channel];
                            return (
                                <article
                                    key={item.id}
                                    className="flex flex-col gap-4 p-5 hover:bg-slate-50 sm:flex-row sm:items-center"
                                >
                                    <div className="grid size-11 shrink-0 place-items-center rounded-xl bg-blue-50 text-blue-600">
                                        <Icon className="size-5" />
                                    </div>
                                    <div className="min-w-0 flex-1">
                                        <div className="flex flex-wrap items-center gap-2">
                                            <h3 className="font-semibold">
                                                {item.title}
                                            </h3>
                                            <span
                                                className={`rounded-full px-2.5 py-1 text-xs font-semibold capitalize ${statusStyle[item.status]}`}
                                            >
                                                {item.status}
                                            </span>
                                            <span
                                                className={`text-xs font-semibold capitalize ${item.priority === "high" ? "text-rose-600" : "text-slate-500"}`}
                                            >
                                                {item.priority} priority
                                            </span>
                                        </div>
                                        <p className="mt-1 text-sm text-slate-500">
                                            {item.leadName ?? "Unassigned"}
                                            {item.leadEmail
                                                ? ` · ${item.leadEmail}`
                                                : ""}
                                        </p>
                                        <p className="mt-2 flex items-center gap-1.5 text-sm font-medium text-slate-700">
                                            <CalendarClock className="size-4 text-slate-400" />
                                            {new Date(
                                                item.scheduledAt,
                                            ).toLocaleString("en-IN", {
                                                dateStyle: "medium",
                                                timeStyle: "short",
                                            })}
                                        </p>
                                    </div>
                                    <div className="flex items-center gap-1 self-end sm:self-auto">
                                        {item.status !== "completed" && (
                                            <button
                                                title="Mark completed"
                                                onClick={async () => {
                                                    const response =
                                                        await fetch(
                                                            `/api/follow-ups/${item.id}`,
                                                            {
                                                                method: "PATCH",
                                                                headers: {
                                                                    "Content-Type":
                                                                        "application/json",
                                                                },
                                                                body: JSON.stringify(
                                                                    {
                                                                        ...item,
                                                                        status: "completed",
                                                                    },
                                                                ),
                                                            },
                                                        );
                                                    if (response.ok)
                                                        void load();
                                                }}
                                                className="rounded-lg p-2 text-slate-400 hover:bg-emerald-50 hover:text-emerald-600"
                                            >
                                                <CheckCircle2 className="size-4" />
                                            </button>
                                        )}
                                        <button
                                            title="Edit"
                                            onClick={() => setEditing(item)}
                                            className="rounded-lg p-2 text-slate-400 hover:bg-blue-50 hover:text-blue-600"
                                        >
                                            <Pencil className="size-4" />
                                        </button>
                                        <button
                                            title="Delete"
                                            onClick={() => remove(item)}
                                            className="rounded-lg p-2 text-slate-400 hover:bg-rose-50 hover:text-rose-600"
                                        >
                                            <Trash2 className="size-4" />
                                        </button>
                                    </div>
                                </article>
                            );
                        })}
                        {shown.length === 0 && (
                            <div className="py-16 text-center">
                                <Users className="mx-auto size-9 text-slate-300" />
                                <p className="mt-3 font-semibold">
                                    No follow-ups found
                                </p>
                            </div>
                        )}
                    </div>
                    <div className="border-t px-5 py-3 text-sm text-slate-500">
                        Showing {shown.length} of {items.length} follow-ups
                    </div>
                </section>
            </div>
            {editing && (
                <div className="fixed inset-0 z-50 grid place-items-center overflow-y-auto bg-slate-950/55 p-4">
                    <div className="my-4 w-full max-w-2xl overflow-hidden rounded-2xl bg-white shadow-2xl">
                        <div className="flex justify-between border-b px-6 py-5">
                            <div>
                                <h2 className="text-lg font-bold">
                                    {editing === "new"
                                        ? "Schedule follow-up"
                                        : "Edit follow-up"}
                                </h2>
                                <p className="text-sm text-slate-500">
                                    Set the owner, channel, time, and next
                                    action.
                                </p>
                            </div>
                            <button onClick={() => setEditing(null)}>
                                <X className="size-5" />
                            </button>
                        </div>
                        <FollowUpForm
                            item={editing === "new" ? null : editing}
                            leads={leads}
                            onClose={() => setEditing(null)}
                            onSaved={() => {
                                setEditing(null);
                                void load();
                            }}
                        />
                    </div>
                </div>
            )}
        </main>
    );
}
