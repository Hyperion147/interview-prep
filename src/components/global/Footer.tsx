"use client";

import Link from "next/link";
import {
    FaFacebookF,
    FaTwitter,
    FaInstagram,
    FaLinkedinIn,
    FaEnvelope,
    FaPhone,
    FaMapMarkerAlt,
} from "react-icons/fa";

export default function Footer() {
    return (
        <footer className="bg-primary text-white/80 border-t border-white/10 font-sans">
            <div className="max-w-7xl mx-auto px-6 py-16 md:px-12">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">
                    {/* Brand Column */}
                    <div className="space-y-6">
                        <Link
                            href="/"
                            className="text-2xl font-bold tracking-tighter text-white"
                        >
                            Travel.
                        </Link>
                        <p className="text-sm leading-relaxed text-white/60">
                            Curating exceptional journeys across India. We
                            believe in travel that transforms, connects, and
                            inspires.
                        </p>
                        <div className="flex gap-4">
                            {[
                                FaFacebookF,
                                FaTwitter,
                                FaInstagram,
                                FaLinkedinIn,
                            ].map((Icon, i) => (
                                <a
                                    key={i}
                                    href="#"
                                    className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center hover:bg-foreground transition-colors duration-300"
                                >
                                    <Icon size={14} />
                                </a>
                            ))}
                        </div>
                    </div>

                    {/* Quick Links */}
                    <div>
                        <h4 className="text-white font-bold uppercase tracking-wider mb-6 text-sm">
                            Explore
                        </h4>
                        <ul className="space-y-4 text-sm">
                            {[
                                {
                                    label: "Destinations",
                                    href: "/destinations",
                                },
                                { label: "Packages", href: "/packages" },
                                { label: "About Us", href: "/about" },
                                { label: "Travel Guide", href: "/blog" },
                            ].map((link) => (
                                <li key={link.label}>
                                    <Link
                                        href={link.href}
                                        className="hover:text-foreground transition-colors flex items-center gap-2 group"
                                    >
                                        <span className="w-1 h-1 bg-white/30 rounded-full group-hover:bg-primary transition-colors" />
                                        {link.label}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Legal */}
                    <div>
                        <h4 className="text-white font-bold uppercase tracking-wider mb-6 text-sm">
                            Legal
                        </h4>
                        <ul className="space-y-4 text-sm">
                            {[
                                { label: "Privacy Policy", href: "/privacy" },
                                { label: "Terms of Service", href: "/terms" },
                                { label: "Cookie Policy", href: "/cookies" },
                                {
                                    label: "Cancellation Policy",
                                    href: "/cancellation",
                                },
                            ].map((link) => (
                                <li key={link.label}>
                                    <Link
                                        href={link.href}
                                        className="hover:text-foreground transition-colors"
                                    >
                                        {link.label}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Contact */}
                    <div>
                        <h4 className="text-white font-bold uppercase tracking-wider mb-6 text-sm">
                            Contact Us
                        </h4>
                        <ul className="space-y-6 text-sm">
                            <li className="flex items-start gap-4">
                                <FaMapMarkerAlt className="text-primary mt-1 shrink-0" />
                                <span>
                                    123 Heritage Lane,
                                    <br />
                                    Connaught Place, New Delhi,
                                    <br />
                                    India - 110001
                                </span>
                            </li>
                            <li className="flex items-center gap-4">
                                <FaPhone className="text-primary shrink-0" />
                                <a
                                    href="tel:+919876543210"
                                    className="hover:text-foreground"
                                >
                                    +91 987 654 3210
                                </a>
                            </li>
                            <li className="flex items-center gap-4">
                                <FaEnvelope className="text-primary shrink-0" />
                                <a href="#" className="hover:text-foreground">
                                    hello@travel.com
                                </a>
                            </li>
                        </ul>
                    </div>
                </div>

                {/* Bottom Bar */}
                <div className="pt-8 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-white/40">
                    <p>&copy; 2026 Travel. All rights reserved.</p>
                    <div className="flex gap-8">
                        <a
                            href="#"
                            className="hover:text-white transition-colors"
                        >
                            Sitemap
                        </a>
                        <a
                            href="#"
                            className="hover:text-white transition-colors"
                        >
                            Credits
                        </a>
                    </div>
                </div>
            </div>
        </footer>
    );
}
