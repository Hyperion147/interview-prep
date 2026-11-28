"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Navbar from "@/components/pages/landing/navbar";
import Footer from "@/components/global/Footer";
import { SelectField } from "@/components/ui/select-field";
import {
    FaHotel,
    FaMapMarkerAlt,
    FaStar,
    FaArrowRight,
    FaFilter,
} from "react-icons/fa";

gsap.registerPlugin(ScrollTrigger);

interface PublicPackage {
    id: string;
    name: string;
    locationLabel: string;
    region: string;
    state: string;
    imageUrl: string;
    price: string;
    durationDays: number;
    durationNights: number;
    hotel: string;
    rating: string;
    features: string[];
}

function isRecord(value: unknown): value is Record<string, unknown> {
    return typeof value === "object" && value !== null && !Array.isArray(value);
}

function parsePublicPackage(value: unknown): PublicPackage | null {
    if (!isRecord(value)) return null;
    const stringFields = [
        "id",
        "name",
        "locationLabel",
        "region",
        "state",
        "imageUrl",
        "price",
        "hotel",
        "rating",
    ] as const;
    if (stringFields.some((field) => typeof value[field] !== "string")) {
        return null;
    }
    if (
        typeof value.durationDays !== "number" ||
        typeof value.durationNights !== "number" ||
        !Array.isArray(value.features) ||
        !value.features.every((feature) => typeof feature === "string")
    ) {
        return null;
    }
    return value as unknown as PublicPackage;
}

