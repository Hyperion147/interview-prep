import { NextResponse } from "next/server";
import { db } from "@/db";
import { users } from "@/db/schema/auth";
import { safeRedirectPath } from "@/lib/auth/redirects";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: Request) {
    const url = new URL(request.url);
    const code = url.searchParams.get("code");
    const destination = url.searchParams.get("next");
    const next = safeRedirectPath(destination, "/");
    if (!code)
        return NextResponse.redirect(
            new URL("/auth/login?error=Missing+OAuth+code", url.origin),
        );
    const supabase = await createClient();
    const { data, error } = await supabase.auth.exchangeCodeForSession(code);
    if (error || !data.user.email)
        return NextResponse.redirect(
            new URL(
                `/auth/login?error=${encodeURIComponent(error?.message ?? "No email returned")}`,
                url.origin,
            ),
        );
    await db
        .insert(users)
        .values({
            id: data.user.id,
            email: data.user.email,
            fullName: String(
                data.user.user_metadata.full_name ??
                    data.user.user_metadata.name ??
                    "",
            ),
            avatarUrl: data.user.user_metadata.avatar_url
                ? String(data.user.user_metadata.avatar_url)
                : null,
            role: "user",
        })
        .onConflictDoUpdate({
            target: users.id,
            set: {
                email: data.user.email,
                fullName: String(
                    data.user.user_metadata.full_name ??
                        data.user.user_metadata.name ??
                        "",
                ),
                avatarUrl: data.user.user_metadata.avatar_url
                    ? String(data.user.user_metadata.avatar_url)
                    : null,
                updatedAt: new Date(),
            },
        });
    return NextResponse.redirect(new URL(next, url.origin));
}
