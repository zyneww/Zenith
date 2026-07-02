"use client";

import { useTranslations, useLocale } from "next-intl";
import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  Flame,
  Trophy,
  TrendingDown,
  ArrowRightLeft,
  Droplets,
  Fuel,
  ArrowRight,
  Zap,
  RefreshCw,
  AlertCircle,
} from "lucide-react";
import { useFormatPrice, useCurrency, type Currency } from "@/lib/context/CurrencyContext";

type Mover = {
  id: string;
  symbol: string;
  name: string;
  image: string;
  price: number;
  change24h: number;
};

type FearGreed = { value: number; label: string; timestamp: number };

type GasLevels = { slow: number; average: number; fast: number };
type GasData = {
  chain: string;
  levels: GasLevels;
  unit: string;
  lastBlock: number;
  fetchedAt: number;
  fallback?: boolean;
};

type Crypto = {
  id: string;
  symbol: string;
  name: string;
  current_price: number;
  image: string;
};

const CHAINS = ["ethereum", "polygon", "arbitrum"] as const;
const CHAIN_LABEL: Record<string, string> = {
  ethereum: "Ethereum",
  polygon: "Polygon",
  arbitrum: "Arbitrum",
};

const CRYPTO_OPTIONS = ["BTC", "ETH", "SOL", "BNB", "XRP"];
const FIAT_OPTIONS = ["USD", "EUR"];
const ALL_OPTIONS = [...CRYPTO_OPTIONS, ...FIAT_OPTIONS];

function gasDotColor(level: number): string {
  if (level < 30) return "bg-up";
  if (level < 80) return "bg-warning";
  return "bg-down";
}

function formatCrypto(p: number, locale: string): string {
  if (!isFinite(p)) return "—";
  if (p >= 1) return p.toLocaleString(locale, { maximumFractionDigits: 2, minimumFractionDigits: 2 });
  if (p >= 0.01) return p.toLocaleString(locale, { maximumFractionDigits: 4 });
  return p.toLocaleString(locale, { maximumFractionDigits: 8 });
}

