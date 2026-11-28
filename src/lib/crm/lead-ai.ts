import "server-only";

import { and, asc, eq, inArray } from "drizzle-orm";
import { db } from "@/db";
import { followUps } from "@/db/schema/follow-ups";
import { leads } from "@/db/schema/leads";
import {
    leadActivities,
    leadAiInsightHistory,
    leadAutomation,
    whatsappMessages,
} from "@/db/schema/whatsapp";
import { askGemini } from "@/lib/ai/gemini";

export type LeadInsight = {
    summary: string;
    intent:
        | "researching"
        | "planning"
        | "ready_to_book"
        | "support"
        | "unknown";
    sentiment: "positive" | "neutral" | "negative";
    priority: "low" | "medium" | "high";
    missingDetails: string[];
    suggestedReply: string;
    handoffRequired: boolean;
    extractedDetails: {
        destination?: string;
        travelers?: number;
        budget?: number;
        travelDates?: string;
    };
};

const insightSchema = {
    type: "object",
    additionalProperties: false,
    required: [
        "summary",
        "intent",
        "sentiment",
        "priority",
        "missingDetails",
        "suggestedReply",
        "handoffRequired",
        "extractedDetails",
    ],
    properties: {
        summary: { type: "string" },
        intent: {
            type: "string",
            enum: [
                "researching",
                "planning",
                "ready_to_book",
                "support",
                "unknown",
            ],
        },
        sentiment: {
            type: "string",
            enum: ["positive", "neutral", "negative"],
        },
        priority: { type: "string", enum: ["low", "medium", "high"] },
        missingDetails: {
            type: "array",
            items: { type: "string" },
            maxItems: 6,
        },
        suggestedReply: { type: "string" },
        handoffRequired: { type: "boolean" },
        extractedDetails: {
            type: "object",
            additionalProperties: false,
            properties: {
                destination: { type: "string" },
                travelers: { type: "integer", minimum: 1, maximum: 1000 },
                budget: { type: "number", minimum: 0 },
                travelDates: { type: "string" },
            },
        },
    },
};

export const LEAD_INSIGHT_PROMPT_VERSION = "travel-lead-v2";

function scoreInsight(insight: LeadInsight) {
    let score = 10;
    const reasons: string[] = [];
    const details = insight.extractedDetails ?? {};
    if (details.destination) {
        score += 20;
        reasons.push("Destination known");
    }
    if (details.travelers) {
        score += 15;
        reasons.push("Group size known");
    }
    if (details.budget) {
        score += 20;
        reasons.push("Budget known");
    }
    if (details.travelDates) {
        score += 15;
        reasons.push("Travel dates known");
    }
    if (insight.intent === "ready_to_book") {
        score += 25;
        reasons.push("Ready-to-book intent");
    } else if (insight.intent === "planning") {
        score += 12;
        reasons.push("Active planning intent");
    }
    if (insight.priority === "high") {
        score += 10;
        reasons.push("High priority");
    }
    if (insight.sentiment === "negative" || insight.handoffRequired) {
        score -= 15;
        reasons.push("Human attention required");
    }
    return { score: Math.max(0, Math.min(100, score)), reasons };
}

