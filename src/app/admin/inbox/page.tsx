import { Suspense } from "react";
import { AdminSkeleton } from "@/components/admin-skeleton";
import { InboxWorkspace } from "./inbox-workspace";

export default function InboxPage() {
    return <main className="h-[calc(100dvh-0px)] min-h-[700px] overflow-hidden bg-white">
        <Suspense fallback={<AdminSkeleton variant="cards" label="Loading inbox" />}>
            <InboxWorkspace />
        </Suspense>
    </main>;
}
