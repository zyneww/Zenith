"use client";

import { useMarketData } from "@/lib/market-data/useMarketData";
import { useCryptoData } from "@/lib/market-data/useMarketData";
import { formatPrice, formatChange, getChangeColor } from "@/lib/market-data/format";
import { MarketDataPoint, AssetClass } from "@/lib/market-data/types";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

interface AssetSectionProps {
  title: string;
  assetClass: AssetClass;
  symbols?: string[];
  limit?: number;
  icon?: React.ReactNode;
  link?: string;
  linkLabel?: string;
}

export default function AssetSection({
  title,
  assetClass,
  symbols,
  limit = 6,
  icon,
  link,
  linkLabel = "Voir tout",
}: AssetSectionProps) {
  const state = assetClass === "crypto" ? useCryptoData(limit) : useMarketData(assetClass, symbols || [], 30000);
  const { data, isLoading } = state;

  const items = data.slice(0, limit);

  return (
    <div className="bg-[#131722] border border-[#1a1f2e] rounded-xl overflow-hidden">
      <div className="flex items-center justify-between px-4 py-3 border-b border-[#1a1f2e]">
        <div className="flex items-center gap-2">
          {icon}
          <h3 className="text-sm font-semibold text-white">{title}</h3>
        </div>
        {link && (
          <Link
            href={link}
            className="flex items-center gap-1 text-xs text-[#00e5ff] hover:text-[#00e5ff]/80 transition-colors"
          >
            {linkLabel}
            <ArrowRight className="w-3 h-3" />
          </Link>
        )}
      </div>

      {isLoading ? (
        <div className="p-4 space-y-2 animate-pulse">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-10 bg-[#1a1f2e] rounded" />
          ))}
        </div>
      ) : (
        <div className="divide-y divide-[#1a1f2e]">
          {items.map((item) => (
            <AssetRow key={item.symbol} item={item} />
          ))}
        </div>
      )}
    </div>
  );
}

function AssetRow({ item }: { item: MarketDataPoint }) {
  return (
    <div className="flex items-center justify-between px-4 py-3 hover:bg-[#1a1f2e]/50 transition-colors cursor-pointer">
      <div className="flex items-center gap-3 min-w-0">
        <div className="w-8 h-8 rounded bg-[#1a1f2e] flex items-center justify-center text-xs font-bold text-[#7a8498] shrink-0">
          {item.symbol.slice(0, 2)}
        </div>
        <div className="min-w-0">
          <p className="text-sm font-medium text-white truncate">{item.symbol}</p>
          <p className="text-xs text-[#7a8498] truncate">{item.name}</p>
        </div>
      </div>
      <div className="text-right shrink-0">
        <p className="text-sm font-mono text-white font-medium">
          {formatPrice(item.price)}
        </p>
        <p className={`text-xs font-medium ${getChangeColor(item.change)}`}>
          {formatChange(item.change)}
        </p>
      </div>
    </div>
  );
}
