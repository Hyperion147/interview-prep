"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { adminRequest } from "@/lib/crm/admin-request";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { SelectField } from "@/components/ui/select-field";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
    AlertCircle,
    CalendarDays,
    CheckCircle2,
    FileText,
    Mail,
    Plus,
    Search,
    UserRound,
    UsersRound,
    X,
} from "lucide-react";

type GroupRow = {
    id: string;
    name: string;
    customerEmail: string;
    status: "prospect" | "active" | "completed" | "cancelled";
    destination: string | null;
    memberCount: number;
    missingDocuments: number;
};
type Traveler = {
    id: string;
    fullName: string;
    email: string | null;
    phone: string | null;
    relationship: string;
    nationality: string | null;
    passportLast4: string | null;
    passportCountry: string | null;
    passportExpiry: string | null;
    preferences: Record<string, string | string[]>;
    isPrimary: boolean;
};
type Document = {
    id: string;
    travelerId: string;
    label: string;
    type: string;
    status: "requested" | "uploaded" | "approved" | "rejected" | "expired";
    rejectionReason: string | null;
};
type Detail = {
    group: GroupRow & {
        emergencyContact?: {
            name?: string;
            phone?: string;
            relationship?: string;
        };
    };
    members: Traveler[];
    documents: Document[];
    visas: Array<{
        id: string;
        destinationCountry: string;
        visaType: string;
        progress: number;
        status: string;
    }>;
};
const statusTone: Record<string, string> = {
    active: "bg-emerald-50 text-emerald-700",
    completed: "bg-blue-50 text-blue-700",
    prospect: "bg-amber-50 text-amber-700",
    cancelled: "bg-slate-100 text-slate-600",
    approved: "bg-emerald-50 text-emerald-700",
    uploaded: "bg-blue-50 text-blue-700",
    rejected: "bg-rose-50 text-rose-700",
    expired: "bg-rose-50 text-rose-700",
    requested: "bg-amber-50 text-amber-700",
};

