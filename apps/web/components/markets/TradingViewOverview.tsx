"use client";

import { useState, useEffect } from "react";
import { TrendingUp, TrendingDown, BarChart3, DollarSign, Globe, Wheat, Landmark, ChevronRight } from "lucide-react";
import Link from "next/link";
import MarketMiniTable from "./MarketMiniTable";
import TopMovers from "./TopMovers";
import MarketHeatmap from "./MarketHeatmap";
import CrossRatesGrid from "./CrossRatesGrid";
import EcoCalendarMini from "./EcoCalendarMini";
import CommunityCarousel from "./CommunityCarousel";
import BrokerGrid from "./BrokerGrid";
import Highlights from "./Highlights";
import NewsRSS from "./NewsRSS";
import { useMarketData, useCryptoData } from "@/lib/market-data/useMarketData";

const INDICES_SYMBOLS = ["^GSPC", "^IXIC", "^DJI", "^FCHI", "^GDAXI", "^FTSE", "^N225", "^HSI"];
const FOREX_SYMBOLS = ["EUR/USD", "GBP/USD", "USD/JPY", "USD/CHF", "AUD/USD", "USD/CAD"];
const FUTURES_SYMBOLS = ["ES=F", "NQ=F", "YM=F", "GCF", "CLF"];
const COMMODITIES_SYMBOLS = ["CL=F", "GC=F", "SI=F", "NG=F", "HG=F"];
const STOCKS_SYMBOLS = ["AAPL", "MSFT", "GOOGL", "AMZN", "TSLA", "NVDA"];

export default function TradingViewOverview() {
  const cryptoData = useCryptoData(10);
  const indicesData = useMarketData("indices", INDICES_SYMBOLS);
  const forexData = useMarketData("forex", FOREX_SYMBOLS);
  const futuresData = useMarketData("futures", FUTURES_SYMBOLS);
  const commoditiesData = useMarketData("commodities", COMMODITIES_SYMBOLS);
  const stocksData = useMarketData("stocks", STOCKS_SYMBOLS);

  const columns = [
    { key: "symbol", label: "Symbole" },
    { key: "price", label: "Prix", align: "right" as const },
    { key: "changePercent", label: "24h", align: "right" as const },
  ];

  const SectionHeader = ({ title, href }: { title: string; href: string }) => (
    <div className="flex items-center justify-between mb-2">
      <h2 className="heading-3 text-primary uppercase tracking-wider">{title}</h2>
      <Link href={href} className="text-xs text-secondary hover:text-accent transition-colors flex items-center gap-1">
        Voir tout <ChevronRight className="w-3 h-3" />
      </Link>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Highlights */}
      <section>
        <Highlights />
      </section>

      {/* Indices section */}
      <section>
        <SectionHeader title="Indices" href="/markets/indices" />
        <MarketMiniTable
          title="Indices"
          icon={<BarChart3 className="w-4 h-4 text-accent" />}
          data={indicesData.data.slice(0, 6)}
          columns={columns}
          linkHref="/markets/indices"
          linkLabel="Tous les indices"
          isLoading={indicesData.isLoading}
        />
      </section>

      {/* Crypto section with heatmap */}
      <section>
        <SectionHeader title="Cryptomonnaies" href="/markets/cryptocurrencies" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
          <div className="lg:col-span-1">
            <MarketMiniTable
              title="Top par cap"
              icon={<TrendingUp className="w-4 h-4 text-accent" />}
              data={cryptoData.data.slice(0, 6)}
              columns={columns}
              linkHref="/markets/cryptocurrencies"
              linkLabel="Top 100"
              isLoading={cryptoData.isLoading}
            />
          </div>
          <div className="lg:col-span-2">
            <MarketHeatmap
              data={cryptoData.data}
              isLoading={cryptoData.isLoading}
            />
          </div>
        </div>
      </section>

      {/* Forex section */}
      <section>
        <SectionHeader title="Forex" href="/markets/currencies" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
          <div className="lg:col-span-1">
            <MarketMiniTable
              title="Paires majeures"
              icon={<DollarSign className="w-4 h-4 text-accent" />}
              data={forexData.data.slice(0, 6)}
              columns={columns}
              linkHref="/markets/currencies"
              linkLabel="Toutes les paires"
              isLoading={forexData.isLoading}
            />
          </div>
          <div className="lg:col-span-2">
            <CrossRatesGrid data={forexData.data} isLoading={forexData.isLoading} />
          </div>
        </div>
      </section>

      {/* Top Movers */}
      <section>
        <h2 className="heading-3 text-primary uppercase tracking-wider mb-2">Top Variations 24h</h2>
        <TopMovers />
      </section>

      {/* Futures section */}
      <section>
        <SectionHeader title="Futures" href="/markets/futures" />
        <MarketMiniTable
          title="Futures"
          icon={<Globe className="w-4 h-4 text-accent" />}
          data={futuresData.data.slice(0, 6)}
          columns={columns}
          linkHref="/markets/futures"
          linkLabel="Tous les futures"
          isLoading={futuresData.isLoading}
        />
      </section>

      {/* Commodities section */}
      <section>
        <SectionHeader title="Matières premières" href="/markets/commodities" />
        <MarketMiniTable
          title="Matières premières"
          icon={<Wheat className="w-4 h-4 text-accent" />}
          data={commoditiesData.data.slice(0, 6)}
          columns={columns}
          linkHref="/markets/commodities"
          linkLabel="Tous les produits"
          isLoading={commoditiesData.isLoading}
        />
      </section>

      {/* Stocks + Calendar + News grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
        <div className="lg:col-span-2">
          <section>
            <SectionHeader title="Actions & ETFs" href="/markets/stocks" />
            <MarketMiniTable
              title="Actions"
              icon={<Landmark className="w-4 h-4 text-accent" />}
              data={stocksData.data.slice(0, 6)}
              columns={columns}
              linkHref="/markets/stocks"
              linkLabel="Toutes les actions"
              isLoading={stocksData.isLoading}
            />
          </section>
          <section className="mt-3">
            <CommunityCarousel />
          </section>
        </div>
        <div className="space-y-3">
          <EcoCalendarMini />
          <NewsRSS />
        </div>
      </div>

      {/* Brokers */}
      <section>
        <BrokerGrid />
      </section>
    </div>
  );
}
