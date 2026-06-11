"use client";

import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { MarketDataPoint } from "@/lib/market-data/types";

const INDICES_SYMBOLS = [
  "^GSPC", "^IXIC", "^DJI", "^FCHI", "^GDAXI", "^FTSE", "^N225", "^HSI",
  "^RUT", "^VIX", "^STOXX50E", "^AEX", "^IBEX", "^MIB"
];

function getChangeColor(change: number): string {
  return change >= 0 ? "text-green-400" : "text-red-400";
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
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-[#00e5ff]" />
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
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              filter === region
                ? "bg-[#00e5ff] text-[#0b0e14]"
                : "bg-[#131722] text-gray-400 hover:text-white"
            }`}
          >
            {t(`indices.filter.${region}`)}
          </button>
        ))}
      </div>

      {/* Indices Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {filteredIndices.length === 0 ? (
          <div className="col-span-full text-center text-gray-500 py-12">
            {t("indices.noData")}
          </div>
        ) : (
          filteredIndices.map((index) => (
            <div
              key={index.symbol}
              className="bg-[#131722] rounded-xl border border-gray-800 p-4 hover:border-[#00e5ff]/30 transition-colors"
            >
              <div className="flex items-center justify-between mb-3">
                <div>
                  <h3 className="text-white font-semibold text-sm">
                    {getIndexName(index.symbol)}
                  </h3>
                  <p className="text-gray-500 text-xs">{index.symbol}</p>
                </div>
                <span className="text-xs text-gray-500 px-2 py-1 rounded bg-[#1a1f2e]">
                  {getRegion(index.symbol)}
                </span>
              </div>
              <div className="space-y-2">
                <div className="text-2xl font-bold text-white">
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
                    <span className="text-gray-500">High</span>
                    <p className="text-gray-300">{formatPrice(index.high)}</p>
                  </div>
                  <div>
                    <span className="text-gray-500">Low</span>
                    <p className="text-gray-300">{formatPrice(index.low)}</p>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Market Overview */}
      <div className="bg-[#131722] rounded-xl border border-gray-800 p-6">
        <h3 className="text-lg font-semibold text-white mb-4">
          {t("indices.overview")}
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="text-center">
            <div className="text-3xl font-bold text-white mb-1">
              {indices.filter((i) => i.changePercent >= 0).length}
            </div>
            <div className="text-sm text-green-400">{t("indices.rising")}</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-white mb-1">
              {indices.filter((i) => i.changePercent < 0).length}
            </div>
            <div className="text-sm text-red-400">{t("indices.falling")}</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-white mb-1">
              {indices.length > 0
                ? (indices.reduce((sum, i) => sum + i.changePercent, 0) / indices.length).toFixed(2) + "%"
                : "—"}
            </div>
            <div className="text-sm text-gray-400">{t("indices.avgChange")}</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-white mb-1">
              {indices.length > 0
                ? Math.max(...indices.map((i) => i.changePercent)).toFixed(2) + "%"
                : "—"}
            </div>
            <div className="text-sm text-green-400">{t("indices.bestPerf")}</div>
          </div>
        </div>
      </div>
    </div>
  );
}
