"use client";

import { MarketDataPoint } from "@/lib/market-data/types";
import SymbolLogo from "./SymbolLogo";
import Sparkline from "./Sparkline";
import Link from "next/link";

interface FeaturedCardProps {
  data: MarketDataPoint;
}

const fmtPrice = (p: number) => {
  if (p >= 1000) return p.toLocaleString("fr-FR", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  if (p >= 1) return p.toLocaleString("fr-FR", { minimumFractionDigits: 2, maximumFractionDigits: 4 });
  return p.toLocaleString("fr-FR", { minimumFractionDigits: 4, maximumFractionDigits: 8 });
};

const fmtVol = (n: number) => {
  if (n >= 1e12) return `$${(n / 1e12).toFixed(2)}T`;
  if (n >= 1e9) return `$${(n / 1e9).toFixed(1)}B`;
  if (n >= 1e6) return `$${(n / 1e6).toFixed(0)}M`;
  return `$${(n / 1e3).toFixed(0)}K`;
};

export default function FeaturedCard({ data }: FeaturedCardProps) {
  const isUp = data.changePercent >= 0;

  return (
    <Link
      href={`/markets/${data.symbol.toLowerCase()}`}
      className="block bg-card border border-surface rounded-sm p-4 hover:border-accent/30 transition-all group"
    >
      <div className="flex items-center gap-2 mb-3">
        <SymbolLogo symbol={data.symbol} assetClass={data.assetClass} size="sm" />
        <span className="font-medium text-sm text-primary">{data.name}</span>
        <span className="text-xs text-secondary">{data.symbol}</span>
      </div>

      <div className="flex items-end justify-between mb-2">
        <span className="text-2xl font-mono font-medium text-primary tabular-nums">
          ${fmtPrice(data.price)}
        </span>
        <span className={`text-sm font-mono font-medium tabular-nums ${isUp ? "text-up" : "text-down"}`}>
          {isUp ? "+" : ""}{data.changePercent.toFixed(2)}%
        </span>
      </div>

      <div className="flex items-center justify-between gap-3">
        {data.sparkline7d && data.sparkline7d.length > 0 && (
          <div className="w-24 h-8">
            <Sparkline data={data.sparkline7d} />
          </div>
        )}
        <span className="text-[11px] text-secondary font-mono tabular-nums whitespace-nowrap">
          Vol: {data.volume ? fmtVol(data.volume) : "-"}
        </span>
      </div>
    </Link>
  );
}
