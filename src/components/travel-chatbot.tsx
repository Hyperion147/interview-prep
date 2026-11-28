"use client";

import { FormEvent, useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import {
    Bot,
    MessageCircle,
    RefreshCcw,
    Send,
    Sparkles,
    X,
} from "lucide-react";
import { Bubble, BubbleContent } from "@/components/ui/bubble";
import { Button } from "@/components/ui/button";
import { Marker, MarkerContent, MarkerIcon } from "@/components/ui/marker";
import { Message, MessageContent } from "@/components/ui/message";
import {
    MessageScroller,
    MessageScrollerButton,
    MessageScrollerContent,
    MessageScrollerItem,
    MessageScrollerProvider,
    MessageScrollerViewport,
} from "@/components/ui/message-scroller";

type ChatMessage = {
    id: number;
    role: "assistant" | "user";
    text: string;
    error?: boolean;
};

const welcomeMessage: ChatMessage = {
    id: 1,
    role: "assistant",
    text: "Hi! I’m your TravelDesk assistant. Ask me about destinations, packages, visas, or planning your next trip.",
};

function isRecord(value: unknown): value is Record<string, unknown> {
    return typeof value === "object" && value !== null && !Array.isArray(value);
}

export function TravelChatbot() {
    const pathname = usePathname();
    const [open, setOpen] = useState(false);
    const [messages, setMessages] = useState<ChatMessage[]>([welcomeMessage]);
    const [draft, setDraft] = useState("");
    const [interactionId, setInteractionId] = useState("");
    const [sending, setSending] = useState(false);
    const [remaining, setRemaining] = useState<number | null>(null);
    const inputRef = useRef<HTMLTextAreaElement>(null);
    const nextId = useRef(2);

    useEffect(() => {
        if (open) inputRef.current?.focus();
    }, [open]);

    if (pathname.startsWith("/admin") || pathname.startsWith("/auth")) {
        return null;
    }

    function resetChat() {
        setMessages([welcomeMessage]);
        setInteractionId("");
        setDraft("");
        nextId.current = 2;
        inputRef.current?.focus();
    }

    async function sendMessage(event: FormEvent) {
        event.preventDefault();
        const message = draft.trim();
        if (!message || sending || remaining === 0) return;

        setDraft("");
        setSending(true);
        setMessages((current) => [
            ...current,
            { id: nextId.current++, role: "user", text: message },
        ]);

        try {
            const response = await fetch("/api/chat", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ message, interactionId }),
            });
            const data: unknown = await response.json();
            if (isRecord(data) && typeof data.remaining === "number") {
                setRemaining(data.remaining);
            }
            if (!response.ok) {
                const detail =
                    isRecord(data) && typeof data.error === "string"
                        ? data.error
                        : "I couldn’t answer that right now.";
                throw new Error(detail);
            }
            if (
                !isRecord(data) ||
                typeof data.reply !== "string" ||
                typeof data.interactionId !== "string" ||
                typeof data.remaining !== "number"
            ) {
                throw new Error("The assistant returned an invalid response.");
            }
            const reply = data.reply;
            const nextInteractionId = data.interactionId;
            setInteractionId(nextInteractionId);
            setMessages((current) => [
                ...current,
                { id: nextId.current++, role: "assistant", text: reply },
            ]);
        } catch (error) {
            setMessages((current) => [
                ...current,
                {
                    id: nextId.current++,
                    role: "assistant",
                    text:
                        error instanceof Error
                            ? error.message
                            : "The travel assistant is unavailable right now.",
                    error: true,
                },
            ]);
        } finally {
            setSending(false);
        }
    }

    return (
        <div className="fixed bottom-5 right-5 z-[100] font-sans sm:bottom-6 sm:right-6">
            {open && (
                <section
                    aria-label="Travel assistant"
                    className="mb-3 flex h-[min(560px,72vh)] w-[min(380px,calc(100vw-2rem))] flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white text-slate-950 shadow-2xl shadow-slate-950/20"
                    role="dialog"
                >
                    <header className="flex items-center gap-3 border-b border-slate-100 bg-slate-950 px-4 py-3.5 text-white">
                        <span className="grid size-10 place-items-center rounded-xl bg-teal-500 text-white">
                            <Bot className="size-5" />
                        </span>
                        <div className="min-w-0 flex-1">
                            <h2 className="text-sm font-bold">
                                Travel assistant
                            </h2>
                            <p className="mt-0.5 flex items-center gap-1.5 text-xs text-slate-400">
                                <span className="size-1.5 rounded-full bg-emerald-400" />
                                Powered by Gemini
                            </p>
                        </div>
                        <Button
                            aria-label="Start a new chat"
                            className="text-slate-300 hover:bg-white/10 hover:text-white"
                            onClick={resetChat}
                            size="icon-sm"
                            variant="ghost"
                        >
                            <RefreshCcw />
                        </Button>
                        <Button
                            aria-label="Close chat"
                            className="text-slate-300 hover:bg-white/10 hover:text-white"
                            onClick={() => setOpen(false)}
                            size="icon-sm"
                            variant="ghost"
                        >
                            <X />
                        </Button>
                    </header>

                    <MessageScrollerProvider>
                        <MessageScroller className="flex-1 bg-slate-50/70">
                            <MessageScrollerViewport>
                                <MessageScrollerContent className="gap-4 p-4">
                                    <Marker variant="separator">
                                        <MarkerIcon>
                                            <Sparkles />
                                        </MarkerIcon>
                                        <MarkerContent>
                                            TravelDesk AI
                                        </MarkerContent>
                                    </Marker>
                                    {messages.map((message, index) => (
                                        <MessageScrollerItem
                                            key={message.id}
                                            scrollAnchor={
                                                index === messages.length - 1
                                            }
                                        >
                                            <Message
                                                align={
                                                    message.role === "user"
                                                        ? "end"
                                                        : "start"
                                                }
                                            >
                                                <MessageContent>
                                                    <Bubble
                                                        align={
                                                            message.role ===
                                                            "user"
                                                                ? "end"
                                                                : "start"
                                                        }
                                                        variant={
                                                            message.error
                                                                ? "destructive"
                                                                : message.role ===
                                                                    "user"
                                                                  ? "default"
                                                                  : "secondary"
                                                        }
                                                    >
                                                        <BubbleContent className="whitespace-pre-wrap">
                                                            {message.text}
                                                        </BubbleContent>
                                                    </Bubble>
                                                </MessageContent>
                                            </Message>
                                        </MessageScrollerItem>
                                    ))}
                                    {sending && (
                                        <MessageScrollerItem scrollAnchor>
                                            <Message>
                                                <MessageContent>
                                                    <Bubble variant="secondary">
                                                        <BubbleContent aria-label="Assistant is typing">
                                                            <span className="flex gap-1 py-1">
                                                                {[0, 1, 2].map(
                                                                    (dot) => (
                                                                        <span
                                                                            key={
                                                                                dot
                                                                            }
                                                                            className="size-1.5 animate-pulse rounded-full bg-slate-400"
                                                                            style={{
                                                                                animationDelay: `${dot * 160}ms`,
                                                                            }}
                                                                        />
                                                                    ),
                                                                )}
                                                            </span>
                                                        </BubbleContent>
                                                    </Bubble>
                                                </MessageContent>
                                            </Message>
                                        </MessageScrollerItem>
                                    )}
                                </MessageScrollerContent>
                            </MessageScrollerViewport>
                            <MessageScrollerButton />
                        </MessageScroller>
                    </MessageScrollerProvider>

                    <form
                        className="border-t border-slate-200 bg-white p-3"
                        onSubmit={sendMessage}
                    >
                        <div className="flex items-end gap-2 rounded-xl border border-slate-200 bg-slate-50 p-1.5 focus-within:border-teal-500 focus-within:ring-2 focus-within:ring-teal-500/15">
                            <textarea
                                aria-label="Message the travel assistant"
                                className="max-h-24 min-h-9 flex-1 resize-none bg-transparent px-2 py-2 text-sm outline-none placeholder:text-slate-400"
                                disabled={sending || remaining === 0}
                                maxLength={1500}
                                onChange={(event) =>
                                    setDraft(event.target.value)
                                }
                                onKeyDown={(event) => {
                                    if (
                                        event.key === "Enter" &&
                                        !event.shiftKey
                                    ) {
                                        event.preventDefault();
                                        event.currentTarget.form?.requestSubmit();
                                    }
                                }}
                                placeholder={
                                    remaining === 0
                                        ? "Daily limit reached"
                                        : "Ask about your next trip…"
                                }
                                ref={inputRef}
                                rows={1}
                                value={draft}
                            />
                            <Button
                                aria-label="Send message"
                                className="size-9 rounded-lg bg-teal-600 text-white hover:bg-teal-700"
                                disabled={
                                    !draft.trim() ||
                                    sending ||
                                    remaining === 0
                                }
                                size="icon-lg"
                                type="submit"
                            >
                                <Send />
                            </Button>
                        </div>
                        <p className="mt-2 text-center text-[11px] text-slate-400">
                            {remaining === null
                                ? "Daily message limits apply."
                                : `${remaining} question${remaining === 1 ? "" : "s"} left today.`}{" "}
                            AI can make mistakes.
                        </p>
                    </form>
                </section>
            )}

            <button
                aria-expanded={open}
                aria-label={
                    open ? "Close travel assistant" : "Open travel assistant"
                }
                className="ml-auto flex h-14 items-center gap-2 rounded-full bg-teal-600 px-4 font-semibold text-white shadow-xl shadow-teal-950/25 transition hover:-translate-y-0.5 hover:bg-teal-700 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-teal-500/30"
                onClick={() => setOpen((current) => !current)}
                type="button"
            >
                {open ? (
                    <X className="size-5" />
                ) : (
                    <MessageCircle className="size-5" />
                )}
                <span className="text-sm">{open ? "Close" : "Ask us"}</span>
            </button>
        </div>
    );
}
