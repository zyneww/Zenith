"use client";

import { useMemo } from "react";
import { TrendingUp, TrendingDown, BarChart3 } from "lucide-react";
import { MarketDataPoint } from "@/lib/market-data/types";
import SymbolLogo from "./SymbolLogo";

interface MarketHeatmapProps {
  data: MarketDataPoint[];
  title?: string;
  description?: string;
  limit?: number;
  isLoading?: boolean;
}

function getHeatColor(changePercent: number): { bg: string; text: string; border: string } {
  if (changePercent >= 5) return { bg: "bg-[#22c55e]", text: "text-white", border: "border-[#16a34a]" };
  if (changePercent >= 2) return { bg: "bg-[#4ade80]", text: "text-[#052e16]", border: "border-[#22c55e]" };
  if (changePercent >= 0.5) return { bg: "bg-[#86efac]", text: "text-[#052e16]", border: "border-[#4ade80]" };
  if (changePercent >= 0) return { bg: "bg-[#dcfce7]", text: "text-[#052e16]", border: "border-[#86efac]" };
  if (changePercent > -0.5) return { bg: "bg-[#fee2e2]", text: "text-[#450a0a]", border: "border-[#fca5a5]" };
  if (changePercent > -2) return { bg: "bg-[#fca5a5]", text: "text-[#450a0a]", border: "border-[#ef4444]" };
  if (changePercent > -5) return { bg: "bg-[#ef4444]", text: "text-white", border: "border-[#dc2626]" };
  return { bg: "bg-[#b91c1c]", text: "text-white", border: "border-[#7f1d1d]" };
}

export default function MarketHeatmap({
  data,
  title = "Carte thermique du marché",
  description = "Visualisation des variations en temps réel — taille = volume",
  limit = 24,
  isLoading = false,
}: MarketHeatmapProps) {
  const items = useMemo(() => {
    const sorted = [...data]
      .filter((d) => d.symbol && d.price > 0)
      .sort((a, b) => (b.volume ?? 0) - (a.volume ?? 0))
      .slice(0, limit);
    const maxVolume = Math.max(...sorted.map((d) => d.volume ?? 1), 1);
    return sorted.map((d) => ({
      item: d,
      weight: Math.sqrt((d.volume ?? 1) / maxVolume),
    }));
  }, [data, limit]);

  if (isLoading) {
    return (
      <div className="bg-card border border-surface rounded-sm p-4">
        <div className="flex items-center gap-2 mb-4">
          <BarChart3 className="w-4 h-4 text-accent" />
          <h3 className="font-medium text-sm text-primary">{title}</h3>
        </div>
        <div className="grid grid-cols-6 gap-1 h-[420px]">
          {Array.from({ length: 24 }).map((_, i) => (
            <div key={i} className="bg-raised rounded-sm animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="bg-card border border-surface rounded-sm p-4 h-[460px] flex flex-col items-center justify-center text-secondary">
        <BarChart3 className="w-8 h-8 mb-2 opacity-40" />
        <p className="text-sm">Aucune donnée disponible</p>
      </div>
    );
  }

  return (
    <div className="bg-card border border-surface rounded-sm p-4">
      <div className="flex items-center justify-between mb-4">
        <div>
          <div className="flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-accent" />
            <h3 className="font-medium text-sm text-primary">{title}</h3>
          </div>
          <p className="text-xs text-secondary mt-1">{description}</p>
        </div>
        <div className="hidden md:flex items-center gap-3 text-[10px] font-mono-caps text-secondary">
          <span className="flex items-center gap-1">
            <span className="w-3 h-3 rounded-sm bg-[#22c55e]" />
            ≥+5%
          </span>
          <span className="flex items-center gap-1">
            <span className="w-3 h-3 rounded-sm bg-[#4ade80]" />
            +2%
          </span>
          <span className="flex items-center gap-1">
            <span className="w-3 h-3 rounded-sm bg-[#dcfce7]" />
            +0%
          </span>
          <span className="flex items-center gap-1">
            <span className="w-3 h-3 rounded-sm bg-[#fee2e2]" />
            -0%
          </span>
          <span className="flex items-center gap-1">
            <span className="w-3 h-3 rounded-sm bg-[#ef4444]" />
            -2%
          </span>
          <span className="flex items-center gap-1">
            <span className="w-3 h-3 rounded-sm bg-[#b91c1c]" />
            ≤-5%
          </span>
        </div>
      </div>

      <div className="flex flex-wrap gap-1 h-[420px] content-start">
        {items.map(({ item, weight }) => {
          const color = getHeatColor(item.changePercent);
          const isPositive = item.changePercent >= 0;
          return (
            <a
              key={item.symbol}
              href={`/markets/${encodeURIComponent(item.symbol)}`}
              className={`${color.bg} ${color.text} border ${color.border} rounded-sm p-2 flex flex-col justify-between hover:z-10 cursor-pointer overflow-hidden`}
              style={{
                flexBasis: `${Math.max(8, weight * 22)}%`,
                flexGrow: weight,
                minHeight: `${Math.max(60, weight * 130)}px`,
              }}
              title={`${item.name} — ${item.price.toLocaleString("fr-FR", { minimumFractionDigits: 2 })} (${item.changePercent >= 0 ? "+" : ""}${item.changePercent.toFixed(2)}%)`}
            >
              <div className="flex items-start justify-between gap-1">
                <SymbolLogo symbol={item.symbol} assetClass={item.assetClass} size="xs" />
                {isPositive ? (
                  <TrendingUp className="w-3 h-3 opacity-70" />
                ) : (
                  <TrendingDown className="w-3 h-3 opacity-70" />
                )}
              </div>
              <div className="min-w-0">
                <div className="text-[11px] font-semibold truncate leading-tight">
                  {normalizeSymbol(item.symbol)}
                </div>
                <div className="text-[10px] opacity-80 truncate leading-tight mt-0.5">
                  {item.name}
                </div>
                <div className="text-sm font-bold mt-1 leading-none">
                  {item.changePercent >= 0 ? "+" : ""}{item.changePercent.toFixed(2)}%
                </div>
              </div>
            </a>
          );
        })}
      </div>
    </div>
  );
}

function normalizeSymbol(raw: string): string {
  if (!raw) return "";
  const map: Record<string, string> = {
    BTCUSDT: "BTC", ETHUSDT: "ETH", SOLUSDT: "SOL", BNBUSDT: "BNB",
    XRPUSDT: "XRP", DOGEUSDT: "DOGE", ADAUSDT: "ADA", AVAXUSDT: "AVAX",
    MATICUSDT: "MATIC", LINKUSDT: "LINK", UNIUSDT: "UNI", LTCUSDT: "LTC",
  };
  if (map[raw]) return map[raw];
  return raw.replace(/=F$/i, "").replace(/USDT$/i, "").replace(/USD$/i, "");
}
