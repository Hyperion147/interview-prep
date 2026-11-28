import { Suspense } from "react";
import Link from "next/link";
import { submitEnquiry } from "./actions";

async function Result({
    params,
}: {
    params: PageProps<"/enquire">["searchParams"];
}) {
    const { result } = await params;
    if (result === "sent")
        return (
            <p role="status">
                Your enquiry was received. Our travel team will follow up.
            </p>
        );
    if (result === "invalid")
        return (
            <p role="alert">
                Check your details and include the country code in your phone
                number.
            </p>
        );
    return null;
}

async function EnquiryForm({
    params,
}: {
    params: PageProps<"/enquire">["searchParams"];
}) {
    const { destination } = await params;
    return (
        <form
            action={submitEnquiry}
            className="grid gap-4 rounded-xl border bg-white p-5"
        >
            <label className="grid gap-1">
                Name
                <input
                    name="name"
                    required
                    maxLength={160}
                    className="rounded border p-2"
                />
            </label>
            <label className="grid gap-1">
                Phone with country code
                <input
                    name="phone"
                    type="tel"
                    placeholder="+919876543210"
                    required
                    maxLength={16}
                    className="rounded border p-2"
                />
            </label>
            <label className="grid gap-1">
                Destination or package
                <input
                    name="destination"
                    defaultValue={
                        typeof destination === "string"
                            ? destination.slice(0, 120)
                            : ""
                    }
                    required
                    maxLength={120}
                    className="rounded border p-2"
                />
            </label>
            <p className="text-sm text-slate-600">
                Sign in before sending your enquiry.
            </p>
            <Link
                href="/auth/login?next=/enquire"
                className="text-sm text-teal-700 underline"
            >
                Sign in
            </Link>
            <button className="rounded bg-teal-700 px-4 py-2 text-white">
                Send enquiry
            </button>
        </form>
    );
}

export default function EnquiryPage({ searchParams }: PageProps<"/enquire">) {
    return (
        <main className="mx-auto max-w-lg space-y-5 px-6 py-16">
            <Link href="/packages" className="text-teal-700 underline">
                Browse packages
            </Link>
            <h1 className="text-3xl font-bold">Plan your trip</h1>
            <Suspense fallback={<p>Loading enquiry form…</p>}>
                <Result params={searchParams} />
                <EnquiryForm params={searchParams} />
            </Suspense>
        </main>
    );
}
