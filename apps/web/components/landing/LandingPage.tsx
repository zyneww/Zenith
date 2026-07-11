"use client";

import Header from "./Header";
import Hero from "./Hero";
import MarketCategories from "./MarketCategories";
import TrendingAssets from "./TrendingAssets";
import HomeMarketView from "@/components/home/HomeMarketView";
import Features from "./Features";
import CTAFinal from "./CTAFinal";
import Footer from "./Footer";

export default function LandingPage() {
  return (
    <div className="relative min-h-screen">
      <Header />
      <main>
        <Hero />
        <MarketCategories />
        <TrendingAssets />
        <HomeMarketView />
        <Features />
        <CTAFinal />
      </main>
      <Footer />
    </div>
  );
}
