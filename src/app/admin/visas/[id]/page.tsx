"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import { ArrowLeft, CheckCircle2, FileText, Mail, MapPin, Phone, Save } from "lucide-react";
import { documentStatuses, normalizeVisa, visaStatuses, type VisaApplication } from "../crud/types";

const input = "h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/15";

function VisaApplicationDetails() {
  const { id } = useParams<{ id: string }>();
  const [application, setApplication] = useState<VisaApplication | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  useEffect(() => { fetch(`/api/visas/${id}`).then((response) => response.ok ? response.json() : Promise.reject()).then((row) => setApplication(normalizeVisa(row))); }, [id]);
  async function save() {
    if (!application) return;
    setSaving(true);
    setError(null);
    try {
      const response = await fetch(`/api/visas/${id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(application) });
      if (!response.ok) {
        const data = await response.json().catch(() => null);
        throw new Error(data?.error ?? "Failed to save changes");
      }
      setApplication(normalizeVisa(await response.json()));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save changes");
    } finally {
      setSaving(false);
    }
  }

  if (!application) return <main className="grid min-h-screen place-items-center bg-slate-50 text-sm text-slate-500">Loading application…</main>;
  const created = new Date(application.createdAt).toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" });
  return <main className="min-h-screen bg-slate-50 p-5 sm:p-8"><div className="mx-auto max-w-5xl">
    <Link href="/admin/visas" className="inline-flex items-center gap-2 text-sm font-semibold text-slate-500 hover:text-blue-600"><ArrowLeft className="size-4" />Back to applications</Link>
    <div className="mt-5 flex flex-col justify-between gap-4 sm:flex-row sm:items-start"><div><p className="text-xs font-semibold uppercase tracking-[.18em] text-blue-600">Visa application</p><h1 className="mt-1 text-3xl font-bold">{application.applicantName}</h1><p className="mt-1 text-sm text-slate-500">Created {created} · ID {application.id.slice(0, 8).toUpperCase()}</p></div><div className="flex flex-col items-start gap-2 sm:items-end"><button onClick={save} disabled={saving} className="inline-flex w-fit items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-60"><Save className="size-4" />{saving ? "Saving…" : "Save changes"}</button>{error && <p className="text-sm font-medium text-rose-600">{error}</p>}</div></div>
    <div className="mt-8 grid gap-6 lg:grid-cols-[1fr_340px]">
      <div className="space-y-6"><section className="rounded-2xl border bg-white p-6 shadow-sm"><h2 className="font-bold">Applicant details</h2><div className="mt-5 grid gap-5 sm:grid-cols-2"><div className="flex gap-3"><Mail className="mt-0.5 size-5 text-slate-400" /><div><p className="text-xs text-slate-500">Email</p><p className="font-medium">{application.email}</p></div></div><div className="flex gap-3"><Phone className="mt-0.5 size-5 text-slate-400" /><div><p className="text-xs text-slate-500">Phone</p><p className="font-medium">{application.phone}</p></div></div><div className="flex gap-3"><FileText className="mt-0.5 size-5 text-slate-400" /><div><p className="text-xs text-slate-500">Passport number</p><p className="font-medium">{application.passportNumber}</p></div></div><div className="flex gap-3"><MapPin className="mt-0.5 size-5 text-slate-400" /><div><p className="text-xs text-slate-500">Destination</p><p className="font-medium">{application.destinationCountry}</p></div></div></div></section>
        <section className="rounded-2xl border bg-white p-6 shadow-sm"><h2 className="font-bold">Application summary</h2><div className="mt-5 grid gap-5 sm:grid-cols-2"><div><p className="text-xs text-slate-500">Visa type</p><p className="mt-1 font-medium">{application.visaType}</p></div><div><p className="text-xs text-slate-500">Application value</p><p className="mt-1 font-medium">₹{application.applicationValue.toLocaleString("en-IN")}</p></div><div className="sm:col-span-2"><p className="text-xs text-slate-500">Notes</p><textarea value={application.notes} onChange={(e) => setApplication({ ...application, notes: e.target.value })} className={`${input} mt-1 h-24 py-2`} /></div></div></section></div>
      <aside className="rounded-2xl border bg-white p-6 shadow-sm"><div className="flex items-center gap-2"><CheckCircle2 className="size-5 text-blue-600" /><h2 className="font-bold">Tracking</h2></div><div className="mt-6 space-y-5"><label><span className="mb-1.5 block text-sm text-slate-500">Application status</span><select value={application.status} onChange={(e) => setApplication({ ...application, status: e.target.value as VisaApplication["status"] })} className={`${input} capitalize`}>{visaStatuses.map((status) => <option key={status}>{status}</option>)}</select></label><label><span className="mb-1.5 block text-sm text-slate-500">Document status</span><select value={application.documentStatus} onChange={(e) => setApplication({ ...application, documentStatus: e.target.value as VisaApplication["documentStatus"] })} className={`${input} capitalize`}>{documentStatuses.map((status) => <option key={status}>{status}</option>)}</select></label><label><span className="mb-1.5 flex justify-between text-sm text-slate-500"><span>Progress</span><strong className="text-slate-900">{application.progress}%</strong></span><input type="range" min="0" max="100" step="5" value={application.progress} onChange={(e) => setApplication({ ...application, progress: Number(e.target.value) })} className="w-full accent-blue-600" /></label><div className="h-2 overflow-hidden rounded-full bg-slate-100"><div className="h-full rounded-full bg-blue-600 transition-all" style={{ width: `${application.progress}%` }} /></div><div className="border-t pt-5"><p className="text-xs text-slate-500">Submitted on</p><p className="mt-1 text-sm font-medium">{application.submittedAt || "Not submitted yet"}</p></div></div></aside>
    </div>
  </div></main>;
}

export default function VisaApplicationPage() {
  return <Suspense fallback={<main className="grid min-h-screen place-items-center bg-slate-50 text-sm text-slate-500">Loading application…</main>}><VisaApplicationDetails /></Suspense>;
}
