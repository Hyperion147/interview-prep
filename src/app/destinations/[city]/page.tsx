"use client";

import { use, useRef } from "react";
import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import {
    FaMapMarkerAlt,
    FaStar,
    FaArrowRight,
    FaCheckCircle,
} from "react-icons/fa";
import { getDestination } from "@/data/cities/destinations";
import Navbar from "@/components/pages/landing/navbar";

gsap.registerPlugin(ScrollTrigger);

export default function DestinationPage({
    params,
}: {
    params: Promise<{ city: string }>;
}) {
    const { city } = use(params);
    const destination = getDestination(city);
    const container = useRef<HTMLDivElement>(null);

    useGSAP(
        () => {
            const tl = gsap.timeline();

            // Hero Text Animation
            tl.from(".hero-text", {
                y: 50,
                opacity: 0,
                duration: 1,
                ease: "power3.out",
            }).from(
                ".hero-sub",
                {
                    y: 20,
                    opacity: 0,
                    duration: 0.8,
                    ease: "power2.out",
                },
                "-=0.6",
            );

            // Image Parallax / Scale
            gsap.from(".hero-image", {
                scale: 1.2,
                duration: 2,
                ease: "power2.out",
            });

            // Content Fade In
            gsap.from(".content-section", {
                y: 50,
                opacity: 0,
                duration: 1,
                stagger: 0.2,
                scrollTrigger: {
                    trigger: ".content-container",
                    start: "top 80%",
                },
            });

            // Attractions Stagger
            gsap.from(".attraction-card", {
                scale: 0.8,
                opacity: 0,
                duration: 0.6,
                stagger: 0.1,
                ease: "back.out(1.7)",
                scrollTrigger: {
                    trigger: ".attractions-grid",
                    start: "top 85%",
                },
            });
        },
        { scope: container },
    );

    if (!destination) {
        return notFound();
    }

    return (
        <div
            ref={container}
            className="travel-home bg-background min-h-screen font-sans text-foreground selection:bg-primary selection:text-black"
        >
            <Navbar />

            {/* Hero Section */}
            <section className="relative h-[70vh] w-full overflow-hidden flex items-center justify-center">
                <div className="absolute inset-0 z-0">
                    <Image
                        src={destination.image}
                        alt={destination.name}
                        fill
                        className="hero-image object-cover opacity-60"
                        priority
                    />
                    <div className="absolute inset-0 bg-gradient-to-b from-background/60 via-background/20 to-background" />
                </div>

                <div className="relative z-10 text-center px-4 max-w-4xl mx-auto mt-20">
                    <div className="hero-text inline-flex items-center gap-2 border border-foreground/20 bg-background/20 backdrop-blur-md px-4 py-1 rounded-sm mb-6">
                        <FaMapMarkerAlt className="text-primary" />
                        <span className="text-sm font-bold uppercase tracking-widest">
                            {destination.region}
                        </span>
                    </div>
                    <h1 className="hero-text text-5xl md:text-7xl lg:text-9xl font-bold uppercase tracking-tighter mb-4 text-shadow-lg">
                        {destination.name}
                    </h1>
                    <p className="hero-sub text-xl md:text-2xl text-foreground/90 max-w-2xl mx-auto font-light">
                        {destination.description}
                    </p>
                </div>
            </section>

            <main className="content-container max-w-7xl mx-auto px-6 md:px-12 py-12">
                {/* Info Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 mb-20">
                    {/* Main Content */}
                    <div className="content-section lg:col-span-8">
                        <h2 className="text-3xl font-bold mb-6 flex items-center gap-3">
                            About {destination.name}
                            <div className="h-px flex-1 bg-foreground/10 ml-4"></div>
                        </h2>
                        <p className="text-lg leading-relaxed text-foreground/70 mb-8">
                            {destination.longDescription}
                        </p>

                        <div className="flex flex-wrap gap-4 mb-8">
                            {destination.features.map((feat) => (
                                <span
                                    key={feat}
                                    className="px-4 py-2 bg-secondary/10 rounded-sm text-sm font-bold text-primary border border-primary/20 flex items-center gap-2"
                                >
                                    <FaCheckCircle className="text-xs" /> {feat}
                                </span>
                            ))}
                        </div>
                    </div>

                    {/* Sticky Sidebar / Booking Card */}
                    <div className="lg:col-span-4 relative">
                        <div className="content-section sticky top-24 bg-secondary/10 border border-foreground/5 backdrop-blur-sm p-8 rounded-sm">
                            <div className="flex justify-between items-start mb-6">
                                <div>
                                    <p className="text-xs text-foreground/50 font-bold uppercase tracking-wider mb-1">
                                        Starting From
                                    </p>
                                    <h3 className="text-4xl font-bold text-primary">
                                        {destination.priceStart}
                                    </h3>
                                </div>
                                <div className="flex items-center gap-1 bg-background/50 px-3 py-1 rounded-sm border border-foreground/5">
                                    <FaStar className="text-yellow-500 text-sm" />
                                    <span className="font-bold text-sm">
                                        {destination.rating}
                                    </span>
                                </div>
                            </div>

                            <p className="text-sm text-foreground/60 mb-8">
                                Experience the best of {destination.name} with
                                our curated packages designed for luxury and
                                comfort.
                            </p>

                            <Link
                                href="/auth/login"
                                className="w-full py-4 rounded-sm bg-primary text-accent-foreground font-bold hover:scale-105 active:scale-95 transition-all shadow-lg hover:shadow-primary/20 mb-4 flex items-center justify-center gap-2 group"
                            >
                                Book Now{" "}
                                <FaArrowRight className="group-hover:translate-x-1 transition-transform" />
                            </Link>

                            <p className="text-xs text-center text-foreground/30">
                                *Prices vary based on season and availability.
                            </p>
                        </div>
                    </div>
                </div>

                {/* Attractions Section */}
                <section className="mb-20">
                    <h2 className="content-section text-3xl font-bold mb-12 text-center">
                        Top Attractions in{" "}
                        <span className="text-primary">{destination.name}</span>
                    </h2>

                    <div className="attractions-grid grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {destination.attractions.map((attraction, i) => (
                            <div
                                key={i}
                                className="attraction-card aspect-square relative rounded-sm overflow-hidden group cursor-pointer border border-foreground/5"
                            >
                                <Image
                                    src={attraction.image}
                                    alt={attraction.name}
                                    fill
                                    className="object-cover transition-transform duration-700 group-hover:scale-110"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-80" />
                                <div className="absolute bottom-0 left-0 w-full p-6 translate-y-2 group-hover:translate-y-0 transition-transform duration-300">
                                    <h3 className="text-xl font-bold text-white mb-1">
                                        {attraction.name}
                                    </h3>
                                    <p className="text-xs text-white/60 uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity duration-300 delay-100">
                                        Explore
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>
            </main>

            {/* Footer / Next Steps could go here */}
            <footer className="py-12 border-t border-foreground/10 text-center">
                <Link
                    href="/packages"
                    className="text-foreground/50 hover:text-primary transition-colors text-sm font-mono tracking-widest uppercase"
                >
                    View All Packages
                </Link>
            </footer>
        </div>
    );
}
