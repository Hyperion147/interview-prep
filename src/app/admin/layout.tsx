import { Suspense } from "react";
import { redirect } from "next/navigation";
import { AdminSidebar } from "@/components/admin-sidebar";
import { getStaffIdentity } from "@/lib/auth/authorization";
import { hasSupabaseAuthConfig } from "@/lib/supabase/config";

export const instant = false;

export default async function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const configured = hasSupabaseAuthConfig();
    const identity = configured ? await getStaffIdentity() : null;
    if (configured && !identity) redirect("/auth/login");
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