export async function generateLeadInsight(leadId: string) {
    const [[lead], messages, tasks] = await Promise.all([
        db.select().from(leads).where(eq(leads.id, leadId)).limit(1),
        db
            .select({
                direction: whatsappMessages.direction,
                body: whatsappMessages.body,
                createdAt: whatsappMessages.createdAt,
            })
            .from(whatsappMessages)
            .where(eq(whatsappMessages.leadId, leadId))
            .orderBy(asc(whatsappMessages.createdAt))
            .limit(50),
        db
            .select({
                title: followUps.title,
                status: followUps.status,
                outcome: followUps.outcome,
            })
            .from(followUps)
            .where(eq(followUps.leadId, leadId))
            .limit(20),
    ]);
    if (!lead) return null;
    const text = await askGemini({
        instruction:
            "You are a travel CRM analyst. Summarize only the supplied lead data. Be concise and factual. Never invent dates, destinations, traveler counts, budgets, bookings, availability, or consent. Put a value in extractedDetails only when the customer explicitly supplied it; otherwise omit that property. Mark handoffRequired for complaints, refunds, payments, cancellations, legal/safety issues, negative sentiment, or an explicit request for a person. The suggested WhatsApp reply must be under 350 characters, helpful, and must not request payment details or identity documents.",
        responseSchema: insightSchema,
        input: JSON.stringify({
            lead: {
                name: lead.fullName,
                destination: lead.destination,
                travelers: lead.travelers,
                status: lead.status,
                value: lead.estimatedValue,
                notes: lead.notes,
            },
            whatsapp: messages.map((message) => ({
                direction: message.direction,
                body: message.body,
                at: message.createdAt.toISOString(),
            })),
            followUps: tasks,
        }),
    });
    const insight = JSON.parse(text) as LeadInsight;
    if (
        !insight.summary ||
        !insight.suggestedReply ||
        !Array.isArray(insight.missingDetails)
    ) {
        throw new Error("Gemini returned an invalid lead insight");
    }
    const now = new Date();
    const details = {
        ...(typeof insight.extractedDetails?.destination === "string" &&
        insight.extractedDetails.destination.trim()
            ? {
                  destination: insight.extractedDetails.destination
                      .trim()
                      .slice(0, 120),
              }
            : {}),
        ...(Number.isInteger(insight.extractedDetails?.travelers) &&
        insight.extractedDetails.travelers! > 0
            ? { travelers: insight.extractedDetails.travelers }
            : {}),
        ...(typeof insight.extractedDetails?.budget === "number" &&
        insight.extractedDetails.budget > 0
            ? { budget: insight.extractedDetails.budget }
            : {}),
        ...(typeof insight.extractedDetails?.travelDates === "string" &&
        insight.extractedDetails.travelDates.trim()
            ? {
                  travelDates: insight.extractedDetails.travelDates
                      .trim()
                      .slice(0, 200),
              }
            : {}),
    };
    const { score, reasons } = scoreInsight(insight);
    const model = process.env.GEMINI_MODEL ?? "gemini-3.5-flash-lite";
    const [saved] = await db
        .insert(leadAutomation)
        .values({
            leadId,
            summary: insight.summary.slice(0, 1200),
            intent: insight.intent,
            sentiment: insight.sentiment,
            priority: insight.priority,
            missingDetails: insight.missingDetails.slice(0, 6).map(String),
            suggestedReply: insight.suggestedReply.slice(0, 600),
            extractedDetails: details,
            leadScore: score,
            scoreReasons: reasons,
            promptVersion: LEAD_INSIGHT_PROMPT_VERSION,
            model,
            handoffRequired: insight.handoffRequired,
            summarizedAt: now,
            updatedAt: now,
        })
        .onConflictDoUpdate({
            target: leadAutomation.leadId,
            set: {
                summary: insight.summary.slice(0, 1200),
                intent: insight.intent,
                sentiment: insight.sentiment,
                priority: insight.priority,
                missingDetails: insight.missingDetails.slice(0, 6).map(String),
                suggestedReply: insight.suggestedReply.slice(0, 600),
                extractedDetails: details,
                leadScore: score,
                scoreReasons: reasons,
                promptVersion: LEAD_INSIGHT_PROMPT_VERSION,
                model,
                handoffRequired: insight.handoffRequired,
                summarizedAt: now,
                updatedAt: now,
            },
        })
        .returning();
    let nextStatus = lead.status;
    if (lead.status === "new" && messages.length) nextStatus = "contacted";
    if (
        ["new", "contacted"].includes(lead.status) &&
        score >= 60 &&
        details.destination
    )
        nextStatus = "qualified";
    const leadUpdates = {
        ...(details.destination && lead.destination === "To be confirmed"
            ? { destination: details.destination }
            : {}),
        ...(details.travelers && lead.travelers === 1
            ? { travelers: details.travelers }
            : {}),
        ...(details.budget && Number(lead.estimatedValue) === 0
            ? { estimatedValue: String(details.budget) }
            : {}),
        status: nextStatus,
        updatedAt: now,
    };
    await db.transaction(async (tx) => {
        await tx.update(leads).set(leadUpdates).where(eq(leads.id, leadId));
        await tx.insert(leadAiInsightHistory).values({
            leadId,
            summary: insight.summary.slice(0, 1200),
            intent: insight.intent,
            sentiment: insight.sentiment,
            priority: insight.priority,
            missingDetails: insight.missingDetails.slice(0, 6),
            suggestedReply: insight.suggestedReply.slice(0, 600),
            extractedDetails: details,
            leadScore: score,
            scoreReasons: reasons,
            model,
            promptVersion: LEAD_INSIGHT_PROMPT_VERSION,
        });
        await tx.insert(leadActivities).values({
            leadId,
            kind: "ai_summary",
            body: insight.summary.slice(0, 1200),
            metadata: { score, promptVersion: LEAD_INSIGHT_PROMPT_VERSION },
        });
        if (nextStatus !== lead.status)
            await tx.insert(leadActivities).values({
                leadId,
                kind: "stage_change",
                body: `Stage changed from ${lead.status} to ${nextStatus}`,
                metadata: {
                    from: lead.status,
                    to: nextStatus,
                    automated: true,
                },
            });
        const [openTask] = await tx
            .select({ id: followUps.id })
            .from(followUps)
            .where(
                and(
                    eq(followUps.leadId, leadId),
                    inArray(followUps.status, ["scheduled", "missed"]),
                ),
            )
            .limit(1);
        if (!openTask && insight.missingDetails.length)
            await tx.insert(followUps).values({
                leadId,
                title:
                    score >= 60
                        ? "Follow up with high-intent lead"
                        : "Collect missing trip details",
                scheduledAt: new Date(
                    now.getTime() + (score >= 60 ? 4 : 24) * 60 * 60 * 1000,
                ),
                channel: "whatsapp",
                priority: score >= 60 ? "high" : "medium",
                notes: `Missing: ${insight.missingDetails.join(", ")}`.slice(
                    0,
                    1500,
                ),
            });
    });
    return saved;
}
