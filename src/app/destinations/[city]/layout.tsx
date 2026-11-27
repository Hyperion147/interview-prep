import { Suspense } from "react";

export const instant = false;

export default function DestinationLayout({
    children,
}: Readonly<{ children: React.ReactNode }>) {
    return (
        <Suspense
            fallback={
                <div className="travel-home min-h-screen bg-background" />
            }
        >
            {children}
        </Suspense>
    );
}
