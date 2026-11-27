import { desc } from "drizzle-orm";
import { db } from "@/db";
import { agents } from "@/db/schema/auth";
import { requireAdmin } from "@/lib/auth/authorization";
import { createAdminClient } from "@/lib/supabase/admin";

export async function GET() {
    if (!(await requireAdmin()))
        return Response.json(
            { error: "Admin access required" },
            { status: 403 },
        );
    return Response.json(
        await db.select().from(agents).orderBy(desc(agents.createdAt)),
    );
}

export async function POST(request: Request) {
    const admin = await requireAdmin();
    if (!admin)
        return Response.json(
            { error: "Admin access required" },
            { status: 403 },
        );
    const body = await request.json();
    const email = String(body.email ?? "")
        .trim()
        .toLowerCase();
    const password = String(body.password ?? "");
    const fullName = String(body.fullName ?? "").trim();
    if (!email || !fullName || password.length < 8)
        return Response.json(
            { error: "Name, email, and an 8-character password are required" },
            { status: 400 },
        );
    const supabase = createAdminClient();
    const { data, error } = await supabase.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
        user_metadata: { full_name: fullName },
        app_metadata: { role: "agent" },
    });
    if (error) return Response.json({ error: error.message }, { status: 400 });
    try {
        const [created] = await db
            .insert(agents)
            .values({
                authUserId: data.user.id,
                createdByAdminId: admin.recordId,
                email,
                fullName,
                phone: body.phone ? String(body.phone) : null,
                role: "agent",
                status: "active",
                permissions: Array.isArray(body.permissions)
                    ? body.permissions.map(String)
                    : [],
            })
            .returning();
        return Response.json(created, { status: 201 });
    } catch (error) {
        await supabase.auth.admin.deleteUser(data.user.id);
        console.error(error);
        return Response.json(
            { error: "Unable to save agent authorization" },
            { status: 400 },
        );
    }
}
