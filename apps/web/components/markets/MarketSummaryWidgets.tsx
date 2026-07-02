"use client";

import { useEffect, useState, useCallback } from "react";
import { useTranslations, useLocale } from "next-intl";
import { Flame, TrendingUp, BarChart3 } from "lucide-react";
import { useFormatPrice, useCurrency } from "@/lib/context/CurrencyContext";

interface GlobalData {
  totalMarketCap: number;
  totalVolume: number;
  marketCapChange24h: number;
  btcDominance: number;
}

interface Gainer {
  symbol: string;
  name: string;
  changePercent: number;
}

interface MarketSummaryWidgetsProps {
  activeTab?: string;
}

const formatCompact = (n: number, locale: string) => {
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

export default function MarketSummaryWidgets({ activeTab = "crypto" }: MarketSummaryWidgetsProps) {
  const t = useTranslations();
  const locale = useLocale();
  const formatPrice = useFormatPrice();
  const { convertFromUsd } = useCurrency();
  const [global, setGlobal] = useState<GlobalData | null>(null);
  const [gainers, setGainers] = useState<Gainer[]>([]);
  const [marketData, setMarketData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      if (activeTab === "crypto" || activeTab === "apercu") {
        const [globalRes, cryptoRes] = await Promise.all([
          fetch("/api/market/global"),
          fetch("/api/markets/crypto?limit=100"),
        ]);
        if (globalRes.ok) { const g = await globalRes.json(); if (!g.error) setGlobal(g); }
        if (cryptoRes.ok) {
          const coins = await cryptoRes.json();
          setMarketData(coins);
          const top = [...coins].sort((a: any, b: any) => (b.changePercent ?? 0) - (a.changePercent ?? 0)).slice(0, 3);
          setGainers(top.map((c: any) => ({ symbol: c.symbol, name: c.name, changePercent: c.changePercent ?? 0 })));
        }
      } else {
        const res = await fetch(`/api/markets/${activeTab}?limit=100`);
        if (res.ok) {
          const items = await res.json();
          setMarketData(items);
          const top = [...items].sort((a: any, b: any) => (b.changePercent ?? 0) - (a.changePercent ?? 0)).slice(0, 3);
          setGainers(top.map((c: any) => ({ symbol: c.symbol, name: c.name, changePercent: c.changePercent ?? 0 })));
          const totalVol = items.reduce((s: number, i: any) => s + (i.volume ?? 0), 0);
          const totalCap = items.reduce((s: number, i: any) => s + (i.marketCap ?? 0), 0);
          setGlobal({ totalMarketCap: totalCap || 0, totalVolume: totalVol || 0, marketCapChange24h: 0, btcDominance: 0 });
        }
      }
    } catch {} finally {
      setLoading(false);
    }
  }, [activeTab]);

  useEffect(() => {
    fetchData();
    const i = setInterval(fetchData, 15000);
    return () => clearInterval(i);
  }, [fetchData]);

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 max-w-7xl mx-auto w-full">
        {[1, 2, 3].map((i) => (
          <div key={i} className="bg-[#161A1E] border border-[#222930] rounded-sm p-4 h-[100px] animate-pulse" />
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-3 max-w-7xl mx-auto w-full">
      {/* Market Cap */}
      <div className="bg-[#161A1E] border border-[#222930] rounded-sm p-4">
        <div className="flex items-center gap-2 mb-1">
          <BarChart3 className="w-3.5 h-3.5 text-[#848E9C]" />
          <span className="text-xs text-[#848E9C] font-medium">Market Cap</span>
        </div>
        <div className="text-xl font-mono font-medium text-[#EAECEF] tabular-nums">
          {global ? formatPrice(global.totalMarketCap) : "—"}
        </div>
        {global && (
          <span className={`text-xs font-mono ${global.marketCapChange24h >= 0 ? "text-[#4DAB9A]" : "text-[#FF7369]"}`}>
            {global.marketCapChange24h >= 0 ? "+" : ""}{global.marketCapChange24h.toFixed(2)}%
          </span>
        )}
      </div>

      {/* Volume 24h */}
      <div className="bg-[#161A1E] border border-[#222930] rounded-sm p-4">
        <div className="flex items-center gap-2 mb-1">
          <TrendingUp className="w-3.5 h-3.5 text-[#848E9C]" />
          <span className="text-xs text-[#848E9C] font-medium">Volume 24h</span>
        </div>
        <div className="text-xl font-mono font-medium text-[#EAECEF] tabular-nums">
          {global ? formatPrice(global.totalVolume) : "—"}
        </div>
        <span className="text-xs text-[#5D6677]">Total across all exchanges</span>
      </div>

      {/* Top Gainers */}
      <div className="bg-[#161A1E] border border-[#222930] rounded-sm p-4">
        <div className="flex items-center gap-2 mb-2">
          <Flame className="w-3.5 h-3.5 text-orange-400" />
          <span className="text-xs text-[#848E9C] font-medium">Top Gainers (24h)</span>
        </div>
        {gainers.length > 0 ? (
          <div className="space-y-1.5">
            {gainers.map((g) => (
              <div key={g.symbol} className="flex items-center justify-between">
                <span className="text-sm text-[#EAECEF] font-medium">{g.symbol}</span>
                <span className="text-sm font-mono text-[#4DAB9A] tabular-nums">
                  +{g.changePercent.toFixed(2)}%
                </span>
              </div>
            ))}
          </div>
        ) : (
          <span className="text-sm text-[#5D6677]">—</span>
        )}
      </div>
    </div>
  );
}
