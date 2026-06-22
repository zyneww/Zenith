"use client";

import { useEffect, useState } from "react";
import { TrendingUp, Zap, Flame } from "lucide-react";
import { MarketDataPoint } from "@/lib/market-data/types";

interface HighlightsData {
  trending: MarketDataPoint[];
  topGainer: MarketDataPoint | null;
  totalMarketCap: number;
  volume24h: number;
  btcDominance: number;
}

export default function Highlights() {
  const [data, setData] = useState<HighlightsData | null>(null);

  useEffect(() => {
    async function fetchData() {
      try {
        const [trendingRes, cryptoRes] = await Promise.all([
          fetch("/api/markets/trending").then((r) => r.json()),
          fetch("/api/markets/crypto?limit=100"),
        ]);
        if (!cryptoRes.ok) return;
        const all: MarketDataPoint[] = await cryptoRes.json();
        const topGainer = all.length ? [...all].sort((a, b) => b.changePercent - a.changePercent)[0] : null;
        const totalMC = all.reduce((sum, c) => sum + (c.marketCap ?? 0), 0);
        const btc = all.find((c) => c.symbol === "BTC");
        setData({
          trending: Array.isArray(trendingRes) ? trendingRes.slice(0, 5) : [],
          topGainer,
          totalMarketCap: totalMC,
          volume24h: all.reduce((sum, c) => sum + (c.volume ?? 0), 0),
          btcDominance: totalMC > 0 && btc ? (btc.marketCap ?? 0) / totalMC * 100 : 0,
        });
      } catch {}
    }
    fetchData();
    const i = setInterval(fetchData, 60000);
    return () => clearInterval(i);
  }, []);

  if (!data) {
    return <div className="grid grid-cols-1 md:grid-cols-3 gap-3"><div className="h-24 bg-card rounded-sm animate-pulse" /><div className="h-24 bg-card rounded-sm animate-pulse" /><div className="h-24 bg-card rounded-sm animate-pulse" /></div>;
  }

  const fmtMC = (n: number) => {
    if (n >= 1e12) return `$${(n / 1e12).toFixed(2)}T`;
    if (n >= 1e9) return `$${(n / 1e9).toFixed(1)}B`;
    return `$${(n / 1e6).toFixed(0)}M`;
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
      <div className="bg-card border border-surface rounded-sm p-3">
        <div className="flex items-center gap-1.5 mb-2">
          <Flame className="w-3.5 h-3.5 text-accent" />
          <span className="text-xs font-medium text-primary">Trending</span>
        </div>
        <div className="space-y-1">
          {data.trending.map((coin) => (
            <div key={coin.symbol} className="flex items-center justify-between text-xs">
              <span className="text-primary font-medium">{coin.symbol}</span>
              <span className={coin.changePercent >= 0 ? "text-up" : "text-down"}>
                {coin.changePercent >= 0 ? "+" : ""}{coin.changePercent.toFixed(1)}%
              </span>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-card border border-surface rounded-sm p-3">
        <div className="flex items-center gap-1.5 mb-2">
          <Zap className="w-3.5 h-3.5 text-up" />
          <span className="text-xs font-medium text-primary">Top Gainer 24h</span>
        </div>
        {data.topGainer && (
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm font-medium text-primary">{data.topGainer.symbol}</div>
              <div className="text-xs text-secondary">{data.topGainer.name}</div>
            </div>
            <div className="text-right">
              <div className="text-sm font-mono text-primary">
                ${data.topGainer.price.toLocaleString()}
              </div>
              <div className="text-xs text-up font-medium">
                +{data.topGainer.changePercent.toFixed(2)}%
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="bg-card border border-surface rounded-sm p-3">
        <div className="flex items-center gap-1.5 mb-2">
          <TrendingUp className="w-3.5 h-3.5 text-accent" />
          <span className="text-xs font-medium text-primary">Market Cap</span>
        </div>
        <div className="text-lg font-mono font-medium text-primary">{fmtMC(data.totalMarketCap)}</div>
        <div className="flex items-center gap-3 mt-1">
          <span className="text-xs text-secondary">Vol 24h: {fmtMC(data.volume24h)}</span>
          <span className="text-xs text-secondary">BTC: {data.btcDominance.toFixed(1)}%</span>
        </div>
      </div>
    </div>
  );
}
