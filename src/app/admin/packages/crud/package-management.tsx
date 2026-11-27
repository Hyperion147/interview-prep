"use client";

import Link from "next/link";
import { FormEvent, useEffect, useMemo, useState } from "react";
import {
    CalendarDays,
    Globe2,
    MapPin,
    Pencil,
    Plus,
    Search,
    Trash2,
    X,
} from "lucide-react";
import {
    normalizePackage,
    packageCategories,
    packageStatuses,
    type PackageCategory,
    type PackageDraft,
    type TravelPackage,
} from "./types";

const blank: PackageDraft = {
    name: "",
    category: "domestic",
    country: "India",
    state: "",
    city: "",
    description: "",
    durationDays: 1,
    durationNights: 0,
    price: 0,
    status: "draft",
};
const input =
    "h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/15";
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

function PackageForm({
    item,
    onClose,
    onSaved,
}: {
    item: TravelPackage | null;
    onClose: () => void;
    onSaved: (value: TravelPackage) => void;
}) {
    const [draft, setDraft] = useState<PackageDraft>(item ?? blank);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");
    const set = <K extends keyof PackageDraft>(
        key: K,
        value: PackageDraft[K],
    ) => setDraft((old) => ({ ...old, [key]: value }));
    async function submit(event: FormEvent) {
        event.preventDefault();
        setSaving(true);
        setError("");
        try {
            const response = await fetch(
                item ? `/api/packages/${item.id}` : "/api/packages",
                {
                    method: item ? "PATCH" : "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(draft),
                },
            );
            const data = await response.json();
            if (!response.ok)
                throw new Error(data.error ?? "Unable to save package");
            onSaved(normalizePackage(data));
        } catch (cause) {
            setError(
                cause instanceof Error
                    ? cause.message
                    : "Unable to save package",
            );
        } finally {
            setSaving(false);
        }
    }
    return (
        <form onSubmit={submit}>
            <div className="grid gap-4 p-6 sm:grid-cols-2">
                <div className="sm:col-span-2">
                    <Field label="Package name">
                        <input
                            className={input}
                            required
                            value={draft.name}
                            onChange={(e) => set("name", e.target.value)}
                            placeholder="e.g. Himalayan Adventure"
                        />
                    </Field>
                </div>
                <Field label="Category">
                    <select
                        className={`${input} capitalize`}
                        value={draft.category}
                        onChange={(e) => {
                            const category = e.target.value as PackageCategory;
                            setDraft((old) => ({
                                ...old,
                                category,
                                country: category === "domestic" ? "India" : "",
                                state: "",
                                city: "",
                            }));
                        }}
                    >
                        {packageCategories.map((value) => (
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
                                e.target.value as PackageDraft["status"],
                            )
                        }
                    >
                        {packageStatuses.map((value) => (
                            <option key={value}>{value}</option>
                        ))}
                    </select>
                </Field>
                <Field label="Country">
                    <input
                        className={input}
                        required
                        readOnly={draft.category === "domestic"}
                        value={draft.country}
                        onChange={(e) => set("country", e.target.value)}
                    />
                </Field>
                <Field label="State / region">
                    <input
                        className={input}
                        required
                        value={draft.state}
                        onChange={(e) => set("state", e.target.value)}
                    />
                </Field>
                <Field label="City">
                    <input
                        className={input}
                        required
                        value={draft.city}
                        onChange={(e) => set("city", e.target.value)}
                    />
                </Field>
                <Field label="Price per person (₹)">
                    <input
                        className={input}
                        type="number"
                        min="0"
                        required
                        value={draft.price}
                        onChange={(e) => set("price", Number(e.target.value))}
                    />
                </Field>
                <Field label="Days">
                    <input
                        className={input}
                        type="number"
                        min="1"
                        required
                        value={draft.durationDays}
                        onChange={(e) =>
                            set("durationDays", Number(e.target.value))
                        }
                    />
                </Field>
                <Field label="Nights">
                    <input
                        className={input}
                        type="number"
                        min="0"
                        required
                        value={draft.durationNights}
                        onChange={(e) =>
                            set("durationNights", Number(e.target.value))
                        }
                    />
                </Field>
                <div className="sm:col-span-2">
                    <Field label="Description">
                        <textarea
                            className={`${input} h-24 py-2`}
                            required
                            value={draft.description}
                            onChange={(e) => set("description", e.target.value)}
                        />
                    </Field>
                </div>
            </div>
            {error && (
                <p className="mx-6 mb-4 rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-700">
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
                          : "Create package"}
                </button>
            </div>
        </form>
    );
}

export function PackageManagement() {
    const [items, setItems] = useState<TravelPackage[]>([]);
    const [editing, setEditing] = useState<TravelPackage | "new" | null>(null);
    const [search, setSearch] = useState("");
    const [category, setCategory] = useState<PackageCategory | "all">("all");
    const [country, setCountry] = useState("all");
    const [state, setState] = useState("all");
    const [city, setCity] = useState("all");
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    useEffect(() => {
        fetch("/api/packages", { cache: "no-store" })
            .then(async (response) => {
                const data = await response.json();
                if (!response.ok)
                    throw new Error(data.error ?? "Unable to load packages");
                return data;
            })
            .then((rows) => setItems(rows.map(normalizePackage)))
            .catch((cause) =>
                setError(
                    cause instanceof Error
                        ? cause.message
                        : "Unable to load packages",
                ),
            )
            .finally(() => setLoading(false));
    }, []);
    const countries = useMemo(
        () =>
            [
                ...new Set(
                    items
                        .filter(
                            (x) =>
                                category === "all" || x.category === category,
                        )
                        .map((x) => x.country),
                ),
            ].sort(),
        [items, category],
    );
    const states = useMemo(
        () =>
            [
                ...new Set(
                    items
                        .filter(
                            (x) => country === "all" || x.country === country,
                        )
                        .map((x) => x.state),
                ),
            ].sort(),
        [items, country],
    );
    const cities = useMemo(
        () =>
            [
                ...new Set(
                    items
                        .filter(
                            (x) =>
                                (state === "all" || x.state === state) &&
                                (country === "all" || x.country === country),
                        )
                        .map((x) => x.city),
                ),
            ].sort(),
        [items, country, state],
    );
    const shown = useMemo(
        () =>
            items.filter(
                (x) =>
                    (category === "all" || x.category === category) &&
                    (country === "all" || x.country === country) &&
                    (state === "all" || x.state === state) &&
                    (city === "all" || x.city === city) &&
                    [x.name, x.country, x.state, x.city].some((value) =>
                        value.toLowerCase().includes(search.toLowerCase()),
                    ),
            ),
        [items, search, category, country, state, city],
    );
    function resetLocation(nextCategory: PackageCategory | "all") {
        setCategory(nextCategory);
        setCountry("all");
        setState("all");
        setCity("all");
    }
    if (loading)
        return (
            <main className="grid min-h-screen place-items-center bg-slate-50 text-sm text-slate-500">
                Loading packages from Supabase…
            </main>
        );
    if (error)
        return (
            <main className="grid min-h-screen place-items-center bg-slate-50 p-6">
                <div className="max-w-md rounded-2xl border border-rose-200 bg-white p-6 text-center shadow-sm">
                    <h1 className="font-bold text-slate-900">
                        Packages could not be loaded
                    </h1>
                    <p className="mt-2 text-sm text-rose-700">{error}</p>
                    <button
                        className="mt-5 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white"
                        onClick={() => window.location.reload()}
                    >
                        Try again
                    </button>
                </div>
            </main>
        );
    async function remove(item: TravelPackage) {
        if (!window.confirm(`Delete “${item.name}”?`)) return;
        const response = await fetch(`/api/packages/${item.id}`, {
            method: "DELETE",
        });
        const data = await response.json();
        if (response.ok) setItems((old) => old.filter((x) => x.id !== item.id));
        else setError(data.error ?? "Unable to delete package");
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
                <h1 className="mt-1 text-2xl font-bold">Travel packages</h1>
            </header>
            <div className="p-5 sm:p-8">
                <div className="mb-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
                    <div>
                        <h2 className="text-xl font-bold">Package catalogue</h2>
                        <p className="mt-1 text-sm text-slate-500">
                            Create and organize domestic and international
                            experiences.
                        </p>
                    </div>
                    <button
                        onClick={() => setEditing("new")}
                        className="inline-flex w-fit items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white"
                    >
                        <Plus className="size-4" />
                        New package
                    </button>
                </div>
                <section className="mb-6 grid gap-4 sm:grid-cols-3">
                    <div className="rounded-2xl border bg-white p-5 shadow-sm">
                        <p className="text-sm text-slate-500">Total packages</p>
                        <p className="mt-2 text-3xl font-bold">
                            {items.length}
                        </p>
                    </div>
                    <div className="rounded-2xl border bg-white p-5 shadow-sm">
                        <p className="text-sm text-slate-500">Domestic</p>
                        <p className="mt-2 text-3xl font-bold">
                            {
                                items.filter((x) => x.category === "domestic")
                                    .length
                            }
                        </p>
                    </div>
                    <div className="rounded-2xl border bg-white p-5 shadow-sm">
                        <p className="text-sm text-slate-500">International</p>
                        <p className="mt-2 text-3xl font-bold">
                            {
                                items.filter(
                                    (x) => x.category === "international",
                                ).length
                            }
                        </p>
                    </div>
                </section>
                <section className="rounded-2xl border bg-white p-4 shadow-sm">
                    <div className="grid gap-3 lg:grid-cols-[2fr_repeat(4,1fr)]">
                        <div className="relative">
                            <Search className="absolute left-3 top-3 size-4 text-slate-400" />
                            <input
                                className={`${input} pl-9`}
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                placeholder="Search packages or destinations…"
                            />
                        </div>
                        <select
                            className={`${input} capitalize`}
                            value={category}
                            onChange={(e) =>
                                resetLocation(
                                    e.target.value as PackageCategory | "all",
                                )
                            }
                        >
                            <option value="all">All categories</option>
                            {packageCategories.map((x) => (
                                <option key={x}>{x}</option>
                            ))}
                        </select>
                        <select
                            className={input}
                            value={country}
                            onChange={(e) => {
                                setCountry(e.target.value);
                                setState("all");
                                setCity("all");
                            }}
                        >
                            <option value="all">All countries</option>
                            {countries.map((x) => (
                                <option key={x}>{x}</option>
                            ))}
                        </select>
                        <select
                            className={input}
                            value={state}
                            onChange={(e) => {
                                setState(e.target.value);
                                setCity("all");
                            }}
                        >
                            <option value="all">All states</option>
                            {states.map((x) => (
                                <option key={x}>{x}</option>
                            ))}
                        </select>
                        <select
                            className={input}
                            value={city}
                            onChange={(e) => setCity(e.target.value)}
                        >
                            <option value="all">All cities</option>
                            {cities.map((x) => (
                                <option key={x}>{x}</option>
                            ))}
                        </select>
                    </div>
                </section>
                <section className="mt-6 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
                    {shown.map((item) => (
                        <article
                            key={item.id}
                            className="overflow-hidden rounded-2xl border bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
                        >
                            <div
                                className={`h-2 ${item.category === "domestic" ? "bg-emerald-500" : "bg-blue-600"}`}
                            />
                            <div className="p-5">
                                <div className="flex items-start justify-between gap-3">
                                    <div>
                                        <span
                                            className={`rounded-full px-2.5 py-1 text-xs font-semibold capitalize ${item.category === "domestic" ? "bg-emerald-50 text-emerald-700" : "bg-blue-50 text-blue-700"}`}
                                        >
                                            {item.category}
                                        </span>
                                        <h3 className="mt-3 text-lg font-bold">
                                            {item.name}
                                        </h3>
                                    </div>
                                    <span className="rounded-lg bg-slate-100 px-2 py-1 text-xs font-semibold capitalize text-slate-600">
                                        {item.status}
                                    </span>
                                </div>
                                <p className="mt-3 line-clamp-2 text-sm leading-6 text-slate-500">
                                    {item.description}
                                </p>
                                <div className="mt-4 space-y-2 text-sm text-slate-600">
                                    <p className="flex items-center gap-2">
                                        <MapPin className="size-4 text-slate-400" />
                                        {item.city}, {item.state},{" "}
                                        {item.country}
                                    </p>
                                    <p className="flex items-center gap-2">
                                        <CalendarDays className="size-4 text-slate-400" />
                                        {item.durationDays} days /{" "}
                                        {item.durationNights} nights
                                    </p>
                                </div>
                                <div className="mt-5 flex items-end justify-between border-t pt-4">
                                    <div>
                                        <p className="text-xs text-slate-400">
                                            Per person
                                        </p>
                                        <p className="text-xl font-bold">
                                            ₹
                                            {item.price.toLocaleString("en-IN")}
                                        </p>
                                    </div>
                                    <div className="flex gap-1">
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
                                </div>
                            </div>
                        </article>
                    ))}
                    {shown.length === 0 && (
                        <div className="col-span-full rounded-2xl border border-dashed bg-white py-16 text-center">
                            <Globe2 className="mx-auto size-9 text-slate-300" />
                            <p className="mt-3 font-semibold">
                                No packages found
                            </p>
                            <p className="mt-1 text-sm text-slate-500">
                                Change the location filters or create a package.
                            </p>
                        </div>
                    )}
                </section>
            </div>
            {editing && (
                <div className="fixed inset-0 z-50 grid place-items-center overflow-y-auto bg-slate-950/55 p-4">
                    <div className="my-4 w-full max-w-2xl overflow-hidden rounded-2xl bg-white shadow-2xl">
                        <div className="flex justify-between border-b px-6 py-5">
                            <div>
                                <h2 className="text-lg font-bold">
                                    {editing === "new"
                                        ? "Create package"
                                        : "Edit package"}
                                </h2>
                                <p className="text-sm text-slate-500">
                                    Add pricing, duration, and destination
                                    details.
                                </p>
                            </div>
                            <button onClick={() => setEditing(null)}>
                                <X className="size-5" />
                            </button>
                        </div>
                        <PackageForm
                            item={editing === "new" ? null : editing}
                            onClose={() => setEditing(null)}
                            onSaved={(value) => {
                                setItems((old) =>
                                    editing === "new"
                                        ? [value, ...old]
                                        : old.map((x) =>
                                              x.id === value.id ? value : x,
                                          ),
                                );
                                setEditing(null);
                            }}
                        />
                    </div>
                </div>
            )}
        </main>
    );
}
