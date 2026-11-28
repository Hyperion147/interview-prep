"use client";

import { useEffect, useMemo, useState } from "react";
import { Archive, Bot, Check, CircleAlert, Clock3, Inbox, LoaderCircle, MessageCircle, RefreshCw, Search, Send, Sparkles, Star, UserRound } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";

type Conversation = { id: string; fullName: string; phone: string; destination: string; status: string; assignedAgentId: string | null; assignedAgentName: string | null; inboxStatus: "open" | "done"; important: boolean; handoffRequired: boolean; leadScore: number; aiPriority: string | null; summary: string | null; lastMessage: string | null; lastMessageAt: string | null; lastDirection: string | null; unreadCount: number };
type Detail = { lead: Record<string, unknown>; automation: Record<string, unknown>; messages: Array<{ id: string; direction: string; body: string; status: string; createdAt: string; error: string | null }>; history: Array<{ id: string; summary: string; suggestedReply: string; editedReply: string | null; leadScore: number; scoreReasons: string[]; promptVersion: string; model: string; acceptedAt: string | null; createdAt: string }>; activities: Array<{ id: string; kind: string; body: string; createdAt: string }>; tasks: Array<{ id: string; title: string; status: string; scheduledAt: string }>; agents: Array<{ id: string; fullName: string }> };
type View = "inbox" | "unread" | "important" | "review" | "done";

