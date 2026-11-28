"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { FaAngleRight, FaArrowRight } from "react-icons/fa6";

type NavbarProps = {
    accountHref?: string;
    accountLabel?: string;
};

const Navbar = ({
    accountHref = "/auth/login",
    accountLabel = "Sign In",
}: NavbarProps) => {
    const [isDestinationsOpen, setIsDestinationsOpen] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [isScrolled, setIsScrolled] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 20);
        };
        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    const navLinks = [
        { name: "Destinations", href: "" },
        { name: "Packages", href: "/packages" },
        { name: "My portal", href: "/portal" },
        { name: "About", href: "/about" },
        { name: "Contact", href: "/#cta" },
    ];

    /* ... regions ... */

    const regions = [
        {
            name: "North India",
            cities: [
                "Jammu & Kashmir",
                "Himachal Pradesh",
                "Punjab",
                "Uttarakhand",
                "Ladakh",
            ],
        },
        {
            name: "South India",
            cities: [
                "Kerala",
                "Tamil Nadu",
                "Karnataka",
                "Telangana",
                "Andhra Pradesh",
            ],
        },
        {
            name: "West & Central",
            cities: [
                "Goa",
                "Rajasthan",
                "Gujarat",
                "Maharashtra",
                "Madhya Pradesh",
            ],
        },
        {
            name: "East & North East",
            cities: [
                "West Bengal",
                "Sikkim",
                "Meghalaya",
                "Assam",
                "Arunachal Pradesh",
            ],
        },
    ];

    // Prevent scrolling when mobile menu is open
    useEffect(() => {
        if (isMobileMenuOpen) {
            document.body.style.overflow = "hidden";
        } else {
            document.body.style.overflow = "auto";
        }
    }, [isMobileMenuOpen]);

    return (
        <>
            <nav
                className={`fixed top-0 left-0 w-full z-50 flex items-center justify-between px-6 pt-4 md:px-24 pb-4 transition-all duration-300 ${
                    isScrolled || isDestinationsOpen || isMobileMenuOpen
                        ? "bg-background/80 backdrop-blur-md shadow-sm border-b border-foreground/5 pt-4"
                        : "bg-transparent pt-4"
                }`}
                onMouseLeave={() => setIsDestinationsOpen(false)}
            >
                {/* Left: Logo */}
                <Link
                    className={`text-2xl font-bold tracking-tighter transition-colors duration-300 z-50 relative ${
                        isDestinationsOpen || isMobileMenuOpen
                            ? "text-primary"
                            : "text-foreground"
                    }`}
                    href="/"
                >
                    Travel.
                </Link>

                {/* Right: Navigation & CTA (Desktop) */}
                <div
                    className={`hidden md:flex items-center gap-8 px-6 pl-12 py-2 rounded-sm transition-all duration-300 ${
                        isDestinationsOpen
                            ? "bg-transparent text-primary"
                            : "bg-background/80 backdrop-blur-sm text-primary"
                    }`}
                >
                    <ul className="flex items-center gap-8">
                        {navLinks.map((link) => (
                            <li
                                key={link.name}
                                onMouseEnter={() =>
                                    link.name === "Destinations" &&
                                    setIsDestinationsOpen(true)
                                }
                            >
                                <Link
                                    href={link.href}
                                    className={`text-sm font-medium transition-colors relative group ${
                                        isDestinationsOpen
                                            ? "text-primary hover:text-foreground"
                                            : "text-primary"
                                    }`}
                                >
                                    {link.name}
                                    <span
                                        className={`absolute -bottom-1 left-0 w-0 h-[2px] transition-all duration-300 group-hover:w-3/4 ${
                                            isDestinationsOpen
                                                ? "bg-foreground"
                                                : "bg-background"
                                        }`}
                                    ></span>
                                </Link>
                            </li>
                        ))}
                    </ul>

                    <Link
                        href={accountHref}
                        className={`px-6 py-2 rounded-sm text-sm font-bold transition-all duration-300 inline-block ${
                            isDestinationsOpen
                                ? "bg-primary text-accent-foreground hover:shadow-[0_0_5px_rgba(255,248,212,0.8)]"
                                : "bg-foreground text-background hover:bg-primary"
                        }`}
                    >
                        {accountLabel}
                    </Link>
                </div>

                {/* Mobile Menu Toggle */}
                <button
                    className="md:hidden text-foreground z-50 relative p-2"
                    onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                >
                    <div className="w-6 h-5 flex flex-col justify-between">
                        <span
                            className={`w-full h-0.5 bg-current transition-all duration-300 ${
                                isMobileMenuOpen
                                    ? "rotate-45 translate-y-2.5"
                                    : ""
                            }`}
                        />
                        <span
                            className={`w-full h-0.5 bg-current transition-all duration-300 ${
                                isMobileMenuOpen ? "opacity-0" : ""
                            }`}
                        />
                        <span
                            className={`w-full h-0.5 bg-current transition-all duration-300 ${
                                isMobileMenuOpen
                                    ? "-rotate-45 -translate-y-2"
                                    : ""
                            }`}
                        />
                    </div>
                </button>
            </nav>

            {/* Mobile Menu Overlay */}
            <div
                className={`fixed inset-0 bg-background z-40 transition-all duration-500 flex flex-col items-center justify-center gap-8 md:hidden ${
                    isMobileMenuOpen
                        ? "opacity-100 pointer-events-auto"
                        : "opacity-0 pointer-events-none"
                }`}
            >
                <div className="w-full max-h-[80vh] overflow-y-auto px-6">
                    <ul className="flex flex-col items-center gap-6 text-center w-full">
                        {navLinks.map((link) => (
                            <li key={link.name} className="w-full">
                                {link.name === "Destinations" ? (
                                    <div className="flex flex-col items-center w-full">
                                        <button
                                            onClick={() =>
                                                setIsDestinationsOpen(
                                                    !isDestinationsOpen,
                                                )
                                            }
                                            className="text-3xl font-bold text-foreground hover:text-primary transition-colors flex items-center gap-2"
                                        >
                                            {link.name}
                                            <span
                                                className={`text-sm transition-transform duration-300 ${
                                                    isDestinationsOpen
                                                        ? "rotate-180"
                                                        : ""
                                                }`}
                                            >
                                                ▼
                                            </span>
                                        </button>
                                        {/* Cloud/Mobile Dropdown */}
                                        <div
                                            className={`overflow-hidden transition-all duration-500 w-full ${
                                                isDestinationsOpen
                                                    ? "max-h-[1000px] opacity-100 mt-4"
                                                    : "max-h-0 opacity-0"
                                            }`}
                                        >
                                            <div className="grid grid-cols-2 gap-4 pb-4 text-left">
                                                {regions.map((region) => (
                                                    <Link
                                                        key={region.name}
                                                        href={`/destinations?region=${encodeURIComponent(
                                                            region.name,
                                                        )}`}
                                                        className="flex flex-col gap-2 p-3 rounded-sm bg-secondary/5 border border-foreground/5 hover:bg-primary/10 transition-colors group"
                                                        onClick={() => {
                                                            setIsMobileMenuOpen(
                                                                false,
                                                            );
                                                            setIsDestinationsOpen(
                                                                false,
                                                            );
                                                        }}
                                                    >
                                                        <h4 className="text-foreground text-sm font-bold uppercase tracking-wider group-hover:text-primary transition-colors">
                                                            {region.name}
                                                        </h4>
                                                        <span className="text-xs text-foreground/50 group-hover:text-primary/80">
                                                            Explore &rarr;
                                                        </span>
                                                    </Link>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                ) : (
                                    <Link
                                        href={link.href}
                                        className="text-3xl font-bold text-foreground hover:text-primary transition-colors"
                                        onClick={() =>
                                            setIsMobileMenuOpen(false)
                                        }
                                    >
                                        {link.name}
                                    </Link>
                                )}
                            </li>
                        ))}
                    </ul>
                    <div className="mt-8 flex justify-center w-full">
                        <Link
                            href={accountHref}
                            onClick={() => setIsMobileMenuOpen(false)}
                            className="px-8 py-3 rounded-sm text-lg font-bold bg-primary text-accent-foreground hover:shadow-[0_0_10px_rgba(255,248,212,0.8)] transition-all"
                        >
                            {accountLabel}
                        </Link>
                    </div>
                </div>
            </div>

            {/* Mega Menu Dropdown (Desktop) */}
            <div
                className={`fixed top-0 left-0 w-full min-h-[50vh] bg-background/95 backdrop-blur-3xl z-40 transition-all duration-500 cubic-bezier(0.4, 0, 0.2, 1) overflow-hidden hidden md:block border-b border-white/10 shadow-2xl ${
                    isDestinationsOpen
                        ? "translate-y-0 opacity-100 visible"
                        : "-translate-y-4 opacity-0 invisible"
                }`}
                onMouseEnter={() => setIsDestinationsOpen(true)}
                onMouseLeave={() => setIsDestinationsOpen(false)}
            >
                <div className="h-full w-full flex items-start justify-center pt-28 pb-12">
                    <div className="max-w-7xl w-full px-6">
                        <div className="grid grid-cols-4 gap-12">
                            {regions.map((region, i) => (
                                <div
                                    key={region.name}
                                    className={`space-y-6 ${
                                        i !== regions.length - 1
                                            ? "border-r border-white/5 pr-8"
                                            : ""
                                    }`}
                                >
                                    <h3 className="text-primary text-sm font-bold uppercase tracking-[0.2em] flex items-center gap-2">
                                        <span className="w-8 h-[1px] bg-primary/50"></span>
                                        {region.name}
                                    </h3>
                                    <div className="flex flex-col gap-3">
                                        {region.cities.map((city) => (
                                            <Link
                                                href={`/destinations/${city
                                                    .toLowerCase()
                                                    .replace(/ & /g, "-")
                                                    .replace(/ /g, "-")}`}
                                                key={city}
                                                className="group flex items-center justify-between text-xl text-foreground/80 hover:text-foreground font-light transition-all duration-300"
                                            >
                                                <span>{city}</span>
                                                <span className="opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300 text-primary">
                                                    <FaAngleRight className="w-3 h-3" />
                                                </span>
                                            </Link>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                        {/* Featured Image/Promo Area - Optional addition for "wow" factor */}
                        <div className="mt-12 w-full h-[1px] bg-gradient-to-r from-transparent via-white/10 to-transparent"></div>
                        <div className="mt-8 flex justify-center">
                            <Link
                                href="/destinations"
                                className="text-sm text-muted-foreground hover:text-primary transition-colors flex items-center gap-2 group"
                            >
                                Explore all destinations
                                <span className="group-hover:translate-x-1 transition-transform">
                                    <FaArrowRight className="w-3 h-3" />
                                </span>
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default Navbar;
