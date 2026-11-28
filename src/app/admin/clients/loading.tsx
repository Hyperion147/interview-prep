import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
    return <main className="space-y-5 p-6"><Skeleton className="h-20 w-full" /><div className="grid gap-4 lg:grid-cols-[360px_1fr]"><Skeleton className="h-[620px]" /><Skeleton className="h-[620px]" /></div></main>;
}
