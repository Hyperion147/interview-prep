import "server-only";
import { and, desc, eq, inArray, sql } from "drizzle-orm";
import { db } from "@/db";
import { leads, type NewLeadRow } from "@/db/schema/leads";
import { followUps } from "@/db/schema/follow-ups";
import { whatsappEvents } from "@/db/schema/whatsapp";

export async function captureEnquiry(
    enquiry: Pick<
        NewLeadRow,
        "fullName" | "phone" | "email" | "destination" | "source"
    >,
    eventId?: string,
    handoff = false,
    message?: string,
) {
    return db.transaction(async (tx) => {
        if (eventId) {
            const [event] = await tx
                .insert(whatsappEvents)
                .values({ id: eventId, status: "received" })
                .onConflictDoNothing()
                .returning();
            if (!event) return null;
        }
        const phone = enquiry.phone.replace(/\D/g, "");
        await tx.execute(
            sql`select pg_advisory_xact_lock(hashtextextended(${phone}, 0))`,
        );
        const [existing] = await tx
            .select()
            .from(leads)
            .where(
                and(
                    inArray(leads.status, [
                        "new",
                        "contacted",
                        "qualified",
                        "proposal_sent",
                    ]),
                    sql`regexp_replace(${leads.phone}, '[^0-9]', '', 'g') = ${phone}`,
                ),
            )
            .orderBy(desc(leads.createdAt))
            .limit(1);
        const due = new Date(Date.now() + (handoff ? 0 : 24 * 60 * 60 * 1000));
        const [created] = existing
            ? [existing]
            : await tx
                  .insert(leads)
                  .values({
                      ...enquiry,
                      phone: `+${phone}`,
                      nextFollowUpAt: due,
                  })
                  .returning();
        const [openWhatsAppTask] = handoff
            ? await tx
                  .select({ id: followUps.id })
                  .from(followUps)
                  .where(
                      and(
                          eq(followUps.leadId, created.id),
                          eq(followUps.channel, "whatsapp"),
                          inArray(followUps.status, ["scheduled", "missed"]),
                      ),
                  )
                  .limit(1)
            : [];
        if ((!existing || handoff || !eventId) && !openWhatsAppTask) {
            await tx.insert(followUps).values({
                leadId: created.id,
                title: handoff
                    ? "Review WhatsApp enquiry"
                    : "Qualify new travel enquiry",
                scheduledAt: due,
                channel: eventId ? "whatsapp" : "email",
                priority: handoff ? "high" : "medium",
                notes: eventId
                    ? message?.slice(0, 1500)
                    : `Requested destination: ${enquiry.destination}`,
            });
            if (
                existing &&
                (!existing.nextFollowUpAt || existing.nextFollowUpAt > due)
            ) {
                await tx
                    .update(leads)
                    .set({ nextFollowUpAt: due })
                    .where(eq(leads.id, created.id));
            }
        }
        if (eventId)
            await tx
                .update(whatsappEvents)
                .set({
                    leadId: created.id,
                    status: handoff ? "needs_review" : "received",
                })
                .where(eq(whatsappEvents.id, eventId));
        return created;
    });
}
