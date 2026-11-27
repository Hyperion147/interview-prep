"use client";

import { useRef } from "react";
import Image from "next/image";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Navbar from "@/components/pages/landing/navbar";
import Footer from "@/components/global/Footer";
import { FaGlobeAmericas, FaUsers, FaAward, FaLeaf } from "react-icons/fa";

gsap.registerPlugin(ScrollTrigger);

export default function About() {
  const container = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const tl = gsap.timeline();

      // Header Animation
      tl.from(".about-header", {
        y: 50,
        opacity: 0,
        duration: 1,
        stagger: 0.15,
        ease: "power3.out",
      });

      // Image Reveal
      gsap.from(".about-hero-img", {
        scale: 1.1,
        opacity: 0,
        duration: 1.5,
        ease: "power2.out",
        delay: 0.5,
      });

      // Stats Stagger
      gsap.from(".stat-card", {
        y: 50,
        opacity: 0,
        duration: 0.8,
        stagger: 0.1,
        ease: "power2.out",
        scrollTrigger: {
          trigger: ".stats-grid",
          start: "top 80%",
        },
      });

      // Team/Values Stagger
      gsap.from(".value-card", {
        y: 30,
        opacity: 0,
        duration: 0.8,
        stagger: 0.1,
        ease: "power2.out",
        scrollTrigger: {
          trigger: ".values-grid",
          start: "top 80%",
        },
      });
    },
    { scope: container }
  );

  return (
    <div
      ref={container}
      className="travel-home bg-background min-h-screen font-sans text-foreground selection:bg-primary selection:text-black"
    >
      <Navbar />

      <main className="pt-32 pb-20 px-6 md:px-12 max-w-7xl mx-auto">
        {/* Header Section */}
        <header className="text-center mb-20 max-w-4xl mx-auto">
          <div className="about-header inline-block border border-foreground/10 bg-white/5 backdrop-blur-md px-6 py-2 rounded-sm mb-6">
            <span className="text-primary text-xs font-bold uppercase tracking-[0.2em]">
              Our Story
            </span>
          </div>
          <h1 className="about-header text-5xl md:text-7xl font-bold mb-8 tracking-tight leading-tight">
            We are{" "}
            <span className="text-primary/80 italic font-serif">Travel</span>.{" "}
            <br />
            Redefining Exploration.
          </h1>
          <p className="about-header text-lg md:text-xl text-foreground/60 leading-relaxed font-light">
            Founded on the belief that travel is the only thing you buy that
            makes you richer. We curate experiences that go beyond
            sightseeing—immersing you in the culture, heart, and soul of every
            destination.
          </p>
        </header>

        {/* Hero Image */}
        <div className="relative w-full h-[60vh] rounded-sm overflow-hidden mb-24 border border-foreground/5 shadow-2xl">
          <Image
            src="https://images.unsplash.com/photo-1529156069898-49953e39b3ac?q=80&w=1600"
            alt="Travel Team"
            fill
            className="about-hero-img object-cover hidden md:block" // hiding on small screens if needed or keeping
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-transparent to-transparent" />
          <div className="absolute bottom-12 left-12 max-w-lg hidden md:block">
            <blockquote className="text-2xl font-serif italic text-white/90">
              &ldquo;To travel is to live.&rdquo;
            </blockquote>
            <cite className="text-white/60 not-italic mt-2 block text-sm tracking-widest uppercase">
              — Hans Christian Andersen
            </cite>
          </div>
        </div>

        {/* Stats Grid */}
        <section className="stats-grid grid grid-cols-2 md:grid-cols-4 gap-8 mb-32 border-y border-foreground/10 py-12">
          {[
            { label: "Destinations", value: "50+", icon: FaGlobeAmericas },
            { label: "Happy Travelers", value: "10k+", icon: FaUsers },
            { label: "Awards Won", value: "25", icon: FaAward },
            { label: "Eco Partners", value: "100%", icon: FaLeaf },
          ].map((stat, i) => (
            <div key={i} className="stat-card text-center group">
              <stat.icon className="mx-auto text-3xl text-primary mb-4 opacity-80 group-hover:scale-110 transition-transform duration-300" />
              <div className="text-4xl md:text-5xl font-bold mb-2 group-hover:text-primary transition-colors">
                {stat.value}
              </div>
              <div className="text-xs font-bold uppercase tracking-widest text-foreground/40">
                {stat.label}
              </div>
            </div>
          ))}
        </section>

        {/* Mission / Values Section */}
        <section className="mb-20">
          <div className="flex flex-col md:flex-row justify-between md:items-end mb-8 md:mb-12">
            <h2 className="text-xl md:text-4xl font-bold max-w-md leading-tight">
              Guided by our <span className="text-primary">Core Values</span>
            </h2>
            <p className="text-foreground/50 max-w-sm text-left mt-4 md:mt-0">
              Every trip we plan is rooted in these fundamental principles.
            </p>
          </div>

          <div className="values-grid grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                title: "Authenticity",
                desc: "We skip the tourist traps to show you the real deal.",
              },
              {
                title: "Sustainability",
                desc: "We prioritize eco-friendly stays and local communities.",
              },
              {
                title: "Excellence",
                desc: "24/7 support and premium service, always.",
              },
            ].map((val, i) => (
              <div
                key={i}
                className="value-card p-8 rounded-sm bg-secondary/10 border border-foreground/5 hover:bg-secondary/20 transition-colors"
              >
                <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center mb-6 text-primary font-bold">
                  0{i + 1}
                </div>
                <h3 className="text-xl font-bold mb-3">{val.title}</h3>
                <p className="text-foreground/60 leading-relaxed">{val.desc}</p>
              </div>
            ))}
          </div>
        </section>
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
}