export function TravelersWorkspace() {
    const [groups, setGroups] = useState<GroupRow[]>([]);
    const [selected, setSelected] = useState<string | null>(null);
    const [detail, setDetail] = useState<Detail | null>(null);
    const [query, setQuery] = useState("");
    const [loading, setLoading] = useState(true);
    const loadGroups = useCallback(async () => {
        const response = await adminRequest("/api/travelers");
        if (response.ok) {
            const rows = await response.json();
            setGroups(rows);
            setSelected((current) => current ?? rows[0]?.id ?? null);
        }
        setLoading(false);
    }, []);
    const loadDetail = useCallback(async (id: string) => {
        const response = await adminRequest(`/api/travelers/${id}`);
        if (response.ok) setDetail(await response.json());
    }, []);
    useEffect(() => {
        const controller = new AbortController();
        adminRequest("/api/travelers", { signal: controller.signal })
            .then(async (response) => {
                if (response.ok) {
                    const rows = await response.json();
                    if (!controller.signal.aborted) {
                        setGroups(rows);
                        setSelected(rows[0]?.id ?? null);
                    }
                }
            })
            .catch((error: unknown) => {
                if (!controller.signal.aborted) console.error("Could not load traveler groups", error);
            })
            .finally(() => {
                if (!controller.signal.aborted) setLoading(false);
            });
        return () => controller.abort("Traveler list effect cleanup");
    }, []);
    useEffect(() => {
        if (!selected) return;
        const controller = new AbortController();
        adminRequest(`/api/travelers/${selected}`, {
            signal: controller.signal,
        })
            .then(async (response) => {
                if (response.ok) {
                    const row = await response.json();
                    if (!controller.signal.aborted) setDetail(row);
                }
            })
            .catch((error: unknown) => {
                if (!controller.signal.aborted) console.error("Could not load traveler profile", error);
            });
        return () => controller.abort("Traveler detail effect cleanup");
    }, [selected]);
    const filtered = useMemo(
        () =>
            groups.filter((g) =>
                `${g.name} ${g.customerEmail} ${g.destination ?? ""}`
                    .toLowerCase()
                    .includes(query.toLowerCase()),
            ),
        [groups, query],
    );
    async function changeGroupStatus(status: GroupRow["status"]) {
        if (!selected) return;
        await adminRequest(`/api/travelers/${selected}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ status }),
        });
        await Promise.all([loadGroups(), loadDetail(selected)]);
    }
    async function changeDocument(
        document: Document,
        status: Document["status"],
    ) {
        await adminRequest(`/api/travelers/documents/${document.id}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                status,
                rejectionReason:
                    status === "rejected"
                        ? "Please upload a clear, uncropped copy."
                        : null,
            }),
        });
        if (selected) await Promise.all([loadGroups(), loadDetail(selected)]);
    }
    return (
        <main className="min-h-screen bg-slate-50/70 p-4 sm:p-6">
            <div className="mb-5 flex flex-col justify-between gap-4 xl:flex-row xl:items-end">
                <div>
                    <p className="text-xs font-semibold uppercase tracking-[.16em] text-indigo-600">
                        Customer operations
                    </p>
                    <h1 className="mt-1 text-2xl font-bold tracking-tight text-slate-950">
                        Traveler profiles
                    </h1>
                    <p className="mt-1 text-sm text-slate-500">
                        One relationship view for every party, passport,
                        preference and document request.
                    </p>
                </div>
                <CreateGroup onCreated={loadGroups} />
            </div>
            <div className="grid overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm lg:grid-cols-[350px_minmax(0,1fr)]">
                <section className="border-b border-slate-200 lg:border-r lg:border-b-0">
                    <div className="border-b p-3">
                        <div className="relative">
                            <Search className="absolute left-3 top-2.5 size-4 text-slate-400" />
                            <Input
                                value={query}
                                onChange={(e) => setQuery(e.target.value)}
                                placeholder="Search travelers"
                                className="pl-9"
                            />
                        </div>
                    </div>
                    <div className="max-h-[720px] overflow-y-auto">
                        {loading ? (
                            <ListSkeleton />
                        ) : (
                            filtered.map((group) => (
                                <button
                                    key={group.id}
                                    onClick={() => setSelected(group.id)}
                                    className={`w-full border-b p-4 text-left transition ${selected === group.id ? "bg-indigo-50/70" : "hover:bg-slate-50"}`}
                                >
                                    <div className="flex items-start justify-between gap-3">
                                        <div className="min-w-0">
                                            <p className="truncate text-sm font-semibold text-slate-950">
                                                {group.name}
                                            </p>
                                            <p className="truncate text-xs text-slate-500">
                                                {group.customerEmail}
                                            </p>
                                        </div>
                                        <Badge
                                            className={`${statusTone[group.status]} border-0 capitalize`}
                                        >
                                            {group.status}
                                        </Badge>
                                    </div>
                                    <div className="mt-3 flex items-center gap-4 text-xs text-slate-500">
                                        <span className="flex items-center gap-1">
                                            <UsersRound className="size-3.5" />
                                            {group.memberCount}
                                        </span>
                                        <span className="flex items-center gap-1">
                                            <FileText className="size-3.5" />
                                            {group.missingDocuments} pending
                                        </span>
                                    </div>
                                </button>
                            ))
                        )}
                    </div>
                </section>
                <section className="min-w-0 p-4 sm:p-6">
                    {!detail ? (
                        <DetailSkeleton />
                    ) : (
                        <div className="space-y-6">
                            <header className="flex flex-col justify-between gap-4 border-b pb-5 sm:flex-row sm:items-start">
                                <div>
                                    <div className="flex items-center gap-2">
                                        <div className="grid size-10 place-items-center rounded-full bg-indigo-100 text-indigo-700">
                                            <UsersRound className="size-5" />
                                        </div>
                                        <div>
                                            <h2 className="text-xl font-bold text-slate-950">
                                                {detail.group.name}
                                            </h2>
                                            <p className="flex items-center gap-1 text-sm text-slate-500">
                                                <Mail className="size-3.5" />
                                                {detail.group.customerEmail}
                                            </p>
                                        </div>
                                    </div>
                                    <p className="mt-3 text-sm text-slate-600">
                                        {detail.group.destination
                                            ? `Planning ${detail.group.destination}`
                                            : "Destination not selected"}
                                    </p>
                                </div>
                                <SelectField
                                    value={detail.group.status}
                                    onValueChange={(value) =>
                                        void changeGroupStatus(
                                            value as GroupRow["status"],
                                        )
                                    }
                                    className="w-40 capitalize"
                                    options={[
                                        "prospect",
                                        "active",
                                        "completed",
                                        "cancelled",
                                    ].map((value) => ({ value, label: value }))}
                                />
                            </header>
                            <div className="grid gap-4 xl:grid-cols-[1fr_280px]">
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between">
                                        <h3 className="text-sm font-semibold">
                                            Travel party (
                                            {detail.members.length})
                                        </h3>
                                        <AddTraveler
                                            groupId={detail.group.id}
                                            onAdded={() =>
                                                loadDetail(detail.group.id)
                                            }
                                        />
                                    </div>
                                    {detail.members.map((member) => (
                                        <Card
                                            key={member.id}
                                            className="shadow-none"
                                        >
                                            <CardHeader className="pb-3">
                                                <div className="flex items-start justify-between">
                                                    <div className="flex gap-3">
                                                        <div className="grid size-9 place-items-center rounded-full bg-slate-100">
                                                            <UserRound className="size-4" />
                                                        </div>
                                                        <div>
                                                            <CardTitle className="text-sm">
                                                                {
                                                                    member.fullName
                                                                }
                                                            </CardTitle>
                                                            <p className="text-xs capitalize text-slate-500">
                                                                {
                                                                    member.relationship
                                                                }
                                                                {member.isPrimary
                                                                    ? " · Primary contact"
                                                                    : ""}
                                                            </p>
                                                        </div>
                                                    </div>
                                                    {member.passportExpiry && (
                                                        <Badge variant="outline">
                                                            <CalendarDays className="mr-1 size-3" />
                                                            {
                                                                member.passportExpiry
                                                            }
                                                        </Badge>
                                                    )}
                                                </div>
                                            </CardHeader>
                                            <CardContent className="space-y-3">
                                                <div className="grid gap-2 text-xs text-slate-600 sm:grid-cols-3">
                                                    <span>
                                                        Nationality:{" "}
                                                        <b>
                                                            {member.nationality ??
                                                                "—"}
                                                        </b>
                                                    </span>
                                                    <span>
                                                        Passport:{" "}
                                                        <b>
                                                            {member.passportLast4
                                                                ? `•••• ${member.passportLast4}`
                                                                : "Not added"}
                                                        </b>
                                                    </span>
                                                    <span>
                                                        Issued by:{" "}
                                                        <b>
                                                            {member.passportCountry ??
                                                                "—"}
                                                        </b>
                                                    </span>
                                                </div>
                                                <div className="space-y-2 border-t pt-3">
                                                    {detail.documents
                                                        .filter(
                                                            (d) =>
                                                                d.travelerId ===
                                                                member.id,
                                                        )
                                                        .map((doc) => (
                                                            <div
                                                                key={doc.id}
                                                                className="flex flex-wrap items-center justify-between gap-2 rounded-lg bg-slate-50 px-3 py-2"
                                                            >
                                                                <div className="flex items-center gap-2">
                                                                    <FileText className="size-4 text-slate-400" />
                                                                    <span className="text-xs font-medium">
                                                                        {
                                                                            doc.label
                                                                        }
                                                                    </span>
                                                                    <Badge
                                                                        className={`${statusTone[doc.status]} border-0 text-[10px] capitalize`}
                                                                    >
                                                                        {
                                                                            doc.status
                                                                        }
                                                                    </Badge>
                                                                </div>
                                                                <SelectField
                                                                    value={
                                                                        doc.status
                                                                    }
                                                                    onValueChange={(
                                                                        value,
                                                                    ) =>
                                                                        void changeDocument(
                                                                            doc,
                                                                            value as Document["status"],
                                                                        )
                                                                    }
                                                                    size="sm"
                                                                    className="w-32 text-xs capitalize"
                                                                    options={[
                                                                        "requested",
                                                                        "uploaded",
                                                                        "approved",
                                                                        "rejected",
                                                                        "expired",
                                                                    ].map(
                                                                        (
                                                                            value,
                                                                        ) => ({
                                                                            value,
                                                                            label: value,
                                                                        }),
                                                                    )}
                                                                />
                                                            </div>
                                                        ))}
                                                </div>
                                            </CardContent>
                                        </Card>
                                    ))}
                                </div>
                                <aside className="space-y-4">
                                    <Card className="shadow-none">
                                        <CardHeader>
                                            <CardTitle className="text-sm">
                                                Next best action
                                            </CardTitle>
                                        </CardHeader>
                                        <CardContent className="space-y-3 text-sm">
                                            {detail.documents.some((d) =>
                                                [
                                                    "requested",
                                                    "rejected",
                                                    "expired",
                                                ].includes(d.status),
                                            ) ? (
                                                <>
                                                    <div className="flex gap-2 text-amber-700">
                                                        <AlertCircle className="mt-0.5 size-4 shrink-0" />
                                                        <p>
                                                            Collect or correct{" "}
                                                            {
                                                                detail.documents.filter(
                                                                    (d) =>
                                                                        [
                                                                            "requested",
                                                                            "rejected",
                                                                            "expired",
                                                                        ].includes(
                                                                            d.status,
                                                                        ),
                                                                ).length
                                                            }{" "}
                                                            travel documents.
                                                        </p>
                                                    </div>
                                                    <Button
                                                        size="sm"
                                                        variant="outline"
                                                        className="w-full"
                                                    >
                                                        Send reminder
                                                    </Button>
                                                </>
                                            ) : (
                                                <div className="flex gap-2 text-emerald-700">
                                                    <CheckCircle2 className="size-4" />
                                                    Documents are on track.
                                                </div>
                                            )}
                                        </CardContent>
                                    </Card>
                                    <Card className="shadow-none">
                                        <CardHeader>
                                            <CardTitle className="text-sm">
                                                Visa progress
                                            </CardTitle>
                                        </CardHeader>
                                        <CardContent className="space-y-3">
                                            {detail.visas.length ? (
                                                detail.visas.map((v) => (
                                                    <a
                                                        key={v.id}
                                                        href={`/admin/visas/${v.id}`}
                                                        className="block rounded-lg border p-3 hover:bg-slate-50"
                                                    >
                                                        <div className="flex justify-between text-xs">
                                                            <b>
                                                                {
                                                                    v.destinationCountry
                                                                }
                                                            </b>
                                                            <span>
                                                                {v.progress}%
                                                            </span>
                                                        </div>
                                                        <div className="mt-2 h-1.5 rounded bg-slate-100">
                                                            <div
                                                                className="h-full rounded bg-indigo-600"
                                                                style={{
                                                                    width: `${v.progress}%`,
                                                                }}
                                                            />
                                                        </div>
                                                    </a>
                                                ))
                                            ) : (
                                                <p className="text-xs text-slate-500">
                                                    No visa applications linked
                                                    yet.
                                                </p>
                                            )}
                                        </CardContent>
                                    </Card>
                                    <Card className="shadow-none">
                                        <CardHeader>
                                            <CardTitle className="text-sm">
                                                Emergency contact
                                            </CardTitle>
                                        </CardHeader>
                                        <CardContent className="text-xs text-slate-600">
                                            <p className="font-semibold text-slate-900">
                                                {detail.group.emergencyContact
                                                    ?.name ?? "Not provided"}
                                            </p>
                                            <p>
                                                {
                                                    detail.group
                                                        .emergencyContact
                                                        ?.relationship
                                                }
                                            </p>
                                            <p>
                                                {
                                                    detail.group
                                                        .emergencyContact?.phone
                                                }
                                            </p>
                                        </CardContent>
                                    </Card>
                                </aside>
                            </div>
                        </div>
                    )}
                </section>
            </div>
        </main>
    );
}