export function InboxWorkspace() {
    const [conversations, setConversations] = useState<Conversation[]>([]);
    const [selected, setSelected] = useState<string | null>(null);
    const [detail, setDetail] = useState<Detail | null>(null);
    const [view, setView] = useState<View>("inbox");
    const [search, setSearch] = useState("");
    const [draft, setDraft] = useState("");
    const [note, setNote] = useState("");
    const [busy, setBusy] = useState(false);

    function loadInbox() {
        return fetch("/api/inbox").then(async (response) => {
            if (!response.ok) throw new Error("Could not load inbox");
            const rows = await response.json() as Conversation[];
            setConversations(rows);
            setSelected((current) => current ?? rows[0]?.id ?? null);
        });
    }
    function loadDetail(id: string) {
        return fetch(`/api/inbox/${id}`).then(async (response) => {
            if (!response.ok) throw new Error("Could not load conversation");
            const data = await response.json() as Detail;
            setDetail(data);
            const suggestion = data.history[0]?.editedReply ?? data.history[0]?.suggestedReply;
            if (suggestion) setDraft(suggestion);
            return fetch(`/api/inbox/${id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ markViewed: true }) });
        });
    }
    useEffect(() => { loadInbox().catch((error) => toast.error(error.message)); }, []);
    useEffect(() => { if (selected) loadDetail(selected).catch((error) => toast.error(error.message)); }, [selected]);

    const filtered = useMemo(() => conversations.filter((item) => {
        if (view === "unread" && item.unreadCount < 1) return false;
        if (view === "important" && !item.important) return false;
        if (view === "review" && !item.handoffRequired) return false;
        if (view === "done" ? item.inboxStatus !== "done" : item.inboxStatus === "done") return false;
        return `${item.fullName} ${item.phone} ${item.destination} ${item.lastMessage}`.toLowerCase().includes(search.toLowerCase());
    }), [conversations, search, view]);
    const active = conversations.find((item) => item.id === selected);

    async function updateConversation(values: Record<string, unknown>) {
        if (!selected) return;
        const response = await fetch(`/api/inbox/${selected}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(values) });
        if (!response.ok) return toast.error("Could not update conversation");
        await loadInbox(); await loadDetail(selected);
    }
    async function regenerate() {
        if (!selected) return;
        setBusy(true); const notice = toast.loading("Gemini is analyzing the lead…");
        try { const response = await fetch(`/api/leads/${selected}/summary`, { method: "POST" }); const data = await response.json(); if (!response.ok) throw new Error(data.error); await loadDetail(selected); await loadInbox(); toast.success("AI insight updated", { id: notice }); }
        catch (error) { toast.error(error instanceof Error ? error.message : "Analysis failed", { id: notice }); }
        finally { setBusy(false); }
    }
    async function sendReply() {
        if (!selected || !draft.trim()) return;
        setBusy(true); const notice = toast.loading("Sending reply…");
        try { const response = await fetch(`/api/leads/${selected}/whatsapp`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ message: draft }) }); const data = await response.json(); if (!response.ok) throw new Error(data.error); setDraft(""); await loadDetail(selected); await loadInbox(); toast.success("Reply sent", { id: notice }); }
        catch (error) { toast.error(error instanceof Error ? error.message : "Reply failed", { id: notice }); }
        finally { setBusy(false); }
    }
    async function addNote() {
        if (!selected || !note.trim()) return;
        const response = await fetch(`/api/inbox/${selected}/notes`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ note }) });
        if (response.ok) { setNote(""); await loadDetail(selected); toast.success("Internal note added"); }
    }

    const views: Array<[View, string, typeof Inbox]> = [["inbox", "Inbox", Inbox], ["unread", "Unread", MessageCircle], ["important", "Important", Star], ["review", "Needs review", CircleAlert], ["done", "Done", Archive]];
    const latestInsight = detail?.history[0];
    return <div className="grid h-full grid-cols-[12rem_20rem_minmax(25rem,1fr)_22rem] text-slate-900">
        <aside className="border-r bg-slate-50 p-3">
            <p className="px-2 py-3 text-xs font-bold uppercase tracking-[.16em] text-slate-400">Conversation views</p>
            <nav className="space-y-1">{views.map(([key, label, Icon]) => <button key={key} onClick={() => setView(key)} className={`flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium ${view === key ? "bg-white text-indigo-700 shadow-sm ring-1 ring-slate-200" : "text-slate-600 hover:bg-white"}`}><Icon className="size-4" />{label}<span className="ml-auto text-xs">{key === "unread" ? conversations.filter((c) => c.unreadCount).length : ""}</span></button>)}</nav>
            <div className="mt-6 rounded-xl border bg-white p-3"><p className="text-xs font-semibold text-slate-500">AI workflow</p><p className="mt-1 text-sm font-semibold">Travel lead copilot</p><p className="mt-1 text-xs leading-5 text-slate-500">Scores leads, drafts replies and schedules missing-detail follow-ups.</p></div>
        </aside>
        <section className="flex min-w-0 flex-col border-r">
            <div className="border-b p-3"><div className="relative"><Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" /><Input className="pl-9" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search conversations" /></div></div>
            <div className="flex-1 overflow-y-auto">{filtered.map((item) => <button key={item.id} onClick={() => setSelected(item.id)} className={`w-full border-b p-4 text-left ${selected === item.id ? "bg-indigo-50/70" : "hover:bg-slate-50"}`}><div className="flex items-start gap-3"><span className="grid size-9 shrink-0 place-items-center rounded-full bg-slate-900 text-xs font-bold text-white">{item.fullName.split(" ").map((x) => x[0]).slice(0,2).join("")}</span><div className="min-w-0 flex-1"><div className="flex items-center gap-2"><p className="truncate text-sm font-semibold">{item.fullName}</p>{item.important && <Star className="size-3 fill-amber-400 text-amber-400" />}{item.unreadCount > 0 && <span className="ml-auto rounded-full bg-indigo-600 px-1.5 text-[10px] text-white">{item.unreadCount}</span>}</div><p className="mt-1 truncate text-xs text-slate-500">{item.lastDirection === "outbound" ? "You: " : ""}{item.lastMessage ?? "No message"}</p><div className="mt-2 flex gap-1"><Badge variant="secondary">{item.leadScore}</Badge>{item.handoffRequired && <Badge variant="destructive">Review</Badge>}</div></div></div></button>)}{!filtered.length && <p className="p-8 text-center text-sm text-slate-500">No conversations in this view.</p>}</div>
        </section>
        <section className="flex min-w-0 flex-col bg-slate-50/40">
            {!active ? <div className="grid flex-1 place-items-center text-sm text-slate-500">Select a conversation</div> : <><header className="flex items-center gap-3 border-b bg-white px-5 py-3"><div className="flex-1"><h1 className="font-semibold">{active.fullName}</h1><p className="text-xs text-slate-500">{active.phone} · {active.destination}</p></div><Button size="icon-sm" variant={active.important ? "default" : "outline"} onClick={() => updateConversation({ important: !active.important })}><Star /></Button><Button variant="outline" onClick={() => updateConversation({ inboxStatus: active.inboxStatus === "done" ? "open" : "done" })}>{active.inboxStatus === "done" ? "Reopen" : <><Check /> Done</>}</Button></header>
            <div className="flex-1 space-y-3 overflow-y-auto p-5">{!detail ? <><Skeleton className="h-16 w-3/5" /><Skeleton className="ml-auto h-20 w-2/3" /></> : detail.messages.map((message) => <div key={message.id} className={`max-w-[75%] rounded-2xl px-4 py-3 text-sm shadow-sm ${message.direction === "outbound" ? "ml-auto bg-indigo-600 text-white" : "bg-white ring-1 ring-slate-200"}`}><p className="whitespace-pre-wrap">{message.body}</p><p className={`mt-1 text-[10px] ${message.direction === "outbound" ? "text-indigo-200" : "text-slate-400"}`}>{message.status}</p></div>)}</div>
            <div className="border-t bg-white p-4"><Textarea value={draft} onChange={(event) => setDraft(event.target.value)} placeholder="Reply on WhatsApp…" /><div className="mt-2 flex items-center justify-between"><Button variant="outline" onClick={() => latestInsight && setDraft(latestInsight.editedReply ?? latestInsight.suggestedReply)}><Sparkles /> Use AI draft</Button><Button disabled={busy || !draft.trim()} onClick={sendReply}>{busy ? <LoaderCircle className="animate-spin" /> : <Send />} Send</Button></div></div></>}
        </section>
        <aside className="overflow-y-auto border-l bg-white p-5">
            <div className="flex items-center justify-between"><div><p className="flex items-center gap-2 font-semibold"><Bot className="size-4 text-violet-600" /> AI lead brief</p><p className="text-xs text-slate-500">Generated from CRM activity</p></div><Button size="icon-sm" variant="ghost" onClick={regenerate} disabled={busy}><RefreshCw className={busy ? "animate-spin" : ""} /></Button></div>
            {detail ? <div className="mt-5 space-y-5"><div className="rounded-xl border bg-slate-50 p-4"><div className="flex items-center justify-between"><p className="text-xs font-semibold uppercase text-slate-500">Lead score</p><span className="text-2xl font-bold text-indigo-700">{String(detail.automation?.leadScore ?? 0)}</span></div><div className="mt-2 h-2 rounded bg-slate-200"><div className="h-2 rounded bg-indigo-600" style={{ width: `${Number(detail.automation?.leadScore ?? 0)}%` }} /></div></div><div><p className="text-sm font-semibold">Summary</p><p className="mt-2 text-sm leading-6 text-slate-600">{String(detail.automation?.summary ?? "Generate an AI brief for this lead.")}</p></div>{latestInsight && <div><p className="text-sm font-semibold">Why this score</p><ul className="mt-2 space-y-1 text-xs text-slate-600">{latestInsight.scoreReasons.map((reason) => <li key={reason}>• {reason}</li>)}</ul><p className="mt-2 text-[10px] text-slate-400">{latestInsight.promptVersion} · {latestInsight.model}</p></div>}<Button className="w-full" variant="outline" onClick={regenerate}><Sparkles /> Refresh AI brief</Button><div><p className="text-sm font-semibold">Assigned agent</p><select className="mt-2 h-9 w-full rounded-lg border px-2 text-sm" value={String(detail.automation?.assignedAgentId ?? "")} onChange={(event) => updateConversation({ assignedAgentId: event.target.value || null })}><option value="">Unassigned</option>{detail.agents.map((agent) => <option value={agent.id} key={agent.id}>{agent.fullName}</option>)}</select></div><div><p className="text-sm font-semibold">Internal note</p><Textarea className="mt-2" value={note} onChange={(event) => setNote(event.target.value)} placeholder="Visible only to your team" /><Button className="mt-2" size="sm" variant="outline" onClick={addNote}>Add note</Button></div><div><p className="flex items-center gap-2 text-sm font-semibold"><Clock3 className="size-4" /> Next tasks</p>{detail.tasks.filter((task) => task.status === "scheduled").slice(0,3).map((task) => <div key={task.id} className="mt-2 rounded-lg border p-2 text-xs"><p className="font-medium">{task.title}</p><p className="text-slate-500">{new Date(task.scheduledAt).toLocaleString("en-IN")}</p></div>)}</div><div><p className="flex items-center gap-2 text-sm font-semibold"><UserRound className="size-4" /> Activity</p>{detail.activities.slice(0,5).map((activity) => <div className="mt-2 border-l-2 border-slate-200 pl-3 text-xs" key={activity.id}><p>{activity.body}</p><p className="text-slate-400">{new Date(activity.createdAt).toLocaleString("en-IN")}</p></div>)}</div></div> : <div className="mt-5 space-y-3"><Skeleton className="h-28" /><Skeleton className="h-20" /></div>}
        </aside>
    </div>;
}
