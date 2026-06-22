"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import { Search, SlidersHorizontal } from "lucide-react";
import { useRealtimePrice } from "@/lib/hooks/useRealtimePrice";
import Header from "@/components/landing/Header";
import Footer from "@/components/landing/Footer";
import TickerStrip from "@/components/markets/TickerStrip";
import TradingViewOverview from "@/components/markets/TradingViewOverview";
import CoinGeckoTable from "@/components/markets/CoinGeckoTable";
import Highlights from "@/components/markets/Highlights";
import { AssetClass } from "@/lib/market-data/types";

const CRYPTO_SYMBOLS = ["BTC", "ETH", "SOL", "BNB", "XRP", "DOGE", "ADA", "AVAX"];

export default function MarketsClient() {
  const searchParams = useSearchParams();
  const category = (searchParams.get("category") || "") as AssetClass | "";
  const view = searchParams.get("view") || "";
  const [searchQuery, setSearchQuery] = useState("");
  const { isConnected } = useRealtimePrice(CRYPTO_SYMBOLS);

  const isCoinGeckoView = category || view;

  return (
    <>
      <Header />
      <main className="min-h-screen bg-canvas text-primary">
        <TickerStrip />

        {/* Header */}
        <div className="border-b border-surface">
          <div className="max-w-7xl mx-auto px-4 sm:px-8 lg:px-16 py-5">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-3 mb-4">
              <div>
                <h1 className="text-xl md:text-2xl font-medium text-primary">
                  {category
                    ? { crypto: "Cryptomonnaies", forex: "Forex", indices: "Indices", commodities: "Matières premières", stocks: "Actions & ETFs", futures: "Futures" }[category] ?? "Marchés"
                    : view === "gainers"
                      ? "Top Gagnants 24h"
                      : view === "trending"
                        ? "Tendances"
                        : view === "new"
                          ? "Nouveaux actifs"
                          : "Marchés"
                  }
                </h1>
                <p className="text-secondary text-xs mt-0.5">
                  {isCoinGeckoView ? "Prix, capitalisation et variations en temps réel" : "Prix temps réel, indices, forex et cryptomonnaies"}
                </p>
              </div>
              <span className={`text-xs px-2 py-1 rounded-sm font-medium uppercase ${
                isConnected ? "bg-accent-subtle text-accent" : "bg-[#f59e0b]/10 text-[#f59e0b]"
              }`}>
                {isConnected ? "● LIVE" : "◌ OFFLINE"}
              </span>
            </div>

            <div className="flex flex-col md:flex-row gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-secondary" />
                <input
                  type="text"
                  placeholder="Rechercher un actif..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-card border border-surface rounded-sm pl-10 pr-4 py-2 text-sm text-primary placeholder-secondary focus:outline-none focus:border-accent transition"
                />
              </div>
              <button className="flex items-center gap-2 bg-card border border-surface rounded-sm px-3 py-2 text-sm text-secondary hover:text-primary transition">
                <SlidersHorizontal className="w-4 h-4" />
                Filtres
              </button>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-8 lg:px-16 py-6">
          {isCoinGeckoView ? (
            <div className="space-y-4">
              <Highlights />
              <CoinGeckoTable
                category={(category || "crypto") as AssetClass}
                view={view ? (view as "gainers" | "trending") : "default"}
              />
            </div>
          ) : (
            <TradingViewOverview />
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}
