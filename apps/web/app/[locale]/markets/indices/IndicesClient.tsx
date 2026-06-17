"use client";

import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { MarketDataPoint } from "@/lib/market-data/types";

const INDICES_SYMBOLS = [
  "^GSPC", "^IXIC", "^DJI", "^FCHI", "^GDAXI", "^FTSE", "^N225", "^HSI",
  "^RUT", "^VIX", "^STOXX50E", "^AEX", "^IBEX", "^MIB"
];

function getChangeColor(change: number): string {
  return change >= 0 ? "text-accent" : "text-[#ef4444]";
}

function formatPrice(price: number): string {
  if (price >= 10000) {
    return price.toLocaleString("en-US", { minimumFractionDigits: 0, maximumFractionDigits: 0 });
  }
  return price.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

export default function IndicesClient() {
  const t = useTranslations("markets");
  const [indices, setIndices] = useState<MarketDataPoint[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "americas" | "europe" | "asia">("all");

  useEffect(() => {
    async function fetchIndices() {
      try {
        const res = await fetch(`/api/markets/indices?symbols=${INDICES_SYMBOLS.join(",")}`);
        if (!res.ok) throw new Error("Failed to fetch");
        const data = await res.json();
        setIndices(data);
      } catch (error) {
        console.error("Error fetching indices:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchIndices();
  }, []);

  const filteredIndices = indices.filter((index) => {
    if (filter === "all") return true;
    const symbol = index.symbol;
    if (filter === "americas") return symbol.includes("^GSPC") || symbol.includes("^IXIC") || symbol.includes("^DJI") || symbol.includes("^RUT") || symbol.includes("^VIX");
    if (filter === "europe") return symbol.includes("^FCHI") || symbol.includes("^GDAXI") || symbol.includes("^FTSE") || symbol.includes("^STOXX50E") || symbol.includes("^AEX") || symbol.includes("^IBEX") || symbol.includes("^MIB");
    if (filter === "asia") return symbol.includes("^N225") || symbol.includes("^HSI");
    return true;
  });

  const getIndexName = (symbol: string): string => {
    const names: Record<string, string> = {
      "^GSPC": "S&P 500",
      "^IXIC": "Nasdaq Composite",
      "^DJI": "Dow Jones Industrial",
      "^FCHI": "CAC 40",
      "^GDAXI": "DAX 40",
      "^FTSE": "FTSE 100",
      "^N225": "Nikkei 225",
      "^HSI": "Hang Seng Index",
      "^RUT": "Russell 2000",
      "^VIX": "VIX Volatility Index",
      "^STOXX50E": "Euro Stoxx 50",
      "^AEX": "AEX Amsterdam",
      "^IBEX": "IBEX 35",
      "^MIB": "FTSE MIB",
    };
    return names[symbol] || symbol;
  };

  const getRegion = (symbol: string): string => {
    if (symbol.includes("^GSPC") || symbol.includes("^IXIC") || symbol.includes("^DJI") || symbol.includes("^RUT") || symbol.includes("^VIX")) return "Americas";
    if (symbol.includes("^FCHI") || symbol.includes("^GDAXI") || symbol.includes("^FTSE") || symbol.includes("^STOXX50E") || symbol.includes("^AEX") || symbol.includes("^IBEX") || symbol.includes("^MIB")) return "Europe";
    if (symbol.includes("^N225") || symbol.includes("^HSI")) return "Asia";
    return "Other";
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-accent" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="flex gap-2">
        {(["all", "americas", "europe", "asia"] as const).map((region) => (
          <button
            key={region}
            onClick={() => setFilter(region)}
            className={`px-4 py-2 rounded-sm text-sm font-medium transition-colors ${
              filter === region
                ? "bg-accent text-inverse"
                : "bg-card text-secondary hover:text-primary"
            }`}
          >
            {t(`indices.filter.${region}`)}
          </button>
        ))}
      </div>

      {/* Indices Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {filteredIndices.length === 0 ? (
          <div className="col-span-full text-center text-secondary py-12">
            {t("indices.noData")}
          </div>
        ) : (
          filteredIndices.map((index) => (
            <div
              key={index.symbol}
              className="bg-card rounded-sm border border-surface p-4 hover:border-accent/30 transition-colors"
            >
              <div className="flex items-center justify-between mb-3">
                <div>
                  <h3 className="text-primary font-semibold text-sm">
                    {getIndexName(index.symbol)}
                  </h3>
                  <p className="text-secondary text-xs">{index.symbol}</p>
                </div>
                <span className="text-xs text-secondary px-2 py-1 rounded-sm bg-raised">
                  {getRegion(index.symbol)}
                </span>
              </div>
              <div className="space-y-2">
                <div className="text-2xl font-medium text-primary">
                  {formatPrice(index.price)}
                </div>
                <div className="flex items-center gap-2">
                  <span className={`text-sm font-medium ${getChangeColor(index.change)}`}>
                    {index.change >= 0 ? "+" : ""}
                    {index.change.toFixed(2)}
                  </span>
                  <span className={`text-sm font-medium ${getChangeColor(index.changePercent)}`}>
                    {index.changePercent >= 0 ? "+" : ""}
                    {index.changePercent.toFixed(2)}%
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <span className="text-secondary">High</span>
                    <p className="text-primary">{formatPrice(index.high)}</p>
                  </div>
                  <div>
                    <span className="text-secondary">Low</span>
                    <p className="text-primary">{formatPrice(index.low)}</p>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Market Overview */}
      <div className="bg-card rounded-sm border border-surface p-6">
        <h3 className="text-lg font-semibold text-primary mb-4">
          {t("indices.overview")}
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="text-center">
            <div className="text-3xl font-medium text-primary mb-1">
              {indices.filter((i) => i.changePercent >= 0).length}
            </div>
            <div className="text-sm text-accent">{t("indices.rising")}</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-medium text-primary mb-1">
              {indices.filter((i) => i.changePercent < 0).length}
            </div>
            <div className="text-sm text-[#ef4444]">{t("indices.falling")}</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-medium text-primary mb-1">
              {indices.length > 0
                ? (indices.reduce((sum, i) => sum + i.changePercent, 0) / indices.length).toFixed(2) + "%"
                : "—"}
            </div>
            <div className="text-sm text-secondary">{t("indices.avgChange")}</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-medium text-primary mb-1">
              {indices.length > 0
                ? Math.max(...indices.map((i) => i.changePercent)).toFixed(2) + "%"
                : "—"}
            </div>
            <div className="text-sm text-accent">{t("indices.bestPerf")}</div>
          </div>
        </div>
      </div>
    </div>
  );
}
