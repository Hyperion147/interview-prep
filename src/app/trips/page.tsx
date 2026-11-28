import { Suspense } from "react";
import Link from "next/link";
import { and, ne, eq } from "drizzle-orm";
import { db } from "@/db";
import { leads } from "@/db/schema/leads";
import { tripWorkflow } from "@/db/schema/trip-workflow";
import { createClient } from "@/lib/supabase/server";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TripActions } from "@/components/trip-actions";
import { connection } from "next/server";

export const instant = false;

async function CustomerTrips() {
    await connection();
    const { data } = await (await createClient()).auth.getUser();
    if (!data.user?.email || !data.user.email_confirmed_at)
        return (
            <Link className="underline" href="/auth/login?next=/trips">
                Sign in to see your trips
            </Link>
        );
    const trips = await db
        .select({ trip: tripWorkflow, destination: leads.destination })
        .from(tripWorkflow)
        .innerJoin(leads, eq(leads.id, tripWorkflow.leadId))
        .where(
            and(
                ne(leads.status, "lost"),
                eq(tripWorkflow.customerEmail, data.user.email.toLowerCase()),
            ),
        );
    return trips.length ? (
        trips.map(({ trip, destination }) => (
            <Card key={trip.leadId}>
                <CardHeader>
                    <CardTitle>{destination}</CardTitle>
                    <Badge variant="secondary">{trip.stage}</Badge>
                </CardHeader>
                <CardContent className="space-y-4">
                    <p className="whitespace-pre-wrap break-words">
                        {trip.itinerary}
                    </p>
                    <p>
                        ₹{trip.total.toLocaleString("en-IN")} · Payment due{" "}
                        {trip.dueAt.toLocaleDateString("en-IN", {
                            timeZone: "Asia/Kolkata",
                        })}
                    </p>
                    {trip.stage === "proposed" && (
                        <TripActions id={trip.leadId} action="accept" />
                    )}
                </CardContent>
            </Card>
        ))
    ) : (
        <p>No proposals or bookings yet.</p>
    );
}

export default function TripsPage() {
    return (
        <main className="mx-auto max-w-3xl space-y-5 px-6 py-16">
            <Link href="/" className="underline">
                TravelDesk home
            </Link>
            <h1 className="text-3xl font-semibold">My trips</h1>
            <Suspense fallback={<p>Loading trips…</p>}>
                <CustomerTrips />
            </Suspense>
        </main>
    );
}
