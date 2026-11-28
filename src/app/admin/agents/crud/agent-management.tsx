"use client";
import { Input } from "@/components/ui/input";
import { SelectField } from "@/components/ui/select-field";

import { adminRequest as fetch } from "@/lib/crm/admin-request";

import { Button } from "@/components/ui/button";
import { FormEvent, useEffect, useState } from "react";
import {
    KeyRound,
    Pencil,
    Plus,
    ShieldCheck,
    Trash2,
    UserCog,
    X,
} from "lucide-react";

type Agent = {
    id: string;
    email: string;
    fullName: string;
    phone: string | null;
    status: "invited" | "active" | "suspended";
    permissions: string[];
    createdAt: string;
};
const availablePermissions = [
    "leads:read",
    "leads:write",
    "follow-ups:manage",
    "visas:manage",
    "packages:manage",
];
const input =
    "h-10 w-full rounded-lg border border-slate-200 px-3 text-sm outline-none focus:border-blue-500";

function AgentForm({
    agent,
    close,
    saved,
}: {
    agent: Agent | null;
    close: () => void;
    saved: () => void;
}) {
    const [form, setForm] = useState({
        fullName: agent?.fullName ?? "",
        email: agent?.email ?? "",
        phone: agent?.phone ?? "",
        password: "",
        status: agent?.status ?? "active",
        permissions: agent?.permissions ?? ["leads:read"],
    });
    const [error, setError] = useState("");
    const [saving, setSaving] = useState(false);
    function permission(value: string) {
        setForm((old) => ({
            ...old,
            permissions: old.permissions.includes(value)
                ? old.permissions.filter((item) => item !== value)
                : [...old.permissions, value],
        }));
    }
    async function submit(event: FormEvent) {
        event.preventDefault();
        setSaving(true);
        setError("");
        const response = await fetch(
            agent ? `/api/agents/${agent.id}` : "/api/agents",
            {
                method: agent ? "PATCH" : "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(form),
            },
        );
        const data = await response.json();
        if (response.ok) saved();
        else setError(data.error ?? "Unable to save agent");
        setSaving(false);
    }
    return (
        <form onSubmit={submit}>
            <div className="grid gap-4 p-6 sm:grid-cols-2">
                <label>
                    <span className="mb-1.5 block text-sm font-medium">
                        Full name
                    </span>
                    <Input
                        className={input}
                        required
                        value={form.fullName}
                        onChange={(e) =>
                            setForm({ ...form, fullName: e.target.value })
                        }
                    />
                </label>
                <label>
                    <span className="mb-1.5 block text-sm font-medium">
                        Email
                    </span>
                    <Input
                        className={input}
                        disabled={Boolean(agent)}
                        type="email"
                        required
                        value={form.email}
                        onChange={(e) =>
                            setForm({ ...form, email: e.target.value })
                        }
                    />
                </label>
                <label>
                    <span className="mb-1.5 block text-sm font-medium">
                        Phone
                    </span>
                    <Input
                        className={input}
                        value={form.phone}
                        onChange={(e) =>
                            setForm({ ...form, phone: e.target.value })
                        }
                    />
                </label>
                {agent ? (
                    <label>
                        <span className="mb-1.5 block text-sm font-medium">
                            Status
                        </span>
                        <SelectField
                            className="h-10 capitalize"
                            value={form.status}
                            onValueChange={(value) =>
                                setForm({
                                    ...form,
                                    status: value as Agent["status"],
                                })
                            }
                            options={["active","suspended","invited"].map(value=>({value,label:value}))}
                        />
                    </label>
                ) : (
                    <label>
                        <span className="mb-1.5 block text-sm font-medium">
                            Temporary password
                        </span>
                        <Input
                            className={input}
                            type="password"
                            minLength={8}
                            required
                            value={form.password}
                            onChange={(e) =>
                                setForm({ ...form, password: e.target.value })
                            }
                        />
                    </label>
                )}
                <fieldset className="sm:col-span-2">
                    <legend className="mb-2 text-sm font-medium">
                        Permissions
                    </legend>
                    <div className="grid gap-2 sm:grid-cols-2">
                        {availablePermissions.map((value) => (
                            <label
                                className="flex items-center gap-2 rounded-lg border p-3 text-sm"
                                key={value}
                            >
                                <Input
                                    type="checkbox"
                                    checked={form.permissions.includes(value)}
                                    onChange={() => permission(value)}
                                />
                                {value}
                            </label>
                        ))}
                    </div>
                </fieldset>
            </div>
            {error && (
                <p className="mx-6 mb-4 rounded-lg bg-rose-50 p-3 text-sm text-rose-700">
                    {error}
                </p>
            )}
            <div className="flex justify-end gap-3 border-t bg-slate-50 px-6 py-4">
                <Button
                    type="button"
                    onClick={close}
                    className="rounded-lg border bg-white px-4 py-2 text-sm font-semibold"
                >
                    Cancel
                </Button>
                <Button
                    type="submit"
                    disabled={saving}
                    className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white disabled:opacity-60"
                >
                    {saving
                        ? "Saving…"
                        : agent
                          ? "Save authorization"
                          : "Create agent"}
                </Button>
            </div>
        </form>
    );
}

