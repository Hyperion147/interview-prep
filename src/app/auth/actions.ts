"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export async function signInWithGoogle(formData: FormData) {
    const origin = (await headers()).get("origin") ?? "http://localhost:3000";
    const supabase = await createClient();
    const callback = new URL("/auth/callback", origin);
    const next = formData.get("next");
    callback.searchParams.set("next", next === "/enquire" || next === "/trips" ? next : "/");
    const { data, error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: { redirectTo: callback.toString() },
    });
    if (error)
        redirect(`/auth/login?error=${encodeURIComponent(error.message)}`);
    if (data.url) redirect(data.url);
}

export async function signInStaff(formData: FormData) {
    const supabase = await createClient();
    const { error } = await supabase.auth.signInWithPassword({
        email: String(formData.get("email") ?? ""),
        password: String(formData.get("password") ?? ""),
    });
    if (error)
        redirect(`/auth/login?error=${encodeURIComponent(error.message)}`);
    redirect("/admin");
}

export async function signOut() {
    const supabase = await createClient();
    await supabase.auth.signOut();
    redirect("/auth/login");
}
