"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { and, eq } from "drizzle-orm";
import { db } from "@/db";
import { admins, agents, users } from "@/db/schema/auth";
import { safeRedirectPath } from "@/lib/auth/redirects";
import { createClient } from "@/lib/supabase/server";

async function hasStaffAccess(authUserId: string) {
    const [admin] = await db
        .select({ id: admins.id })
        .from(admins)
        .where(
            and(
                eq(admins.authUserId, authUserId),
                eq(admins.isActive, true),
            ),
        )
        .limit(1);
    if (admin) return true;
    const [agent] = await db
        .select({ id: agents.id })
        .from(agents)
        .where(
            and(
                eq(agents.authUserId, authUserId),
                eq(agents.status, "active"),
            ),
        )
        .limit(1);
    return Boolean(agent);
}

export async function signInWithGoogle(formData: FormData) {
    const origin = (await headers()).get("origin") ?? "http://localhost:3000";
    const supabase = await createClient();
    const callback = new URL("/auth/callback", origin);
    callback.searchParams.set(
        "next",
        safeRedirectPath(formData.get("next"), "/portal"),
    );
    const { data, error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: { redirectTo: callback.toString() },
    });
    if (error)
        redirect(`/auth/login?error=${encodeURIComponent(error.message)}`);
    if (data.url) redirect(data.url);
    redirect(
        `/auth/login?error=${encodeURIComponent("Unable to start Google sign-in")}`,
    );
}

export async function signInCustomer(formData: FormData) {
    const requested = safeRedirectPath(formData.get("next"), "/portal");
    const supabase = await createClient();
    const { data, error } = await supabase.auth.signInWithPassword({
        email: String(formData.get("email") ?? "")
            .trim()
            .toLowerCase(),
        password: String(formData.get("password") ?? ""),
    });
    if (error)
        redirect(
            `/auth/login?error=${encodeURIComponent(error.message)}&next=${encodeURIComponent(requested)}`,
        );
    // A customer must never land in the staff workspace. Staff who happen to
    // use this form may still continue to the admin page they asked for.
    if (
        requested.startsWith("/admin") &&
        data.user &&
        !(await hasStaffAccess(data.user.id))
    )
        redirect("/portal");
    redirect(requested);
}

export async function signUpCustomer(formData: FormData) {
    const fullName = String(formData.get("fullName") ?? "").trim();
    const email = String(formData.get("email") ?? "")
        .trim()
        .toLowerCase();
    const password = String(formData.get("password") ?? "");
    if (fullName.length < 2 || !email.includes("@") || password.length < 8)
        redirect(
            "/auth/signup?error=Enter+a+name%2C+valid+email%2C+and+an+8-character+password",
        );
    const origin = (await headers()).get("origin") ?? "http://localhost:3000";
    const callback = new URL("/auth/callback", origin);
    callback.searchParams.set("next", "/portal");
    const supabase = await createClient();
    const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
            data: { full_name: fullName },
            emailRedirectTo: callback.toString(),
        },
    });
    if (error)
        redirect(`/auth/signup?error=${encodeURIComponent(error.message)}`);
    // Supabase returns a user with no identities when the email already exists
    // (to prevent account enumeration). Do not overwrite that account's profile.
    if (data.user && data.user.identities?.length === 0) {
        redirect(
            `/auth/login?notice=${encodeURIComponent("If an account already exists for this email, sign in instead.")}`,
        );
    }
    if (data.user) {
        await db
            .insert(users)
            .values({ id: data.user.id, email, fullName, role: "user" })
            .onConflictDoUpdate({
                target: users.id,
                set: { email, fullName, updatedAt: new Date() },
            });
    }
    if (data.session) redirect("/portal");
    redirect(
        `/auth/login?notice=${encodeURIComponent("Check your email to confirm your account, then sign in.")}`,
    );
}

export async function signInStaff(formData: FormData) {
    const requested = safeRedirectPath(formData.get("next"), "/admin");
    const next = requested.startsWith("/admin") ? requested : "/admin";
    const supabase = await createClient();
    const { data, error } = await supabase.auth.signInWithPassword({
        email: String(formData.get("email") ?? "")
            .trim()
            .toLowerCase(),
        password: String(formData.get("password") ?? ""),
    });
    if (error)
        redirect(
            `/auth/login?audience=staff&error=${encodeURIComponent(error.message)}&next=${encodeURIComponent(next)}`,
        );
    if (!data.user || !(await hasStaffAccess(data.user.id))) {
        await supabase.auth.signOut();
        redirect(
            `/auth/login?audience=staff&error=${encodeURIComponent("This account does not have staff access.")}`,
        );
    }
    redirect(next);
}

export async function signOut() {
    const supabase = await createClient();
    await supabase.auth.signOut();
    redirect("/");
}
