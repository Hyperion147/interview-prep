import { Skeleton } from "@/components/ui/skeleton";
export default function Loading(){return <main className="mx-auto max-w-6xl space-y-6 px-5 py-10"><Skeleton className="h-28"/><div className="grid gap-5 lg:grid-cols-3"><Skeleton className="h-60 lg:col-span-2"/><Skeleton className="h-60"/></div><Skeleton className="h-72"/></main>}
