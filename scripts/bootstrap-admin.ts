import "dotenv/config";
import { createClient } from "@supabase/supabase-js";
import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import { admins } from "../src/db/schema/auth";

const {
    NEXT_PUBLIC_SUPABASE_URL: url,
    SUPABASE_SERVICE_ROLE_KEY: key,
    ADMIN_EMAIL: email,
    ADMIN_PASSWORD: password,
} = process.env;
if (!url || !key || !email || !password)
    throw new Error(
        "Set NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, ADMIN_EMAIL, and ADMIN_PASSWORD",
    );

async function bootstrap() {
    const supabase = createClient(url!, key!, {
        auth: { persistSession: false, autoRefreshToken: false },
    });
    const pool = new Pool({ connectionString: process.env.DATABASE_URL });
    const db = drizzle(pool);
    try {
        const { data, error } = await supabase.auth.admin.createUser({
            email: email!,
            password: password!,
            email_confirm: true,
            app_metadata: { role: "admin" },
        });
        if (error) throw error;
        await db
            .insert(admins)
            .values({
                authUserId: data.user.id,
                email: email!,
                fullName: String(
                    data.user.user_metadata.full_name ?? "Travel Admin",
                ),
                role: "admin",
            })
            .onConflictDoUpdate({
                target: admins.email,
                set: {
                    authUserId: data.user.id,
                    isActive: true,
                    updatedAt: new Date(),
                },
            });
        console.log(`Bootstrapped admin ${email}.`);
    } finally {
        await pool.end();
    }
}
bootstrap().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
