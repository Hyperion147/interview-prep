"use client";

import { type FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

type Action = "propose" | "accept" | "book" | "pay";
const labels = {
    propose: "Publish proposal",
    accept: "Accept proposal",
    book: "Confirm booking",
    pay: "Record full payment",
};
const success = {
    propose: "Proposal published",
    accept: "Proposal accepted",
    book: "Booking confirmed",
    pay: "Payment recorded",
};

export function CopyTripsLink() {
    return (
        <Button
            type="button"
            variant="outline"
            onClick={async () => {
                try {
                    await navigator.clipboard.writeText(
                        new URL("/trips", window.location.origin).href,
                    );
                    toast.success("Customer portal link copied");
                } catch {
                    toast.error(
                        "Could not copy the link. Share the My trips page directly.",
                    );
                }
            }}
        >
            Copy customer portal link
        </Button>
    );
}

export function TripActions({ id, action }: { id: string; action: Action }) {
    const router = useRouter();
    const [busy, setBusy] = useState(false);
    async function submit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        const form = new FormData(event.currentTarget);
        const due = form.get("dueAt");
        setBusy(true);
        const toastId = toast.loading("Updating trip…");
        try {
            const response = await fetch("/api/trips", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    id,
                    action,
                    itinerary: form.get("itinerary"),
                    total: form.get("total"),
                    dueAt:
                        typeof due === "string" && due
                            ? `${due}T23:59:59+05:30`
                            : undefined,
                }),
            });
            const data = await response.json();
            if (!response.ok) throw new Error(data.error);
            toast.success(success[action], { id: toastId });
            router.refresh();
        } catch (error) {
            toast.error(
                error instanceof Error
                    ? error.message
                    : "Could not update trip.",
                { id: toastId },
            );
        } finally {
            setBusy(false);
        }
    }
    return (
        <form onSubmit={submit} className="grid gap-3">
            {action === "propose" && (
                <>
                    <Label className="grid gap-2">
                        Itinerary and terms
                        <Textarea name="itinerary" required maxLength={6000} />
                    </Label>
                    <div className="grid gap-3 sm:grid-cols-2">
                        <Label className="grid gap-2">
                            Total (INR)
                            <Input
                                name="total"
                                type="number"
                                min={1}
                                max={1000000000}
                                required
                            />
                        </Label>
                        <Label className="grid gap-2">
                            Payment due (India time)
                            <Input name="dueAt" type="date" required />
                        </Label>
                    </div>
                </>
            )}
            <Button type="submit" disabled={busy} className="w-fit">
                {labels[action]}
            </Button>
        </form>
    );
}
