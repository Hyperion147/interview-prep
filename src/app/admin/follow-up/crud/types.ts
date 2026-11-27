export const followUpStatuses = ["scheduled", "completed", "cancelled", "missed"] as const;
export const followUpChannels = ["call", "email", "whatsapp", "meeting"] as const;
export const followUpPriorities = ["low", "medium", "high"] as const;
export type FollowUpStatus = (typeof followUpStatuses)[number];
export type FollowUp = { id: string; leadId: string | null; leadName: string | null; leadEmail: string | null; title: string; scheduledAt: string; status: FollowUpStatus; channel: (typeof followUpChannels)[number]; priority: (typeof followUpPriorities)[number]; notes: string | null; outcome: string | null; completedAt: string | null; createdAt: string; updatedAt: string };
export type FollowUpDraft = Pick<FollowUp, "leadId" | "title" | "scheduledAt" | "status" | "channel" | "priority" | "notes" | "outcome" | "completedAt">;
export type LeadOption = { id: string; fullName: string; email: string };