function CreateGroup({ onCreated }: { onCreated: () => Promise<void> }) {
    const [open, setOpen] = useState(false);
    async function submit(data: FormData) {
        const response = await adminRequest("/api/travelers", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(Object.fromEntries(data)),
        });
        if (response.ok) {
            setOpen(false);
            await onCreated();
        }
    }
    return (
        <>
            <Button onClick={() => setOpen(true)}>
                <Plus className="size-4" />
                New traveler profile
            </Button>
            {open && (
                <Drawer
                    title="Create traveler profile"
                    description="Start the customer record with its primary traveler."
                    onClose={() => setOpen(false)}
                >
                    <form action={submit} className="space-y-4">
                        <Field
                            name="name"
                            label="Party name"
                            placeholder="The Sharma family"
                        />
                        <Field
                            name="primaryName"
                            label="Primary traveler"
                            placeholder="Aarav Sharma"
                        />
                        <Field
                            name="customerEmail"
                            label="Customer email"
                            type="email"
                        />
                        <Field name="phone" label="Phone" />
                        <Button type="submit" className="w-full">
                            Create profile
                        </Button>
                    </form>
                </Drawer>
            )}
        </>
    );
}
function AddTraveler({
    groupId,
    onAdded,
}: {
    groupId: string;
    onAdded: () => Promise<void>;
}) {
    const [open, setOpen] = useState(false);
    async function submit(data: FormData) {
        const response = await adminRequest(
            `/api/travelers/${groupId}/members`,
            {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(Object.fromEntries(data)),
            },
        );
        if (response.ok) {
            setOpen(false);
            await onAdded();
        }
    }
    return (
        <>
            <Button size="sm" variant="outline" onClick={() => setOpen(true)}>
                <Plus className="size-3.5" />
                Add traveler
            </Button>
            {open && (
                <Drawer
                    title="Add traveler"
                    description="Record identity and passport details for this party."
                    onClose={() => setOpen(false)}
                >
                    <form action={submit} className="space-y-4">
                        <Field name="fullName" label="Full name" />
                        <Field
                            name="relationship"
                            label="Relationship"
                            placeholder="Spouse"
                        />
                        <Field name="nationality" label="Nationality" />
                        <Field
                            name="passportLast4"
                            label="Passport last 4"
                            maxLength={4}
                        />
                        <Field
                            name="passportCountry"
                            label="Passport country"
                        />
                        <Field
                            name="passportExpiry"
                            label="Passport expiry"
                            type="date"
                        />
                        <Button type="submit" className="w-full">
                            Add traveler
                        </Button>
                    </form>
                </Drawer>
            )}
        </>
    );
}
function Drawer({
    title,
    description,
    onClose,
    children,
}: {
    title: string;
    description: string;
    onClose: () => void;
    children: React.ReactNode;
}) {
    return (
        <div
            className="fixed inset-0 z-50 flex justify-end bg-slate-950/30"
            role="dialog"
            aria-modal="true"
        >
            <button
                className="absolute inset-0 cursor-default"
                onClick={onClose}
                aria-label="Close dialog"
            />
            <div className="relative h-full w-full max-w-md overflow-y-auto bg-white p-6 shadow-2xl">
                <div className="mb-7 flex items-start justify-between">
                    <div>
                        <h2 className="text-lg font-bold">{title}</h2>
                        <p className="mt-1 text-sm text-slate-500">
                            {description}
                        </p>
                    </div>
                    <Button
                        size="icon"
                        variant="ghost"
                        onClick={onClose}
                        aria-label="Close"
                    >
                        <X className="size-4" />
                    </Button>
                </div>
                {children}
            </div>
        </div>
    );
}
function Field({
    label,
    ...props
}: React.ComponentProps<typeof Input> & { label: string }) {
    return (
        <label className="block space-y-1.5 text-sm font-medium">
            <span>{label}</span>
            <Input {...props} />
        </label>
    );
}
function ListSkeleton() {
    return (
        <div className="space-y-3 p-4">
            {[1, 2, 3, 4].map((i) => (
                <div
                    className="h-20 animate-pulse rounded-lg bg-slate-100"
                    key={i}
                />
            ))}
        </div>
    );
}
function DetailSkeleton() {
    return (
        <div className="space-y-4">
            <div className="h-20 animate-pulse rounded-lg bg-slate-100" />
            <div className="h-52 animate-pulse rounded-lg bg-slate-100" />
            <div className="h-52 animate-pulse rounded-lg bg-slate-100" />
        </div>
    );
}
