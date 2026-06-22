"use client";

import { useEffect, useState, useMemo } from "react";
import { ChevronUp, ChevronDown, ChevronLeft, ChevronRight } from "lucide-react";
import { MarketDataPoint, AssetClass } from "@/lib/market-data/types";
import SymbolLogo from "./SymbolLogo";
import Sparkline from "./Sparkline";

type SortKey = "rank" | "symbol" | "price" | "change1h" | "change24h" | "change7d" | "volume" | "marketCap";
type SortDir = "asc" | "desc";

interface CoinGeckoTableProps {
  category: AssetClass;
  view?: "default" | "gainers" | "trending";
}

const PAGE_SIZES = [50, 100, 300];

export default function CoinGeckoTable({ category, view = "default" }: CoinGeckoTableProps) {
  const [data, setData] = useState<MarketDataPoint[]>([]);
  const [loading, setLoading] = useState(true);
  const [sortKey, setSortKey] = useState<SortKey>("rank");
  const [sortDir, setSortDir] = useState<SortDir>("asc");
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(100);

  useEffect(() => {
    setLoading(true);
    async function fetchData() {
      try {
        if (category === "crypto" && view === "trending") {
          const res = await fetch("/api/markets/trending");
          if (res.ok) setData(await res.json());
        } else {
          const res = await fetch(`/api/markets/${category}?limit=300`);
          if (res.ok) {
            let items: MarketDataPoint[] = await res.json();
            if (view === "gainers") {
              items = [...items].sort((a, b) => b.changePercent - a.changePercent);
            }
            setData(items);
          }
        }
      } catch {} finally {
        setLoading(false);
      }
    }
    fetchData();
    const i = setInterval(fetchData, 30000);
    return () => clearInterval(i);
  }, [category, view]);

  const sorted = useMemo(() => {
    const copy = [...data];
    copy.sort((a, b) => {
      const getVal = (item: MarketDataPoint, key: SortKey): number => {
        switch (key) {
          case "rank": return item.marketCapRank ?? 0;
          case "symbol": return item.symbol.charCodeAt(0);
          case "price": return item.price;
          case "change1h": return item.changePercent1h ?? 0;
          case "change24h": return item.changePercent;
          case "change7d": return item.changePercent7d ?? 0;
          case "volume": return item.volume ?? 0;
          case "marketCap": return item.marketCap ?? 0;
        }
      };
      const va = getVal(a, sortKey);
      const vb = getVal(b, sortKey);
      return sortDir === "asc" ? va - vb : vb - va;
    });
    return copy;
  }, [data, sortKey, sortDir]);

  const totalPages = Math.max(1, Math.ceil(sorted.length / pageSize));
  const pageData = sorted.slice(page * pageSize, (page + 1) * pageSize);

  const handleSort = (key: SortKey) => {
    if (sortKey === key) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    else { setSortKey(key); setSortDir("asc"); }
    setPage(0);
  };

  const SortIcon = ({ col }: { col: SortKey }) => {
    if (sortKey !== col) return null;
    return sortDir === "asc" ? <ChevronUp className="w-3 h-3 inline ml-0.5" /> : <ChevronDown className="w-3 h-3 inline ml-0.5" />;
  };

  const fmtPrice = (p: number) => {
    if (p >= 1000) return p.toLocaleString("fr-FR", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    if (p >= 1) return p.toLocaleString("fr-FR", { minimumFractionDigits: 2, maximumFractionDigits: 4 });
    return p.toLocaleString("fr-FR", { minimumFractionDigits: 4, maximumFractionDigits: 8 });
  };

  const fmtMC = (n: number) => {
    if (n >= 1e12) return `$${(n / 1e12).toFixed(2)}T`;
    if (n >= 1e9) return `$${(n / 1e9).toFixed(1)}B`;
    if (n >= 1e6) return `$${(n / 1e6).toFixed(0)}M`;
    return `$${(n / 1e3).toFixed(0)}K`;
  };

  const fmtVol = (n: number) => {
    if (n >= 1e12) return `$${(n / 1e12).toFixed(2)}T`;
    if (n >= 1e9) return `$${(n / 1e9).toFixed(1)}B`;
    if (n >= 1e6) return `$${(n / 1e6).toFixed(0)}M`;
    return `$${(n / 1e3).toFixed(0)}K`;
  };

  const TH = ({ col, label, align = "left" }: { col: SortKey; label: string; align?: "left" | "right" }) => (
    <th
      className={`py-2 px-2 text-[10px] font-mono-caps text-secondary font-medium cursor-pointer hover:text-primary select-none ${
        align === "right" ? "text-right" : "text-left"
      }`}
      onClick={() => handleSort(col)}
    >
      {label}
      <SortIcon col={col} />
    </th>
  );

  if (loading) {
    return (
      <div className="bg-card border border-surface rounded-sm">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead><tr className="border-b border-surface">{Array.from({ length: 8 }).map((_, i) => <th key={i} className="py-3 px-2"><div className="h-3 bg-raised rounded animate-pulse w-12" /></th>)}</tr></thead>
            <tbody>{Array.from({ length: 10 }).map((_, i) => <tr key={i} className="border-b border-surface/50">{Array.from({ length: 8 }).map((_, j) => <td key={j} className="py-3 px-2"><div className="h-4 bg-raised rounded animate-pulse w-16" /></td>)}</tr>)}</tbody>
          </table>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="bg-card border border-surface rounded-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-surface">
                <TH col="rank" label="#" align="right" />
                <TH col="symbol" label="Coin" />
                <TH col="price" label="Prix" align="right" />
                <TH col="change1h" label="1h" align="right" />
                <TH col="change24h" label="24h" align="right" />
                <TH col="change7d" label="7j" align="right" />
                <TH col="volume" label="Volume 24h" align="right" />
                <TH col="marketCap" label="Market Cap" align="right" />
                <th className="py-2 px-2 text-right text-[10px] font-mono-caps text-secondary font-medium">7j</th>
              </tr>
            </thead>
            <tbody>
              {pageData.map((coin, i) => (
                <tr
                  key={coin.symbol}
                  className="border-b border-surface/50 hover:bg-raised/50 transition-colors"
                >
                  <td className="py-2.5 px-2 text-right text-secondary font-mono text-[11px]">
                    {coin.marketCapRank || page * pageSize + i + 1}
                  </td>
                  <td className="py-2.5 px-2">
                    <div className="flex items-center gap-2">
                      <SymbolLogo symbol={coin.symbol} assetClass={coin.assetClass} size="xs" />
                      <span className="font-medium text-primary">{coin.name}</span>
                      <span className="text-secondary">{coin.symbol}</span>
                    </div>
                  </td>
                  <td className="py-2.5 px-2 text-right font-mono text-primary tabular-nums">
                    {category === "forex" ? coin.price.toFixed(5) : fmtPrice(coin.price)}
                  </td>
                  <td className={`py-2.5 px-2 text-right font-mono tabular-nums ${(coin.changePercent1h ?? 0) >= 0 ? "text-up" : "text-down"}`}>
                    {(coin.changePercent1h ?? 0) >= 0 ? "+" : ""}{(coin.changePercent1h ?? 0).toFixed(1)}%
                  </td>
                  <td className={`py-2.5 px-2 text-right font-mono tabular-nums ${coin.changePercent >= 0 ? "text-up" : "text-down"}`}>
                    {coin.changePercent >= 0 ? "+" : ""}{coin.changePercent.toFixed(2)}%
                  </td>
                  <td className={`py-2.5 px-2 text-right font-mono tabular-nums ${(coin.changePercent7d ?? 0) >= 0 ? "text-up" : "text-down"}`}>
                    {(coin.changePercent7d ?? 0) >= 0 ? "+" : ""}{(coin.changePercent7d ?? 0).toFixed(1)}%
                  </td>
                  <td className="py-2.5 px-2 text-right font-mono text-secondary tabular-nums">
                    {coin.volume ? fmtVol(coin.volume) : "-"}
                  </td>
                  <td className="py-2.5 px-2 text-right font-mono text-secondary tabular-nums">
                    {coin.marketCap ? fmtMC(coin.marketCap) : "-"}
                  </td>
                  <td className="py-2.5 px-2 text-right">
                    {coin.sparkline7d && coin.sparkline7d.length > 0 ? (
                      <Sparkline data={coin.sparkline7d} />
                    ) : null}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between mt-2 px-1">
        <div className="flex items-center gap-1">
          {PAGE_SIZES.map((size) => (
            <button
              key={size}
              onClick={() => { setPageSize(size); setPage(0); }}
              className={`text-xs px-2 py-0.5 rounded-sm transition-colors ${
                pageSize === size ? "bg-accent-subtle text-accent font-medium" : "bg-card border border-surface text-secondary hover:text-primary"
              }`}
            >
              {size}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-2 text-xs text-secondary">
          <span>{page * pageSize + 1}–{Math.min((page + 1) * pageSize, sorted.length)} sur {sorted.length}</span>
          <button
            onClick={() => setPage((p) => Math.max(0, p - 1))}
            disabled={page === 0}
            className="p-1 hover:text-primary disabled:opacity-30 transition-colors bg-card border border-surface rounded"
          >
            <ChevronLeft className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
            disabled={page >= totalPages - 1}
            className="p-1 hover:text-primary disabled:opacity-30 transition-colors bg-card border border-surface rounded"
          >
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}
