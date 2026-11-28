"use client";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { SelectField } from "@/components/ui/select-field";

import { adminRequest as fetch } from "@/lib/crm/admin-request";

import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { FormEvent, useEffect, useMemo, useState } from "react";
import { Eye, FileCheck2, Pencil, Plus, Search, Trash2, X } from "lucide-react";
import {
    documentStatuses,
    normalizeVisa,
    visaStatuses,
    type VisaApplication,
    type VisaDraft,
    type VisaStatus,
} from "./types";

const blank: VisaDraft = {
    applicantName: "",
    email: "",
    phone: "",
    passportNumber: "",
    destinationCountry: "",
    visaType: "",
    status: "draft",
    documentStatus: "pending",
    progress: 0,
    applicationValue: 0,
    notes: "",
    submittedAt: "",
};
const input =
    "h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/15";
const statusColor: Record<VisaStatus, string> = {
    draft: "bg-slate-100 text-slate-700",
    processed: "bg-amber-50 text-amber-700",
    published: "bg-emerald-50 text-emerald-700",
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

function VisaForm({
    initial,
    onClose,
    onSaved,
}: {
    initial: VisaDraft;
    onClose: () => void;
    onSaved: (item: VisaApplication) => void;
}) {
    const [draft, setDraft] = useState(initial);
    const [saving, setSaving] = useState(false);
    const set = <K extends keyof VisaDraft>(key: K, value: VisaDraft[K]) =>
        setDraft((old) => ({ ...old, [key]: value }));
    async function submit(event: FormEvent) {
        event.preventDefault();
        setSaving(true);
        const response = await fetch("/api/visas", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(draft),
        });
        if (response.ok) onSaved(normalizeVisa(await response.json()));
        setSaving(false);
    }
    return (
        <form onSubmit={submit}>
            <div className="grid gap-4 p-6 sm:grid-cols-2">
                <Field label="Applicant name">
                    <Input
                        className={input}
                        required
                        value={draft.applicantName}
                        onChange={(e) => set("applicantName", e.target.value)}
                    />
                </Field>
                <Field label="Email">
                    <Input
                        className={input}
                        required
                        type="email"
                        value={draft.email}
                        onChange={(e) => set("email", e.target.value)}
                    />
                </Field>
                <Field label="Phone">
                    <Input
                        className={input}
                        required
                        value={draft.phone}
                        onChange={(e) => set("phone", e.target.value)}
                    />
                </Field>
                <Field label="Passport number">
                    <Input
                        className={input}
                        required
                        value={draft.passportNumber}
                        onChange={(e) =>
                            set("passportNumber", e.target.value.toUpperCase())
                        }
                    />
                </Field>
                <Field label="Destination">
                    <Input
                        className={input}
                        required
                        value={draft.destinationCountry}
                        onChange={(e) =>
                            set("destinationCountry", e.target.value)
                        }
                    />
                </Field>
                <Field label="Visa type">
                    <Input
                        className={input}
                        required
                        placeholder="Tourist Visa"
                        value={draft.visaType}
                        onChange={(e) => set("visaType", e.target.value)}
                    />
                </Field>
                <Field label="Application status">
                    <SelectField
                        className="h-10 capitalize"
                        value={draft.status}
                        onValueChange={(value) => set("status", value as VisaDraft["status"])}
                        options={visaStatuses.map(value=>({value,label:value}))}
                    />
                </Field>
                <Field label="Document status">
                    <SelectField
                        className="h-10 capitalize"
                        value={draft.documentStatus}
                        onValueChange={(value) => set("documentStatus", value as VisaDraft["documentStatus"])}
                        options={documentStatuses.map(value=>({value,label:value}))}
                    />
                </Field>
                <Field label="Progress (%)">
                    <Input
                        className={input}
                        min="0"
                        max="100"
                        type="number"
                        value={draft.progress}
                        onChange={(e) =>
                            set("progress", Number(e.target.value))
                        }
                    />
                </Field>
                <Field label="Application value (₹)">
                    <Input
                        className={input}
                        min="0"
                        type="number"
                        value={draft.applicationValue}
                        onChange={(e) =>
                            set("applicationValue", Number(e.target.value))
                        }
                    />
                </Field>
                <Field label="Submitted on">
                    <Input
                        className={input}
                        type="date"
                        value={draft.submittedAt}
                        onChange={(e) => set("submittedAt", e.target.value)}
                    />
                </Field>
                <div className="sm:col-span-2">
                    <Field label="Notes">
                        <Textarea
                            className={`${input} h-24 py-2`}
                            value={draft.notes}
                            onChange={(e) => set("notes", e.target.value)}
                        />
                    </Field>
                </div>
            </div>
            <div className="flex justify-end gap-3 border-t bg-slate-50 px-6 py-4">
                <Button
                    type="button"
                    onClick={onClose}
                    className="rounded-lg border bg-white px-4 py-2 text-sm font-semibold"
                >
                    Cancel
                </Button>
                <Button
                    type="submit"
                    disabled={saving}
                    className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white disabled:opacity-60"
                >
                    {saving ? "Saving…" : "Create application"}
                </Button>
            </div>
        </form>
    );
}

