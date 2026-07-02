"use client";

import { useEffect, useMemo, useState, useCallback } from "react";
import { TrendingUp, TrendingDown, ArrowRight, ExternalLink } from "lucide-react";
import Link from "next/link";
import { useFormatPrice, useCurrency, CURRENCY_SYMBOLS } from "@/lib/context/CurrencyContext";

/* ─── Types ─── */

interface CoinData {
  id: string;
  symbol: string;
  name: string;
  image: string;
  current_price: number;
  market_cap_rank: number;
  price_change_percentage_1h_in_currency: number;
  price_change_percentage_24h: number;
  price_change_percentage_7d_in_currency: number;
  total_volume: number;
  market_cap: number;
  sparkline_in_7d?: { price: number[] };
}

interface GlobalData {
  data?: {
    active_cryptocurrencies: number;
    markets: number;
    total_market_cap: { usd: number };
    total_volume: { usd: number };
    market_cap_percentage: { btc: number; eth: number };
    market_cap_change_percentage_24h_usd: number;
  };
}

interface NewsItem {
  title: string;
  url: string;
  source: string;
  domain: string;
  publishedAt: string;
}

interface CategoryData {
  id: string;
  name: string;
  marketCapChange24h: number;
  marketCap: number;
  volume24h: number;
}

/* ─── Helpers ─── */

function fmtPct(v: number | null | undefined): string {
  try {
    if (v == null || Number.isNaN(v)) return "—";
    const sign = v >= 0 ? "+" : "";
    return `${sign}${v.toFixed(2)}%`;
  } catch {
    return "—";
  }
}

function buildSparkPath(prices: number[]): string {
  if (!prices || prices.length < 2) return "";
  const min = Math.min(...prices);
  const max = Math.max(...prices);
  const range = max - min || 1;
  const w = prices.length - 1;
  return prices
    .map((v, i) => `${i === 0 ? "M" : "L"}${(i / w) * 100},${30 - ((v - min) / range) * 26 - 2}`)
    .join(" ");
}

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins} min`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h`;
  return `${Math.floor(hrs / 24)}d`;
}

/* ─── Pills ─── */

const CATEGORIES = ["All", "DeFi", "NFT", "AI", "Meme", "Layer 2", "Gaming", "SocialFi", "RWA", "Infrastructure"];

/* ─── Main Component ─── */

