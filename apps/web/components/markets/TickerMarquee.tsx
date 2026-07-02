"use client";

import { useEffect, useState } from "react";
import { tokens } from "@/lib/theme/bybit";
import { useFormatPrice } from "@/lib/context/CurrencyContext";

interface TrendingPair {
  symbol: string;
  price: number;
  changePercent: number;
}

export default function TickerMarquee() {
  const [trending, setTrending] = useState<TrendingPair[]>([]);
  const formatPrice = useFormatPrice();

  useEffect(() => {
    fetch("https://api.binance.com/api/v3/ticker/24hr")
      .then((r) => r.json())
      .then((data) => {
        const list: TrendingPair[] = (data || [])
          .filter((t: any) => t.symbol.endsWith("USDT") && t.symbol !== "USDTUSDT")
          .sort((a: any, b: any) => Math.abs(parseFloat(b.priceChangePercent)) - Math.abs(parseFloat(a.priceChangePercent)))
          .slice(0, 20)
          .map((t: any) => ({
            symbol: t.symbol.replace("USDT", ""),
            price: parseFloat(t.lastPrice),
            changePercent: parseFloat(t.priceChangePercent),
          }));
        setTrending(list);
      })
      .catch(() => {});
  }, []);

  if (trending.length === 0) return null;

  const rows = [...trending, ...trending]; // Duplicate for seamless loop

  return (
    <div className="w-full overflow-hidden py-1" style={{ backgroundColor: tokens.color.bg.dark, borderBottom: `1px solid ${tokens.color.border.default}` }}>
      <div className="flex gap-6 animate-scroll whitespace-nowrap">
        {rows.map((t, i) => {
          const isUp = t.changePercent >= 0;
          return (
            <div key={`${t.symbol}-${i}`} className="inline-flex items-center gap-1.5 text-[11px] font-medium">
              <span style={{ color: tokens.color.text.primary }}>{t.symbol}</span>
              <span className="tabular-nums" style={{ color: tokens.color.text.secondary }}>{formatPrice(t.price)}</span>
              <span className="tabular-nums" style={{ color: isUp ? tokens.color.accent.green : tokens.color.accent.red }}>
                {isUp ? "+" : ""}{t.changePercent.toFixed(2)}%
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
