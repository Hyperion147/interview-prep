import { and, eq, inArray, ne } from "drizzle-orm";
import { db } from "@/db";
import { followUps } from "@/db/schema/follow-ups";
import { leads } from "@/db/schema/leads";
import { tripWorkflow } from "@/db/schema/trip-workflow";
import { canAccess } from "@/lib/auth/authorization";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
    const body = await request.json().catch(() => null);
    if (
        !body ||
        typeof body.id !== "string" ||
        !/^[\da-f]{8}(?:-[\da-f]{4}){3}-[\da-f]{12}$/i.test(body.id)
    ) {
        return Response.json({ error: "Invalid lead." }, { status: 400 });
    }
    const { id, action } = body;
    let customerEmail: string | undefined;
    if (action === "accept") {
        const supabase = await createClient();
        const { data } = await supabase.auth.getUser();
        customerEmail = data.user?.email_confirmed_at
            ? data.user.email
            : undefined;
        if (!customerEmail)
            return Response.json(
                { error: "Sign in to accept this proposal." },
                { status: 401 },
            );
    } else if (!(await canAccess("leads:write"))) {
        return Response.json({ error: "Forbidden." }, { status: 403 });
    }

    try {
        const changed = await db.transaction(async (tx) => {
            const [lead] = await tx
                .select()
                .from(leads)
                .where(eq(leads.id, id))
                .for("update");
            if (!lead || lead.status === "lost") return false;
            const [trip] = await tx
                .select()
                .from(tripWorkflow)
                .where(eq(tripWorkflow.leadId, id));
            if (action === "propose") {
                const itinerary =
                    typeof body.itinerary === "string"
                        ? body.itinerary.trim()
                        : "";
                const total = Number(body.total);
                const dueAt = new Date(body.dueAt);
                if (
                    trip ||
                    !itinerary ||
                    itinerary.length > 6000 ||
                    !Number.isSafeInteger(total) ||
                    total < 1 ||
                    total > 1_000_000_000 ||
                    !(dueAt.getTime() > Date.now()) ||
                    !["new", "contacted", "qualified"].includes(lead.status) ||
                    !lead.email.trim()
                )
                    return false;
                const [reminder] = await tx
                    .insert(followUps)
                    .values({
                        leadId: id,
                        title: "Follow up on proposal",
                        scheduledAt: new Date(Date.now() + 2 * 86400000),
                        channel: "email",
                    })
                    .returning({ id: followUps.id });
                await tx
                    .insert(tripWorkflow)
                    .values({
                        leadId: id,
                        customerEmail: lead.email.trim().toLowerCase(),
                        itinerary,
                        total,
                        dueAt,
                        stage: "proposed",
                        reminderId: reminder.id,
                    });
                await tx
                    .update(leads)
                    .set({
                        status: "proposal_sent",
                        estimatedValue: String(total),
                    })
                    .where(eq(leads.id, id));
                return true;
            }
            if (!trip) return false;
            let stage: typeof trip.stage;
            let task: { title: string; scheduledAt: Date } | undefined;
            if (
                action === "accept" &&
                trip.stage === "proposed" &&
                customerEmail?.toLowerCase() === trip.customerEmail
            ) {
                stage = "accepted";
                task = {
                    title: "Confirm suppliers and book accepted trip",
                    scheduledAt: new Date(),
                };
            } else if (action === "book" && trip.stage === "accepted") {
                stage = "booked";
                task = {
                    title: "Follow up on trip payment",
                    scheduledAt: new Date(
                        Math.max(
                            Date.now(),
                            trip.dueAt.getTime() - 7 * 86400000,
                        ),
                    ),
                };
                await tx
                    .update(leads)
                    .set({ status: "won", nextFollowUpAt: null })
                    .where(eq(leads.id, id));
                await tx
                    .update(followUps)
                    .set({ status: "cancelled" })
                    .where(
                        and(
                            eq(followUps.leadId, id),
                            eq(followUps.status, "scheduled"),
                            ne(followUps.id, trip.reminderId ?? id),
                        ),
                    );
            } else if (action === "pay" && trip.stage === "booked") {
                stage = "paid";
            } else {
                return false;
            }
            if (trip.reminderId)
                await tx
                    .update(followUps)
                    .set({ status: "completed", completedAt: new Date() })
                    .where(
                        and(
                            eq(followUps.id, trip.reminderId),
                            inArray(followUps.status, ["scheduled", "missed"]),
                        ),
                    );
            const [reminder] = task
                ? await tx
                      .insert(followUps)
                      .values({
                          ...task,
                          leadId: id,
                          channel: "email",
                      })
                      .returning({ id: followUps.id })
                : [];
            await tx
                .update(tripWorkflow)
                .set({ stage, reminderId: reminder?.id ?? null })
                .where(eq(tripWorkflow.leadId, id));
            return true;
        });
        return changed
            ? Response.json({ ok: true })
            : Response.json(
                  {
                      error: "Check the lead, quote details, or current trip stage.",
                  },
                  { status: 409 },
              );
    } catch {
        return Response.json(
            { error: "Could not update the trip." },
            { status: 500 },
        );
    }
}
