"use client";

import { useMarketSummary } from "@/lib/market-data/useMarketData";
import { formatPrice, formatChange, getChangeColor } from "@/lib/market-data/format";
import { MarketDataPoint } from "@/lib/market-data/types";

export default function MarketSummary() {
  const { data, isLoading } = useMarketSummary();

  if (isLoading) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 animate-pulse">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="bg-[#131722] rounded-lg p-4 h-24" />
        ))}
      </div>
    );
  }

  const topItems = data.slice(0, 8);

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
      {topItems.map((item) => (
        <SummaryCard key={item.symbol} item={item} />
      ))}
    </div>
  );
}

function SummaryCard({ item }: { item: MarketDataPoint }) {
  return (
    <div className="bg-[#131722] border border-[#1a1f2e] rounded-lg p-4 hover:border-[#2a2f3e] transition-colors cursor-pointer group">
      <div className="flex items-start justify-between mb-2">
        <div>
          <p className="text-xs text-[#7a8498] font-medium">{item.symbol}</p>
          <p className="text-sm text-white font-medium truncate">{item.name}</p>
        </div>
        <div className={`px-1.5 py-0.5 rounded text-xs font-medium ${getChangeColor(item.change)}`}>
          {formatChange(item.change)}
        </div>
      </div>
      <p className="text-lg font-mono text-white font-semibold">
        {formatPrice(item.price)}
      </p>
    </div>
  );
}
