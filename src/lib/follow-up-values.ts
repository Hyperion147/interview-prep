const statuses = ["scheduled", "completed", "cancelled", "missed"] as const;
const channels = ["call", "email", "whatsapp", "meeting"] as const;
const priorities = ["low", "medium", "high"] as const;

export function followUpValues(body: Record<string, unknown>) {
    const status = String(
        body.status ?? "scheduled",
    ) as (typeof statuses)[number];
    const channel = String(body.channel ?? "call") as (typeof channels)[number];
    const priority = String(
        body.priority ?? "medium",
    ) as (typeof priorities)[number];
    if (!String(body.title ?? "").trim() || !body.scheduledAt)
        throw new Error("Title and schedule are required");
    if (
        !statuses.includes(status) ||
        !channels.includes(channel) ||
        !priorities.includes(priority)
    )
        throw new Error("Invalid follow-up selection");
    const scheduledAt = new Date(String(body.scheduledAt));
    if (Number.isNaN(scheduledAt.getTime()))
        throw new Error("Invalid schedule date");
    return {
        leadId: body.leadId ? String(body.leadId) : null,
        title: String(body.title).trim(),
        scheduledAt,
        status,
        channel,
        priority,
        notes: body.notes ? String(body.notes) : null,
        outcome: body.outcome ? String(body.outcome) : null,
        completedAt:
            status === "completed"
                ? body.completedAt
                    ? new Date(String(body.completedAt))
                    : new Date()
                : null,
    };
}
