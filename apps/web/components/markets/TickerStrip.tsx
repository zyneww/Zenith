"use client";

import { useMarketSummary } from "@/lib/market-data/useMarketData";
import { formatPrice, formatChange, getChangeColor, getChangeBg } from "@/lib/market-data/format";
import { MarketDataPoint } from "@/lib/market-data/types";

export default function TickerStrip() {
  const { data: prices, isLoading } = useMarketSummary();

  const symbols = [
    { symbol: "^GSPC", name: "S&P 500" },
    { symbol: "^IXIC", name: "Nasdaq" },
    { symbol: "^DJI", name: "Dow Jones" },
    { symbol: "^FCHI", name: "CAC 40" },
    { symbol: "^GDAXI", name: "DAX" },
    { symbol: "^FTSE", name: "FTSE 100" },
    { symbol: "^N225", name: "Nikkei" },
    { symbol: "BTC", name: "Bitcoin" },
    { symbol: "ETH", name: "Ethereum" },
    { symbol: "SOL", name: "Solana" },
    { symbol: "EUR/USD", name: "EUR/USD" },
    { symbol: "GBP/USD", name: "GBP/USD" },
    { symbol: "USD/JPY", name: "USD/JPY" },
    { symbol: "CL=F", name: "WTI" },
    { symbol: "GC=F", name: "Or" },
  ];

  const tickerItems = symbols.map((s) => {
    const price = prices.find((p) => p.symbol === s.symbol);
    return {
      ...s,
      price: price?.price ?? 0,
      change: price?.change ?? 0,
      changePercent: price?.changePercent ?? 0,
    };
  });

  if (isLoading) {
    return (
      <div className="w-full bg-[#0b0e14] border-b border-[#1a1f2e] overflow-hidden">
        <div className="flex items-center h-10 animate-pulse">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="flex items-center gap-2 px-4 text-sm">
              <span className="w-16 h-3 bg-[#1a1f2e] rounded" />
              <span className="w-12 h-3 bg-[#1a1f2e] rounded" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="w-full bg-[#0b0e14] border-b border-[#1a1f2e] overflow-hidden">
      <div className="flex items-center h-10 animate-scroll whitespace-nowrap">
        {tickerItems.map((item, i) => (
          <div key={`${item.symbol}-${i}`} className="flex items-center gap-2 px-4 text-sm">
            <span className="text-[#7a8498] font-medium">{item.name}</span>
            <span className="text-white font-mono">
              {formatPrice(item.price)}
            </span>
            <span className={`${getChangeColor(item.change)} text-xs font-medium`}>
              {formatChange(item.change)}
            </span>
          </div>
        ))}
        {/* Duplicate for seamless loop */}
        {tickerItems.map((item, i) => (
          <div key={`${item.symbol}-dup-${i}`} className="flex items-center gap-2 px-4 text-sm">
            <span className="text-[#7a8498] font-medium">{item.name}</span>
            <span className="text-white font-mono">
              {formatPrice(item.price)}
            </span>
            <span className={`${getChangeColor(item.change)} text-xs font-medium`}>
              {formatChange(item.change)}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