export function AgentManagement() {
    const [agents, setAgents] = useState<Agent[]>([]);
    const [editing, setEditing] = useState<Agent | "new" | null>(null);
    const [error, setError] = useState("");
    async function load() {
        const response = await fetch("/api/agents", { cache: "no-store" });
        const data = await response.json();
        if (response.ok) setAgents(data);
        else setError(data.error ?? "Unable to load agents");
    }
    useEffect(() => {
        const timer = window.setTimeout(() => {
            void load();
        }, 0);
        return () => window.clearTimeout(timer);
    }, []);
    async function remove(agent: Agent) {
        if (!confirm(`Delete ${agent.fullName}'s account and authorization?`))
            return;
        const response = await fetch(`/api/agents/${agent.id}`, {
            method: "DELETE",
        });
        if (response.ok)
            setAgents((old) => old.filter((item) => item.id !== agent.id));
        else setError((await response.json()).error);
    }
    return (
        <main className="min-h-screen bg-slate-50">
            <header className="border-b bg-white px-5 py-5 sm:px-8">
                <p className="text-xs font-semibold uppercase tracking-[.18em] text-blue-600">
                    Authorization
                </p>
                <h1 className="mt-1 text-2xl font-bold">Agent management</h1>
            </header>
            <div className="p-5 sm:p-8">
                <div className="mb-6 flex items-end justify-between gap-4">
                    <div>
                        <h2 className="text-xl font-bold">Staff accounts</h2>
                        <p className="mt-1 text-sm text-slate-500">
                            Create agent credentials and control access by
                            capability.
                        </p>
                    </div>
                    <Button
                        onClick={() => setEditing("new")}
                        className="flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white"
                    >
                        <Plus className="size-4" />
                        Create agent
                    </Button>
                </div>
                {error && (
                    <p className="mb-5 rounded-xl bg-amber-50 p-4 text-sm text-amber-800">
                        {error}
                    </p>
                )}
                <section className="overflow-hidden rounded-2xl border bg-white shadow-sm">
                    <div className="divide-y">
                        {agents.map((agent) => (
                            <article
                                className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center"
                                key={agent.id}
                            >
                                <div className="grid size-11 place-items-center rounded-full bg-blue-50 font-bold text-blue-700">
                                    {agent.fullName
                                        .split(" ")
                                        .map((part) => part[0])
                                        .slice(0, 2)
                                        .join("")}
                                </div>
                                <div className="min-w-0 flex-1">
                                    <div className="flex items-center gap-2">
                                        <h3 className="font-semibold">
                                            {agent.fullName}
                                        </h3>
                                        <span
                                            className={`rounded-full px-2 py-0.5 text-xs font-semibold capitalize ${agent.status === "active" ? "bg-emerald-50 text-emerald-700" : "bg-slate-100 text-slate-600"}`}
                                        >
                                            {agent.status}
                                        </span>
                                    </div>
                                    <p className="text-sm text-slate-500">
                                        {agent.email}
                                        {agent.phone ? ` · ${agent.phone}` : ""}
                                    </p>
                                    <div className="mt-2 flex flex-wrap gap-1">
                                        {agent.permissions.map((value) => (
                                            <span
                                                className="rounded bg-slate-100 px-2 py-1 text-xs text-slate-600"
                                                key={value}
                                            >
                                                {value}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                                <div className="flex gap-1 self-end sm:self-auto">
                                    <Button
                                        title="Edit authorization"
                                        onClick={() => setEditing(agent)}
                                        className="rounded-lg p-2 text-slate-400 hover:bg-blue-50 hover:text-blue-600"
                                    >
                                        <Pencil className="size-4" />
                                    </Button>
                                    <Button
                                        title="Delete agent"
                                        onClick={() => remove(agent)}
                                        className="rounded-lg p-2 text-slate-400 hover:bg-rose-50 hover:text-rose-600"
                                    >
                                        <Trash2 className="size-4" />
                                    </Button>
                                </div>
                            </article>
                        ))}
                        {agents.length === 0 && !error && (
                            <div className="py-16 text-center">
                                <UserCog className="mx-auto size-9 text-slate-300" />
                                <p className="mt-3 font-semibold">
                                    No agents created
                                </p>
                            </div>
                        )}
                    </div>
                </section>
                <div className="mt-6 grid gap-4 sm:grid-cols-2">
                    <div className="rounded-2xl border bg-white p-5">
                        <ShieldCheck className="size-5 text-emerald-600" />
                        <h3 className="mt-3 font-semibold">Role separation</h3>
                        <p className="mt-1 text-sm text-slate-500">
                            Agents receive only selected operational
                            permissions. Admin-only account management stays
                            protected.
                        </p>
                    </div>
                    <div className="rounded-2xl border bg-white p-5">
                        <KeyRound className="size-5 text-blue-600" />
                        <h3 className="mt-3 font-semibold">Supabase Auth</h3>
                        <p className="mt-1 text-sm text-slate-500">
                            Credentials are created server-side using the
                            service role key and never exposed to the browser.
                        </p>
                    </div>
                </div>
            </div>
            {editing && (
                <div className="fixed inset-0 z-50 grid place-items-center overflow-y-auto bg-slate-950/55 p-4">
                    <div className="w-full max-w-2xl overflow-hidden rounded-2xl bg-white">
                        <div className="flex justify-between border-b px-6 py-5">
                            <div>
                                <h2 className="text-lg font-bold">
                                    {editing === "new"
                                        ? "Create agent"
                                        : "Edit agent authorization"}
                                </h2>
                                <p className="text-sm text-slate-500">
                                    Admin-only staff management.
                                </p>
                            </div>
                            <Button onClick={() => setEditing(null)}>
                                <X className="size-5" />
                            </Button>
                        </div>
                        <AgentForm
                            agent={editing === "new" ? null : editing}
                            close={() => setEditing(null)}
                            saved={() => {
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
