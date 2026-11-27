"use client";
import { useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { FaAngleLeft, FaAngleRight } from "react-icons/fa";

const Carousel = () => {
    const [currentIndex, setCurrentIndex] = useState(0);
    const containerRef = useRef<HTMLDivElement>(null);

    const destinations = [
        {
            title: "Majestic North",
            image: "https://images.unsplash.com/photo-1629184950099-3eb7993b5f48?q=80&w=800",
            desc: "Experience the snow-capped peaks and spiritual serenity of the Himalayas.",
            location: "North India",
        },
        {
            title: "Tropical South",
            image: "https://images.unsplash.com/photo-1593693397690-362cb9666fc2?q=80&w=800",
            desc: "Relax in the tranquil backwaters and ancient temples of the south.",
            location: "South India",
        },
        {
            title: "Vibrant West",
            image: "https://images.unsplash.com/photo-1592385692039-e8ff4c6b7a66?q=80&w=800",
            desc: "Discover the royal heritage, vast deserts, and festive colors.",
            location: "West India",
        },
        {
            title: "Mystical East",
            image: "https://images.unsplash.com/photo-1648305244775-bc196ae1be85?q=80&w=800",
            desc: "Explore the untouched beauty, tea gardens, and living root bridges.",
            location: "East India",
        },
        {
            title: "Thrissur Pooram",
            image: "https://images.unsplash.com/photo-1558971499-9b0683596aa2?q=80&w=800",
            desc: "A spectacular temple festival featuring elephants and traditional percussion.",
            location: "South India",
        },
        {
            title: "Taj Mahal",
            image: "https://images.unsplash.com/photo-1564507592333-c60657eea523?q=80&w=800",
            desc: "An immense mausoleum of white marble, the jewel of Muslim art in India.",
            location: "Agra",
        },
        {
            title: "Konark Sun Temple",
            image: "https://images.unsplash.com/photo-1677211352662-30e7775c7ce8?q=80&w=800",
            desc: "A 13th-century CE sun temple known for its Kalinga architecture.",
            location: "Odisha",
        },
        {
            title: "Hampi",
            image: "https://images.unsplash.com/photo-1651073231492-169afcf84f36?q=80&w=800",
            desc: "A UNESCO World Heritage Site featuring the ruins of the Vijayanagara Empire.",
            location: "Karnataka",
        },
        {
            title: "Khajuraho",
            image: "https://images.unsplash.com/photo-1606298855672-3efb63017be8?q=80&w=800",
            desc: "Famous for its nagara-style architectural symbolism and erotic sculptures.",
            location: "Madhya Pradesh",
        },
        {
            title: "Meenakshi Temple",
            image: "https://images.unsplash.com/photo-1692173248120-59547c3d4653?q=80&w=800",
            desc: "A historic Hindu temple located on the southern bank of the Vaigai River.",
            location: "Madurai",
        },
        {
            title: "Durga Puja",
            image: "https://images.unsplash.com/photo-1603689200436-b212c976c011?q=80&w=800",
            desc: "A grand celebration of art, culture, and the goddess of power.",
            location: "Kolkata",
        },
        {
            title: "Thar Desert",
            image: "https://images.unsplash.com/photo-1715264500941-27bf30bf46eb?q=80&w=800",
            desc: "Experience the vast golden sands and camel safaris of Rajasthan.",
            location: "Rajasthan",
        },
        {
            title: "Udaipur Palace",
            image: "https://images.unsplash.com/photo-1706961121527-4017856774c7?q=80&w=800",
            desc: "The City of Lakes featuring the magnificent City Palace.",
            location: "Udaipur",
        },
        {
            title: "Goa Sunsets",
            image: "https://images.unsplash.com/photo-1706806326312-836000df9e1b?q=80&w=800",
            desc: "Relax by the shore and watch the sun dip below the horizon.",
            location: "Goa",
        },
    ];

    const nextSlide = () => {
        setCurrentIndex((prev) => (prev + 1) % destinations.length);
    };

    const prevSlide = () => {
        setCurrentIndex(
            (prev) => (prev - 1 + destinations.length) % destinations.length,
        );
    };

    return (
        <div
            ref={containerRef}
            className="w-full max-w-[1920px] mx-auto py-20 px-6 md:px-16 overflow-hidden"
        >
            {/* Header */}
            <div className="flex flex-row md:flex-col md:items-end justify-between mb-8 gap-6 w-full px-2 px:4">
                <div className="flex flex-col">
                    <h2 className="text-2xl md:text-6xl font-bold uppercase tracking-tighter text-foreground mb-0 md:mb-4">
                        Destinations
                    </h2>
                    <div className="w-16 md:w-24 h-1 bg-primary"></div>
                </div>
                <Link
                    href="/destinations"
                    className="px-2 md:px-4 py-2 md:py-3 rounded-sm border border-foreground/10 text-foreground text-sm font-bold uppercase tracking-widest hover:bg-primary hover:text-black hover:border-primary transition-all duration-300 md:mb-2"
                >
                    View All
                </Link>
            </div>

            {/* 3-Item Focused Carousel */}
            <div className="relative w-full h-[500px] md:h-[600px] flex items-center justify-center perspective-1000">
                {destinations.map((dest, i) => {
                    const total = destinations.length;
                    // Calculate shortest effective distance (circular)
                    let diff = (i - currentIndex) % total;
                    if (diff > total / 2) diff -= total;
                    if (diff < -total / 2) diff += total;

                    // Determine position state
                    const isActive = diff === 0;
                    const isLeft = diff === -1;
                    const isRight = diff === 1;
                    // Base transform styles
                    let transformClass = "translate-x-0 scale-50 opacity-0 z-0"; // Hidden default

                    if (isActive) {
                        transformClass =
                            "translate-x-0 scale-100 opacity-100 z-30";
                    } else if (isLeft) {
                        transformClass =
                            "-translate-x-[15%] md:-translate-x-[60%] scale-[0.9] md:scale-[0.8] opacity-60 z-20 hover:opacity-80";
                    } else if (isRight) {
                        transformClass =
                            "translate-x-[15%] md:translate-x-[60%] scale-[0.9] md:scale-[0.8] opacity-60 z-20 hover:opacity-80";
                        // Handle buffer items for smooth wrap-around entrance/exit - keep them just off-screen
                    } else if (diff > 1) {
                        transformClass =
                            "translate-x-[200%] md:translate-x-[120%] scale-[0.5] opacity-0 z-10";
                    } else if (diff < -1) {
                        transformClass =
                            "-translate-x-[200%] md:-translate-x-[120%] scale-[0.5] opacity-0 z-10";
                    }

                    return (
                        <div
                            key={i}
                            className={`absolute w-[85%] md:w-[60%] h-full transition-all duration-700 ease-[cubic-bezier(0.25,1,0.5,1)] cursor-pointer ${transformClass}`}
                            onClick={() => {
                                if (isLeft) prevSlide();
                                if (isRight) nextSlide();
                            }}
                        >
                            <div className="relative w-full h-full overflow-hidden bg-secondary border border-foreground/10 rounded-sm shadow-2xl">
                                <Image
                                    src={dest.image}
                                    alt={dest.title}
                                    fill
                                    className="object-cover"
                                />
                                <div
                                    className={`absolute inset-0 bg-black/40 transition-opacity duration-500 ${
                                        isActive ? "bg-transparent" : ""
                                    }`}
                                ></div>

                                {/* Content - Only show full content on active slide */}
                                <div
                                    className={`absolute bottom-0 left-0 p-6 md:p-12 w-full transition-all duration-500 transform ${
                                        isActive
                                            ? "opacity-100 translate-y-0"
                                            : "opacity-0 translate-y-4"
                                    }`}
                                >
                                    <div className="bg-background/80 backdrop-blur-sm p-4 md:p-6 rounded-sm border border-white/10 shadow-lg max-w-lg">
                                        <span className="text-primary font-mono text-xs tracking-widest uppercase mb-2 block">
                                            {dest.location}
                                        </span>
                                        <h3 className="text-2xl md:text-4xl font-bold text-foreground mb-2">
                                            {dest.title}
                                        </h3>
                                        <p className="text-foreground/70 text-sm md:text-base">
                                            {dest.desc}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Controls */}
            <div className="flex justify-center mt-12 gap-4">
                <button
                    onClick={prevSlide}
                    className="w-12 h-12 flex items-center rounded-sm justify-center bg-transparent border border-foreground/20 text-foreground hover:bg-primary hover:text-background hover:border-primary transition-all duration-300 group"
                >
                    <span className="text-xl group-hover:-translate-x-px transition-transform">
                        <FaAngleLeft />
                    </span>
                </button>
                <button
                    onClick={nextSlide}
                    className="w-12 h-12 flex items-center rounded-sm justify-center bg-transparent border border-foreground/20 text-foreground hover:bg-primary hover:text-background hover:border-primary transition-all duration-300 group"
                >
                    <span className="text-xl group-hover:translate-x-px transition-transform">
                        <FaAngleRight />
                    </span>
                </button>
            </div>
        </div>
    );
};

export default Carousel;