export default function HomeMarketView() {
  const [coins, setCoins] = useState<CoinData[]>([]);
  const [global, setGlobal] = useState<GlobalData | null>(null);
  const [news, setNews] = useState<NewsItem[]>([]);
  const [categories, setCategories] = useState<CategoryData[]>([]);
  const [activeFilter, setActiveFilter] = useState("All");
  const formatPrice = useFormatPrice();
  const { convertFromUsd, formatNumber, currency } = useCurrency();

  const fmtCompact = useCallback((n: number) => {
    const converted = convertFromUsd(n);
    const compact = formatNumber(converted, { notation: "compact", compactDisplay: "short", maximumFractionDigits: 2 });
    return `${CURRENCY_SYMBOLS[currency]}${compact}`;
  }, [convertFromUsd, formatNumber, currency]);

  const loadData = useCallback(async () => {
    const [coinRes, globalRes, newsRes, catRes] = await Promise.allSettled([
      fetch("/api/market/top-cryptos?limit=50"),
      fetch("/api/market/global"),
      fetch("/api/market/news?limit=5&kind=news"),
      fetch("/api/market/categories"),
    ]);
    if (coinRes.status === "fulfilled") {
      const data = await coinRes.value.json();
      if (Array.isArray(data)) setCoins(data);
    }
    if (globalRes.status === "fulfilled") {
      const data = await globalRes.value.json();
      setGlobal(data);
    }
    if (newsRes.status === "fulfilled") {
      const data = await newsRes.value.json();
      if (Array.isArray(data)) setNews(data);
    }
    if (catRes.status === "fulfilled") {
      const data = await catRes.value.json();
      if (Array.isArray(data)) setCategories(data);
    }
  }, []);

  useEffect(() => {
    loadData();
    const id = setInterval(loadData, 60_000);
    return () => clearInterval(id);
  }, [loadData]);

  const g = global?.data;

  const topGainers = useMemo(
    () => [...coins].sort((a, b) => b.price_change_percentage_24h - a.price_change_percentage_24h).slice(0, 3),
    [coins]
  );

  return (
    <section className="bg-canvas">
      <div className="max-w-7xl mx-auto px-4 sm:px-8 lg:px-16 xl:px-28 pt-6 pb-12">
        {/* ─── Stats Bar ─── */}
        <div className="flex flex-wrap items-center gap-x-5 gap-y-1 text-xs text-secondary mb-6">
          {g && (
            <>
              <span className="flex items-center gap-1">
                Coins <strong className="text-primary font-semibold">{g.active_cryptocurrencies.toLocaleString()}</strong>
              </span>
              <span className="flex items-center gap-1">
                Exchanges <strong className="text-primary font-semibold">{g.markets.toLocaleString()}</strong>
              </span>
              <span className="flex items-center gap-1">
                Market Cap{" "}
                <strong className="text-primary font-semibold">{fmtCompact(g.total_market_cap.usd)}</strong>
                <span className={`flex items-center gap-0.5 ${g.market_cap_change_percentage_24h_usd >= 0 ? "text-up" : "text-down"}`}>
                  {g.market_cap_change_percentage_24h_usd >= 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                  {fmtPct(g.market_cap_change_percentage_24h_usd)}
                </span>
              </span>
              <span className="flex items-center gap-1">
                Volume 24h <strong className="text-primary font-semibold">{fmtCompact(g.total_volume.usd)}</strong>
              </span>
              <span className="flex items-center gap-1">
                BTC Dominance <strong className="text-primary font-semibold">{(g.market_cap_percentage.btc ?? 0).toFixed(1)}%</strong>
              </span>
              <span className="flex items-center gap-1">
                ETH Dominance <strong className="text-primary font-semibold">{(g.market_cap_percentage.eth ?? 0).toFixed(1)}%</strong>
              </span>
            </>
          )}
        </div>

        {/* ─── Title ─── */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2 mb-6">
          <div>
            <h1 className="heading-2 text-primary">Cryptocurrency Prices by Market Cap</h1>
            <p className="text-sm text-secondary mt-1">
              Total market cap {g ? fmtCompact(g.total_market_cap.usd) : "—"}
              {g && (
                <span className={`ml-2 ${g.market_cap_change_percentage_24h_usd >= 0 ? "text-up" : "text-down"}`}>
                  {fmtPct(g.market_cap_change_percentage_24h_usd)}
                </span>
              )}
            </p>
          </div>
          <Link href="/markets" className="text-xs text-accent hover:underline flex items-center gap-1">
            Read more about cryptocurrencies <ArrowRight className="w-3 h-3" />
          </Link>
        </div>

        {/* ─── 3 Cards Row ─── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
          {/* Market Cap */}
          <div className="bg-card rounded-md p-5">
            <div className="text-xs text-secondary mb-1">Market Cap</div>
            <div className="text-lg font-semibold text-primary">{g ? fmtCompact(g.total_market_cap.usd) : "—"}</div>
            <div className={`text-xs ${g && g.market_cap_change_percentage_24h_usd >= 0 ? "text-up" : "text-down"}`}>
              {g ? fmtPct(g.market_cap_change_percentage_24h_usd) : "—"}
            </div>
            {coins.length > 0 && (
              <svg className="w-full h-8 mt-3" viewBox="0 0 100 30" preserveAspectRatio="none">
                <path d={buildSparkPath(coins[0].sparkline_in_7d?.price ?? [])} fill="none" stroke="var(--text-accent)" strokeWidth="2" />
              </svg>
            )}
          </div>

          {/* Volume 24h */}
          <div className="bg-card rounded-md p-5">
            <div className="text-xs text-secondary mb-1">Volume 24h</div>
            <div className="text-lg font-semibold text-primary">{g ? fmtCompact(g.total_volume.usd) : "—"}</div>
            <div className="text-xs text-tertiary">Total across all exchanges</div>
            {coins.length > 1 && (
              <svg className="w-full h-8 mt-3" viewBox="0 0 100 30" preserveAspectRatio="none">
                <path d={buildSparkPath(coins[1].sparkline_in_7d?.price ?? [])} fill="none" stroke="var(--text-accent)" strokeWidth="2" />
              </svg>
            )}
          </div>

          {/* Top Gainers */}
          <div className="bg-card rounded-md p-5">
            <div className="text-xs text-secondary mb-1">🔥 Top Gainers (24h)</div>
            <div className="space-y-2 mt-3">
              {topGainers.map((coin) => (
                <div key={coin.id} className="flex items-center justify-between">
                  <Link href={`/markets/${coin.id}`} className="flex items-center gap-2 hover:text-accent transition-colors">
                    <img src={coin.image} alt={coin.symbol} className="w-5 h-5 rounded-full" />
                    <span className="text-sm font-medium text-primary">{coin.symbol.toUpperCase()}</span>
                  </Link>
                  <span className="text-sm text-up font-medium">{fmtPct(coin.price_change_percentage_24h)}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ─── Main Content: Table + Sidebar ─── */}
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Table */}
          <div className="flex-1 min-w-0">
            {/* Filter Pills */}
            <div className="flex items-center gap-2 mb-4 overflow-x-auto hide-scrollbar">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setActiveFilter(cat)}
                  className={`whitespace-nowrap px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                    activeFilter === cat
                      ? "bg-accent text-on-accent"
                      : "bg-card text-secondary hover:text-primary hover:bg-raised"
                  }`}
                  type="button"
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-surface text-xs text-tertiary font-mono-caps">
                    <th className="text-left py-3 pr-2 w-8">#</th>
                    <th className="text-left py-3 px-2">Coin</th>
                    <th className="text-right py-3 px-2">Price</th>
                    <th className="text-right py-3 px-2 hidden sm:table-cell">1h</th>
                    <th className="text-right py-3 px-2">24h</th>
                    <th className="text-right py-3 px-2 hidden md:table-cell">7d</th>
                    <th className="text-right py-3 px-2 hidden lg:table-cell">Volume 24h</th>
                    <th className="text-right py-3 px-2 hidden lg:table-cell">Market Cap</th>
                    <th className="text-right py-3 px-2 hidden xl:table-cell">Last 7d</th>
                  </tr>
                </thead>
                <tbody>
                  {coins.length === 0 ? (
                    <tr>
                      <td colSpan={9} className="text-center py-12 text-secondary text-sm">Loading market data...</td>
                    </tr>
                  ) : (
                    coins.map((coin) => (
                      <tr
                        key={coin.id}
                        className="border-b border-surface/50 hover:bg-raised/50 transition-colors"
                      >
                        <td className="py-3 pr-2 text-xs text-tertiary">{coin.market_cap_rank}</td>
                        <td className="py-3 px-2">
                          <Link href={`/markets/${coin.id}`} className="flex items-center gap-2.5">
                            <img src={coin.image} alt="" className="w-6 h-6 rounded-full" />
                            <div>
                              <div className="text-sm font-medium text-primary leading-tight">{coin.name}</div>
                              <div className="text-xs text-tertiary">{coin.symbol.toUpperCase()}</div>
                            </div>
                          </Link>
                        </td>
                        <td className="py-3 px-2 text-right font-medium text-primary">{formatPrice(coin.current_price)}</td>
                        <td className={`py-3 px-2 text-right font-medium hidden sm:table-cell ${(coin.price_change_percentage_1h_in_currency ?? 0) >= 0 ? "text-up" : "text-down"}`}>
                          {fmtPct(coin.price_change_percentage_1h_in_currency)}
                        </td>
                        <td className={`py-3 px-2 text-right font-medium ${(coin.price_change_percentage_24h ?? 0) >= 0 ? "text-up" : "text-down"}`}>
                          {fmtPct(coin.price_change_percentage_24h)}
                        </td>
                        <td className={`py-3 px-2 text-right font-medium hidden md:table-cell ${(coin.price_change_percentage_7d_in_currency ?? 0) >= 0 ? "text-up" : "text-down"}`}>
                          {fmtPct(coin.price_change_percentage_7d_in_currency ?? 0)}
                        </td>
                        <td className="py-3 px-2 text-right text-sm text-tertiary hidden lg:table-cell">{fmtCompact(coin.total_volume)}</td>
                        <td className="py-3 px-2 text-right text-sm text-tertiary hidden lg:table-cell">{fmtCompact(coin.market_cap)}</td>
                        <td className="py-3 px-2 hidden xl:table-cell">
                          {coin.sparkline_in_7d?.price ? (
                            <svg className="w-20 h-6" viewBox="0 0 100 30" preserveAspectRatio="none">
                              <path
                                d={buildSparkPath(coin.sparkline_in_7d.price)}
                                fill="none"
                                stroke={coin.price_change_percentage_24h >= 0 ? "var(--text-up)" : "var(--text-down)"}
                                strokeWidth="2"
                              />
                            </svg>
                          ) : (
                            <span className="text-xs text-tertiary">—</span>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Footer link */}
            <div className="mt-4 text-center">
              <Link
                href="/markets"
                className="inline-flex items-center gap-1.5 text-sm text-accent hover:underline font-medium"
              >
                View all {coins.length > 0 ? coins.length : ""} coins <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>

          {/* ─── Sidebar ─── */}
          <aside className="w-full lg:w-[280px] flex-shrink-0 space-y-6">
            {/* Market Overview */}
            <div className="bg-card rounded-md p-5">
              <h3 className="text-sm font-semibold text-primary mb-3 flex items-center gap-2">
                📈 Market Overview
              </h3>
              <p className="text-xs text-secondary leading-relaxed">
                {g
                  ? `Global cryptocurrency market cap is ${fmtCompact(g.total_market_cap.usd)}, a ${
                      g.market_cap_change_percentage_24h_usd >= 0 ? "increase" : "decrease"
                    } of ${fmtPct(Math.abs(g.market_cap_change_percentage_24h_usd))} over the last 24 hours. Bitcoin dominance stands at ${
                      (g.market_cap_percentage.btc ?? 0).toFixed(1)
                    }%, with Ethereum at ${(g.market_cap_percentage.eth ?? 0).toFixed(1)}%.`
                  : "Loading market overview..."}
              </p>
            </div>

            {/* Trending Categories */}
            <div className="bg-card rounded-md p-5">
              <h3 className="text-sm font-semibold text-primary mb-3 flex items-center gap-2">
                🔥 Trending Categories
              </h3>
              {categories.length === 0 ? (
                <div className="space-y-2">
                  {Array.from({ length: 4 }).map((_, i) => (
                    <div key={i} className="h-6 bg-raised rounded animate-pulse" />
                  ))}
                </div>
              ) : (
                <div className="space-y-1">
                  {categories.map((cat) => (
                    <Link
                      key={cat.id}
                      href={`/markets?category=${encodeURIComponent(cat.name)}`}
                      className="block py-1.5 px-2 rounded hover:bg-raised transition-colors"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-primary truncate pr-2">{cat.name}</span>
                        <span className={`text-xs font-medium tabular-nums ${cat.marketCapChange24h >= 0 ? "text-up" : "text-down"}`}>
                          {fmtPct(cat.marketCapChange24h)}
                        </span>
                      </div>
                      <div className="text-[10px] text-tertiary tabular-nums">
                        Cap {fmtCompact(cat.marketCap)} · Vol {fmtCompact(cat.volume24h)}
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>

            {/* News */}
            {news.length > 0 && (
              <div className="bg-card rounded-md p-5">
                <h3 className="text-sm font-semibold text-primary mb-3 flex items-center gap-2">
                  📰 News
                </h3>
                <div className="space-y-3">
                  {news.map((item, i) => (
                    <a
                      key={i}
                      href={item.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block group"
                    >
                      <p className="text-xs text-primary group-hover:text-accent transition-colors leading-relaxed">
                        {item.title}
                      </p>
                      <div className="flex items-center gap-2 mt-1 text-[10px] text-tertiary">
                        <span>{timeAgo(item.publishedAt)}</span>
                        <span>·</span>
                        <span className="flex items-center gap-0.5">
                          {item.source} <ExternalLink className="w-2.5 h-2.5" />
                        </span>
                      </div>
                    </a>
                  ))}
                </div>
              </div>
            )}
          </aside>
        </div>
      </div>
    </section>
  );
}
