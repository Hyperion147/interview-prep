export const leadStatuses = [
    "new",
    "contacted",
    "qualified",
    "proposal_sent",
    "won",
    "lost",
] as const;
export const leadSources = [
    "website",
    "referral",
    "social_media",
    "walk_in",
    "phone",
    "other",
] as const;

export type LeadStatus = (typeof leadStatuses)[number];
export type LeadSource = (typeof leadSources)[number];

export type Lead = {
    id: string;
    fullName: string;
    email: string;
    phone: string;
    destination: string;
    status: LeadStatus;
    source: LeadSource;
    travelers: number;
    estimatedValue: number;
    notes: string;
    nextFollowUpAt: string;
    createdAt: string;
    updatedAt: string;
    handoffRequired: boolean;
    aiPriority: string | null;
    unreadWhatsApp: number;
    lastWhatsAppMessage: string | null;
    whatsappDeliveryFailed: boolean;
};

export type LeadDraft = Omit<
    Lead,
    | "id"
    | "createdAt"
    | "updatedAt"
    | "handoffRequired"
    | "aiPriority"
    | "unreadWhatsApp"
    | "lastWhatsAppMessage"
    | "whatsappDeliveryFailed"
>;
