import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export function AdminSkeleton({
    variant = "table",
    label,
    embedded = false,
}: {
    variant?: "overview" | "table" | "cards" | "detail";
    label: string;
    embedded?: boolean;
}) {
    return (
        <div
            role="status"
            className={
                embedded ? "" : "mx-auto max-w-[96rem] space-y-5 p-5 sm:p-7"
            }
        >
            <span className="sr-only">{label}</span>
            <div aria-hidden="true" className="space-y-5">
                {!embedded && (
                    <div className="flex items-center justify-between gap-4 py-2">
                        <div className="space-y-2">
                            <Skeleton className="h-7 w-36" />
                            <Skeleton className="h-4 w-44" />
                        </div>
                        <Skeleton className="h-9 w-20 sm:w-28" />
                    </div>
                )}
                {variant === "overview" && (
                    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                        {Array.from({ length: 4 }, (_, index) => (
                            <Card key={index} className="gap-3 p-5">
                                <Skeleton className="h-4 w-24" />
                                <Skeleton className="h-7 w-16" />
                                <Skeleton className="h-3 w-28" />
                            </Card>
                        ))}
                    </div>
                )}
                {variant === "cards" || variant === "detail" ? (
                    <div
                        className={
                            variant === "cards"
                                ? "grid gap-4 xl:grid-cols-2"
                                : "grid gap-4 lg:grid-cols-[2fr_1fr]"
                        }
                    >
                        {Array.from(
                            { length: variant === "cards" ? 4 : 2 },
                            (_, index) => (
                                <Card key={index} className="gap-4 p-5">
                                    <Skeleton className="h-5 w-32" />
                                    <Skeleton className="h-4 w-2/3" />
                                    <Skeleton className="h-24 w-full" />
                                    <Skeleton className="h-9 w-28" />
                                </Card>
                            ),
                        )}
                    </div>
                ) : (
                    <Card className="gap-0 overflow-hidden p-0">
                        <div className="flex gap-3 border-b p-4">
                            <Skeleton className="h-8 w-40" />
                            <Skeleton className="h-8 w-20" />
                        </div>
                        {Array.from({ length: 6 }, (_, index) => (
                            <div
                                key={index}
                                className="grid grid-cols-3 gap-4 border-b px-4 py-4 last:border-b-0 sm:grid-cols-4"
                            >
                                <Skeleton className="h-4 w-full max-w-36" />
                                <Skeleton className="h-4 w-full max-w-24" />
                                <Skeleton className="h-4 w-full max-w-20" />
                                <Skeleton className="hidden h-4 w-full max-w-28 sm:block" />
                            </div>
                        ))}
                    </Card>
                )}
            </div>
        </div>
    );
}
