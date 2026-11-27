"use client";

import { useState, useRef, Suspense } from "react";
import Image from "next/image";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { gsap } from "gsap";
import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { FaStar, FaArrowRight } from "react-icons/fa";
import Navbar from "@/components/pages/landing/navbar";
import { destinations } from "@/data/cities/destinations";

gsap.registerPlugin(ScrollTrigger);

const regions = [
    "All",
    "North India",
    "South India",
    "West & Central",
    "East & North East",
];

function DestinationsContent() {
    const container = useRef<HTMLDivElement>(null);
    const searchParams = useSearchParams();
    const [activeRegion, setActiveRegion] = useState(() => {
        const regionParam = searchParams.get("region");
        return regionParam && regions.includes(regionParam)
            ? regionParam
            : "All";
    });

    const filteredDestinations =
        activeRegion === "All"
            ? destinations
            : destinations.filter((d) => d.region === activeRegion);

    useGSAP(
        () => {
            // Grid Animation - Triggered on Filter Change
            gsap.fromTo(
                ".destination-card",
                { y: 20, autoAlpha: 0, scale: 0.98 },
                {
                    y: 0,
                    autoAlpha: 1,
                    scale: 1,
                    duration: 0.4,
                    stagger: 0.05,
                    ease: "power2.out",
                    overwrite: "auto",
                },
            );
        },
        { scope: container, dependencies: [activeRegion] },
    );

    return (
        <div
            ref={container}
            className="travel-home bg-background min-h-screen font-sans text-foreground selection:bg-primary selection:text-black"
        >
            <Navbar />

            {/* Hero / Header Section */}
            <section className="relative pt-40 pb-12 px-6 md:px-12 bg-[url('/grid-pattern.svg')] bg-fixed">
                <div className="absolute inset-0 bg-background/80 bg-gradient-to-b from-background/90 via-background/50 to-background/90"></div>
                <div className="relative z-10 max-w-7xl mx-auto text-center">
                    <h1 className="page-header text-5xl md:text-7xl font-bold mb-6 tracking-tight">
                        Explore <span className="text-primary">India</span>
                    </h1>
                    <p className="page-header text-xl md:text-2xl text-foreground/60 max-w-2xl mx-auto mb-12 font-light">
                        Discover the diverse landscapes, rich culture, and
                        timeless heritage of the subcontinent.
                    </p>

                    {/* Filter Tabs - Glassmorphic Pill Style */}
                    <div className="flex flex-wrap justify-center gap-2 mb-8 bg-secondary/30 backdrop-blur-md border border-white/10 p-2 rounded-full w-fit mx-auto shadow-lg">
                        {regions.map((region) => (
                            <button
                                key={region}
                                onClick={() => setActiveRegion(region)}
                                className={`filter-tab px-6 py-2 rounded-full text-sm font-medium transition-all duration-300 relative ${
                                    activeRegion === region
                                        ? "bg-primary text-black shadow-md"
                                        : "text-foreground/80 hover:text-foreground hover:bg-white/5"
                                }`}
                            >
                                {region}
                            </button>
                        ))}
                    </div>
                </div>
            </section>

            {/* Destinations Grid */}
            <section className="px-6 md:px-12 pb-32">
                <div className="max-w-8xl mx-auto">
                    <div className="destinations-grid grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                        {filteredDestinations.map((destination) => (
                            <Link
                                href={`/destinations/${destination.slug}`}
                                key={destination.slug}
                                className="destination-card group relative block h-[500px] w-full overflow-hidden rounded-lg bg-secondary/5 border border-white/5 hover:border-primary/30 transition-all duration-500 hover:shadow-2xl hover:shadow-primary/5 hover:-translate-y-2"
                            >
                                {/* Image Background */}
                                <div className="absolute inset-0 z-0 user-select-none">
                                    <Image
                                        src={destination.image}
                                        alt={destination.name}
                                        fill
                                        className="object-cover transition-transform duration-1000 group-hover:scale-110 opacity-90 group-hover:opacity-100"
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-black/90 opacity-80 transition-opacity duration-300 group-hover:opacity-90"></div>
                                </div>

                                {/* Content Overlay */}
                                <div className="absolute inset-0 z-10 flex flex-col justify-between p-8">
                                    <div className="flex justify-between items-start translate-y-[-20px] opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-500 ease-out">
                                        <span className="bg-white/10 backdrop-blur-md border border-white/20 text-white px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
                                            {destination.region}
                                        </span>
                                        <div className="flex items-center gap-1 text-accent-foreground drop-shadow-[0_2px_4px_rgba(0,0,0,1)]">
                                            <FaStar />
                                            <span className="font-bold">
                                                {destination.rating}
                                            </span>
                                        </div>
                                    </div>

                                    <div className="translate-y-4 group-hover:translate-y-0 transition-transform duration-500 ease-out">
                                        <h2 className="text-3xl font-bold text-white mb-2 leading-tight">
                                            {destination.name}
                                        </h2>
                                        <p className="text-white/80 line-clamp-2 mb-6 font-light text-sm">
                                            {destination.description}
                                        </p>

                                        <div className="flex items-center justify-between pt-6 border-t border-white/20">
                                            <div>
                                                <p className="text-xs text-white/60 uppercase tracking-wider mb-1">
                                                    Starts from
                                                </p>
                                                <p className="text-xl font-bold text-primary">
                                                    {destination.priceStart}
                                                </p>
                                            </div>
                                            <span className="w-10 h-10 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center text-white group-hover:bg-primary group-hover:text-black transition-colors duration-300">
                                                <FaArrowRight className="-rotate-45 group-hover:rotate-0 transition-transform duration-500" />
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>

                    {filteredDestinations.length === 0 && (
                        <div className="text-center py-20">
                            <p className="text-2xl text-foreground/50">
                                No destinations found in this region yet.
                            </p>
                        </div>
                    )}
                </div>
            </section>
        </div>
    );
}

export default function DestinationsIndex() {
    return (
        <Suspense fallback={<div className="min-h-screen bg-background" />}>
            <DestinationsContent />
        </Suspense>
    );
}
