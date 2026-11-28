import { Suspense } from "react";
import { redirect } from "next/navigation";
import { AdminSidebar } from "@/components/admin-sidebar";
import { getStaffIdentity } from "@/lib/auth/authorization";
import { createClient } from "@/lib/supabase/server";
import { hasSupabaseAuthConfig } from "@/lib/supabase/config";
import { connection } from "next/server";

export const instant = false;

export default async function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const configured = hasSupabaseAuthConfig();
    if (configured) await connection();
    const identity = configured ? await getStaffIdentity() : null;
    if (configured && !identity) {
        // Distinguish signed-out visitors from customers who are signed in but
        // do not have a staff account, so they are not trapped on the staff
        // login screen.
        const { data } = await (await createClient()).auth.getUser();
        redirect(data.user ? "/portal" : "/auth/login?audience=staff");
    }
    return (
        <div className="crm-workspace min-h-screen bg-slate-50 lg:grid lg:grid-cols-[14rem_minmax(0,1fr)]">
            <Suspense
                fallback={
                    <div className="hidden border-r border-slate-200 bg-white lg:block" />
                }
            >
                <AdminSidebar role={identity?.role ?? "admin"} />
            </Suspense>
            <div className="min-w-0">{children}</div>
        </div>
    );
}
