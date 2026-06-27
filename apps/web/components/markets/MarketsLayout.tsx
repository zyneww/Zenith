"use client";

import { useEffect, useState, useMemo, useCallback } from "react";
import { useLocale, useTranslations } from "next-intl";
import Link from "next/link";
import { Search, ChevronUp, ChevronDown, ChevronLeft, ChevronRight, TrendingUp, BarChart3, DollarSign, Landmark, Globe, Wheat } from "lucide-react";
import { MarketDataPoint, AssetClass } from "@/lib/market-data/types";
import SymbolLogo from "./SymbolLogo";
import Sparkline from "./Sparkline";
import FeaturedCard from "./FeaturedCard";
import { useRealtimePrice } from "@/lib/hooks/useRealtimePrice";

type SortKey = "rank" | "symbol" | "price" | "change1h" | "change24h" | "change7d" | "high" | "low" | "volume" | "marketCap";
type SortDir = "asc" | "desc";

interface Tab {
  id: string;
  label: string;
  icon: React.ReactNode;
  assetClass?: AssetClass;
  path: string;
}

const tabs: Tab[] = [
  { id: "apercu", label: "markets.tabOverview", icon: null, path: "/markets" },
  { id: "crypto", label: "markets.tabCrypto", icon: <TrendingUp className="w-3.5 h-3.5" />, assetClass: "crypto", path: "/markets/cryptocurrencies" },
  { id: "forex", label: "markets.tabForex", icon: <DollarSign className="w-3.5 h-3.5" />, assetClass: "forex", path: "/markets/forex" },
  { id: "indices", label: "markets.tabIndices", icon: <BarChart3 className="w-3.5 h-3.5" />, assetClass: "indices", path: "/markets/indices" },
  { id: "stocks", label: "markets.tabStocks", icon: <Landmark className="w-3.5 h-3.5" />, assetClass: "stocks", path: "/markets/stocks" },
  { id: "futures", label: "markets.tabFutures", icon: <Globe className="w-3.5 h-3.5" />, assetClass: "futures", path: "/markets/futures" },
  { id: "commodities", label: "markets.tabCommodities", icon: <Wheat className="w-3.5 h-3.5" />, assetClass: "commodities", path: "/markets/commodities" },
];

const PAGE_SIZES = [50, 100, 300];
const CRYPTO_SYMBOLS = ["BTC", "ETH", "SOL", "BNB", "XRP", "DOGE", "ADA", "AVAX"];

