import type { ComponentProps } from "react";
import { cn } from "@/lib/utils";

export function Skeleton({ className, ...props }: ComponentProps<"div">) {
    return <div className={cn("rounded-md bg-slate-200/80 motion-safe:animate-pulse", className)} {...props} />;
}