export default function QuickTools() {
  const t = useTranslations("quickTools");
  const locale = useLocale();
  const formatPrice = useFormatPrice();
  const { rates, currency, convertFromUsd, formatNumber } = useCurrency();

  // --- Daily Movers ---
  const [activeTab, setActiveTab] = useState<"trending" | "gainers" | "losers">("trending");
  const [movers, setMovers] = useState<Mover[]>([]);
  const [moversLoading, setMoversLoading] = useState(true);
  const [moversError, setMoversError] = useState(false);

  const fetchMovers = useCallback(async (tab: string, signal?: AbortSignal) => {
    setMoversLoading(true);
    setMoversError(false);
    try {
      const res = await fetch(`/api/market/movers/${tab}`, { signal, cache: "no-store" });
      if (!res.ok) throw new Error("movers");
      const data = (await res.json()) as Mover[];
      setMovers(Array.isArray(data) ? data.slice(0, 3) : []);
    } catch (e) {
      if ((e as { name?: string })?.name !== "AbortError") setMoversError(true);
    } finally {
      setMoversLoading(false);
    }
  }, []);

  useEffect(() => {
    const ctrl = new AbortController();
    fetchMovers(activeTab, ctrl.signal);
    const id = setInterval(() => fetchMovers(activeTab, ctrl.signal), 60_000);
    return () => {
      ctrl.abort();
      clearInterval(id);
    };
  }, [activeTab, fetchMovers]);

  // --- Quick Converter ---
  const [cryptos, setCryptos] = useState<Crypto[]>([]);
  const [fromAmount, setFromAmount] = useState("1");
  const [fromSymbol, setFromSymbol] = useState("BTC");
  const [toSymbol, setToSymbol] = useState("USD");

  useEffect(() => {
    const ctrl = new AbortController();
    fetch("/api/market/top-cryptos?limit=10", { signal: ctrl.signal, cache: "no-store" })
      .then((r) => (r.ok ? r.json() : []))
      .then((data: Crypto[]) => setCryptos(Array.isArray(data) ? data : []))
      .catch(() => {});
    return () => ctrl.abort();
  }, []);

  const fiatRates = useMemo(() => {
    const m: Record<string, number> = { USD: 1 };
    if (rates) {
      for (const fiat of FIAT_OPTIONS) {
        if (fiat !== "USD") m[fiat] = rates.rates[fiat as Currency] ?? 1;
      }
    }
    return m;
  }, [rates]);

  const priceMap = useMemo(() => {
    const m: Record<string, number> = { ...fiatRates };
    for (const c of cryptos) {
      const sym = c.symbol?.toUpperCase();
      if (sym && c.current_price > 0) m[sym] = c.current_price;
    }
    return m;
  }, [cryptos, fiatRates]);

  const toAmount = useMemo(() => {
    const n = parseFloat(fromAmount);
    if (!isFinite(n)) return 0;
    const fromUsd = fiatRates[fromSymbol] !== undefined
      ? fiatRates[fromSymbol]
      : priceMap[fromSymbol] ?? 0;
    const toUsd = fiatRates[toSymbol] !== undefined
      ? fiatRates[toSymbol]
      : priceMap[toSymbol] ?? 0;
    if (!toUsd) return 0;
    return (n * fromUsd) / toUsd;
  }, [fromAmount, fromSymbol, toSymbol, priceMap, fiatRates]);

  const usdValue = useMemo(() => {
    const n = parseFloat(fromAmount);
    if (!isFinite(n)) return 0;
    return n * (fiatRates[fromSymbol] !== undefined ? fiatRates[fromSymbol] : priceMap[fromSymbol] ?? 0);
  }, [fromAmount, fromSymbol, priceMap, fiatRates]);

  const swap = () => {
    setFromSymbol(toSymbol);
    setToSymbol(fromSymbol);
  };

  // --- Fear & Greed ---
  const [fearGreed, setFearGreed] = useState<FearGreed>({ value: 50, label: "Neutral", timestamp: 0 });
  const [fgLoading, setFgLoading] = useState(true);
  const [fgError, setFgError] = useState(false);

  useEffect(() => {
    const ctrl = new AbortController();
    fetch("/api/sentiment/fear-greed", { signal: ctrl.signal, cache: "no-store" })
      .then((r) => (r.ok ? r.json() : null))
      .then((d: FearGreed | null) => {
        if (d && typeof d.value === "number") setFearGreed(d);
        else setFgError(true);
      })
      .catch(() => setFgError(true))
      .finally(() => setFgLoading(false));
    return () => ctrl.abort();
  }, []);

  // --- Gas Tracker ---
  const [gas, setGas] = useState<Record<string, GasData | null>>({});
  const [gasLoading, setGasLoading] = useState(true);

  useEffect(() => {
    const ctrl = new AbortController();
    const load = () => {
      setGasLoading(true);
      Promise.all(
        CHAINS.map((c) =>
          fetch(`/api/gas/${c}`, { signal: ctrl.signal, cache: "no-store" })
            .then((r) => (r.ok ? r.json() : null))
            .then((d: GasData | null) => [c, d] as const)
            .catch(() => [c, null] as const)
        )
      ).then((entries) => {
        setGas(Object.fromEntries(entries));
        setGasLoading(false);
      });
    };
    load();
    const id = setInterval(load, 30_000);
    return () => {
      ctrl.abort();
      clearInterval(id);
    };
  }, []);

  const fgColor = (() => {
    const v = fearGreed.value;
    if (v < 25) return "text-down";
    if (v < 50) return "text-warning";
    if (v < 75) return "text-up";
    return "text-accent";
  })();

  const tabs = [
    { key: "trending", label: t("tabs.trending"), icon: Flame },
    { key: "gainers", label: t("tabs.gainers"), icon: Trophy },
    { key: "losers", label: t("tabs.losers"), icon: TrendingDown },
  ] as const;

  return (
    <section className="py-12 px-4 bg-canvas">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-10">
          <p className="font-mono-caps text-secondary mb-2">FIG 02 — OUTILS</p>
          <h2 className="heading-2 text-3xl md:text-4xl font-medium text-primary mb-2">
            {t("title")}
          </h2>
          <p className="text-secondary text-sm">{t("subtitle")}</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
          {/* Left Column */}
          <div className="md:col-span-8 flex flex-col gap-6">
            {/* Daily Movers */}
            <div className="bg-card border border-surface rounded-sm p-6">
              <div className="flex justify-between items-center mb-6 flex-wrap gap-3">
                <div>
                  <h3 className="text-lg font-medium text-primary">{t("sectionTitle")}</h3>
                  <p className="text-secondary text-xs">{t("sectionDesc")}</p>
                </div>
                <div className="flex bg-raised rounded-sm p-1 border border-surface">
                  {tabs.map((tab) => (
                    <button
                      key={tab.key}
                      onClick={() => setActiveTab(tab.key)}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-sm text-xs font-medium transition ${
                        activeTab === tab.key
                          ? "bg-accent-subtle text-accent"
                          : "text-secondary hover:text-primary"
                      }`}
                    >
                      <tab.icon className="w-3.5 h-3.5" />
                      {tab.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-3">
                {moversLoading && movers.length === 0 ? (
                  Array.from({ length: 3 }).map((_, i) => (
                    <div key={i} className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-4 h-3 bg-raised rounded animate-pulse" />
                        <div className="w-6 h-6 rounded-full bg-raised animate-pulse" />
                        <div className="space-y-1.5">
                          <div className="w-20 h-3 bg-raised rounded animate-pulse" />
                          <div className="w-10 h-2 bg-raised rounded animate-pulse" />
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="w-16 h-3 bg-raised rounded animate-pulse" />
                        <div className="w-14 h-5 bg-raised rounded animate-pulse" />
                      </div>
                    </div>
                  ))
                ) : moversError ? (
                  <div className="flex flex-col items-center justify-center py-6 gap-3">
                    <AlertCircle className="w-5 h-5 text-down" />
                    <p className="text-sm text-secondary">Erreur de chargement</p>
                    <button
                      onClick={() => fetchMovers(activeTab)}
                      className="flex items-center gap-1.5 text-xs text-accent hover:underline"
                    >
                      <RefreshCw className="w-3 h-3" /> Réessayer
                    </button>
                  </div>
                ) : (
                  movers.map((item, idx) => (
                    <Link
                      key={item.id}
                      href={`/markets/${item.id}`}
                      className="flex items-center justify-between hover:bg-raised -mx-2 px-2 py-1.5 rounded transition"
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-secondary text-sm w-4">{idx + 1}</span>
                        <img
                          src={item.image}
                          alt={item.symbol}
                          width={24}
                          height={24}
                          className="w-6 h-6 rounded-full"
                        />
                        <div>
                          <div className="font-medium text-sm text-primary">{item.name}</div>
                          <div className="text-xs text-secondary">{item.symbol}</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <span className="font-medium text-sm text-primary">
                          {formatPrice(item.price)}
                        </span>
                        <span
                          className={`px-1.5 py-0.5 rounded-sm text-xs font-medium ${
                            item.change24h >= 0 ? "text-up" : "text-down"
                          }`}
                        >
                          {item.change24h >= 0 ? "+" : ""}
                          {item.change24h.toFixed(2)}%
                        </span>
                      </div>
                    </Link>
                  ))
                )}
              </div>
            </div>

            {/* Quick Converter */}
            <div className="bg-card border border-surface rounded-sm p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-sm font-medium text-primary flex items-center gap-2">
                  <ArrowRightLeft className="w-4 h-4 text-accent" />
                  {t("converterTitle")}
                </h3>
                <span className="font-mono-caps text-secondary">LIVE — RATES</span>
              </div>

              <div className="flex flex-col md:flex-row items-center gap-3">
                <div className="flex-1 w-full bg-canvas border border-surface rounded-md p-2 flex items-center">
                  <input
                    type="text"
                    inputMode="decimal"
                    value={fromAmount}
                    onChange={(e) => setFromAmount(e.target.value)}
                    aria-label="Montant source"
                    className="bg-transparent text-primary font-medium w-full focus:outline-none px-2"
                  />
                  <select
                    value={fromSymbol}
                    onChange={(e) => setFromSymbol(e.target.value)}
                    aria-label="Devise source"
                    className="bg-canvas text-sm text-primary focus:outline-none border-l border-surface pl-2 py-1 uppercase"
                  >
                    {ALL_OPTIONS.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                </div>

                <button
                  onClick={swap}
                  aria-label="Inverser"
                  className="bg-raised p-2 rounded-sm border border-surface hover:bg-card transition shrink-0"
                >
                  <ArrowRightLeft className="w-4 h-4 text-secondary" />
                </button>

                <div className="flex-1 w-full bg-canvas border border-surface rounded-md p-2 flex items-center">
                  <input
                    type="text"
                    readOnly
                    value={toAmount ? (FIAT_OPTIONS.includes(toSymbol) ? formatPrice(usdValue) : formatCrypto(toAmount, locale)) : "—"}
                    aria-label="Montant converti"
                    className="bg-transparent text-primary font-medium w-full focus:outline-none px-2"
                  />
                  <select
                    value={toSymbol}
                    onChange={(e) => setToSymbol(e.target.value)}
                    aria-label="Devise cible"
                    className="bg-canvas text-sm text-primary focus:outline-none border-l border-surface pl-2 py-1 uppercase"
                  >
                    {ALL_OPTIONS.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="text-[10px] text-tertiary mt-3 font-mono-caps">
                {fromAmount || "0"} {fromSymbol} ={" "}
                <span className="text-primary font-medium">
                  {toAmount ? (FIAT_OPTIONS.includes(toSymbol) ? formatPrice(usdValue) : formatCrypto(toAmount, locale)) : "—"}
                </span>{" "}
                {FIAT_OPTIONS.includes(toSymbol) ? currency : toSymbol}
                {priceMap[fromSymbol] ? (
                  <span className="ml-2">
                    · 1 {fromSymbol} = {formatPrice(priceMap[fromSymbol])}
                  </span>
                ) : null}
              </div>
            </div>
          </div>

          {/* Right Column */}
          <div className="md:col-span-4 flex flex-col gap-6">
            {/* Fear & Greed */}
            <div className="bg-card border border-surface rounded-sm p-6 flex flex-col items-center">
              <div className="w-full flex justify-between items-center mb-2">
                <h3 className="text-sm font-medium text-primary">{t("fearGreedTitle")}</h3>
                <span className="font-mono-caps text-secondary">{t("fearGreedSub")}</span>
              </div>

              <div className="relative w-40 h-24 mt-4 overflow-hidden">
                <svg viewBox="0 0 100 50" className="w-full h-full">
                  <path
                    d="M 10 50 A 40 40 0 0 1 90 50"
                    fill="none"
                    stroke="var(--border-default)"
                    strokeWidth="8"
                    strokeLinecap="round"
                  />
                  <path
                    d="M 10 50 A 40 40 0 0 1 90 50"
                    fill="none"
                    stroke="url(#gaugeGradient)"
                    strokeWidth="8"
                    strokeLinecap="round"
                    pathLength="100"
                    strokeDasharray={`${fgLoading ? 50 : fearGreed.value} 100`}
                    style={{ transition: "stroke-dasharray 0.6s ease" }}
                  />
                  <defs>
                    <linearGradient
                      id="gaugeGradient"
                      x1="0%"
                      y1="0%"
                      x2="100%"
                      y2="0%"
                    >
                      <stop offset="0%" stopColor="var(--text-down)" />
                      <stop offset="25%" stopColor="var(--text-down)" />
                      <stop offset="50%" stopColor="var(--text-warning)" />
                      <stop offset="75%" stopColor="var(--text-up)" />
                      <stop offset="100%" stopColor="var(--text-accent)" />
                    </linearGradient>
                  </defs>
                </svg>
                <div className="absolute bottom-0 left-0 w-full text-center">
                  <div
                    className={`heading-1 text-3xl font-medium ${fgLoading ? "animate-pulse text-tertiary" : fgColor}`}
                  >
                    {fgError ? "—" : fearGreed.value}
                  </div>
                  <div className={`font-mono-caps ${fgError ? "text-tertiary" : "text-accent"}`}>
                    {fgError ? "INDISPONIBLE" : fearGreed.label.toUpperCase()}
                  </div>
                </div>
              </div>
              <p className="text-xs text-secondary text-center mt-4">
                {t.rich("fearGreedDesc", { sentiment: t("fearGreedSentiment") })}
              </p>
            </div>

            {/* Gas Tracker */}
            <div className="bg-card border border-surface rounded-sm p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-sm font-medium flex items-center gap-2 text-primary">
                  <Fuel className="w-4 h-4 text-warning" />
                  {t("gasTitle")}
                </h3>
                <span className="font-mono-caps text-secondary flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-up animate-pulse" />
                  LIVE — CHAINS
                </span>
              </div>
              <div className="space-y-3">
                {CHAINS.map((c) => {
                  const g = gas[c];
                  const loading = gasLoading && !g;
                  return (
                    <div
                      key={c}
                      className="flex justify-between items-center text-sm"
                    >
                      <div className="flex items-center gap-2">
                        <div
                          className={`w-2 h-2 rounded-full ${
                            loading
                              ? "bg-tertiary animate-pulse"
                              : g
                                ? gasDotColor(g.levels.average)
                                : "bg-down"
                          }`}
                        />
                        <span className="text-primary">{CHAIN_LABEL[c]}</span>
                      </div>
                      <div className="text-secondary flex gap-3 font-mono text-xs">
                        {loading ? (
                          <span className="text-tertiary">…</span>
                        ) : g ? (
                          <>
                            <span>{g.levels.slow}</span>
                            <span>{g.levels.average}</span>
                            <span className="text-warning font-medium flex items-center gap-0.5">
                              <Zap className="w-3 h-3" /> {g.levels.fast}
                            </span>
                          </>
                        ) : (
                          <span className="text-down">—</span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Screener Callout */}
            <Link
              href="/tools/screener"
              className="bg-card border border-accent/30 rounded-xl p-6 relative overflow-hidden group hover:border-accent/60 transition block"
            >
              <div className="w-10 h-10 bg-accent/20 rounded-sm flex items-center justify-center mb-4 text-accent">
                <Droplets className="w-5 h-5" />
              </div>
              <h3 className="heading-3 text-lg font-medium text-primary mb-2">
                Advanced Screener
              </h3>
              <p className="text-sm text-secondary mb-4 line-clamp-2">
                Filtrez 500+ cryptos par volume, volatilité, RSI, market cap. Construisez votre watchlist en 30s.
              </p>
              <span className="text-accent text-sm font-medium flex items-center gap-1 group-hover:gap-2 transition-all">
                Open screener
                <ArrowRight className="w-4 h-4" />
              </span>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
