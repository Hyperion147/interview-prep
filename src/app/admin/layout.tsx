import { Suspense } from "react";
import { redirect } from "next/navigation";
import { AdminSidebar } from "@/components/admin-sidebar";
import { getStaffIdentity } from "@/lib/auth/authorization";
import { hasSupabaseAuthConfig } from "@/lib/supabase/config";

export default async function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const configured = hasSupabaseAuthConfig();
    const identity = configured ? await getStaffIdentity() : null;
    if (configured && !identity) redirect("/auth/login");
    return (
        <div className="min-h-screen bg-slate-50">
            <Suspense
                fallback={
                    <div className="hidden lg:fixed lg:inset-y-0 lg:block lg:w-64 lg:bg-slate-950" />
                }
            >
                <AdminSidebar role={identity?.role ?? "admin"} />
            </Suspense>
            <div className="min-w-0 lg:ml-64">{children}</div>
        </div>
    );
}
