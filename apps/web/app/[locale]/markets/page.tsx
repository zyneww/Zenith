"use client";

import { useState, useEffect } from "react";
import { Search, SlidersHorizontal, BarChart3, TrendingUp, DollarSign, Globe, Wheat, PieChart, Landmark } from "lucide-react";
import { useRealtimePrice } from "@/lib/hooks/useRealtimePrice";
import Header from "@/components/landing/Header";
import Footer from "@/components/landing/Footer";
import TickerStrip from "@/components/markets/TickerStrip";
import MarketSummary from "@/components/markets/MarketSummary";
import TopMovers from "@/components/markets/TopMovers";
import MarketNav from "@/components/markets/MarketNav";
import MarketMiniTable from "@/components/markets/MarketMiniTable";
import EcoCalendarMini from "@/components/markets/EcoCalendarMini";
import CommunityCarousel from "@/components/markets/CommunityCarousel";
import BrokerGrid from "@/components/markets/BrokerGrid";
import MarketHeatmap from "@/components/markets/MarketHeatmap";
import CrossRatesGrid from "@/components/markets/CrossRatesGrid";
import MarketBriefIA from "@/components/markets/MarketBriefIA";
import SymbolOverview from "@/components/markets/SymbolOverview";
import { EconomicEvent } from "@/lib/market-data/types";
import { useMarketData, useCryptoData } from "@/lib/market-data/useMarketData";

const CRYPTO_SYMBOLS = ["BTC", "ETH", "SOL", "BNB", "XRP", "DOGE", "ADA", "AVAX"];
const INDICES_SYMBOLS = ["^GSPC", "^IXIC", "^DJI", "^FCHI", "^GDAXI", "^FTSE", "^N225", "^HSI"];
const FOREX_SYMBOLS = ["EUR/USD", "GBP/USD", "USD/JPY", "USD/CHF", "AUD/USD", "USD/CAD"];
const FUTURES_SYMBOLS = ["ES=F", "NQ=F", "YM=F", "GCF", "CLF"];
const COMMODITIES_SYMBOLS = ["CL=F", "GC=F", "SI=F", "NG=F", "HG=F"];
const STOCKS_SYMBOLS = ["AAPL", "MSFT", "GOOGL", "AMZN", "TSLA", "NVDA"];

