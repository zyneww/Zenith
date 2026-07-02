"use client";

import { MarketDataPoint } from "@/lib/market-data/types";
import SymbolLogo from "./SymbolLogo";
import Sparkline from "./Sparkline";
import Link from "next/link";
import { useFormatPrice, useCurrency } from "@/lib/context/CurrencyContext";
import { useLocale } from "next-intl";
import { getAssetBySymbol } from "@/lib/assets/registry";

interface FeaturedCardProps {
  data: MarketDataPoint;
}

export default function FeaturedCard({ data }: FeaturedCardProps) {
  const isUp = data.changePercent >= 0;
  const assetMeta = getAssetBySymbol(data.symbol);
  const formatPrice = useFormatPrice();
  const { convertFromUsd } = useCurrency();
  const locale = useLocale();

  const formatCompact = (n: number) => {
    try {
      return new Intl.NumberFormat(locale, {
        notation: "compact",
        compactDisplay: "short",
        maximumFractionDigits: 2,
      }).format(n);
    } catch {
      if (n >= 1e12) return `${(n / 1e12).toFixed(2)}T`;
      if (n >= 1e9) return `${(n / 1e9).toFixed(1)}B`;
      if (n >= 1e6) return `${(n / 1e6).toFixed(0)}M`;
      return `${(n / 1e3).toFixed(0)}K`;
    }
  };

  return (
    <Link
      href={`/markets/${data.symbol.toLowerCase()}`}
      className="block bg-card border border-surface rounded-sm p-4 hover:border-accent/30 transition-all group"
    >
      <div className="flex items-center gap-2 mb-3">
        <SymbolLogo symbol={data.symbol} assetClass={data.assetClass} logoUrl={assetMeta?.logoUrl} name={data.name} size="sm" />
        <span className="font-medium text-sm text-primary">{data.name}</span>
        <span className="text-xs text-secondary">{data.symbol}</span>
      </div>

      <div className="flex items-end justify-between mb-2">
        <span className="text-2xl font-mono font-medium text-primary tabular-nums">
          {formatPrice(data.price)}
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
          Vol: {data.volume ? formatCompact(convertFromUsd(data.volume)) : "-"}
        </span>
      </div>
    </Link>
  );
}
