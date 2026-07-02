"use client";

import { useEffect, useState } from "react";
import { TrendingUp, Zap, Flame } from "lucide-react";
import { MarketDataPoint } from "@/lib/market-data/types";
import { useFormatPrice, useCurrency, CURRENCY_SYMBOLS } from "@/lib/context/CurrencyContext";

interface HighlightsData {
  trending: MarketDataPoint[];
  topGainer: MarketDataPoint | null;
  totalMarketCap: number;
  volume24h: number;
  btcDominance: number;
}

export default function Highlights() {
  const [data, setData] = useState<HighlightsData | null>(null);
  const [timedOut, setTimedOut] = useState(false);
  const formatPrice = useFormatPrice();
  const { convertFromUsd, formatNumber, currency } = useCurrency();

  const fmtMC = (n: number) => {
    const converted = convertFromUsd(n);
    const compact = formatNumber(converted, { notation: "compact", compactDisplay: "short", maximumFractionDigits: 2 });
    return `${CURRENCY_SYMBOLS[currency]}${compact}`;
  };

  useEffect(() => {
    const timer = setTimeout(() => setTimedOut(true), 10000);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    async function fetchData() {
      try {
        const [trendingRes, cryptoRes] = await Promise.all([
          fetch("/api/markets/trending").then((r) => r.json()),
          fetch("/api/markets/crypto?limit=100"),
        ]);
        let all: MarketDataPoint[] = [];
        if (cryptoRes.ok) {
          all = await cryptoRes.json();
        } else {
          const fallbackRes = await fetch("/api/markets/crypto?limit=100");
          if (fallbackRes.ok) all = await fallbackRes.json();
        }
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
      } catch {
        const fallbackRes = await fetch("/api/markets/crypto?limit=100").catch(() => null);
        if (fallbackRes && fallbackRes.ok) {
          const all: MarketDataPoint[] = await fallbackRes.json();
          const topGainer = all.length ? [...all].sort((a, b) => b.changePercent - a.changePercent)[0] : null;
          const totalMC = all.reduce((sum, c) => sum + (c.marketCap ?? 0), 0);
          const btc = all.find((c) => c.symbol === "BTC");
          setData({
            trending: [],
            topGainer,
            totalMarketCap: totalMC,
            volume24h: all.reduce((sum, c) => sum + (c.volume ?? 0), 0),
            btcDominance: totalMC > 0 && btc ? (btc.marketCap ?? 0) / totalMC * 100 : 0,
          });
        }
      }
    }
    fetchData();
    const i = setInterval(fetchData, 60000);
    return () => clearInterval(i);
  }, []);

  if (!data) {
    if (timedOut) {
      return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {["Market Cap", "Volume 24h", "Top Gainer"].map((label) => (
            <div key={label} className="bg-card border border-surface rounded-sm p-4 flex items-center justify-center">
              <span className="text-xs text-secondary">Indisponible</span>
            </div>
          ))}
        </div>
      );
    }
    return <div className="grid grid-cols-1 md:grid-cols-3 gap-3"><div className="h-24 bg-card rounded-sm animate-pulse" /><div className="h-24 bg-card rounded-sm animate-pulse" /><div className="h-24 bg-card rounded-sm animate-pulse" /></div>;
  }

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
        {data.topGainer ? (
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm font-medium text-primary">{data.topGainer.symbol}</div>
              <div className="text-xs text-secondary">{data.topGainer.name}</div>
            </div>
            <div className="text-right">
              <div className="text-sm font-mono text-primary">
                {formatPrice(data.topGainer.price)}
              </div>
              <div className="text-xs text-up font-medium">
                +{data.topGainer.changePercent.toFixed(2)}%
              </div>
            </div>
          </div>
        ) : (
          <div className="text-xs text-secondary">Indisponible</div>
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