export default function MarketsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("apercu");
  const [isFilterMode, setIsFilterMode] = useState(false);
  const symbols = CRYPTO_SYMBOLS;
  const { isConnected } = useRealtimePrice(symbols);

  // Fetch data for sections
  const cryptoData = useCryptoData(10);
  const indicesData = useMarketData("indices", INDICES_SYMBOLS);
  const forexData = useMarketData("forex", FOREX_SYMBOLS);
  const futuresData = useMarketData("futures", FUTURES_SYMBOLS);
  const commoditiesData = useMarketData("commodities", COMMODITIES_SYMBOLS);
  const stocksData = useMarketData("stocks", STOCKS_SYMBOLS);

  // Filter data based on search query
  const filterData = (data: any[]) => {
    if (!searchQuery) return data;
    const q = searchQuery.toLowerCase();
    return data.filter((item) =>
      item.symbol?.toLowerCase().includes(q) ||
      item.name?.toLowerCase().includes(q)
    );
  };

  const filteredCrypto = filterData(cryptoData.data);
  const filteredIndices = filterData(indicesData.data);
  const filteredForex = filterData(forexData.data);
  const filteredFutures = filterData(futuresData.data);
  const filteredCommodities = filterData(commoditiesData.data);
  const filteredStocks = filterData(stocksData.data);

  const columns = [
    { key: "symbol", label: "Symbole" },
    { key: "price", label: "Prix", align: "right" as const },
    { key: "changePercent", label: "Variation", align: "right" as const },
    { key: "high", label: "Haut", align: "right" as const },
    { key: "low", label: "Bas", align: "right" as const },
  ];

  const compactColumns = [
    { key: "symbol", label: "Symbole" },
    { key: "price", label: "Prix", align: "right" as const },
    { key: "changePercent", label: "Variation", align: "right" as const },
  ];

  const expandedColumns = [
    { key: "symbol", label: "Symbole" },
    { key: "name", label: "Nom", align: "left" as const },
    { key: "price", label: "Prix", align: "right" as const },
    { key: "change", label: "Chg", align: "right" as const },
    { key: "changePercent", label: "Variation", align: "right" as const },
    { key: "high", label: "Haut", align: "right" as const },
    { key: "low", label: "Bas", align: "right" as const },
    { key: "volume", label: "Volume", align: "right" as const },
  ];

  // Handle tab change - switch between scroll spy and filter mode
  const handleTabChange = (tabId: string) => {
    setActiveTab(tabId);
    if (tabId === "apercu" || tabId === "movers") {
      setIsFilterMode(false);
      // Scroll to section
      const el = document.getElementById(`section-${tabId}`);
      if (el) {
        el.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    } else {
      setIsFilterMode(true);
    }
  };

  // Scroll spy for MarketNav (only in overview mode)
  useEffect(() => {
    if (isFilterMode) return;
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            const id = entry.target.id.replace("section-", "");
            setActiveTab(id);
          }
        }
      },
      { rootMargin: "-100px 0px -60% 0px" }
    );

    const sections = document.querySelectorAll("[id^='section-']");
    sections.forEach((s) => observer.observe(s));
    return () => observer.disconnect();
  }, [isFilterMode]);

  return (
    <>
      <Header />
      <main className="min-h-screen bg-canvas text-primary">
        {/* Ticker Strip */}
        <TickerStrip />

        {/* Header + Search */}
        <div className="border-b border-surface">
          <div className="max-w-7xl mx-auto px-4 sm:px-8 lg:px-16 py-6">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-6">
              <div>
                <h1 className="text-2xl md:text-3xl font-medium text-primary">Marchés</h1>
                <p className="text-secondary text-sm mt-1">
                  Prix temps réel, indices, forex et cryptomonnaies
                </p>
              </div>
              <div className="flex items-center gap-2">
                <span className={`text-xs px-2 py-1 rounded-sm font-medium uppercase ${
                  isConnected
                    ? "bg-accent-subtle text-accent"
                    : "bg-[#f59e0b]/10 text-[#f59e0b]"
                }`}>
                  {isConnected ? "● LIVE" : "◌ OFFLINE"}
                </span>
              </div>
            </div>

            {/* Search */}
            <div className="flex flex-col md:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-secondary" />
                <input
                  type="text"
                  placeholder="Rechercher un actif (ex: BTC, EUR/USD, S&P 500)..."
                  aria-label="Rechercher un actif"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-card border border-surface rounded-sm pl-10 pr-10 py-2.5 text-sm text-primary placeholder-secondary focus:outline-none focus:border-accent transition"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery("")}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-secondary hover:text-primary transition"
                    aria-label="Effacer la recherche"
                  >
                    <span className="text-xs">✕</span>
                  </button>
                )}
              </div>
              <button className="flex items-center gap-2 bg-card border border-surface rounded-sm px-4 py-2.5 text-sm text-secondary hover:text-primary transition">
                <SlidersHorizontal className="w-4 h-4" />
                Filtres
              </button>
            </div>
            {searchQuery && (
              <div className="text-xs text-secondary">
                {(() => {
                  const total = filteredCrypto.length + filteredIndices.length + filteredForex.length + filteredFutures.length + filteredCommodities.length + filteredStocks.length;
                  return total === 0 ? "Aucun résultat" : `${total} résultat${total > 1 ? 's' : ''} pour "${searchQuery}"`;
                })()}
              </div>
            )}
          </div>
          {/* Tab Navigation */}
          <MarketNav activeTab={activeTab} onTabChange={handleTabChange} isFilterMode={isFilterMode} />
        </div>

        {/* Section: Overview */}
        {(activeTab === "apercu" || !isFilterMode) && (
          <section id="section-apercu" className="max-w-7xl mx-auto px-4 sm:px-8 lg:px-16 py-6 scroll-mt-24">
            <div className="mb-4">
              <h2 className="text-lg font-medium text-primary">Aperçu des marchés</h2>
              <p className="text-xs text-secondary">Indices, crypto et forex en temps réel</p>
            </div>
            <MarketSummary />
          </section>
        )}

        {/* Section: Top Movers */}
        {(activeTab === "apercu" || activeTab === "movers" || !isFilterMode) && (
          <section id="section-movers" className="max-w-7xl mx-auto px-4 sm:px-8 lg:px-16 py-6 scroll-mt-24">
            <TopMovers />
          </section>
        )}

        {/* Section: Market Brief IA + Heatmap */}
        {(activeTab === "apercu" || !isFilterMode) && (
          <section className="max-w-7xl mx-auto px-4 sm:px-8 lg:px-16 py-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              <div className="lg:col-span-1">
                <MarketBriefIA
                  data={[...filteredCrypto, ...filteredIndices, ...filteredForex]}
                  isLoading={cryptoData.isLoading && indicesData.isLoading}
                />
              </div>
              <div className="lg:col-span-2">
                <MarketHeatmap
                  data={[...filteredCrypto, ...filteredIndices, ...filteredStocks]}
                  isLoading={cryptoData.isLoading}
                />
              </div>
            </div>
          </section>
        )}

        {/* Section: Cross Rates */}
        {(activeTab === "apercu" || activeTab === "forex" || !isFilterMode) && (
          <section className="max-w-7xl mx-auto px-4 sm:px-8 lg:px-16 py-6">
            <CrossRatesGrid
              data={filteredForex}
              isLoading={forexData.isLoading}
            />
          </section>
        )}

        {/* Section: Indices */}
        {(activeTab === "apercu" || activeTab === "indices" || !isFilterMode) && (
          <section id="section-indices" className="max-w-7xl mx-auto px-4 sm:px-8 lg:px-16 py-6 scroll-mt-24">
            <div className="mb-4">
              <h2 className="text-lg font-medium text-primary">Indices boursiers</h2>
              <p className="text-xs text-secondary">Les principaux indices mondiaux en temps réel</p>
            </div>
            <MarketMiniTable
              title="Indices"
              icon={<BarChart3 className="w-4 h-4 text-accent" />}
              data={filteredIndices}
              columns={isFilterMode && activeTab === "indices" ? expandedColumns : columns}
              linkHref="/markets/indices"
              linkLabel="Tous les indices"
              isLoading={indicesData.isLoading}
            />
          </section>
        )}

        {/* Section: Crypto */}
        {(activeTab === "apercu" || activeTab === "crypto" || !isFilterMode) && (
          <section id="section-crypto" className="max-w-7xl mx-auto px-4 sm:px-8 lg:px-16 py-6 scroll-mt-24">
            <div className="mb-4">
              <h2 className="text-lg font-medium text-primary">Cryptomonnaies</h2>
              <p className="text-xs text-secondary">Top cryptomonnaies par capitalisation</p>
            </div>
            <MarketMiniTable
              title="Cryptomonnaies"
              icon={<TrendingUp className="w-4 h-4 text-accent" />}
              data={filteredCrypto}
              columns={isFilterMode && activeTab === "crypto" ? expandedColumns : columns}
              linkHref="/markets/cryptocurrencies"
              linkLabel="Top 100"
              isLoading={cryptoData.isLoading}
              showCapToggle
              assetClass="crypto"
            />
          </section>
        )}

        {/* Section: Forex */}
        {(activeTab === "apercu" || activeTab === "forex" || !isFilterMode) && (
          <section id="section-forex" className="max-w-7xl mx-auto px-4 sm:px-8 lg:px-16 py-6 scroll-mt-24">
            <div className="mb-4">
              <h2 className="text-lg font-medium text-primary">Forex</h2>
              <p className="text-xs text-secondary">Principales paires de devises</p>
            </div>
            <MarketMiniTable
              title="Forex"
              icon={<DollarSign className="w-4 h-4 text-accent" />}
              data={filteredForex}
              columns={isFilterMode && activeTab === "forex" ? expandedColumns : compactColumns}
              linkHref="/markets/currencies"
              linkLabel="Toutes les paires"
              isLoading={forexData.isLoading}
            />
          </section>
        )}

        {/* Section: Futures */}
        {(activeTab === "apercu" || activeTab === "futures" || !isFilterMode) && (
          <section id="section-futures" className="max-w-7xl mx-auto px-4 sm:px-8 lg:px-16 py-6 scroll-mt-24">
            <div className="mb-4">
              <h2 className="text-lg font-medium text-primary">Futures</h2>
              <p className="text-xs text-secondary">Contrats à terme sur indices et matières premières</p>
            </div>
            <MarketMiniTable
              title="Futures"
              icon={<Globe className="w-4 h-4 text-accent" />}
              data={filteredFutures}
              columns={isFilterMode && activeTab === "futures" ? expandedColumns : compactColumns}
              linkHref="/markets/futures"
              linkLabel="Tous les futures"
              isLoading={futuresData.isLoading}
            />
          </section>
        )}

        {/* Section: Commodities */}
        {(activeTab === "apercu" || activeTab === "commodities" || !isFilterMode) && (
          <section id="section-commodities" className="max-w-7xl mx-auto px-4 sm:px-8 lg:px-16 py-6 scroll-mt-24">
            <div className="mb-4">
              <h2 className="text-lg font-medium text-primary">Matières premières</h2>
              <p className="text-xs text-secondary">Pétrole, or, argent et métaux</p>
            </div>
            <MarketMiniTable
              title="Matières premières"
              icon={<Wheat className="w-4 h-4 text-accent" />}
              data={filteredCommodities}
              columns={isFilterMode && activeTab === "commodities" ? expandedColumns : compactColumns}
              linkHref="/markets/commodities"
              linkLabel="Tous les produits"
              isLoading={commoditiesData.isLoading}
            />
          </section>
        )}

        {/* Section: ETFs */}
        {(activeTab === "apercu" || activeTab === "etfs" || !isFilterMode) && (
          <section id="section-etfs" className="max-w-7xl mx-auto px-4 sm:px-8 lg:px-16 py-6 scroll-mt-24">
            <div className="mb-4">
              <h2 className="text-lg font-medium text-primary">Actions & ETFs</h2>
              <p className="text-xs text-secondary">Les valeurs les plus suivies</p>
            </div>
            <MarketMiniTable
              title="Actions"
              icon={<Landmark className="w-4 h-4 text-accent" />}
              data={filteredStocks}
              columns={isFilterMode && activeTab === "etfs" ? expandedColumns : compactColumns}
              linkHref="/markets/stocks"
              linkLabel="Toutes les actions"
              isLoading={stocksData.isLoading}
            />
          </section>
        )}

        {/* Section: Economic Calendar */}
        {(activeTab === "apercu" || activeTab === "calendar" || !isFilterMode) && (
          <section id="section-calendar" className="max-w-7xl mx-auto px-4 sm:px-8 lg:px-16 py-6 scroll-mt-24">
            <EcoCalendarMini />
          </section>
        )}

        {/* Section: Community Ideas */}
        {(activeTab === "apercu" || activeTab === "ideas" || !isFilterMode) && (
          <section id="section-ideas" className="max-w-7xl mx-auto px-4 sm:px-8 lg:px-16 py-6 scroll-mt-24">
            <CommunityCarousel />
          </section>
        )}

        {/* Brokers */}
        {(activeTab === "apercu" || !isFilterMode) && (
          <div className="max-w-7xl mx-auto px-4 sm:px-8 lg:px-16 py-6 pb-12">
            <BrokerGrid />
          </div>
        )}
      </main>
      <Footer />
    </>
  );
}
