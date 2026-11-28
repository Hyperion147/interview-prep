import type { Metadata } from "next";
import { Suspense } from "react";
import { Geist_Mono, Raleway } from "next/font/google";
import { TravelChatbot } from "@/components/travel-chatbot";
import { Toaster } from "@/components/ui/sonner";
import "./globals.css";

const raleway = Raleway({
  variable: "--font-raleway",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "TravelDesk",
  description: "Travel planning and operations platform",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${raleway.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full bg-slate-50">
        {children}
        <Toaster richColors position="top-right" />
        <Suspense fallback={null}>
          <TravelChatbot />
        </Suspense>
      </body>
    </html>
  );
}
