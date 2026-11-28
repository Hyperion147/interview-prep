"use client";

import { useRef, useState, useEffect } from "react";
import Image from "next/image";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Navbar from "./navbar";
import Carousel from "./carousel";
import Cta from "./cta";
import Footer from "@/components/global/Footer";
import Link from "next/link";

gsap.registerPlugin(ScrollTrigger);

const heroImages = [
    "https://images.unsplash.com/photo-1564507592333-c60657eea523?q=80&w=1920",
    "https://images.unsplash.com/photo-1677211352662-30e7775c7ce8?q=80&w=1920",
    "https://images.unsplash.com/photo-1651073231492-169afcf84f36?q=80&w=1920",
    "https://images.unsplash.com/photo-1606298855672-3efb63017be8?q=80&w=1920",
    "https://images.unsplash.com/photo-1707893013488-51672ef83425?q=80&w=1920",
    "https://images.unsplash.com/photo-1658406991919-b5ec4b6adb3f?q=80&w=1920",
    "https://images.unsplash.com/photo-1729922141827-ba9163bfb884?q=80&w=1920",
];

export default function Hero({
    accountHref,
    accountLabel,
}: {
    accountHref?: string;
    accountLabel?: string;
}) {
    const container = useRef<HTMLDivElement>(null);

    const [currentHeroIndex, setCurrentHeroIndex] = useState(0);
    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentHeroIndex((prev) => (prev + 1) % heroImages.length);
        }, 4000);
        return () => clearInterval(interval);
    }, []);

    useGSAP(
        () => {
            // Grid Lines Animation
            gsap.from(".grid-line", {
                attr: { d: "M 50 0 Q 50 50 50 100" }, // Start as straight center line
                x: 0, // For the center line itself (if needed, though standardizing on path morph/attr is safer for the curves)
                duration: 2,
                ease: "power3.out",
                stagger: 0.1, // Ripple effect from center
            });

            // Special handling for the center line element to just fade/scale if it's not a path
            gsap.from("line.grid-line", {
                scaleY: 0,
                transformOrigin: "center",
                duration: 1.5,
                ease: "power3.out",
            });

            // Hero Animation
            gsap.from(".hero-text-char", {
                y: 100,
                opacity: 0,
                duration: 1,
                stagger: 0.02,
                ease: "power4.out",
                delay: 0.5,
            });

            gsap.from(".hero-sub", {
                y: 20,
                opacity: 0,
                duration: 1,
                delay: 1.2,
                ease: "power2.out",
            });

            gsap.to(".hero-btn", {
                scale: 1,
                opacity: 1,
                duration: 0.5,
                delay: 1.5,
                ease: "power2.out",
            });
        },
        { scope: container },
    );

    return (
        <div
            ref={container}
            className="travel-home bg-background min-h-screen font-sans text-foreground overflow-x-hidden selection:bg-primary selection:text-black"
        >
            <Navbar accountHref={accountHref} accountLabel={accountLabel} />

            <main className="grid grid-cols-1 divide-y divide-foreground/10 w-full relative">
                {/* Hero Section */}
                <section className="relative min-h-dvh w-full flex flex-col justify-center items-center text-center px-4 overflow-hidden pt-20">
                    <div className="absolute inset-0 z-0">
                        {/* Carousel Images */}
                        {heroImages.map((src, index) => (
                            <Image
                                key={src}
                                src={src}
                                alt={`Hero Background ${index + 1}`}
                                fill
                                className={`object-cover transition-opacity duration-1000 ease-in-out ${
                                    index === currentHeroIndex
                                        ? "opacity-60"
                                        : "opacity-0"
                                }`}
                                priority={index === 0}
                            />
                        ))}
                        <div className="absolute inset-0 bg-linear-to-b from-background/30 via-transparent to-background"></div>

                        {/* Globe/Grid Lines Overlay */}
                        <div className="absolute inset-0 w-full h-full pointer-events-none z-10 opacity-20">
                            <svg
                                className="w-full h-full max-w-8xl mx-auto"
                                viewBox="0 0 100 100"
                                preserveAspectRatio="none"
                                fill="none"
                                xmlns="http://www.w3.org/2000/svg"
                            >
                                {/* Left Pair 4 (Outer) */}
                                <path
                                    className="grid-line hidden md:block"
                                    d="M 5 0 Q -10 50 5 100"
                                    stroke="black"
                                    strokeWidth="2"
                                    strokeOpacity="0.6"
                                    vectorEffect="non-scaling-stroke"
                                />

                                {/* Left Pair 3 */}
                                <path
                                    className="grid-line"
                                    d="M 16 0 Q 8 50 16 100"
                                    stroke="black"
                                    strokeWidth="2"
                                    strokeOpacity="0.6"
                                    vectorEffect="non-scaling-stroke"
                                />

                                {/* Left Pair 2 */}
                                <path
                                    className="grid-line"
                                    d="M 27 0 Q 22 50 27 100"
                                    stroke="black"
                                    strokeWidth="2"
                                    strokeOpacity="0.6"
                                    vectorEffect="non-scaling-stroke"
                                />

                                {/* Left Pair 1 (Inner) */}
                                <path
                                    className="grid-line"
                                    d="M 39 0 Q 36 50 39 100"
                                    stroke="black"
                                    strokeWidth="2"
                                    strokeOpacity="0.6"
                                    vectorEffect="non-scaling-stroke"
                                />

                                {/* Center - Straight */}
                                <line
                                    className="grid-line"
                                    x1="50"
                                    y1="0"
                                    x2="50"
                                    y2="100"
                                    stroke="black"
                                    strokeWidth="2"
                                    strokeOpacity="0.6"
                                    vectorEffect="non-scaling-stroke"
                                />

                                {/* Right Pair 1 (Inner) */}
                                <path
                                    className="grid-line"
                                    d="M 61 0 Q 64 50 61 100"
                                    stroke="black"
                                    strokeWidth="2"
                                    strokeOpacity="0.6"
                                    vectorEffect="non-scaling-stroke"
                                />

                                {/* Right Pair 2 */}
                                <path
                                    className="grid-line"
                                    d="M 73 0 Q 78 50 73 100"
                                    stroke="black"
                                    strokeWidth="2"
                                    strokeOpacity="0.6"
                                    vectorEffect="non-scaling-stroke"
                                />

                                {/* Right Pair 3 */}
                                <path
                                    className="grid-line"
                                    d="M 84 0 Q 92 50 84 100"
                                    stroke="black"
                                    strokeWidth="2"
                                    strokeOpacity="0.6"
                                    vectorEffect="non-scaling-stroke"
                                />

                                {/* Right Pair 4 (Outer) */}
                                <path
                                    className="grid-line hidden md:block"
                                    d="M 95 0 Q 110 50 95 100"
                                    stroke="black"
                                    strokeWidth="2"
                                    strokeOpacity="0.6"
                                    vectorEffect="non-scaling-stroke"
                                />
                            </svg>
                        </div>
                    </div>

                    <div className="relative z-10 flex flex-col items-center max-md:px-4">
                        <div className="border border-foreground/10 bg-background/60 backdrop-blur-3xl px-4 py-2 md:px-6 rounded-full mb-6">
                            <span className="text-foreground text-[10px] md:text-xs font-bold uppercase tracking-[0.2em]">
                                Explore India
                            </span>
                        </div>
                        <h1 className="text-5xl md:text-6xl lg:text-9xl font-bold uppercase tracking-tighter mb-4 overflow-hidden mix-blend-overlay opacity-90 max-w-full leading-[0.85] md:leading-tight flex flex-col md:block items-center justify-center">
                            <span className="inline-block">
                                {"Explore".split("").map((char, i) => (
                                    <span
                                        key={`explore-${i}`}
                                        className="hero-text-char inline-block"
                                    >
                                        {char}
                                    </span>
                                ))}
                            </span>
                            <span className="hidden md:inline-block">
                                &nbsp;
                            </span>
                            <span className="inline-block">
                                {"the Unseen".split("").map((char, i) => (
                                    <span
                                        key={`unseen-${i}`}
                                        className="hero-text-char inline-block"
                                    >
                                        {char === " " ? "\u00A0" : char}
                                    </span>
                                ))}
                            </span>
                        </h1>
                        <p className="hero-sub text-base md:text-xl text-foreground/80 max-w-lg mb-8 tracking-wide px-4">
                            Journey beyond the map. Discover places that tell a
                            story.
                        </p>
                        <Link href="/auth/login">
                            <button className="hero-btn mt-4 px-6 md:px-8 py-3 md:py-4 border border-foreground/20 backdrop-blur-sm text-base md:text-lg font-bold uppercase tracking-wider rounded-sm hover:scale-105 hover:bg-primary hover:text-background hover:border-primary transition-all duration-300 scale-90 opacity-0 bg-background/20">
                                Start Your Trip
                            </button>
                        </Link>
                    </div>
                </section>

                <Carousel />

                <Cta />

                <Footer />
            </main>
        </div>
    );
}
