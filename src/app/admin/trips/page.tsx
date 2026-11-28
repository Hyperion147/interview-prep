import { desc, eq, inArray } from "drizzle-orm";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import { AdminSkeleton } from "@/components/admin-skeleton";
import { db } from "@/db";
import { leads } from "@/db/schema/leads";
import { tripWorkflow } from "@/db/schema/trip-workflow";
import { canAccess } from "@/lib/auth/authorization";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CopyTripsLink, TripActions } from "@/components/trip-actions";

export default function TripsPage() {
    return (
        <main className="mx-auto max-w-6xl space-y-6 p-6 sm:p-8">
            <header>
                <h1 className="text-3xl font-semibold tracking-tight">Trips</h1>
                <p className="mt-1 text-sm text-muted-foreground">
                    Publish quotes, confirm supplier bookings, and track
                    payments.
                </p>
            </header>
            <Suspense
                fallback={
                    <AdminSkeleton
                        variant="cards"
                        embedded
                        label="Loading trips"
                    />
                }
            >
                <TripsContent />
            </Suspense>
        </main>
    );
}

async function TripsContent() {
    if (!(await canAccess("leads:write"))) redirect("/admin");
    const rows = await db
        .select({
            id: leads.id,
            name: leads.fullName,
            destination: leads.destination,
            email: leads.email,
            stage: tripWorkflow.stage,
            total: tripWorkflow.total,
            status: leads.status,
        })
        .from(leads)
        .leftJoin(tripWorkflow, eq(tripWorkflow.leadId, leads.id))
        .where(
            inArray(leads.status, [
                "new",
                "contacted",
                "qualified",
                "proposal_sent",
                "won",
            ]),
        )
        .orderBy(desc(leads.createdAt));
    const trips = rows.filter((row) => row.stage || row.status !== "won");
    return (
        <div className="grid gap-4 xl:grid-cols-2">
            {trips.map((row) => (
                <Card key={row.id}>
                    <CardHeader>
                        <div className="flex flex-wrap items-center justify-between gap-2">
                            <CardTitle>{row.destination}</CardTitle>
                            <Badge variant="secondary">
                                {row.stage ?? "Ready to quote"}
                            </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">
                            {row.name}
                            {row.total
                                ? ` · ₹${row.total.toLocaleString("en-IN")}`
                                : ""}
                        </p>
                    </CardHeader>
                    <CardContent>
                        {!row.stage &&
                            (row.email ? (
                                <TripActions id={row.id} action="propose" />
                            ) : (
                                <p className="text-sm">
                                    Add the customer’s email to the lead before
                                    publishing.
                                </p>
                            ))}
                        {row.stage === "proposed" && (
                            <div className="space-y-3">
                                <p className="text-sm text-muted-foreground">
                                    Awaiting customer approval in My trips.
                                </p>
                                <CopyTripsLink />
                            </div>
                        )}
                        {row.stage === "accepted" && (
                            <TripActions id={row.id} action="book" />
                        )}
                        {row.stage === "booked" && (
                            <TripActions id={row.id} action="pay" />
                        )}
                    </CardContent>
                </Card>
            ))}
            {!trips.length && (
                <p className="text-sm text-muted-foreground">
                    No open leads or trips yet.
                </p>
            )}
        </div>
    );
}
