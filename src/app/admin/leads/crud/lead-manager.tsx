"use client";

import { FormEvent, useMemo, useState } from "react";
import {
    ChevronDown,
    Pencil,
    Plus,
    Search,
    Trash2,
    UserRound,
    X,
} from "lucide-react";
import { useLeads } from "./use-leads";
import {
    leadSources,
    leadStatuses,
    type Lead,
    type LeadDraft,
    type LeadStatus,
} from "./types";

const emptyDraft: LeadDraft = {
    fullName: "",
    email: "",
    phone: "",
    destination: "",
    status: "new",
    source: "website",
    travelers: 1,
    estimatedValue: 0,
    notes: "",
    nextFollowUpAt: "",
};
const labels: Record<LeadStatus, string> = {
    new: "New",
    contacted: "Contacted",
    qualified: "Qualified",
    proposal_sent: "Proposal sent",
    won: "Won",
    lost: "Lost",
};
const statusStyles: Record<LeadStatus, string> = {
    new: "bg-blue-50 text-blue-700 ring-blue-600/20",
    contacted: "bg-amber-50 text-amber-700 ring-amber-600/20",
    qualified: "bg-violet-50 text-violet-700 ring-violet-600/20",
    proposal_sent: "bg-cyan-50 text-cyan-700 ring-cyan-600/20",
    won: "bg-emerald-50 text-emerald-700 ring-emerald-600/20",
    lost: "bg-rose-50 text-rose-700 ring-rose-600/20",
};

function Field({
    label,
    children,
}: {
    label: string;
    children: React.ReactNode;
}) {
    return (
        <label className="block">
            <span className="mb-1.5 block text-sm font-medium text-slate-700">
                {label}
            </span>
            {children}
        </label>
    );
}

const inputClass =
    "h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/15";

function LeadForm({
    initial,
    onCancel,
    onSave,
}: {
    initial: LeadDraft;
    onCancel: () => void;
    onSave: (lead: LeadDraft) => void | Promise<void>;
}) {
    const [draft, setDraft] = useState(initial);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const set = <K extends keyof LeadDraft>(key: K, value: LeadDraft[K]) =>
        setDraft((current) => ({ ...current, [key]: value }));
    async function submit(event: FormEvent) {
        event.preventDefault();
        setSaving(true);
        setError(null);
        try {
            await onSave(draft);
        } catch (err) {
            setError(err instanceof Error ? err.message : "Failed to save lead");
            setSaving(false);
        }
    }

    return (
        <form onSubmit={submit}>
            <div className="grid gap-4 p-6 sm:grid-cols-2">
                <Field label="Full name">
                    <input
                        className={inputClass}
                        onChange={(e) => set("fullName", e.target.value)}
                        placeholder="e.g. Aditi Sharma"
                        required
                        value={draft.fullName}
                    />
                </Field>
                <Field label="Email address">
                    <input
                        className={inputClass}
                        onChange={(e) => set("email", e.target.value)}
                        placeholder="name@example.com"
                        required
                        type="email"
                        value={draft.email}
                    />
                </Field>
                <Field label="Phone number">
                    <input
                        className={inputClass}
                        onChange={(e) => set("phone", e.target.value)}
                        placeholder="+91 98765 43210"
                        required
                        value={draft.phone}
                    />
                </Field>
                <Field label="Destination">
                    <input
                        className={inputClass}
                        onChange={(e) => set("destination", e.target.value)}
                        placeholder="e.g. Canada"
                        required
                        value={draft.destination}
                    />
                </Field>
                <Field label="Status">
                    <select
                        className={inputClass}
                        onChange={(e) =>
                            set("status", e.target.value as LeadStatus)
                        }
                        value={draft.status}
                    >
                        {leadStatuses.map((status) => (
                            <option key={status} value={status}>
                                {labels[status]}
                            </option>
                        ))}
                    </select>
                </Field>
                <Field label="Lead source">
                    <select
                        className={inputClass}
                        onChange={(e) =>
                            set("source", e.target.value as LeadDraft["source"])
                        }
                        value={draft.source}
                    >
                        {leadSources.map((source) => (
                            <option key={source} value={source}>
                                {source.replaceAll("_", " ")}
                            </option>
                        ))}
                    </select>
                </Field>
                <Field label="Number of travelers">
                    <input
                        className={inputClass}
                        min="1"
                        onChange={(e) =>
                            set("travelers", Number(e.target.value))
                        }
                        required
                        type="number"
                        value={draft.travelers}
                    />
                </Field>
                <Field label="Estimated value (₹)">
                    <input
                        className={inputClass}
                        min="0"
                        onChange={(e) =>
                            set("estimatedValue", Number(e.target.value))
                        }
                        type="number"
                        value={draft.estimatedValue}
                    />
                </Field>
                <Field label="Next follow-up">
                    <input
                        className={inputClass}
                        onChange={(e) => set("nextFollowUpAt", e.target.value)}
                        type="date"
                        value={draft.nextFollowUpAt}
                    />
                </Field>
                <div className="sm:col-span-2">
                    <Field label="Notes">
                        <textarea
                            className={`${inputClass} h-24 resize-none py-2.5`}
                            onChange={(e) => set("notes", e.target.value)}
                            placeholder="Add context, requirements, or the next action…"
                            value={draft.notes}
                        />
                    </Field>
                </div>
            </div>
            <div className="flex items-center justify-end gap-3 border-t border-slate-100 bg-slate-50 px-6 py-4">
                {error && (
                    <p className="mr-auto text-sm font-medium text-rose-600">
                        {error}
                    </p>
                )}
                <button
                    className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                    onClick={onCancel}
                    type="button"
                >
                    Cancel
                </button>
                <button
                    className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
                    disabled={saving}
                    type="submit"
                >
                    {saving ? "Saving…" : "Save lead"}
                </button>
            </div>
        </form>
    );
}

