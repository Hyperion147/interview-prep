import { eq } from "drizzle-orm";
import { db } from "@/db";
import { crmAutomationSettings } from "@/db/schema/whatsapp";
import { canAccess } from "@/lib/auth/authorization";

async function currentSettings() {
    const [settings] = await db
        .insert(crmAutomationSettings)
        .values({ id: "default" })
        .onConflictDoNothing()
        .returning();
    if (settings) return settings;
    return (
        await db
            .select()
            .from(crmAutomationSettings)
            .where(eq(crmAutomationSettings.id, "default"))
            .limit(1)
    )[0];
}

export async function GET() {
    if (!(await canAccess("leads:read")))
        return Response.json({ error: "Forbidden" }, { status: 403 });
    return Response.json(await currentSettings());
}

export async function PATCH(request: Request) {
    if (!(await canAccess("leads:write")))
        return Response.json({ error: "Forbidden" }, { status: 403 });
    const body = (await request.json().catch(() => null)) as {
        enabled?: unknown;
    } | null;
    if (typeof body?.enabled !== "boolean")
        return Response.json(
            { error: "enabled must be a boolean" },
            { status: 400 },
        );
    const [settings] = await db
        .insert(crmAutomationSettings)
        .values({ id: "default", whatsappAutoReplyEnabled: body.enabled })
        .onConflictDoUpdate({
            target: crmAutomationSettings.id,
            set: {
                whatsappAutoReplyEnabled: body.enabled,
                updatedAt: new Date(),
            },
        })
        .returning();
    return Response.json(settings);
}
