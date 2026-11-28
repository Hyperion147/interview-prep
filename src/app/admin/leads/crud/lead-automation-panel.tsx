"use client";

import { useEffect, useState } from "react";
import {
    Bot,
    LoaderCircle,
    MessageCircle,
    RefreshCw,
    Send,
    X,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import type { Lead } from "./types";

type Message = {
    id: string;
    direction: "inbound" | "outbound";
    status: string;
    body: string;
    createdAt: string;
    error: string | null;
};
type Automation = {
    autoReplyEnabled: boolean;
    handoffRequired: boolean;
    summary: string | null;
    intent: string | null;
    sentiment: string | null;
    priority: string | null;
    missingDetails: string[];
    suggestedReply: string | null;
    summarizedAt: string | null;
};
type Workspace = {
    configured: boolean;
    messages: Message[];
    automation: Automation | null;
};

export function LeadAutomationPanel({
    lead,
    onClose,
}: {
    lead: Lead;
    onClose: () => void;
}) {
    const [workspace, setWorkspace] = useState<Workspace | null>(null);
    const [draft, setDraft] = useState("");
    const [templateName, setTemplateName] = useState("");
    const [busy, setBusy] = useState(false);

    async function refresh() {
        const response = await fetch(`/api/leads/${lead.id}/whatsapp`);
        if (!response.ok) throw new Error("Unable to load WhatsApp activity");
        setWorkspace(await response.json());
    }
    useEffect(() => {
        let active = true;
        fetch(`/api/leads/${lead.id}/whatsapp`)
            .then(async (response) => {
                if (!response.ok)
                    throw new Error("Unable to load WhatsApp activity");
                return response.json() as Promise<Workspace>;
            })
            .then((data) => {
                if (active) setWorkspace(data);
            })
            .catch((error: Error) => toast.error(error.message));
        return () => {
            active = false;
        };
    }, [lead.id]);
    useEffect(() => {
        fetch(`/api/leads/${lead.id}/automation`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ markViewed: true }),
        }).catch(() => undefined);
    }, [lead.id]);

    async function summarize() {
        setBusy(true);
        const notice = toast.loading("Gemini is summarizing this lead…");
        try {
            const response = await fetch(`/api/leads/${lead.id}/summary`, {
                method: "POST",
            });
            const data = await response.json();
            if (!response.ok) throw new Error(data.error);
            setWorkspace((current) =>
                current
                    ? ({
                          ...current,
                          automation: { ...current.automation, ...data },
                      } as Workspace)
                    : current,
            );
            if (!draft && data.suggestedReply) setDraft(data.suggestedReply);
            toast.success("Lead summary updated", { id: notice });
        } catch (error) {
            toast.error(
                error instanceof Error ? error.message : "Summary failed",
                { id: notice },
            );
        } finally {
            setBusy(false);
        }
    }

    async function toggleAutoReply() {
        if (!workspace) return;
        const next = !(workspace.automation?.autoReplyEnabled ?? true);
        const response = await fetch(`/api/leads/${lead.id}/automation`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ autoReplyEnabled: next }),
        });
        if (!response.ok) return toast.error("Could not update automation");
        const automation = await response.json();
        setWorkspace({ ...workspace, automation });
        toast.success(
            next ? "AI auto-replies enabled" : "AI auto-replies paused",
        );
    }

    async function send() {
        if (!draft.trim() && !templateName.trim()) return;
        setBusy(true);
        const notice = toast.loading("Sending WhatsApp message…");
        try {
            const response = await fetch(`/api/leads/${lead.id}/whatsapp`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    message: draft,
                    templateName,
                    language: "en_US",
                }),
            });
            const data = await response.json();
            if (!response.ok) throw new Error(data.error);
            setDraft("");
            setTemplateName("");
            await refresh();
            toast.success("WhatsApp message accepted by Meta", { id: notice });
        } catch (error) {
            toast.error(
                error instanceof Error ? error.message : "Send failed",
                { id: notice },
            );
        } finally {
            setBusy(false);
        }
    }

    return (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/55 p-4 backdrop-blur-sm">
            <section className="mx-auto my-4 flex min-h-[620px] max-w-5xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl">
                <header className="flex items-start gap-3 border-b p-5">
                    <span className="grid size-10 place-items-center rounded-xl bg-emerald-100 text-emerald-700">
                        <MessageCircle className="size-5" />
                    </span>
                    <div className="flex-1">
                        <h2 className="font-bold text-slate-950">
                            {lead.fullName}
                        </h2>
                        <p className="text-sm text-slate-500">
                            WhatsApp automation · {lead.phone}
                        </p>
                    </div>
                    <Button
                        variant="ghost"
                        size="icon"
                        aria-label="Close"
                        onClick={onClose}
                    >
                        <X />
                    </Button>
                </header>
                {!workspace ? (
                    <div className="grid flex-1 gap-5 p-6 lg:grid-cols-2">
                        <Skeleton className="h-96" />
                        <Skeleton className="h-96" />
                    </div>
                ) : (
                    <div className="grid flex-1 lg:grid-cols-[1.15fr_.85fr]">
                        <div className="flex min-h-[520px] flex-col border-b lg:border-b-0 lg:border-r">
                            <div className="flex items-center justify-between border-b px-5 py-3">
                                <p className="text-sm font-semibold">
                                    Conversation
                                </p>
                                <span
                                    className={`text-xs font-medium ${workspace.configured ? "text-emerald-600" : "text-amber-600"}`}
                                >
                                    {workspace.configured
                                        ? "Cloud API configured"
                                        : "API setup required"}
                                </span>
                            </div>
                            <div className="flex-1 space-y-3 overflow-y-auto bg-slate-50 p-5">
                                {workspace.messages.map((message) => (
                                    <div
                                        key={message.id}
                                        className={`max-w-[82%] rounded-2xl px-4 py-3 text-sm shadow-sm ${message.direction === "outbound" ? "ml-auto bg-emerald-600 text-white" : "bg-white text-slate-800"}`}
                                    >
                                        <p className="whitespace-pre-wrap">
                                            {message.body}
                                        </p>
                                        <p
                                            className={`mt-1 text-[10px] ${message.direction === "outbound" ? "text-emerald-100" : "text-slate-400"}`}
                                        >
                                            {message.status}
                                            {message.error
                                                ? ` · ${message.error}`
                                                : ""}
                                        </p>
                                    </div>
                                ))}
                                {!workspace.messages.length && (
                                    <p className="py-20 text-center text-sm text-slate-500">
                                        No WhatsApp messages for this lead yet.
                                    </p>
                                )}
                            </div>
                            <div className="space-y-2 border-t p-4">
                                <Textarea
                                    value={draft}
                                    onChange={(event) =>
                                        setDraft(event.target.value)
                                    }
                                    placeholder="Write a reply or generate one with Gemini…"
                                    maxLength={1500}
                                />
                                <div className="flex flex-wrap gap-2">
                                    <Input
                                        className="max-w-56"
                                        value={templateName}
                                        onChange={(event) =>
                                            setTemplateName(
                                                event.target.value
                                                    .toLowerCase()
                                                    .replace(/[^a-z0-9_]/g, ""),
                                            )
                                        }
                                        placeholder="Approved template (optional)"
                                    />
                                    <Button
                                        onClick={send}
                                        disabled={busy || !workspace.configured}
                                    >
                                        <Send /> Send
                                    </Button>
                                </div>
                                <p className="text-xs text-slate-500">
                                    Use an approved template to start or resume
                                    conversations outside Meta’s
                                    customer-service window.
                                </p>
                            </div>
                        </div>
                        <aside className="space-y-5 p-5">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="font-semibold">
                                        AI automation
                                    </p>
                                    <p className="text-xs text-slate-500">
                                        Gemini analysis and replies
                                    </p>
                                </div>
                                <Button
                                    variant="outline"
                                    onClick={toggleAutoReply}
                                >
                                    {(workspace.automation?.autoReplyEnabled ??
                                    true)
                                        ? "Pause"
                                        : "Enable"}
                                </Button>
                            </div>
                            {workspace.automation?.handoffRequired && (
                                <div className="rounded-xl border border-amber-200 bg-amber-50 p-3 text-sm font-medium text-amber-800">
                                    Human review required. Auto-replies are
                                    paused.
                                </div>
                            )}
                            <div className="rounded-xl border p-4">
                                <div className="flex items-center justify-between">
                                    <p className="flex items-center gap-2 font-semibold">
                                        <Bot className="size-4 text-violet-600" />{" "}
                                        Lead summary
                                    </p>
                                    <Button
                                        variant="ghost"
                                        size="icon-sm"
                                        onClick={summarize}
                                        disabled={busy}
                                    >
                                        {busy ? (
                                            <LoaderCircle className="animate-spin" />
                                        ) : (
                                            <RefreshCw />
                                        )}
                                    </Button>
                                </div>
                                <p className="mt-3 text-sm leading-6 text-slate-600">
                                    {workspace.automation?.summary ??
                                        "Generate a concise summary from the lead, follow-ups, and WhatsApp conversation."}
                                </p>
                                {workspace.automation?.intent && (
                                    <div className="mt-4 flex flex-wrap gap-2 text-xs">
                                        <span className="rounded-full bg-violet-50 px-2.5 py-1 text-violet-700">
                                            {workspace.automation.intent}
                                        </span>
                                        <span className="rounded-full bg-slate-100 px-2.5 py-1">
                                            {workspace.automation.sentiment}
                                        </span>
                                        <span className="rounded-full bg-blue-50 px-2.5 py-1 text-blue-700">
                                            {workspace.automation.priority}{" "}
                                            priority
                                        </span>
                                    </div>
                                )}
                            </div>
                            {!!workspace.automation?.missingDetails?.length && (
                                <div>
                                    <p className="text-sm font-semibold">
                                        Missing details
                                    </p>
                                    <ul className="mt-2 space-y-1 text-sm text-slate-600">
                                        {workspace.automation.missingDetails.map(
                                            (item) => (
                                                <li key={item}>• {item}</li>
                                            ),
                                        )}
                                    </ul>
                                </div>
                            )}
                            <Button
                                className="w-full"
                                variant="outline"
                                onClick={summarize}
                                disabled={busy}
                            >
                                <Bot /> Generate with Gemini
                            </Button>
                        </aside>
                    </div>
                )}
            </section>
        </div>
    );
}
