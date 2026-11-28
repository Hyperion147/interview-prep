"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { db } from "@/db";
import { users } from "@/db/schema/auth";
import { createClient } from "@/lib/supabase/server";

function safeNext(value: FormDataEntryValue | null) {
    const next = String(value ?? "");
    return ["/", "/enquire", "/trips", "/portal"].includes(next)
        ? next
        : "/portal";
}

export async function signInWithGoogle(formData: FormData) {
    const origin = (await headers()).get("origin") ?? "http://localhost:3000";
    const supabase = await createClient();
    const callback = new URL("/auth/callback", origin);
    callback.searchParams.set("next", safeNext(formData.get("next")));
    const { data, error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: { redirectTo: callback.toString() },
    });
    if (error)
        redirect(`/auth/login?error=${encodeURIComponent(error.message)}`);
    if (data.url) redirect(data.url);
}

export async function signInCustomer(formData: FormData) {
    const supabase = await createClient();
    const { error } = await supabase.auth.signInWithPassword({
        email: String(formData.get("email") ?? "").trim().toLowerCase(),
        password: String(formData.get("password") ?? ""),
    });
    if (error)
        redirect(`/auth/login?error=${encodeURIComponent(error.message)}&next=${encodeURIComponent(safeNext(formData.get("next")))}`);
    redirect(safeNext(formData.get("next")));
}

export async function signUpCustomer(formData: FormData) {
    const fullName = String(formData.get("fullName") ?? "").trim();
    const email = String(formData.get("email") ?? "").trim().toLowerCase();
    const password = String(formData.get("password") ?? "");
    if (fullName.length < 2 || !email.includes("@") || password.length < 8)
        redirect("/auth/signup?error=Enter+a+name%2C+valid+email%2C+and+an+8-character+password");
    const origin = (await headers()).get("origin") ?? "http://localhost:3000";
    const callback = new URL("/auth/callback", origin);
    callback.searchParams.set("next", "/portal");
    const supabase = await createClient();
    const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { full_name: fullName }, emailRedirectTo: callback.toString() },
    });
    if (error) redirect(`/auth/signup?error=${encodeURIComponent(error.message)}`);
    if (data.user) {
        await db.insert(users).values({ id: data.user.id, email, fullName, role: "user" }).onConflictDoUpdate({ target: users.id, set: { email, fullName, updatedAt: new Date() } });
    }
    if (data.session) redirect("/portal");
    redirect(`/auth/login?notice=${encodeURIComponent("Check your email to confirm your account, then sign in.")}`);
}

export async function signInStaff(formData: FormData) {
    const supabase = await createClient();
    const { error } = await supabase.auth.signInWithPassword({
        email: String(formData.get("email") ?? ""),
        password: String(formData.get("password") ?? ""),
    });
    if (error)
        redirect(`/auth/login?audience=staff&error=${encodeURIComponent(error.message)}`);
    redirect("/admin");
}

export async function signOut() {
    const supabase = await createClient();
    await supabase.auth.signOut();
    redirect("/");
}
