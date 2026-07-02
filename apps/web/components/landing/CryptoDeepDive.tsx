"use client";

import { useTranslations, useLocale } from "next-intl";
import { useEffect, useMemo, useState } from "react";
import { ArrowRight, Star } from "lucide-react";
import Link from "next/link";
import { useRealtimePrice } from "@/lib/hooks/useRealtimePrice";
import { useFormatPrice, useCurrency, CURRENCY_SYMBOLS } from "@/lib/context/CurrencyContext";

interface CoinGeckoMarket {
  id: string;
  symbol: string;
  name: string;
  image: string;
  current_price: number;
  market_cap: number;
  market_cap_rank: number;
  total_volume: number;
  price_change_percentage_1h_in_currency?: number;
  price_change_percentage_24h_in_currency?: number;
  price_change_percentage_7d_in_currency?: number;
  sparkline_in_7d?: { price: number[] };
  categories?: string[];
}

const CATEGORY_SYMBOLS: Record<string, Set<string>> = {
  layer1: new Set(["BTC", "ETH", "SOL", "BNB", "ADA", "AVAX", "DOT", "NEAR", "ATOM", "XTZ"]),
  layer2: new Set(["MATIC", "ARB", "OP", "IMX", "LRC", "MNT"]),
  defi: new Set(["UNI", "AAVE", "MKR", "CRV", "SNX", "COMP", "SUSHI", "CAKE"]),
  memes: new Set(["DOGE", "SHIB", "PEPE", "FLOKI", "BONK", "WIF"]),
};

const CATEGORY_API_NAMES: Record<string, string> = {
  layer1: "Layer 1",
  layer2: "Layer 2",
  defi: "Decentralized Finance (DeFi)",
  memes: "Meme",
};

const WATCHLIST_KEY = "zenith:watchlist";
const WS_TOP_N = 5;
const REFRESH_MS = 60_000;

function PercentBadge({ value }: { value: number | undefined }) {
  if (value === undefined || value === null) return <span className="text-secondary">—</span>;
  const isPositive = value >= 0;
  return (
    <span className={`inline-flex items-center px-1.5 py-0.5 rounded text-xs border ${
      isPositive
        ? "bg-accent-subtle text-accent border-accent/20"
        : "bg-down-subtle text-down border-down/20"
    }`}>
      {isPositive ? "+" : ""}{value.toFixed(2)}%
    </span>
  );
}

function Sparkline({ prices }: { prices: number[] | undefined }) {
  if (!prices || prices.length < 2) {
    return <span className="text-secondary text-xs">—</span>;
  }
  const min = Math.min(...prices);
  const max = Math.max(...prices);
  const range = max - min || 1;
  const points = prices
    .map((p, i) => {
      const x = (i / (prices.length - 1)) * 168;
      const y = 32 - ((p - min) / range) * 32;
      return `${x.toFixed(2)},${y.toFixed(2)}`;
    })
    .join(" ");
  const isUp = prices[prices.length - 1] >= prices[0];
  return (
    <svg className="w-20 h-6" viewBox="0 0 168 32" preserveAspectRatio="none">
      <polyline
        points={points}
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        className={isUp ? "text-up" : "text-down"}
      />
    </svg>
  );
}