export default function Packages() {
    const container = useRef<HTMLDivElement>(null);
    const [packagesData, setPackagesData] = useState<PublicPackage[]>([]);
    const [selectedRegion, setSelectedRegion] = useState("All Regions");
    const [selectedCity, setSelectedCity] = useState("All Cities");
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        const controller = new AbortController();
        fetch("/api/public/packages", {
            cache: "no-store",
            signal: controller.signal,
        })
            .then(async (response) => {
                const data: unknown = await response.json();
                if (!response.ok) {
                    const message =
                        isRecord(data) && typeof data.error === "string"
                            ? data.error
                            : "Unable to load packages";
                    throw new Error(message);
                }
                if (!Array.isArray(data)) {
                    throw new Error("The package response has an invalid format");
                }
                const parsed = data
                    .map(parsePublicPackage)
                    .filter((item): item is PublicPackage => item !== null);
                if (parsed.length !== data.length) {
                    throw new Error("Some package records have an invalid format");
                }
                setPackagesData(parsed);
            })
            .catch((cause) => {
                if (controller.signal.aborted) return;
                setError(
                    cause instanceof Error
                        ? cause.message
                        : "Unable to load packages",
                );
            })
            .finally(() => {
                if (!controller.signal.aborted) setLoading(false);
            });
        return () => controller.abort("Package list effect cleanup");
    }, []);

    const regions = useMemo(
        () => [
            "All Regions",
            ...Array.from(new Set(packagesData.map((pkg) => pkg.region))),
        ],
        [packagesData],
    );
    const cities = useMemo(
        () => [
            "All Cities",
            ...Array.from(new Set(packagesData.map((pkg) => pkg.state))),
        ],
        [packagesData],
    );
    const filteredPackages = useMemo(
        () =>
            packagesData.filter((pkg) => {
                const regionMatch =
                    selectedRegion === "All Regions" ||
                    pkg.region === selectedRegion;
                const cityMatch =
                    selectedCity === "All Cities" || pkg.state === selectedCity;
                return regionMatch && cityMatch;
            }),
        [packagesData, selectedRegion, selectedCity],
    );

    useGSAP(
        () => {
            gsap.timeline().from(".page-header-item", {
                y: 30,
                opacity: 0,
                duration: 1,
                stagger: 0.1,
                ease: "power3.out",
            });
            gsap.fromTo(
                ".package-card",
                { y: 20, opacity: 0 },
                {
                    y: 0,
                    opacity: 1,
                    duration: 0.4,
                    stagger: 0.05,
                    overwrite: "auto",
                    ease: "power2.out",
                },
            );
        },
        { scope: container, dependencies: [filteredPackages] },
    );

    return (
        <div
            ref={container}
            className="travel-home bg-background min-h-screen font-sans text-foreground selection:bg-primary selection:text-black flex flex-col"
        >
            <Navbar />
            <main className="flex-1 pt-32 pb-12 px-6 md:px-12 max-w-8xl mx-auto w-full">
                <header className="text-center flex flex-col items-center pb-12">
                    <div className="page-header-item inline-block border border-foreground/10 bg-foreground/5 backdrop-blur-md px-6 py-2 rounded-full mb-6">
                        <span className="text-primary text-xs font-bold uppercase tracking-[0.2em]">
                            Curated Experiences
                        </span>
                    </div>
                    <h1 className="page-header-item text-4xl md:text-6xl font-bold mb-6 tracking-tight">
                        Our Exclusive{" "}
                        <span className="text-primary italic font-serif">
                            Packages
                        </span>
                    </h1>
                    <p className="page-header-item text-foreground/60 max-w-2xl mx-auto text-lg leading-relaxed">
                        Discover our hand-picked collection of premium journeys
                        across India.
                    </p>
                </header>

                <div className="page-header-item flex flex-wrap justify-center gap-4 mb-12">
                    <div className="relative group">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-foreground/50">
                            <FaFilter />
                        </div>
                        <SelectField
                            value={selectedRegion}
                            onValueChange={(value) => {
                                setSelectedRegion(value);
                                setSelectedCity("All Cities");
                            }}
                            className="h-11 min-w-[200px] rounded-sm border-foreground/10 bg-foreground/5 pl-10 text-sm font-bold uppercase tracking-wider hover:bg-foreground/10"
                            options={regions.map((value)=>({value,label:value}))}
                        />
                    </div>
                    <div className="relative group">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-foreground/50">
                            <FaMapMarkerAlt />
                        </div>
                        <SelectField
                            value={selectedCity}
                            onValueChange={setSelectedCity}
                            className="h-11 min-w-[200px] rounded-sm border-foreground/10 bg-foreground/5 pl-10 text-sm font-bold uppercase tracking-wider hover:bg-foreground/10"
                            options={cities
                                .filter(
                                    (city) =>
                                        city === "All Cities" ||
                                        selectedRegion === "All Regions" ||
                                        packagesData.some(
                                            (pkg) =>
                                                pkg.state === city &&
                                                pkg.region === selectedRegion,
                                        ),
                                )
                                .map((value) => ({value,label:value}))}
                        />
                    </div>
                </div>

                {loading && (
                    <div className="py-20 text-center text-foreground/50">
                        Loading packages…
                    </div>
                )}
                {error && (
                    <div className="py-20 text-center text-red-400">
                        {error}
                    </div>
                )}
                {!loading && !error && (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        {filteredPackages.length > 0 ? (
                            filteredPackages.map((pkg) => (
                                <div
                                    key={pkg.id}
                                    className="package-card group w-full bg-background border border-foreground/10 rounded-sm overflow-hidden hover:border-primary/50 transition-all duration-300 flex flex-col md:flex-row h-auto md:h-[22rem]"
                                >
                                    <div className="relative w-full md:w-2/5 h-64 md:h-full overflow-hidden">
                                        <Image
                                            src={pkg.imageUrl}
                                            alt={pkg.name}
                                            fill
                                            className="object-cover transition-transform duration-700"
                                        />
                                        <div className="absolute inset-0 bg-black/10 group-hover:bg-black/0 transition-colors duration-500" />
                                        <div className="absolute top-4 left-4 bg-background/90 backdrop-blur-md px-3 py-1 rounded-sm text-xs font-bold flex items-center gap-1 shadow-sm">
                                            <FaStar className="text-primary" />{" "}
                                            {Number(pkg.rating).toFixed(1)}
                                        </div>
                                    </div>
                                    <div className="flex-1 p-8 flex flex-col justify-between">
                                        <div>
                                            <div className="flex justify-between items-start mb-2">
                                                <div className="flex items-center gap-2 text-primary text-xs font-bold uppercase tracking-wider">
                                                    <FaMapMarkerAlt />{" "}
                                                    {pkg.locationLabel}
                                                </div>
                                            </div>
                                            <h2 className="text-2xl font-bold mb-3 leading-tight group-hover:text-primary transition-colors duration-300">
                                                {pkg.name}
                                            </h2>
                                            <div className="flex items-center gap-3 text-foreground/70 text-sm mb-6 bg-foreground/5 w-fit px-3 py-1.5 rounded-sm">
                                                <FaHotel className="text-primary" />
                                                <span className="font-medium">
                                                    {pkg.hotel}
                                                </span>
                                            </div>
                                            <div className="grid grid-cols-2 gap-y-2 gap-x-4 mb-6">
                                                {pkg.features.map((feature) => (
                                                    <div
                                                        key={feature}
                                                        className="flex items-center gap-2 text-xs text-foreground/60"
                                                    >
                                                        <div className="w-1 h-1 rounded-full bg-primary" />
                                                        {feature}
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                        <div className="flex items-end justify-between border-t border-foreground/5 pt-6 mt-2">
                                            <div>
                                                <div className="text-xs text-foreground/40 mb-1 font-bold uppercase tracking-wider">
                                                    Starting Per/Person
                                                </div>
                                                <div className="text-2xl font-bold text-foreground">
                                                    ₹
                                                    {Number(
                                                        pkg.price,
                                                    ).toLocaleString("en-IN")}
                                                </div>
                                            </div>
                                            <div className="flex flex-col items-end gap-2">
                                                <div className="text-xs text-foreground/50 font-mono">
                                                    {pkg.durationDays} Days /{" "}
                                                    {pkg.durationNights} Nights
                                                </div>
                                                <Link
                                                    href={`/enquire?destination=${encodeURIComponent(pkg.name)}`}
                                                    className="px-6 py-3 rounded-sm bg-primary text-accent-foreground font-bold text-sm hover:brightness-110 active:scale-95 transition-all duration-300 flex items-center gap-2 group-hover:gap-3"
                                                >
                                                    Enquire{" "}
                                                    <FaArrowRight className="text-xs" />
                                                </Link>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="col-span-full py-20 text-center text-foreground/50">
                                <p className="text-xl">
                                    No packages found for the selected filters.
                                </p>
                                <button
                                    onClick={() => {
                                        setSelectedRegion("All Regions");
                                        setSelectedCity("All Cities");
                                    }}
                                    className="mt-4 text-accent underline"
                                >
                                    Clear Filters
                                </button>
                            </div>
                        )}
                    </div>
                )}
            </main>
            <Footer />
        </div>
    );
}
