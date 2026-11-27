import "server-only";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { admins, agents } from "@/db/schema/auth";
import { hasSupabaseAuthConfig } from "@/lib/supabase/config";
import { createClient } from "@/lib/supabase/server";

export type StaffIdentity = {
    authUserId: string;
    role: "admin" | "agent";
    recordId: string;
    permissions: string[];
};

export async function getStaffIdentity(): Promise<StaffIdentity | null> {
    if (!hasSupabaseAuthConfig()) return null;
    const supabase = await createClient();
    const { data } = await supabase.auth.getUser();
    if (!data.user) return null;
    const [admin] = await db
        .select()
        .from(admins)
        .where(eq(admins.authUserId, data.user.id))
        .limit(1);
    if (admin?.isActive)
        return {
            authUserId: data.user.id,
            role: "admin",
            recordId: admin.id,
            permissions: ["*"],
        };
    const [agent] = await db
        .select()
        .from(agents)
        .where(eq(agents.authUserId, data.user.id))
        .limit(1);
    if (agent?.status === "active")
        return {
            authUserId: data.user.id,
            role: "agent",
            recordId: agent.id,
            permissions: agent.permissions,
        };
    return null;
}

export async function requireAdmin() {
    const identity = await getStaffIdentity();
    if (identity?.role !== "admin") return null;
    return identity;
}

export async function canAccess(permission: string) {
    if (!hasSupabaseAuthConfig()) return process.env.NODE_ENV !== "production";
    const identity = await getStaffIdentity();
    return Boolean(
        identity &&
        (identity.role === "admin" ||
            identity.permissions.includes(permission)),
    );
}