export default function CryptoDeepDive() {
  const t = useTranslations("crypto");
  const locale = useLocale();
  const formatPrice = useFormatPrice();
  const { convertFromUsd, formatNumber, currency } = useCurrency();
  const [assets, setAssets] = useState<CoinGeckoMarket[]>([]);
  const [activeCategory, setActiveCategory] = useState<string>("all");
  const [favorites, setFavorites] = useState<string[]>([]);
  const [flashSymbol, setFlashSymbol] = useState<string | null>(null);

  const formatLargeNumber = useMemo(() => (n: number | undefined) => {
    if (!n) return "—";
    const converted = convertFromUsd(n);
    const compact = formatNumber(converted, { notation: "compact", compactDisplay: "short", maximumFractionDigits: 2 });
    return `${CURRENCY_SYMBOLS[currency]}${compact}`;
  }, [convertFromUsd, formatNumber, currency]);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(WATCHLIST_KEY);
      if (stored) setFavorites(JSON.parse(stored));
    } catch {}
  }, []);

  useEffect(() => {
    let mounted = true;
    const fetchData = async () => {
      try {
        const res = await fetch(`/api/market/top-cryptos?limit=10`, { cache: "no-store" });
        if (!res.ok) return;
        const data: CoinGeckoMarket[] = await res.json();
        if (mounted) setAssets(data);
      } catch (err) {
        console.error("Failed to fetch top cryptos:", err);
      }
    };
    fetchData();
    const interval = setInterval(fetchData, REFRESH_MS);
    return () => {
      mounted = false;
      clearInterval(interval);
    };
  }, []);

  const wsSymbols = useMemo(
    () => assets.slice(0, WS_TOP_N).map((a) => a.symbol.toUpperCase()),
    [assets]
  );
  const { prices: livePrices, isConnected } = useRealtimePrice(wsSymbols);

  const filteredAssets = useMemo(() => {
    if (activeCategory === "all") return assets;
    const apiName = CATEGORY_API_NAMES[activeCategory];
    const symbolSet = CATEGORY_SYMBOLS[activeCategory] || new Set();
    return assets.filter((a) => {
      if (a.categories?.includes(apiName)) return true;
      return symbolSet.has(a.symbol.toUpperCase());
    });
  }, [assets, activeCategory]);

  const toggleFavorite = (symbol: string) => {
    const upper = symbol.toUpperCase();
    setFavorites((prev) => {
      const isAdding = !prev.includes(upper);
      const next = isAdding ? [...prev, upper] : prev.filter((s) => s !== upper);
      try {
        localStorage.setItem(WATCHLIST_KEY, JSON.stringify(next));
      } catch {}
      if (isAdding) {
        setFlashSymbol(upper);
        setTimeout(() => setFlashSymbol(null), 700);
      }
      return next;
    });
  };

  const CATEGORIES = useMemo(
    () => [
      { label: t("categories.all"), value: "all" },
      { label: t("categories.layer1"), value: "layer1" },
      { label: t("categories.layer2"), value: "layer2" },
      { label: t("categories.defi"), value: "defi" },
      { label: t("categories.memes"), value: "memes" },
    ],
    [t]
  );

  return (
    <section className="py-16 px-4 relative overflow-hidden bg-canvas">
      <div className="absolute top-1/2 right-0 w-[400px] h-[400px] bg-accent-subtle opacity-20 blur-[100px] rounded-full pointer-events-none" />

      <div className="max-w-7xl mx-auto relative z-10">
        <div className="flex flex-col md:flex-row md:justify-between md:items-end gap-4 mb-8">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <p className="font-mono-caps text-secondary">{t("badge")}</p>
              <span
                className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold uppercase tracking-wider font-mono ${
                  isConnected ? "bg-accent text-on-accent" : "bg-warning-subtle text-warning"
                }`}
              >
                {isConnected ? t("live") : t("offline")}
              </span>
            </div>
            <h2 className="heading-2 text-primary mb-2">
              {t.rich("title", {
                live: (chunks) => <span className="text-accent">{chunks}</span>,
              })}
            </h2>
            <p className="text-secondary text-sm">{t("subtitle")}</p>
          </div>
          <Link
            href="/markets"
            className="text-sm border border-surface px-4 py-2 rounded-full hover:bg-raised transition flex items-center gap-2 w-fit text-secondary hover:text-primary"
          >
            {t("seeAll")}
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="flex gap-2 mb-6 overflow-x-auto hide-scrollbar">
          {CATEGORIES.map((cat) => {
            const isActive = activeCategory === cat.value;
            return (
              <button
                key={cat.value}
                onClick={() => setActiveCategory(cat.value)}
                className={`px-4 py-1.5 rounded-full text-sm font-medium transition whitespace-nowrap ${
                  isActive
                    ? "bg-accent text-on-accent"
                    : "border border-surface text-secondary hover:bg-raised"
                }`}
              >
                {cat.label}
              </button>
            );
          })}
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs md:text-sm whitespace-nowrap">
            <thead>
              <tr className="font-mono-caps text-secondary border-b border-surface">
                <th className="py-3 px-2 w-8">{t("tableHeaders.num")}</th>
                <th className="py-3 px-2">{t("tableHeaders.name")}</th>
                <th className="py-3 px-2 text-right">{t("tableHeaders.price")}</th>
                <th className="py-3 px-2 text-right">1H</th>
                <th className="py-3 px-2 text-right">{t("tableHeaders.24h")}</th>
                <th className="py-3 px-2 text-right">{t("tableHeaders.7d")}</th>
                <th className="py-3 px-2 text-right">{t("tableHeaders.marketCap")}</th>
                <th className="py-3 px-2 text-right">{t("tableHeaders.vol24h")}</th>
                <th className="py-3 px-2 text-right">{t("tableHeaders.7dVol")}</th>
                <th className="py-3 px-2 w-8"></th>
              </tr>
            </thead>
            <tbody className="text-primary">
              {filteredAssets.length === 0 ? (
                <tr>
                  <td colSpan={10} className="py-8 text-center text-secondary text-sm">
                    Chargement des cryptos…
                  </td>
                </tr>
              ) : (
                filteredAssets.map((asset) => {
                  const symbol = asset.symbol.toUpperCase();
                  const livePrice = livePrices[symbol];
                  const displayPrice = livePrice
                    ? formatPrice(livePrice.price)
                    : formatPrice(asset.current_price);
                  const isFavorite = favorites.includes(symbol);
                  const isFlashing = flashSymbol === symbol;

                  return (
                    <tr
                      key={asset.id}
                      className="border-b border-surface/50 hover:bg-raised transition-colors"
                    >
                      <td className="py-4 px-2 text-secondary">{asset.market_cap_rank}</td>
                      <td className="py-4 px-2">
                        <Link
                          href={`/markets/${asset.id}`}
                          className="flex items-center gap-2 md:gap-3"
                        >
                          <img
                            src={asset.image}
                            alt={asset.name}
                            width={28}
                            height={28}
                            className="rounded-full shrink-0"
                            loading="lazy"
                          />
                          <div>
                            <div className="font-medium group-hover:text-accent transition">
                              {asset.name}
                            </div>
                            <div className="text-[10px] md:text-xs text-secondary">
                              {symbol}
                            </div>
                          </div>
                        </Link>
                      </td>
                      <td className="py-4 px-2 text-right font-medium">
                        <span
                          className={`transition-colors duration-200 ${
                            livePrice
                              ? livePrice.side === "BUY"
                                ? "text-up"
                                : "text-down"
                              : ""
                          }`}
                        >
                          {displayPrice}
                        </span>
                      </td>
                      <td className="py-4 px-2 text-right">
                        <PercentBadge value={asset.price_change_percentage_1h_in_currency} />
                      </td>
                      <td className="py-4 px-2 text-right">
                        <PercentBadge value={asset.price_change_percentage_24h_in_currency} />
                      </td>
                      <td className="py-4 px-2 text-right">
                        <PercentBadge value={asset.price_change_percentage_7d_in_currency} />
                      </td>
                      <td className="py-4 px-2 text-right text-secondary">
                        {formatLargeNumber(asset.market_cap)}
                      </td>
                      <td className="py-4 px-2 text-right text-secondary">
                        {formatLargeNumber(asset.total_volume)}
                      </td>
                      <td className="py-4 px-2 text-right">
                        <Sparkline prices={asset.sparkline_in_7d?.price} />
                      </td>
                      <td className="py-4 px-2 text-right">
                        <button
                          type="button"
                          aria-label={isFavorite ? "Retirer des favoris" : "Ajouter aux favoris"}
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleFavorite(symbol);
                          }}
                          className={`p-1 rounded transition-all ${
                            isFavorite
                              ? "text-warning"
                              : "text-secondary hover:text-primary"
                          } ${isFlashing ? "scale-125" : "scale-100"}`}
                        >
                          <Star
                            className={`w-4 h-4 ${isFavorite ? "fill-current" : ""}`}
                          />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        <div className="mt-8 text-center">
          <Link
            href="/markets"
            className="inline-flex items-center gap-2 text-accent hover:text-primary transition-colors text-sm font-medium"
          >
            {t("exploreAll")}
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}
