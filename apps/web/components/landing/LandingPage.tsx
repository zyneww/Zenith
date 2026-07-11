"use client";

import Header from "./Header";
import HomeMarketView from "@/components/home/HomeMarketView";
import Features from "./Features";
import CTAFinal from "./CTAFinal";
import Footer from "./Footer";

export default function LandingPage() {
  return (
    <div className="relative min-h-screen">
      <Header />
      <main>
        <HomeMarketView />
        <Features />
        <CTAFinal />
      </main>
      <Footer />
    </div>
  );
}