function Dialog({
    title,
    subtitle,
    children,
    onClose,
}: {
    title: string;
    subtitle: string;
    children: React.ReactNode;
    onClose: () => void;
}) {
    return (
        <div
            className="fixed inset-0 z-50 grid place-items-center overflow-y-auto bg-slate-950/55 p-4 backdrop-blur-sm"
            onMouseDown={(e) => {
                if (e.currentTarget === e.target) onClose();
            }}
        >
            <div className="my-4 w-full max-w-2xl overflow-hidden rounded-2xl bg-white shadow-2xl">
                <div className="flex items-start justify-between border-b border-slate-100 px-6 py-5">
                    <div>
                        <h2 className="text-lg font-bold text-slate-950">
                            {title}
                        </h2>
                        <p className="mt-1 text-sm text-slate-500">
                            {subtitle}
                        </p>
                    </div>
                    <button
                        aria-label="Close dialog"
                        className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
                        onClick={onClose}
                    >
                        <X className="size-5" />
                    </button>
                </div>
                {children}
            </div>
        </div>
    );
}

export function LeadManager() {
    const { leads, createLead, updateLead, deleteLead } = useLeads();
    const [search, setSearch] = useState("");
    const [status, setStatus] = useState<LeadStatus | "all">("all");
    const [editing, setEditing] = useState<Lead | "new" | null>(null);
    const [deleting, setDeleting] = useState<Lead | null>(null);
    const [deleteError, setDeleteError] = useState<string | null>(null);
    const [deletingBusy, setDeletingBusy] = useState(false);
    const filtered = useMemo(
        () =>
            leads.filter(
                (lead) =>
                    (status === "all" || lead.status === status) &&
                    [
                        lead.fullName,
                        lead.email,
                        lead.phone,
                        lead.destination,
                    ].some((value) =>
                        value.toLowerCase().includes(search.toLowerCase()),
                    ),
            ),
        [leads, search, status],
    );
    const pipelineValue = leads.reduce(
        (sum, lead) => sum + lead.estimatedValue,
        0,
    );

    return (
        <main className="min-h-screen bg-slate-50 text-slate-900">
            <header className="border-b border-slate-200 bg-white px-5 py-5 sm:px-8">
                    <p className="text-xs font-semibold uppercase tracking-[.18em] text-blue-600">
                        CRM
                    </p>
                    <h1 className="mt-1 text-2xl font-bold text-slate-950">
                        Lead management
                    </h1>
                </header>
                <div className="p-5 sm:p-8">
                    <section className="mb-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
                        <div>
                            <h2 className="text-xl font-bold">
                                Your sales pipeline
                            </h2>
                            <p className="mt-1 text-sm text-slate-500">
                                Create, qualify, and track every travel enquiry.
                            </p>
                        </div>
                        <button
                            className="inline-flex w-fit items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-blue-700"
                            onClick={() => setEditing("new")}
                        >
                            <Plus className="size-4" />
                            Add lead
                        </button>
                    </section>

                    <section className="mb-6 grid gap-4 sm:grid-cols-3">
                        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                            <p className="text-sm text-slate-500">
                                Total leads
                            </p>
                            <p className="mt-2 text-3xl font-bold">
                                {leads.length}
                            </p>
                        </div>
                        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                            <p className="text-sm text-slate-500">
                                Qualified leads
                            </p>
                            <p className="mt-2 text-3xl font-bold">
                                {
                                    leads.filter(
                                        (lead) => lead.status === "qualified",
                                    ).length
                                }
                            </p>
                        </div>
                        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                            <p className="text-sm text-slate-500">
                                Pipeline value
                            </p>
                            <p className="mt-2 text-3xl font-bold">
                                ₹{pipelineValue.toLocaleString("en-IN")}
                            </p>
                        </div>
                    </section>

                    <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                        <div className="flex flex-col gap-3 border-b border-slate-100 p-4 sm:flex-row">
                            <div className="relative flex-1">
                                <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
                                <input
                                    aria-label="Search leads"
                                    className={`${inputClass} pl-9`}
                                    onChange={(e) => setSearch(e.target.value)}
                                    placeholder="Search name, email, phone, or destination…"
                                    value={search}
                                />
                            </div>
                            <div className="relative">
                                <select
                                    aria-label="Filter by status"
                                    className={`${inputClass} min-w-44 appearance-none pr-9 capitalize`}
                                    onChange={(e) =>
                                        setStatus(
                                            e.target.value as
                                                | LeadStatus
                                                | "all",
                                        )
                                    }
                                    value={status}
                                >
                                    <option value="all">All statuses</option>
                                    {leadStatuses.map((item) => (
                                        <option key={item} value={item}>
                                            {labels[item]}
                                        </option>
                                    ))}
                                </select>
                                <ChevronDown className="pointer-events-none absolute right-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
                            </div>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full min-w-[940px] text-left text-sm">
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
                                            Follow-up
                                        </th>
                                        <th className="px-5 py-3 text-right font-semibold">
                                            Actions
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {filtered.map((lead) => (
                                        <tr
                                            className="hover:bg-slate-50/70"
                                            key={lead.id}
                                        >
                                            <td className="px-5 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="grid size-10 place-items-center rounded-full bg-blue-50 font-bold text-blue-700">
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
                                                            {lead.email} ·{" "}
                                                            {lead.phone}
                                                        </p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-5 py-4">
                                                <p className="font-medium">
                                                    {lead.destination}
                                                </p>
                                                <p className="text-xs capitalize text-slate-500">
                                                    {lead.travelers} traveler
                                                    {lead.travelers === 1
                                                        ? ""
                                                        : "s"}{" "}
                                                    ·{" "}
                                                    {lead.source.replaceAll(
                                                        "_",
                                                        " ",
                                                    )}
                                                </p>
                                            </td>
                                            <td className="px-5 py-4">
                                                <span
                                                    className={`rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ring-inset ${statusStyles[lead.status]}`}
                                                >
                                                    {labels[lead.status]}
                                                </span>
                                            </td>
                                            <td className="px-5 py-4 font-semibold">
                                                ₹
                                                {lead.estimatedValue.toLocaleString(
                                                    "en-IN",
                                                )}
                                            </td>
                                            <td className="px-5 py-4 text-slate-600">
                                                {lead.nextFollowUpAt
                                                    ? new Intl.DateTimeFormat(
                                                          "en-IN",
                                                          {
                                                              day: "numeric",
                                                              month: "short",
                                                              year: "numeric",
                                                          },
                                                      ).format(
                                                          new Date(
                                                              `${lead.nextFollowUpAt}T00:00:00`,
                                                          ),
                                                      )
                                                    : "Not scheduled"}
                                            </td>
                                            <td className="px-5 py-4">
                                                <div className="flex justify-end gap-1">
                                                    <button
                                                        aria-label={`Edit ${lead.fullName}`}
                                                        className="rounded-lg p-2 text-slate-400 hover:bg-blue-50 hover:text-blue-600"
                                                        onClick={() =>
                                                            setEditing(lead)
                                                        }
                                                    >
                                                        <Pencil className="size-4" />
                                                    </button>
                                                    <button
                                                        aria-label={`Delete ${lead.fullName}`}
                                                        className="rounded-lg p-2 text-slate-400 hover:bg-rose-50 hover:text-rose-600"
                                                        onClick={() => {
                                                            setDeleteError(null);
                                                            setDeleting(lead);
                                                        }}
                                                    >
                                                        <Trash2 className="size-4" />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                    {filtered.length === 0 && (
                                        <tr>
                                            <td
                                                className="px-5 py-16 text-center"
                                                colSpan={6}
                                            >
                                                <UserRound className="mx-auto size-8 text-slate-300" />
                                                <p className="mt-3 font-semibold text-slate-700">
                                                    No leads found
                                                </p>
                                                <p className="mt-1 text-sm text-slate-500">
                                                    Try changing your search or
                                                    status filter.
                                                </p>
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                        <div className="border-t border-slate-100 px-5 py-3 text-sm text-slate-500">
                            Showing {filtered.length} of {leads.length} leads
                        </div>
                    </section>
                </div>

            {editing && (
                <Dialog
                    onClose={() => setEditing(null)}
                    subtitle={
                        editing === "new"
                            ? "Add a new enquiry to your sales pipeline."
                            : "Update the lead details and pipeline status."
                    }
                    title={editing === "new" ? "Create lead" : "Edit lead"}
                >
                    <LeadForm
                        initial={editing === "new" ? emptyDraft : editing}
                        onCancel={() => setEditing(null)}
                        onSave={async (draft) => {
                            if (editing === "new") await createLead(draft);
                            else await updateLead(editing.id, draft);
                            setEditing(null);
                        }}
                    />
                </Dialog>
            )}
            {deleting && (
                <Dialog
                    onClose={() => setDeleting(null)}
                    subtitle="This action cannot be undone."
                    title="Delete lead?"
                >
                    <div className="p-6">
                        <p className="text-sm text-slate-600">
                            You are about to permanently delete{" "}
                            <strong className="text-slate-900">
                                {deleting.fullName}
                            </strong>{" "}
                            from the lead pipeline.
                        </p>
                        <div className="mt-6 flex items-center justify-end gap-3">
                            {deleteError && (
                                <p className="mr-auto text-sm font-medium text-rose-600">
                                    {deleteError}
                                </p>
                            )}
                            <button
                                className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700"
                                onClick={() => setDeleting(null)}
                            >
                                Cancel
                            </button>
                            <button
                                className="rounded-lg bg-rose-600 px-4 py-2 text-sm font-semibold text-white hover:bg-rose-700 disabled:cursor-not-allowed disabled:opacity-60"
                                disabled={deletingBusy}
                                onClick={async () => {
                                    setDeletingBusy(true);
                                    setDeleteError(null);
                                    try {
                                        await deleteLead(deleting.id);
                                        setDeleting(null);
                                    } catch (err) {
                                        setDeleteError(
                                            err instanceof Error
                                                ? err.message
                                                : "Failed to delete lead",
                                        );
                                    } finally {
                                        setDeletingBusy(false);
                                    }
                                }}
                            >
                                {deletingBusy ? "Deleting…" : "Delete lead"}
                            </button>
                        </div>
                    </div>
                </Dialog>
            )}
        </main>
    );
}
