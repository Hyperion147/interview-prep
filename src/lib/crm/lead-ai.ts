import "server-only";

import { asc, eq } from "drizzle-orm";
import { db } from "@/db";
import { followUps } from "@/db/schema/follow-ups";
import { leads } from "@/db/schema/leads";
import { leadAutomation, whatsappMessages } from "@/db/schema/whatsapp";
import { askGemini } from "@/lib/ai/gemini";

export type LeadInsight = {
    summary: string;
    intent: "researching" | "planning" | "ready_to_book" | "support" | "unknown";
    sentiment: "positive" | "neutral" | "negative";
    priority: "low" | "medium" | "high";
    missingDetails: string[];
    suggestedReply: string;
    handoffRequired: boolean;
};

const insightSchema = {
    type: "object",
    additionalProperties: false,
    required: ["summary", "intent", "sentiment", "priority", "missingDetails", "suggestedReply", "handoffRequired"],
    properties: {
        summary: { type: "string" },
        intent: { type: "string", enum: ["researching", "planning", "ready_to_book", "support", "unknown"] },
        sentiment: { type: "string", enum: ["positive", "neutral", "negative"] },
        priority: { type: "string", enum: ["low", "medium", "high"] },
        missingDetails: { type: "array", items: { type: "string" }, maxItems: 6 },
        suggestedReply: { type: "string" },
        handoffRequired: { type: "boolean" },
    },
};

export async function generateLeadInsight(leadId: string) {
    const [[lead], messages, tasks] = await Promise.all([
        db.select().from(leads).where(eq(leads.id, leadId)).limit(1),
        db.select({ direction: whatsappMessages.direction, body: whatsappMessages.body, createdAt: whatsappMessages.createdAt })
            .from(whatsappMessages).where(eq(whatsappMessages.leadId, leadId))
            .orderBy(asc(whatsappMessages.createdAt)).limit(50),
        db.select({ title: followUps.title, status: followUps.status, outcome: followUps.outcome })
            .from(followUps).where(eq(followUps.leadId, leadId)).limit(20),
    ]);
    if (!lead) return null;
    const text = await askGemini({
        instruction: "You are a travel CRM analyst. Summarize only the supplied lead data. Be concise and factual. Never invent dates, budgets, bookings, availability, or consent. Mark handoffRequired for complaints, refunds, payments, cancellations, legal/safety issues, negative sentiment, or an explicit request for a person. The suggested WhatsApp reply must be under 350 characters, helpful, and must not request payment details or identity documents.",
        responseSchema: insightSchema,
        input: JSON.stringify({
            lead: { name: lead.fullName, destination: lead.destination, travelers: lead.travelers, status: lead.status, value: lead.estimatedValue, notes: lead.notes },
            whatsapp: messages.map((message) => ({ direction: message.direction, body: message.body, at: message.createdAt.toISOString() })),
            followUps: tasks,
        }),
    });
    const insight = JSON.parse(text) as LeadInsight;
    const now = new Date();
    const [saved] = await db.insert(leadAutomation).values({
        leadId,
        summary: insight.summary.slice(0, 1200),
        intent: insight.intent,
        sentiment: insight.sentiment,
        priority: insight.priority,
        missingDetails: insight.missingDetails.slice(0, 6).map(String),
        suggestedReply: insight.suggestedReply.slice(0, 600),
        handoffRequired: insight.handoffRequired,
        summarizedAt: now,
        updatedAt: now,
    }).onConflictDoUpdate({
        target: leadAutomation.leadId,
        set: {
            summary: insight.summary.slice(0, 1200), intent: insight.intent,
            sentiment: insight.sentiment, priority: insight.priority,
            missingDetails: insight.missingDetails.slice(0, 6).map(String),
            suggestedReply: insight.suggestedReply.slice(0, 600),
            handoffRequired: insight.handoffRequired, summarizedAt: now, updatedAt: now,
        },
    }).returning();
    return saved;
}