const fmtPrice = (p: number, assetClass?: AssetClass) => {
  if (assetClass === "forex") return p.toFixed(5);
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

const fmtMC = (n: number) => {
  if (n >= 1e12) return `$${(n / 1e12).toFixed(2)}T`;
  if (n >= 1e9) return `$${(n / 1e9).toFixed(1)}B`;
  if (n >= 1e6) return `$${(n / 1e6).toFixed(0)}M`;
  return `$${(n / 1e3).toFixed(0)}K`;
};

interface MarketsLayoutProps {
  activeTab?: string;
  locale: string;
}

export default function MarketsLayout({ activeTab = "apercu", locale }: MarketsLayoutProps) {
  const t = useTranslations();
  const currentTab = tabs.find((tab) => tab.id === activeTab) || tabs[0];
  const assetClass = currentTab.assetClass;

  const [data, setData] = useState<MarketDataPoint[]>([]);
  const [loading, setLoading] = useState(true);
  const [sortKey, setSortKey] = useState<SortKey>("rank");
  const [sortDir, setSortDir] = useState<SortDir>("asc");
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(100);
  const [searchQuery, setSearchQuery] = useState("");
  const ws = useRealtimePrice(CRYPTO_SYMBOLS);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      if (!assetClass) {
        const res = await fetch("/api/markets/summary");
        if (res.ok) {
          let items: MarketDataPoint[] = await res.json();
          items = items.filter((d) => d.price > 0);
          setData(items);
        }
      } else {
        const limit = assetClass === "crypto" ? 300 : 50;
        const res = await fetch(`/api/markets/${assetClass}?limit=${limit}`);
        if (res.ok) {
          let items: MarketDataPoint[] = await res.json();
          setData(items);
        }
      }
    } catch {} finally {
      setLoading(false);
    }
  }, [assetClass]);

  useEffect(() => {
    fetchData();
    const i = setInterval(fetchData, 30000);
    return () => clearInterval(i);
  }, [fetchData]);

  // ponytail: WS price merge not applied to table — data refreshes every 30s

  const sorted = useMemo(() => {
    const copy = [...data];
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return copy.filter((d) => d.symbol.toLowerCase().includes(q) || d.name?.toLowerCase().includes(q));
    }
    copy.sort((a, b) => {
      const getVal = (item: MarketDataPoint, key: SortKey): number => {
        switch (key) {
          case "rank": return item.marketCapRank ?? 9999;
          case "symbol": return item.symbol.charCodeAt(0);
          case "price": return item.price;
          case "change1h": return item.changePercent1h ?? 0;
          case "change24h": return item.changePercent;
          case "change7d": return item.changePercent7d ?? 0;
          case "high": return item.high ?? 0;
          case "low": return item.low ?? 0;
          case "volume": return item.volume ?? 0;
          case "marketCap": return item.marketCap ?? 0;
        }
      };
      const va = getVal(a, sortKey);
      const vb = getVal(b, sortKey);
      return sortDir === "asc" ? va - vb : vb - va;
    });
    return copy;
  }, [data, sortKey, sortDir, searchQuery]);

  const totalPages = Math.max(1, Math.ceil(sorted.length / pageSize));
  const pageData = sorted.slice(page * pageSize, (page + 1) * pageSize);
  const featured = useMemo(() => [...data].sort((a, b) => (b.volume ?? 0) - (a.volume ?? 0)).slice(0, 4), [data]);

  const handleSort = (key: SortKey) => {
    if (sortKey === key) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    else { setSortKey(key); setSortDir("asc"); }
    setPage(0);
  };

  const SortIcon = ({ col }: { col: SortKey }) => {
    if (sortKey !== col) return null;
    return sortDir === "asc" ? <ChevronUp className="w-3 h-3 inline ml-0.5" /> : <ChevronDown className="w-3 h-3 inline ml-0.5" />;
  };

  const TH = ({ col, label, align = "left" }: { col: SortKey; label: string; align?: "left" | "right" }) => (
    <th
      className={`py-2.5 px-2 text-[11px] font-mono-caps text-secondary font-medium cursor-pointer hover:text-primary select-none border-b border-surface whitespace-nowrap ${align === "right" ? "text-right" : "text-left"}`}
      onClick={() => handleSort(col)}
    >
      {label}
      <SortIcon col={col} />
    </th>
  );

  if (loading && data.length === 0) {
    return (
      <div className="space-y-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="bg-card border border-surface rounded-sm p-4 h-[120px] animate-pulse" />
          ))}
        </div>
        <div className="bg-card border border-surface rounded-sm">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead><tr>{Array.from({ length: 10 }).map((_, i) => <th key={i} className="py-3 px-2"><div className="h-3 bg-raised rounded animate-pulse w-14" /></th>)}</tr></thead>
              <tbody>{Array.from({ length: 10 }).map((_, i) => <tr key={i} className="border-b border-surface/50">{Array.from({ length: 10 }).map((_, j) => <td key={j} className="py-3 px-2"><div className="h-4 bg-raised rounded animate-pulse w-16" /></td>)}</tr>)}</tbody>
            </table>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {/* Tab Nav */}
      <div className="border-b border-surface overflow-x-auto hide-scrollbar sticky top-0 bg-canvas/95 backdrop-blur-sm z-20 -mx-4 sm:-mx-8 lg:-mx-16 px-4 sm:px-8 lg:px-16">
        <div className="flex max-w-7xl mx-auto">
          {tabs.map((tab) => {
            const isActive = tab.id === activeTab;
            return (
              <Link
                key={tab.id}
                href={`/${locale}${tab.path}`}
                className={`flex items-center gap-1.5 px-3 py-3 text-xs font-medium whitespace-nowrap transition-colors border-b-2 ${
                  isActive ? "border-accent text-accent" : "border-transparent text-secondary hover:text-primary hover:border-hover"
                }`}
              >
                {tab.icon}
                {t(tab.label)}
              </Link>
            );
          })}
        </div>
      </div>

      {/* Search + LIVE badge */}
      <div className="flex items-center justify-between gap-3 max-w-7xl mx-auto w-full">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-secondary" />
          <input
            type="text"
            placeholder={t("markets.searchPlaceholder")}
            value={searchQuery}
            onChange={(e) => { setSearchQuery(e.target.value); setPage(0); }}
            className="w-full bg-card border border-surface rounded-sm pl-9 pr-4 py-2 text-xs text-primary placeholder-secondary focus:outline-none focus:border-accent transition"
          />
        </div>
        <span className={`text-xs px-2 py-1 rounded-sm font-medium uppercase ${
          ws.isConnected ? "bg-accent-subtle text-accent" : "bg-[#f59e0b]/10 text-[#f59e0b]"
        }`}>
          {ws.isConnected ? t("markets.live") : t("markets.offline")}
        </span>
      </div>

      {/* Featured Cards (overview or when no search) */}
      {!searchQuery && featured.length >= 3 && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 max-w-7xl mx-auto w-full">
          {featured.map((item) => (
            <FeaturedCard key={item.symbol} data={item} />
          ))}
        </div>
      )}

      {/* Main Table */}
      <div className="bg-card border border-surface rounded-sm overflow-hidden max-w-7xl mx-auto w-full">
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr>
                <TH col="rank" label={t("markets.colRank")} align="right" />
                <TH col="symbol" label={t("markets.colName")} />
                <TH col="price" label={t("markets.colPrice")} align="right" />
                <TH col="change1h" label={t("markets.col1h")} align="right" />
                <TH col="change24h" label={t("markets.col24h")} align="right" />
                <TH col="change7d" label={t("markets.col7d")} align="right" />
                <TH col="high" label={t("markets.colHigh")} align="right" />
                <TH col="low" label={t("markets.colLow")} align="right" />
                <TH col="volume" label={t("markets.colVolume")} align="right" />
                <TH col="marketCap" label={t("markets.colMarketCap")} align="right" />
                <th className="py-2.5 px-2 text-right text-[11px] font-mono-caps text-secondary font-medium border-b border-surface whitespace-nowrap">{t("markets.colTrend")}</th>
                <th className="py-2.5 px-2 text-center text-[11px] font-mono-caps text-secondary font-medium border-b border-surface whitespace-nowrap">{t("markets.colTrade")}</th>
              </tr>
            </thead>
            <tbody>
              {pageData.map((item) => {
                const isUp24h = item.changePercent >= 0;
                return (
                  <tr key={item.symbol} className="border-b border-surface/50 hover:bg-raised/50 transition-colors">
                    <td className="py-2.5 px-2 text-right text-secondary font-mono text-[11px] tabular-nums">
                      {item.marketCapRank || "-"}
                    </td>
                    <td className="py-2.5 px-2">
                      <Link href={`/${locale}/markets/${item.symbol.toLowerCase()}`} className="flex items-center gap-2 hover:text-accent transition-colors">
                        <SymbolLogo symbol={item.symbol} assetClass={item.assetClass} size="xs" />
                        <span className="font-medium text-primary">{item.name || item.symbol}</span>
                        <span className="text-secondary text-[11px]">{item.symbol}</span>
                      </Link>
                    </td>
                    <td className="py-2.5 px-2 text-right font-mono text-primary tabular-nums text-[12px]">
                      ${fmtPrice(item.price, item.assetClass)}
                    </td>
                    <td className={`py-2.5 px-2 text-right font-mono tabular-nums ${(item.changePercent1h ?? 0) >= 0 ? "text-up" : "text-down"}`}>
                      {(item.changePercent1h ?? 0) >= 0 ? "+" : ""}{(item.changePercent1h ?? 0).toFixed(1)}%
                    </td>
                    <td className={`py-2.5 px-2 text-right font-mono tabular-nums ${isUp24h ? "text-up" : "text-down"}`}>
                      {isUp24h ? "+" : ""}{item.changePercent.toFixed(2)}%
                    </td>
                    <td className={`py-2.5 px-2 text-right font-mono tabular-nums ${(item.changePercent7d ?? 0) >= 0 ? "text-up" : "text-down"}`}>
                      {(item.changePercent7d ?? 0) >= 0 ? "+" : ""}{(item.changePercent7d ?? 0).toFixed(1)}%
                    </td>
                    <td className="py-2.5 px-2 text-right font-mono text-secondary tabular-nums text-[11px]">
                      {item.high ? `$${fmtPrice(item.high)}` : "-"}
                    </td>
                    <td className="py-2.5 px-2 text-right font-mono text-secondary tabular-nums text-[11px]">
                      {item.low ? `$${fmtPrice(item.low)}` : "-"}
                    </td>
                    <td className="py-2.5 px-2 text-right font-mono text-secondary tabular-nums text-[11px]">
                      {item.volume ? fmtVol(item.volume) : "-"}
                    </td>
                    <td className="py-2.5 px-2 text-right font-mono text-secondary tabular-nums text-[11px]">
                      {item.marketCap ? fmtMC(item.marketCap) : "-"}
                    </td>
                    <td className="py-2.5 px-2 text-right">
                      {item.sparkline7d && item.sparkline7d.length > 0 ? (
                        <Sparkline data={item.sparkline7d} />
                      ) : null}
                    </td>
                    <td className="py-2.5 px-2 text-center">
                      <Link
                        href={`/${locale}/markets/${item.symbol.toLowerCase()}`}
                        className="text-[11px] px-2.5 py-1 rounded-sm bg-raised border border-surface text-secondary hover:text-primary hover:border-accent/30 transition-colors font-mono-caps"
                      >
                        {t("markets.colTradeAction")}
                      </Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between max-w-7xl mx-auto w-full px-1">
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
          <span>{page * pageSize + 1}–{Math.min((page + 1) * pageSize, sorted.length)} {t("markets.of")} {sorted.length}</span>
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