export function VisaManagement() {
    const [items, setItems] = useState<VisaApplication[]>([]);
    const [query, setQuery] = useState("");
    const [filter, setFilter] = useState<VisaStatus | "all">("all");
    const [adding, setAdding] = useState(false);
    useEffect(() => {
        fetch("/api/visas")
            .then((r) => r.json())
            .then((rows) => setItems(rows.map(normalizeVisa)));
    }, []);
    const shown = useMemo(
        () =>
            items.filter(
                (v) =>
                    (filter === "all" || v.status === filter) &&
                    [
                        v.applicantName,
                        v.passportNumber,
                        v.destinationCountry,
                        v.visaType,
                    ].some((x) =>
                        x.toLowerCase().includes(query.toLowerCase()),
                    ),
            ),
        [items, query, filter],
    );
    async function remove(item: VisaApplication) {
        if (!window.confirm(`Delete ${item.applicantName}'s application?`))
            return;
        const response = await fetch(`/api/visas/${item.id}`, {
            method: "DELETE",
        });
        if (response.ok) setItems((old) => old.filter((v) => v.id !== item.id));
    }

    return (
        <main className="min-h-screen bg-slate-50 text-slate-900">
            <header className="border-b bg-white px-5 py-5 sm:px-8">
                <Link
                    href="/"
                    className="text-xs font-semibold uppercase tracking-[.18em] text-blue-600"
                >
                    TravelDesk / Admin
                </Link>
                <h1 className="mt-1 text-2xl font-bold">Visa applications</h1>
            </header>
            <div className="p-5 sm:p-8">
                <div className="mb-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
                    <div>
                        <h2 className="text-xl font-bold">
                            Application tracking
                        </h2>
                        <p className="mt-1 text-sm text-slate-500">
                            Track documents and progress from draft to
                            publication.
                        </p>
                    </div>
                    <Button
                        onClick={() => setAdding(true)}
                        className="flex w-fit items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white"
                    >
                        <Plus className="size-4" />
                        New application
                    </Button>
                </div>
                <section className="mb-6 grid gap-4 sm:grid-cols-4">
                    {[
                        { l: "Applications", v: items.length },
                        {
                            l: "In process",
                            v: items.filter((x) => x.status === "processed")
                                .length,
                        },
                        {
                            l: "Documents verified",
                            v: items.filter(
                                (x) => x.documentStatus === "verified",
                            ).length,
                        },
                        {
                            l: "Published",
                            v: items.filter((x) => x.status === "published")
                                .length,
                        },
                    ].map((s) => (
                        <div
                            className="rounded-2xl border bg-white p-5 shadow-sm"
                            key={s.l}
                        >
                            <p className="text-sm text-slate-500">{s.l}</p>
                            <p className="mt-2 text-3xl font-bold">{s.v}</p>
                        </div>
                    ))}
                </section>
                <section className="overflow-hidden rounded-2xl border bg-white shadow-sm">
                    <div className="flex flex-col gap-3 border-b p-4 sm:flex-row">
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-3 size-4 text-slate-400" />
                            <Input
                                className={`${input} pl-9`}
                                placeholder="Search applicant, passport, country, or visa…"
                                value={query}
                                onChange={(e) => setQuery(e.target.value)}
                            />
                        </div>
                        <SelectField
                            className="h-10 min-w-40 capitalize"
                            value={filter}
                            onValueChange={(value) => setFilter(value as VisaStatus | "all")}
                            options={[{value:"all",label:"All statuses"},...visaStatuses.map(value=>({value,label:value}))]}
                        />
                    </div>
                    <div className="overflow-x-auto">
                        <Table className="w-full min-w-[980px] text-left text-sm">
                            <TableHeader className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                                <TableRow>
                                    <TableHead className="px-5 py-3">Applicant</TableHead>
                                    <TableHead className="px-5 py-3">Visa</TableHead>
                                    <TableHead className="px-5 py-3">Status</TableHead>
                                    <TableHead className="px-5 py-3">Documents</TableHead>
                                    <TableHead className="px-5 py-3">Progress</TableHead>
                                    <TableHead className="px-5 py-3">Created</TableHead>
                                    <TableHead className="px-5 py-3 text-right">
                                        Actions
                                    </TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody className="divide-y">
                                {shown.map((item) => (
                                    <TableRow
                                        className="hover:bg-slate-50"
                                        key={item.id}
                                    >
                                        <TableCell className="px-5 py-4">
                                            <p className="font-semibold">
                                                {item.applicantName}
                                            </p>
                                            <p className="text-xs text-slate-500">
                                                {item.passportNumber} ·{" "}
                                                {item.email}
                                            </p>
                                        </TableCell>
                                        <TableCell className="px-5 py-4">
                                            <p>{item.visaType}</p>
                                            <p className="text-xs text-slate-500">
                                                {item.destinationCountry}
                                            </p>
                                        </TableCell>
                                        <TableCell className="px-5 py-4">
                                            <span
                                                className={`rounded-full px-2.5 py-1 text-xs font-semibold capitalize ${statusColor[item.status]}`}
                                            >
                                                {item.status}
                                            </span>
                                        </TableCell>
                                        <TableCell className="px-5 py-4">
                                            <span className="inline-flex items-center gap-1.5 capitalize text-slate-600">
                                                <FileCheck2 className="size-4" />
                                                {item.documentStatus}
                                            </span>
                                        </TableCell>
                                        <TableCell className="px-5 py-4">
                                            <div className="flex items-center gap-2">
                                                <div className="h-2 w-24 rounded-full bg-slate-100">
                                                    <div
                                                        className="h-2 rounded-full bg-blue-600"
                                                        style={{
                                                            width: `${item.progress}%`,
                                                        }}
                                                    />
                                                </div>
                                                <span className="text-xs font-semibold">
                                                    {item.progress}%
                                                </span>
                                            </div>
                                        </TableCell>
                                        <TableCell className="px-5 py-4 text-slate-500">
                                            {new Date(
                                                item.createdAt,
                                            ).toLocaleDateString("en-IN", {
                                                day: "numeric",
                                                month: "short",
                                                year: "numeric",
                                            })}
                                        </TableCell>
                                        <TableCell className="px-5 py-4">
                                            <div className="flex justify-end gap-1">
                                                <Link
                                                    title="View application"
                                                    href={`/admin/visas/${item.id}`}
                                                    className="rounded-lg p-2 text-slate-400 hover:bg-blue-50 hover:text-blue-600"
                                                >
                                                    <Eye className="size-4" />
                                                </Link>
                                                <Link
                                                    title="Edit application"
                                                    href={`/admin/visas/${item.id}?edit=1`}
                                                    className="rounded-lg p-2 text-slate-400 hover:bg-amber-50 hover:text-amber-600"
                                                >
                                                    <Pencil className="size-4" />
                                                </Link>
                                                <Button
                                                    title="Delete application"
                                                    onClick={() => remove(item)}
                                                    className="rounded-lg p-2 text-slate-400 hover:bg-rose-50 hover:text-rose-600"
                                                >
                                                    <Trash2 className="size-4" />
                                                </Button>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))}
                                {shown.length === 0 && (
                                    <TableRow>
                                        <TableCell
                                            colSpan={7}
                                            className="py-16 text-center text-slate-500"
                                        >
                                            No visa applications found.
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </div>
                    <div className="border-t px-5 py-3 text-sm text-slate-500">
                        Showing {shown.length} of {items.length} applications
                    </div>
                </section>
            </div>
            {adding && (
                <div className="fixed inset-0 z-50 grid place-items-center overflow-y-auto bg-slate-950/55 p-4">
                    <div className="my-4 w-full max-w-2xl overflow-hidden rounded-2xl bg-white shadow-2xl">
                        <div className="flex justify-between border-b px-6 py-5">
                            <div>
                                <h2 className="text-lg font-bold">
                                    New visa application
                                </h2>
                                <p className="text-sm text-slate-500">
                                    Create and begin tracking an application.
                                </p>
                            </div>
                            <Button onClick={() => setAdding(false)}>
                                <X className="size-5" />
                            </Button>
                        </div>
                        <VisaForm
                            initial={blank}
                            onClose={() => setAdding(false)}
                            onSaved={(item) => {
                                setItems((old) => [item, ...old]);
                                setAdding(false);
                            }}
                        />
                    </div>
                </div>
            )}
        </main>
    );
}
