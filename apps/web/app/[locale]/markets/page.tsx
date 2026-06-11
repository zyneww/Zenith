"use client";

import { useState } from "react";
import { Search, SlidersHorizontal } from "lucide-react";
import { useRealtimePrice } from "@/lib/hooks/useRealtimePrice";
import Header from "@/components/landing/Header";
import Footer from "@/components/landing/Footer";
import TickerStrip from "@/components/markets/TickerStrip";
import MarketSummary from "@/components/markets/MarketSummary";
import AssetSection from "@/components/markets/AssetSection";
import CommunityCarousel from "@/components/markets/CommunityCarousel";
import BrokerGrid from "@/components/markets/BrokerGrid";
import { Landmark, TrendingUp, DollarSign, BarChart3, Wheat, Globe } from "lucide-react";

export default function MarketsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const symbols = ["BTC", "ETH", "SOL", "BNB", "XRP", "DOGE", "ADA", "AVAX"];
  const { isConnected } = useRealtimePrice(symbols);

  return (
    <>
      <Header />
      <main className="min-h-screen bg-[#0b0e14] text-white">
        {/* Ticker Strip */}
        <TickerStrip />

        {/* Header */}
        <div className="border-b border-[#1a1f2e]">
          <div className="max-w-7xl mx-auto px-4 sm:px-8 lg:px-16 py-6">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-6">
              <div>
                <h1 className="text-2xl md:text-3xl font-bold text-white">Marchés</h1>
                <p className="text-[#7a8498] text-sm mt-1">
                  Prix temps réel, indices, forex et cryptomonnaies
                </p>
              </div>
              <div className="flex items-center gap-2">
                <span className={`text-xs px-2 py-1 rounded-full font-bold uppercase ${isConnected ? "bg-[#00d26a]/10 text-[#00d26a]" : "bg-[#f59e0b]/10 text-[#f59e0b]"}`}>
                  {isConnected ? "● LIVE" : "◌ OFFLINE"}
                </span>
              </div>
            </div>

            {/* Search and filters */}
            <div className="flex flex-col md:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#7a8498]" />
                <input
                  type="text"
                  placeholder="Rechercher un actif (ex: BTC, EUR/USD, S&P 500)..."
                  aria-label="Rechercher un actif"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-[#131722] border border-[#1a1f2e] rounded-lg pl-10 pr-4 py-2.5 text-sm text-white placeholder-[#7a8498] focus:outline-none focus:border-[#00e5ff] transition"
                />
              </div>
              <button className="flex items-center gap-2 bg-[#131722] border border-[#1a1f2e] rounded-lg px-4 py-2.5 text-sm text-[#7a8498] hover:text-white transition">
                <SlidersHorizontal className="w-4 h-4" />
                Filtres
              </button>
            </div>
          </div>
        </div>

        {/* Market Summary */}
        <div className="max-w-7xl mx-auto px-4 sm:px-8 lg:px-16 py-6">
          <div className="mb-4">
            <h2 className="text-lg font-semibold text-white">Aperçu des marchés</h2>
            <p className="text-xs text-[#7a8498]">Indices, crypto et forex en temps réel</p>
          </div>
          <MarketSummary />
        </div>

        {/* Asset Sections Grid */}
        <div className="max-w-7xl mx-auto px-4 sm:px-8 lg:px-16 py-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Crypto */}
            <AssetSection
              title="Cryptomonnaies"
              assetClass="crypto"
              limit={6}
              icon={<TrendingUp className="w-4 h-4 text-[#00e5ff]" />}
              link="/markets/cryptocurrencies"
              linkLabel="Top 100"
            />

            {/* Forex */}
            <AssetSection
              title="Forex"
              assetClass="forex"
              symbols={["EUR/USD", "GBP/USD", "USD/JPY", "USD/CHF", "AUD/USD", "USD/CAD", "EUR/GBP"]}
              limit={6}
              icon={<DollarSign className="w-4 h-4 text-[#00e5ff]" />}
              link="/markets/currencies"
              linkLabel="Toutes les paires"
            />

            {/* Indices */}
            <AssetSection
              title="Indices"
              assetClass="indices"
              symbols={["^GSPC", "^IXIC", "^DJI", "^FCHI", "^GDAXI", "^FTSE", "^N225", "^HSI"]}
              limit={6}
              icon={<BarChart3 className="w-4 h-4 text-[#00e5ff]" />}
              link="/markets/indices"
              linkLabel="Tous les indices"
            />

            {/* Commodities */}
            <AssetSection
              title="Matières premières"
              assetClass="commodities"
              symbols={["CL=F", "GC=F", "SI=F", "NG=F", "HG=F", "ZW=F", "ZC=F", "ZS=F"]}
              limit={6}
              icon={<Wheat className="w-4 h-4 text-[#00e5ff]" />}
              link="/markets/commodities"
              linkLabel="Tous les produits"
            />

            {/* Futures */}
            <AssetSection
              title="Futures"
              assetClass="futures"
              symbols={["ES=F", "NQ=F", "YM=F", "GCF", "CLF"]}
              limit={5}
              icon={<Globe className="w-4 h-4 text-[#00e5ff]" />}
              link="/markets/futures"
              linkLabel="Tous les futures"
            />

            {/* Stocks placeholder */}
            <AssetSection
              title="Actions"
              assetClass="stocks"
              symbols={["AAPL", "MSFT", "GOOGL", "AMZN", "TSLA", "NVDA"]}
              limit={6}
              icon={<Landmark className="w-4 h-4 text-[#00e5ff]" />}
              link="/markets/stocks"
              linkLabel="Toutes les actions"
            />
          </div>
        </div>

        {/* Community Ideas */}
        <div className="max-w-7xl mx-auto px-4 sm:px-8 lg:px-16 py-6">
          <CommunityCarousel />
        </div>

        {/* Brokers */}
        <div className="max-w-7xl mx-auto px-4 sm:px-8 lg:px-16 py-6 pb-12">
          <BrokerGrid />
        </div>
      </main>
      <Footer />
    </>
  );
}
